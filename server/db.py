"""
Fleet Vehicle Maintenance & Operations Management System
Database Layer (Raw SQL Connection & Query Helper)
File: server/db.py

Description:
    Provides raw SQL query helpers using psycopg2.
    Strictly uses raw SQL queries to showcase syllabus concepts.
    NO ORM abstractions (like SQLAlchemy or Prisma) are used.
"""

import os
import decimal
import datetime
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2 import pool, extras

# Load .env from project root or server directory
root_env = Path(__file__).resolve().parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5400")
DB_NAME = os.getenv("DB_NAME", "fleet_ops_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

_pool = None


def get_connection_pool():
    """Initialize or return the simple connection pool."""
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
    return _pool


def get_db_connection():
    """Retrieve a database connection from the connection pool or create a direct one."""
    try:
        p = get_connection_pool()
        return p.getconn()
    except Exception:
        # Fallback to direct connection if pool fails
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )


def release_db_connection(conn):
    """Return a connection back to the pool."""
    global _pool
    if _pool and conn:
        try:
            _pool.putconn(conn)
        except Exception:
            conn.close()
    elif conn:
        conn.close()


COLUMN_MAP = {
    "vehicleid": "VehicleID",
    "licenseplate": "LicensePlate",
    "model": "Model",
    "currentodometer": "CurrentOdometer",
    "status": "Status",
    "createdat": "CreatedAt",
    "driverid": "DriverID",
    "fullname": "FullName",
    "licensenumber": "LicenseNumber",
    "phone": "Phone",
    "centerid": "CenterID",
    "centername": "CenterName",
    "city": "City",
    "contactphone": "ContactPhone",
    "tripid": "TripID",
    "startdate": "StartDate",
    "enddate": "EndDate",
    "startkm": "StartKm",
    "endkm": "EndKm",
    "notes": "Notes",
    "distancekm": "DistanceKm",
    "fuelid": "FuelID",
    "liters": "Liters",
    "costperliter": "CostPerLiter",
    "totalamount": "TotalAmount",
    "logdate": "LogDate",
    "recordid": "RecordID",
    "servicetype": "ServiceType",
    "cost": "Cost",
    "servicedate": "ServiceDate",
    "nextserviceduekm": "NextServiceDueKm",
    "latestduekm": "LatestDueKm",
    "overduebykm": "OverdueByKm",
    "maintenancestatus": "MaintenanceStatus",
    "servicehealthbadge": "ServiceHealthBadge",
    "totaldistancekm": "TotalDistanceKm",
    "totalfuelcost": "TotalFuelCost",
    "totalmaintenancecost": "TotalMaintenanceCost",
    "totaloperatingcost": "TotalOperatingCost",
    "costperkm": "CostPerKm",
    "drivername": "DriverName",
    "lastservicedate": "LastServiceDate",
    "lastservicetype": "LastServiceType",
    "isoverdue": "IsOverdue",
    "totaltripslogged": "TotalTripsLogged",
    "totalkmdriven": "TotalKmDriven",
    "totalserviceshandled": "TotalServicesHandled",
    "totalbilledamount": "TotalBilledAmount"
}


def serialize_row(row):
    """Helper to convert Decimal and datetime objects into JSON-friendly types,
    and map PostgreSQL lowercase identifiers to schema PascalCase so both work."""
    if row is None:
        return None
    res = {}
    for key, val in row.items():
        if isinstance(val, decimal.Decimal):
            clean_val = float(val)
        elif isinstance(val, (datetime.datetime, datetime.date)):
            clean_val = val.isoformat()
        else:
            clean_val = val

        # Retain original key (lowercase from PostgreSQL)
        res[key] = clean_val
        # Also provide mapped PascalCase key from schema
        pascal_key = COLUMN_MAP.get(key.lower())
        if pascal_key and pascal_key != key:
            res[pascal_key] = clean_val

    return res


def execute_query(query, params=None, fetch="all"):
    """
    Execute a raw SQL SELECT query.
    fetch can be 'all', 'one', or 'none'.
    Returns list of dicts, single dict, or None.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, params or ())
            if fetch == "all":
                rows = cur.fetchall()
                return [serialize_row(r) for r in rows]
            elif fetch == "one":
                row = cur.fetchone()
                return serialize_row(row)
            return None
    finally:
        release_db_connection(conn)


def execute_mutation(query, params=None, returning=True):
    """
    Execute an INSERT, UPDATE, or DELETE raw SQL query with transaction commit.
    If returning=True and query contains RETURNING, returns the affected row(s).
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, params or ())
            result = None
            if returning and "RETURNING" in query.upper():
                row = cur.fetchone()
                result = serialize_row(row)
            conn.commit()
            return result
    except psycopg2.IntegrityError as err:
        conn.rollback()
        # Parse standard PostgreSQL error codes for academic clarity
        diag = err.diag
        pgcode = err.pgcode
        msg = err.args[0] if err.args else str(err)
        
        # 23505: unique_violation
        if pgcode == "23505":
            detail = diag.message_detail if diag else msg
            raise ValueError(f"Integrity Constraint Violation (UNIQUE): {detail}")
        # 23503: foreign_key_violation
        elif pgcode == "23503":
            detail = diag.message_detail if diag else msg
            raise ValueError(f"Referential Integrity Violation (FOREIGN KEY RESTRICT): {detail}")
        # 23514: check_violation
        elif pgcode == "23514":
            constraint = diag.constraint_name if diag else "CHECK constraint"
            raise ValueError(f"Integrity Constraint Violation (CHECK): Violates rule [{constraint}]")
        else:
            raise ValueError(f"Database Integrity Error: {msg}")
    except Exception as err:
        conn.rollback()
        raise err
    finally:
        release_db_connection(conn)


def test_connection():
    """Quick diagnostic function to test database connectivity."""
    try:
        res = execute_query("SELECT current_database() AS db, version() AS ver;", fetch="one")
        return {"connected": True, "details": res}
    except Exception as e:
        return {"connected": False, "error": str(e)}
