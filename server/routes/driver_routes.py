"""
Fleet Vehicle Maintenance & Operations Management System
Drivers Master Data CRUD Routes
File: server/routes/driver_routes.py
"""

from flask import Blueprint, request, jsonify
from db import execute_query, execute_mutation

driver_bp = Blueprint("drivers", __name__)


@driver_bp.route("/api/drivers", methods=["GET"])
def get_drivers():
    """
    Fetch all registered drivers.
    Includes active trip counts and total assigned kilometers.
    Used for driver lists and dynamic dropdown options in transaction forms.
    """
    status_filter = request.args.get("status", "").strip()

    sql = """
        SELECT 
            d.DriverID,
            d.FullName,
            d.LicenseNumber,
            d.Phone,
            d.Status,
            d.CreatedAt,
            COUNT(t.TripID) AS TotalTripsLogged,
            COALESCE(SUM(t.EndKm - t.StartKm), 0) AS TotalKmDriven
        FROM Drivers d
        LEFT JOIN TripLogs t ON d.DriverID = t.DriverID
        WHERE 1=1
    """
    params = []
    if status_filter:
        sql += " AND d.Status = %s"
        params.append(status_filter)

    sql += " GROUP BY d.DriverID, d.FullName, d.LicenseNumber, d.Phone, d.Status, d.CreatedAt ORDER BY d.DriverID ASC;"

    try:
        drivers = execute_query(sql, params, fetch="all")
        return jsonify({"success": True, "count": len(drivers), "drivers": drivers})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@driver_bp.route("/api/drivers/<int:driver_id>", methods=["GET"])
def get_driver_by_id(driver_id):
    """Fetch single driver profile."""
    sql = "SELECT * FROM Drivers WHERE DriverID = %s;"
    try:
        driver = execute_query(sql, (driver_id,), fetch="one")
        if not driver:
            return jsonify({"success": False, "error": f"Driver ID {driver_id} not found."}), 404
        return jsonify({"success": True, "driver": driver})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@driver_bp.route("/api/drivers", methods=["POST"])
def create_driver():
    """
    Register a new driver.
    Enforces UNIQUE(LicenseNumber) and NOT NULL(FullName).
    """
    data = request.get_json() or {}
    full_name = data.get("FullName", "").strip()
    license_no = data.get("LicenseNumber", "").strip().upper()
    phone = data.get("Phone", "").strip()
    status = data.get("Status", "Active").strip()

    if not full_name or not license_no:
        return jsonify({"success": False, "error": "FullName and LicenseNumber are mandatory."}), 400

    sql = """
        INSERT INTO Drivers (FullName, LicenseNumber, Phone, Status)
        VALUES (%s, %s, %s, %s)
        RETURNING DriverID, FullName, LicenseNumber, Phone, Status, CreatedAt;
    """
    try:
        new_driver = execute_mutation(sql, (full_name, license_no, phone, status))
        return jsonify({
            "success": True,
            "message": f"Driver '{full_name}' registered successfully.",
            "driver": new_driver
        }), 201
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@driver_bp.route("/api/drivers/<int:driver_id>", methods=["PUT"])
def update_driver(driver_id):
    """Update driver details."""
    data = request.get_json() or {}
    full_name = data.get("FullName", "").strip()
    license_no = data.get("LicenseNumber", "").strip().upper()
    phone = data.get("Phone", "").strip()
    status = data.get("Status", "Active").strip()

    if not full_name or not license_no:
        return jsonify({"success": False, "error": "FullName and LicenseNumber are required."}), 400

    sql = """
        UPDATE Drivers
        SET FullName = %s,
            LicenseNumber = %s,
            Phone = %s,
            Status = %s
        WHERE DriverID = %s
        RETURNING DriverID, FullName, LicenseNumber, Phone, Status;
    """
    try:
        updated = execute_mutation(sql, (full_name, license_no, phone, status, driver_id))
        if not updated:
            return jsonify({"success": False, "error": f"Driver ID {driver_id} not found."}), 404
        return jsonify({
            "success": True,
            "message": f"Driver '{full_name}' updated successfully.",
            "driver": updated
        })
    except ValueError as val_err:
        return jsonify({"success": False, "error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@driver_bp.route("/api/drivers/<int:driver_id>", methods=["DELETE"])
def delete_driver(driver_id):
    """
    Delete or archive driver.
    Subject to ON DELETE RESTRICT in TripLogs and FuelLogs.
    """
    archive = request.args.get("archive", "").lower() in ("true", "1", "yes")

    if archive:
        sql = "UPDATE Drivers SET Status = 'Retired' WHERE DriverID = %s RETURNING DriverID, FullName, Status;"
        try:
            res = execute_mutation(sql, (driver_id,))
            if not res:
                return jsonify({"success": False, "error": f"Driver ID {driver_id} not found."}), 404
            return jsonify({
                "success": True,
                "message": f"Driver #{driver_id} status updated to Retired.",
                "driver": res
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    sql = "DELETE FROM Drivers WHERE DriverID = %s RETURNING DriverID, FullName;"
    try:
        deleted = execute_mutation(sql, (driver_id,))
        if not deleted:
            return jsonify({"success": False, "error": f"Driver ID {driver_id} not found."}), 404
        return jsonify({"success": True, "message": f"Driver '{deleted['FullName']}' deleted."})
    except ValueError as val_err:
        return jsonify({
            "success": False,
            "isConstraintViolation": True,
            "error": str(val_err),
            "suggestion": "This driver has logged trips or fuel vouchers protected by ON DELETE RESTRICT. Deactivate or retire the driver profile instead."
        }), 409
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
