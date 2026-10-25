"""
Fleet Vehicle Maintenance & Operations Management System
Database Initialization & Seeder Script
File: init_db.py

Usage:
    python init_db.py

Description:
    Reads database credentials from .env, connects to PostgreSQL,
    creates the target database if missing, executes schema.sql
    and seed.sql sequentially, and runs verification checks.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Reconfigure stdout for UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
ENV_EXAMPLE = BASE_DIR / ".env.example"

# Load .env first, fallback to .env.example
if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
elif ENV_EXAMPLE.exists():
    load_dotenv(dotenv_path=ENV_EXAMPLE)
else:
    load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5400")
DB_NAME = os.getenv("DB_NAME", "fleet_ops_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "jay")

SCHEMA_FILE = BASE_DIR / "schema.sql"
SEED_FILE = BASE_DIR / "seed.sql"


def ensure_database_exists():
    """Connect to default 'postgres' database and create target database if absent."""
    print(f"[*] Checking PostgreSQL connection at {DB_HOST}:{DB_PORT} as user '{DB_USER}'...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
        exists = cursor.fetchone()

        if not exists:
            print(f"[+] Database '{DB_NAME}' does not exist. Creating it now...")
            cursor.execute(f'CREATE DATABASE "{DB_NAME}";')
            print(f"[OK] Database '{DB_NAME}' created successfully.")
        else:
            print(f"[OK] Database '{DB_NAME}' already exists.")

        cursor.close()
        conn.close()
        return True
    except psycopg2.OperationalError as err:
        print(f"\n[!] PostgreSQL Connection Error: {err}")
        print("    Please check that PostgreSQL is running and your .env credentials are correct.")
        print(f"    Target host: {DB_HOST}, port: {DB_PORT}, user: {DB_USER}")
        return False


def execute_sql_file(conn, filepath: Path, title: str):
    """Read and execute an entire SQL file using a single raw SQL connection."""
    print(f"\n[*] Executing {title} from: {filepath.name}...")
    if not filepath.exists():
        print(f"[!] Error: File not found: {filepath}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        sql_content = f.read()

    try:
        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        cursor.close()
        print(f"[OK] Successfully executed {title} ({filepath.name}).")
        return True
    except Exception as err:
        conn.rollback()
        print(f"[!] Error executing {title}: {err}")
        return False


def run_verification(conn):
    """Run verification queries showcasing the syllabus trigger and analytical views."""
    print("\n" + "=" * 70)
    print("DBMS SYLLABUS VALIDATION & INTEGRITY VERIFICATION")
    print("=" * 70)

    cursor = conn.cursor()

    # 1. Record counts
    print("\n[1] Table Record Counts:")
    cursor.execute("""
        SELECT 'Vehicles' AS TableName, COUNT(*) FROM Vehicles
        UNION ALL SELECT 'Drivers', COUNT(*) FROM Drivers
        UNION ALL SELECT 'ServiceCenters', COUNT(*) FROM ServiceCenters
        UNION ALL SELECT 'TripLogs', COUNT(*) FROM TripLogs
        UNION ALL SELECT 'FuelLogs', COUNT(*) FROM FuelLogs
        UNION ALL SELECT 'MaintenanceRecords', COUNT(*) FROM MaintenanceRecords;
    """)
    for table, count in cursor.fetchall():
        print(f"    - {table:<20}: {count} records")

    # 2. Trigger check
    print("\n[2] Trigger Verification (Vehicles.CurrentOdometer updated via TripLogs):")
    cursor.execute("""
        SELECT 
            v.VehicleID,
            v.LicensePlate,
            v.CurrentOdometer,
            MAX(t.EndKm) AS ExpectedFromTrips,
            CASE WHEN v.CurrentOdometer = MAX(t.EndKm) THEN 'VERIFIED' ELSE 'MISMATCH' END AS Status
        FROM Vehicles v
        JOIN TripLogs t ON v.VehicleID = t.VehicleID
        GROUP BY v.VehicleID, v.LicensePlate, v.CurrentOdometer
        ORDER BY v.VehicleID
        LIMIT 5;
    """)
    for row in cursor.fetchall():
        print(f"    - Vehicle #{row[0]} ({row[1]}): Odometer={row[2]} km | Max EndKm={row[3]} km -> [{row[4]}]")

    # 3. View 1 check: Overdue maintenance
    print("\n[3] Analytical View 1 (view_overdue_maintenance):")
    cursor.execute("""
        SELECT VehicleID, LicensePlate, CurrentOdometer, LatestDueKm, OverdueByKm, MaintenanceStatus
        FROM view_overdue_maintenance
        LIMIT 5;
    """)
    for row in cursor.fetchall():
        print(f"    - Vehicle #{row[0]} ({row[1]}): Current={row[2]} km, Due={row[3]} km | OverdueBy={row[4]} km -> [{row[5]}]")

    # 4. View 2 check: Operating costs
    print("\n[4] Analytical View 2 (view_vehicle_operating_cost):")
    cursor.execute("""
        SELECT VehicleID, LicensePlate, TotalDistanceKm, TotalFuelCost, TotalMaintenanceCost, TotalOperatingCost, CostPerKm
        FROM view_vehicle_operating_cost
        LIMIT 5;
    """)
    for row in cursor.fetchall():
        print(f"    - Vehicle #{row[0]} ({row[1]}): Distance={row[2]} km, Fuel=Rs.{row[3]:,.2f}, Maint=Rs.{row[4]:,.2f} | Total=Rs.{row[5]:,.2f} (Rs.{row[6]}/km)")

    cursor.close()
    print("\n" + "=" * 70)


def main():
    print("=" * 70)
    print("Fleet Vehicle DBMS - Database Initialization & Verification")
    print("=" * 70)

    # 1. Ensure DB exists
    if not ensure_database_exists():
        sys.exit(1)

    # 2. Connect to the fleet_ops_db
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
    except psycopg2.OperationalError as err:
        print(f"[!] Could not connect to '{DB_NAME}': {err}")
        sys.exit(1)

    # 3. Execute schema.sql
    if not execute_sql_file(conn, SCHEMA_FILE, "DDL Schema"):
        conn.close()
        sys.exit(1)

    # 4. Execute seed.sql
    if not execute_sql_file(conn, SEED_FILE, "Seed Data"):
        conn.close()
        sys.exit(1)

    # 5. Run Verification
    try:
        run_verification(conn)
    except Exception as err:
        print(f"[!] Verification failed: {err}")
    finally:
        conn.close()

    print("\n[OK] Database initialization and verification completed successfully!")


if __name__ == "__main__":
    main()
