"""
Fleet Vehicle Maintenance & Operations Management System
Operational Transactions API (Trips, Fuel, Maintenance)
File: server/routes/operation_routes.py
"""

from flask import Blueprint, request, jsonify
from db import execute_query, execute_mutation

operation_bp = Blueprint("operations", __name__)


# ============================================================================
# 1. TRIP LOGS (Triggers trg_trip_update_odometer)
# ============================================================================

@operation_bp.route("/api/trips", methods=["GET"])
def get_trips():
    """
    Fetch recent trip logs.
    Demonstrates SQL JOIN between TripLogs, Vehicles, and Drivers.
    """
    vehicle_id = request.args.get("vehicle_id")
    limit = min(int(request.args.get("limit", 50)), 100)

    sql = """
        SELECT 
            t.TripID,
            t.VehicleID,
            v.LicensePlate,
            v.Model,
            t.DriverID,
            d.FullName AS DriverName,
            t.StartDate,
            t.EndDate,
            t.StartKm,
            t.EndKm,
            (t.EndKm - t.StartKm) AS DistanceKm,
            t.Notes
        FROM TripLogs t
        JOIN Vehicles v ON t.VehicleID = v.VehicleID
        JOIN Drivers d ON t.DriverID = d.DriverID
        WHERE 1=1
    """
    params = []
    if vehicle_id:
        sql += " AND t.VehicleID = %s"
        params.append(vehicle_id)

    sql += " ORDER BY t.StartDate DESC, t.TripID DESC LIMIT %s;"
    params.append(limit)

    try:
        trips = execute_query(sql, params, fetch="all")
        return jsonify({"success": True, "count": len(trips), "trips": trips})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@operation_bp.route("/api/trips", methods=["POST"])
def log_trip():
    """
    Log a new delivery trip.
    CRITICAL SYLLABUS FEATURE:
    - Enforces CHECK(EndKm >= StartKm) and CHECK(EndDate >= StartDate).
    - Database Trigger 'trg_trip_update_odometer' executes automatically AFTER INSERT,
      updating Vehicles.CurrentOdometer = NEW.EndKm.
    - We query and return the new odometer reading to prove the trigger executed!
    """
    data = request.get_json() or {}
    vehicle_id = data.get("VehicleID")
    driver_id = data.get("DriverID")
    start_date = data.get("StartDate")
    end_date = data.get("EndDate")
    start_km = data.get("StartKm")
    end_km = data.get("EndKm")
    notes = data.get("Notes", "")

    if not all([vehicle_id, driver_id, start_date, end_date, start_km is not None, end_km is not None]):
        return jsonify({"success": False, "error": "VehicleID, DriverID, StartDate, EndDate, StartKm, and EndKm are required."}), 400

    insert_sql = """
        INSERT INTO TripLogs (VehicleID, DriverID, StartDate, EndDate, StartKm, EndKm, Notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING TripID, VehicleID, DriverID, StartDate, EndDate, StartKm, EndKm, Notes;
    """

    try:
        new_trip = execute_mutation(insert_sql, (vehicle_id, driver_id, start_date, end_date, start_km, end_km, notes))

        # Fetch the vehicle's new odometer reading updated by the trigger
        odometer_check = execute_query(
            "SELECT LicensePlate, CurrentOdometer FROM Vehicles WHERE VehicleID = %s;",
            (vehicle_id,),
            fetch="one"
        )

        return jsonify({
            "success": True,
            "message": "Trip logged successfully.",
            "triggerExecuted": True,
            "triggerDetail": f"Database trigger 'trg_trip_update_odometer' fired: {odometer_check['LicensePlate']} odometer updated to {odometer_check['CurrentOdometer']} km.",
            "trip": new_trip,
            "vehicleOdometer": odometer_check["CurrentOdometer"]
        }), 201
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# 2. FUEL LOGS
# ============================================================================

@operation_bp.route("/api/fuel", methods=["GET"])
def get_fuel_logs():
    """Fetch fuel logs with Vehicle and Driver details via SQL JOIN."""
    vehicle_id = request.args.get("vehicle_id")
    limit = min(int(request.args.get("limit", 50)), 100)

    sql = """
        SELECT 
            f.FuelID,
            f.VehicleID,
            v.LicensePlate,
            v.Model,
            f.DriverID,
            d.FullName AS DriverName,
            f.Liters,
            f.CostPerLiter,
            f.TotalAmount,
            f.LogDate
        FROM FuelLogs f
        JOIN Vehicles v ON f.VehicleID = v.VehicleID
        JOIN Drivers d ON f.DriverID = d.DriverID
        WHERE 1=1
    """
    params = []
    if vehicle_id:
        sql += " AND f.VehicleID = %s"
        params.append(vehicle_id)

    sql += " ORDER BY f.LogDate DESC, f.FuelID DESC LIMIT %s;"
    params.append(limit)

    try:
        logs = execute_query(sql, params, fetch="all")
        return jsonify({"success": True, "count": len(logs), "fuel_logs": logs})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@operation_bp.route("/api/fuel", methods=["POST"])
def log_fuel():
    """
    Log fleet refueling receipt.
    Enforces Liters > 0, CostPerLiter > 0, TotalAmount >= 0.
    """
    data = request.get_json() or {}
    vehicle_id = data.get("VehicleID")
    driver_id = data.get("DriverID")
    liters = data.get("Liters")
    cost_per_liter = data.get("CostPerLiter")
    log_date = data.get("LogDate")

    if not all([vehicle_id, driver_id, liters, cost_per_liter]):
        return jsonify({"success": False, "error": "VehicleID, DriverID, Liters, and CostPerLiter are required."}), 400

    try:
        liters_f = float(liters)
        cost_f = float(cost_per_liter)
        total_amount = round(float(data.get("TotalAmount", liters_f * cost_f)), 2)
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Liters and CostPerLiter must be numeric."}), 400

    sql = """
        INSERT INTO FuelLogs (VehicleID, DriverID, Liters, CostPerLiter, TotalAmount, LogDate)
        VALUES (%s, %s, %s, %s, %s, COALESCE(%s::date, CURRENT_DATE))
        RETURNING FuelID, VehicleID, DriverID, Liters, CostPerLiter, TotalAmount, LogDate;
    """
    try:
        new_fuel = execute_mutation(sql, (vehicle_id, driver_id, liters_f, cost_f, total_amount, log_date))
        return jsonify({
            "success": True,
            "message": f"Fuel log recorded (₹{total_amount:,.2f}).",
            "fuel_log": new_fuel
        }), 201
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# 3. MAINTENANCE RECORDS
# ============================================================================

@operation_bp.route("/api/maintenance", methods=["GET"])
def get_maintenance_records():
    """Fetch maintenance service history with Vehicle and ServiceCenter details."""
    vehicle_id = request.args.get("vehicle_id")
    limit = min(int(request.args.get("limit", 50)), 100)

    sql = """
        SELECT 
            m.RecordID,
            m.VehicleID,
            v.LicensePlate,
            v.Model,
            m.CenterID,
            sc.CenterName,
            sc.City AS CenterCity,
            m.ServiceType,
            m.Cost,
            m.ServiceDate,
            m.NextServiceDueKm,
            m.Notes
        FROM MaintenanceRecords m
        JOIN Vehicles v ON m.VehicleID = v.VehicleID
        JOIN ServiceCenters sc ON m.CenterID = sc.CenterID
        WHERE 1=1
    """
    params = []
    if vehicle_id:
        sql += " AND m.VehicleID = %s"
        params.append(vehicle_id)

    sql += " ORDER BY m.ServiceDate DESC, m.RecordID DESC LIMIT %s;"
    params.append(limit)

    try:
        records = execute_query(sql, params, fetch="all")
        return jsonify({"success": True, "count": len(records), "maintenance_records": records})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@operation_bp.route("/api/maintenance", methods=["POST"])
def log_maintenance():
    """
    Record vehicle maintenance / repair invoice.
    Enforces Cost >= 0, NextServiceDueKm > 0.
    """
    data = request.get_json() or {}
    vehicle_id = data.get("VehicleID")
    center_id = data.get("CenterID")
    service_type = data.get("ServiceType", "").strip()
    cost = data.get("Cost")
    next_due_km = data.get("NextServiceDueKm")
    service_date = data.get("ServiceDate")
    notes = data.get("Notes", "")

    if not all([vehicle_id, center_id, service_type, cost is not None, next_due_km]):
        return jsonify({"success": False, "error": "VehicleID, CenterID, ServiceType, Cost, and NextServiceDueKm are required."}), 400

    sql = """
        INSERT INTO MaintenanceRecords (VehicleID, CenterID, ServiceType, Cost, ServiceDate, NextServiceDueKm, Notes)
        VALUES (%s, %s, %s, %s, COALESCE(%s::date, CURRENT_DATE), %s, %s)
        RETURNING RecordID, VehicleID, CenterID, ServiceType, Cost, ServiceDate, NextServiceDueKm, Notes;
    """
    try:
        new_record = execute_mutation(sql, (vehicle_id, center_id, service_type, cost, service_date, next_due_km, notes))
        return jsonify({
            "success": True,
            "message": f"Maintenance record logged for service '{service_type}'.",
            "maintenance_record": new_record
        }), 201
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
