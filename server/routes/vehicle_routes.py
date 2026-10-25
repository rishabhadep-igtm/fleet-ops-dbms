"""
Fleet Vehicle Maintenance & Operations Management System
Vehicles Master Data CRUD Routes
File: server/routes/vehicle_routes.py
"""

from flask import Blueprint, request, jsonify
from db import execute_query, execute_mutation

vehicle_bp = Blueprint("vehicles", __name__)


@vehicle_bp.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    """
    Fetch all vehicles with optional search filtering by license plate or model.
    LEFT JOINs with view_overdue_maintenance to dynamically flag maintenance alerts
    for color-coded UI badges (Green = Ready, Red = Service Due).
    """
    search = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "").strip()

    sql = """
        SELECT 
            v.VehicleID,
            v.LicensePlate,
            v.Model,
            v.CurrentOdometer,
            v.Status,
            v.CreatedAt,
            COALESCE(ov.LatestDueKm, NULL) AS LatestDueKm,
            COALESCE(ov.OverdueByKm, 0) AS OverdueByKm,
            CASE 
                WHEN ov.VehicleID IS NOT NULL THEN 'Service Due'
                WHEN v.Status = 'In Shop' THEN 'In Shop'
                WHEN v.Status = 'Retired' THEN 'Retired'
                ELSE 'Ready'
            END AS ServiceHealthBadge
        FROM Vehicles v
        LEFT JOIN view_overdue_maintenance ov ON v.VehicleID = ov.VehicleID
        WHERE 1=1
    """
    params = []

    if search:
        sql += " AND (v.LicensePlate ILIKE %s OR v.Model ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if status_filter:
        sql += " AND v.Status = %s"
        params.append(status_filter)

    sql += " ORDER BY v.VehicleID ASC;"

    try:
        vehicles = execute_query(sql, params, fetch="all")
        return jsonify({"success": True, "count": len(vehicles), "vehicles": vehicles})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@vehicle_bp.route("/api/vehicles/<int:vehicle_id>", methods=["GET"])
def get_vehicle_by_id(vehicle_id):
    """Fetch single vehicle profile with aggregated stats."""
    sql = """
        SELECT 
            v.*,
            COALESCE(cost.TotalDistanceKm, 0) AS TotalDistanceKm,
            COALESCE(cost.TotalFuelCost, 0) AS TotalFuelCost,
            COALESCE(cost.TotalMaintenanceCost, 0) AS TotalMaintenanceCost,
            COALESCE(cost.TotalOperatingCost, 0) AS TotalOperatingCost,
            ov.OverdueByKm,
            CASE WHEN ov.VehicleID IS NOT NULL THEN TRUE ELSE FALSE END AS IsOverdue
        FROM Vehicles v
        LEFT JOIN view_vehicle_operating_cost cost ON v.VehicleID = cost.VehicleID
        LEFT JOIN view_overdue_maintenance ov ON v.VehicleID = ov.VehicleID
        WHERE v.VehicleID = %s;
    """
    try:
        vehicle = execute_query(sql, (vehicle_id,), fetch="one")
        if not vehicle:
            return jsonify({"success": False, "error": f"Vehicle ID {vehicle_id} not found."}), 404
        return jsonify({"success": True, "vehicle": vehicle})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@vehicle_bp.route("/api/vehicles", methods=["POST"])
def create_vehicle():
    """
    Add a new vehicle to master data.
    Enforces UNIQUE(LicensePlate), CHECK(CurrentOdometer >= 0), CHECK(Status IN (...)).
    """
    data = request.get_json() or {}
    license_plate = data.get("LicensePlate", "").strip().upper()
    model = data.get("Model", "").strip()
    odometer = data.get("CurrentOdometer", 0)
    status = data.get("Status", "Active").strip()

    if not license_plate or not model:
        return jsonify({"success": False, "error": "LicensePlate and Model are mandatory fields."}), 400

    sql = """
        INSERT INTO Vehicles (LicensePlate, Model, CurrentOdometer, Status)
        VALUES (%s, %s, %s, %s)
        RETURNING VehicleID, LicensePlate, Model, CurrentOdometer, Status, CreatedAt;
    """
    try:
        new_vehicle = execute_mutation(sql, (license_plate, model, odometer, status))
        return jsonify({
            "success": True,
            "message": f"Vehicle {license_plate} registered successfully.",
            "vehicle": new_vehicle
        }), 21
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@vehicle_bp.route("/api/vehicles/<int:vehicle_id>", methods=["PUT"])
def update_vehicle(vehicle_id):
    """
    Update vehicle profile details.
    """
    data = request.get_json() or {}
    license_plate = data.get("LicensePlate", "").strip().upper()
    model = data.get("Model", "").strip()
    odometer = data.get("CurrentOdometer")
    status = data.get("Status", "").strip()

    if not license_plate or not model or odometer is None:
        return jsonify({"success": False, "error": "LicensePlate, Model, and CurrentOdometer are required."}), 400

    sql = """
        UPDATE Vehicles
        SET LicensePlate = %s,
            Model = %s,
            CurrentOdometer = %s,
            Status = %s
        WHERE VehicleID = %s
        RETURNING VehicleID, LicensePlate, Model, CurrentOdometer, Status;
    """
    try:
        updated = execute_mutation(sql, (license_plate, model, odometer, status, vehicle_id))
        if not updated:
            return jsonify({"success": False, "error": f"Vehicle ID {vehicle_id} not found."}), 404
        return jsonify({
            "success": True,
            "message": f"Vehicle {license_plate} updated successfully.",
            "vehicle": updated
        })
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@vehicle_bp.route("/api/vehicles/<int:vehicle_id>", methods=["DELETE"])
def delete_vehicle(vehicle_id):
    """
    Delete or archive a vehicle.
    Demonstrates referential integrity actions:
    - If archive=true query parameter is supplied, sets Status to 'Retired'.
    - If direct deletion is attempted on a vehicle with TripLogs or FuelLogs,
      PostgreSQL raises ON DELETE RESTRICT foreign key error.
    """
    archive = request.args.get("archive", "").lower() in ("true", "1", "yes")

    if archive:
        sql = "UPDATE Vehicles SET Status = 'Retired' WHERE VehicleID = %s RETURNING VehicleID, LicensePlate, Status;"
        try:
            res = execute_mutation(sql, (vehicle_id,))
            if not res:
                return jsonify({"success": False, "error": f"Vehicle ID {vehicle_id} not found."}), 404
            return jsonify({
                "success": True,
                "message": f"Vehicle #{vehicle_id} archived (Status set to 'Retired').",
                "vehicle": res
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    # Attempt physical deletion (will trigger ON DELETE RESTRICT if trip/fuel history exists)
    sql = "DELETE FROM Vehicles WHERE VehicleID = %s RETURNING VehicleID, LicensePlate;"
    try:
        deleted = execute_mutation(sql, (vehicle_id,))
        if not deleted:
            return jsonify({"success": False, "error": f"Vehicle ID {vehicle_id} not found."}), 404
        return jsonify({
            "success": True,
            "message": f"Vehicle #{vehicle_id} ({deleted['LicensePlate']}) deleted successfully."
        })
    except ValueError as val_err:
        # Explain syllabus referential integrity to the student / user
        return jsonify({
            "success": False,
            "isConstraintViolation": True,
            "error": str(val_err),
            "suggestion": "This vehicle has associated trip logs or fuel logs protected by ON DELETE RESTRICT. Use the Archive option (Retired status) to decommission it safely."
        }), 409
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
