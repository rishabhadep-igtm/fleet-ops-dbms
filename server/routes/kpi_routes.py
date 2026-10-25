"""
Fleet Vehicle Maintenance & Operations Management System
KPI & Dashboard Metrics API Route
File: server/routes/kpi_routes.py
"""

from flask import Blueprint, jsonify
from db import execute_query

kpi_bp = Blueprint("kpis", __name__)


@kpi_bp.route("/api/kpis", methods=["GET"])
def get_dashboard_kpis():
    """
    Fetches aggregated summary metrics for the Dashboard KPI cards.
    Demonstrates SQL COUNT, SUM, subqueries, and View consumption.
    """
    try:
        # 1. Fleet Vehicle Status counts
        vehicle_stats = execute_query("""
            SELECT 
                COUNT(*) AS total_vehicles,
                COUNT(CASE WHEN Status = 'Active' THEN 1 END) AS active_vehicles,
                COUNT(CASE WHEN Status = 'In Shop' THEN 1 END) AS in_shop_vehicles,
                COUNT(CASE WHEN Status = 'Retired' THEN 1 END) AS retired_vehicles
            FROM Vehicles;
        """, fetch="one") or {}

        # 2. Driver counts (Active drivers and drivers on active trips)
        driver_stats = execute_query("""
            SELECT 
                COUNT(*) AS total_drivers,
                COUNT(CASE WHEN Status = 'Active' THEN 1 END) AS active_drivers,
                COUNT(DISTINCT DriverID) AS drivers_with_trips
            FROM Drivers;
        """, fetch="one") or {}

        # 3. Overdue Maintenance Alerts count (from view_overdue_maintenance)
        overdue_stats = execute_query("""
            SELECT COUNT(*) AS overdue_alerts_count
            FROM view_overdue_maintenance;
        """, fetch="one") or {"overdue_alerts_count": 0}

        # 4. Total Operating Spend & Distance (from view_vehicle_operating_cost)
        financial_stats = execute_query("""
            SELECT 
                COALESCE(SUM(TotalFuelCost), 0) AS total_fuel_spend,
                COALESCE(SUM(TotalMaintenanceCost), 0) AS total_maintenance_spend,
                COALESCE(SUM(TotalOperatingCost), 0) AS total_operating_spend,
                COALESCE(SUM(TotalDistanceKm), 0) AS total_distance_km
            FROM view_vehicle_operating_cost;
        """, fetch="one") or {}

        # Calculate average fleet cost per km
        total_dist = financial_stats.get("total_distance_km", 0)
        total_spend = financial_stats.get("total_operating_spend", 0)
        avg_cost_per_km = round(total_spend / total_dist, 2) if total_dist > 0 else 0.0

        return jsonify({
            "success": True,
            "kpis": {
                "total_vehicles": vehicle_stats.get("total_vehicles", 0),
                "active_vehicles": vehicle_stats.get("active_vehicles", 0),
                "in_shop_vehicles": vehicle_stats.get("in_shop_vehicles", 0),
                "retired_vehicles": vehicle_stats.get("retired_vehicles", 0),
                "total_drivers": driver_stats.get("total_drivers", 0),
                "drivers_on_route": driver_stats.get("active_drivers", 0),
                "overdue_service_alerts": overdue_stats.get("overdue_alerts_count", 0),
                "total_fuel_spend": financial_stats.get("total_fuel_spend", 0),
                "total_maintenance_spend": financial_stats.get("total_maintenance_spend", 0),
                "total_operating_spend": financial_stats.get("total_operating_spend", 0),
                "total_distance_km": financial_stats.get("total_distance_km", 0),
                "avg_cost_per_km": avg_cost_per_km
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
