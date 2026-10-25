"""
Fleet Vehicle Maintenance & Operations Management System
Analytical Reports API Routes (Consuming Database Views)
File: server/routes/report_routes.py
"""

from flask import Blueprint, jsonify
from db import execute_query

report_bp = Blueprint("reports", __name__)


@report_bp.route("/api/reports/overdue", methods=["GET"])
def get_overdue_maintenance_report():
    """
    REPORT 1: Overdue Maintenance Alert
    Syllabus Concept: Consumes SQL View 'view_overdue_maintenance'.
    Compares Vehicles.CurrentOdometer against MAX(NextServiceDueKm) from MaintenanceRecords
    using subqueries to flag and prioritize overdue vehicles.
    """
    sql = """
        SELECT 
            VehicleID,
            LicensePlate,
            Model,
            Status,
            CurrentOdometer,
            LatestDueKm,
            OverdueByKm,
            MaintenanceStatus,
            LastServiceDate,
            LastServiceType
        FROM view_overdue_maintenance
        ORDER BY OverdueByKm DESC;
    """
    try:
        report = execute_query(sql, fetch="all")
        return jsonify({
            "success": True,
            "reportName": "Overdue Maintenance Alert",
            "sourceView": "view_overdue_maintenance",
            "count": len(report),
            "data": report
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@report_bp.route("/api/reports/operating-cost", methods=["GET"])
def get_operating_cost_report():
    """
    REPORT 2: Fleet Operating Expense Summary
    Syllabus Concept: Consumes SQL View 'view_vehicle_operating_cost'.
    Aggregates fuel costs, repair costs, and kilometers driven via JOIN, GROUP BY, and SUM.
    Provides formatted datasets ready for Chart.js rendering (Fuel vs. Maintenance per vehicle).
    """
    sql = """
        SELECT 
            VehicleID,
            LicensePlate,
            Model,
            Status,
            TotalDistanceKm,
            TotalFuelCost,
            TotalMaintenanceCost,
            TotalOperatingCost,
            CostPerKm
        FROM view_vehicle_operating_cost
        ORDER BY TotalOperatingCost DESC;
    """
    try:
        data = execute_query(sql, fetch="all")

        # Prepare ready-to-consume Chart.js payload
        chart_labels = [row["LicensePlate"] for row in data]
        fuel_dataset = [row["TotalFuelCost"] for row in data]
        maint_dataset = [row["TotalMaintenanceCost"] for row in data]

        total_fleet_fuel = sum(row["TotalFuelCost"] for row in data)
        total_fleet_maint = sum(row["TotalMaintenanceCost"] for row in data)
        total_fleet_cost = sum(row["TotalOperatingCost"] for row in data)
        total_fleet_dist = sum(row.get("TotalDistanceKm") or 0 for row in data)
        overall_avg_cost_km = round(total_fleet_cost / total_fleet_dist, 2) if total_fleet_dist > 0 else 0

        return jsonify({
            "success": True,
            "reportName": "Fleet Expense Summary & Cost-per-Km",
            "sourceView": "view_vehicle_operating_cost",
            "summary": {
                "total_fleet_fuel_cost": round(total_fleet_fuel, 2),
                "total_fleet_maintenance_cost": round(total_fleet_maint, 2),
                "total_fleet_operating_cost": round(total_fleet_cost, 2),
                "total_fleet_distance_km": round(total_fleet_dist, 2),
                "overall_avg_cost_per_km": overall_avg_cost_km,
            },
            "chartData": {
                "labels": chart_labels,
                "fuelCosts": fuel_dataset,
                "maintenanceCosts": maint_dataset
            },
            "data": data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
