"""
Fleet Vehicle Maintenance & Operations Management System
Service Centers Master Data Routes
File: server/routes/service_center_routes.py
"""

from flask import Blueprint, request, jsonify
from db import execute_query, execute_mutation

service_center_bp = Blueprint("service_centers", __name__)


@service_center_bp.route("/api/service-centers", methods=["GET"])
def get_service_centers():
    """Fetch authorized service centers for maintenance form dropdowns."""
    sql = """
        SELECT 
            sc.CenterID,
            sc.CenterName,
            sc.City,
            sc.ContactPhone,
            sc.CreatedAt,
            COUNT(mr.RecordID) AS TotalServicesHandled,
            COALESCE(SUM(mr.Cost), 0) AS TotalBilledAmount
        FROM ServiceCenters sc
        LEFT JOIN MaintenanceRecords mr ON sc.CenterID = mr.CenterID
        GROUP BY sc.CenterID, sc.CenterName, sc.City, sc.ContactPhone, sc.CreatedAt
        ORDER BY sc.CenterID ASC;
    """
    try:
        centers = execute_query(sql, fetch="all")
        return jsonify({"success": True, "count": len(centers), "service_centers": centers})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@service_center_bp.route("/api/service-centers", methods=["POST"])
def create_service_center():
    """Register an authorized workshop or service center."""
    data = request.get_json() or {}
    center_name = data.get("CenterName", "").strip()
    city = data.get("City", "").strip()
    phone = data.get("ContactPhone", "").strip()

    if not center_name or not city:
        return jsonify({"success": False, "error": "CenterName and City are required."}), 400

    sql = """
        INSERT INTO ServiceCenters (CenterName, City, ContactPhone)
        VALUES (%s, %s, %s)
        RETURNING CenterID, CenterName, City, ContactPhone, CreatedAt;
    """
    try:
        new_center = execute_mutation(sql, (center_name, city, phone))
        return jsonify({
            "success": True,
            "message": f"Service center '{center_name}' created.",
            "service_center": new_center
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@service_center_bp.route("/api/service-centers/<int:center_id>", methods=["DELETE"])
def delete_service_center(center_id):
    """Delete service center (demonstrates ON DELETE RESTRICT in MaintenanceRecords)."""
    sql = "DELETE FROM ServiceCenters WHERE CenterID = %s RETURNING CenterID, CenterName;"
    try:
        deleted = execute_mutation(sql, (center_id,))
        if not deleted:
            return jsonify({"success": False, "error": f"Center ID {center_id} not found."}), 404
        return jsonify({"success": True, "message": f"Service center '{deleted['CenterName']}' deleted."})
    except ValueError as val_err:
        return jsonify({
            "success": False,
            "isConstraintViolation": True,
            "error": str(val_err),
            "suggestion": "This service center has existing maintenance repair records. ON DELETE RESTRICT forbids removing centers with past invoices."
        }), 409
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
