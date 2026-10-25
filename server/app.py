"""
Fleet Vehicle Maintenance & Operations Management System
Backend API Server (Flask + Raw SQL)
File: server/app.py

Description:
    Lightweight, modular Flask server connecting directly to PostgreSQL.
    Strictly executes syllabus raw SQL queries using psycopg2.
"""

import os
import sys
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure server directory is in sys.path
SERVER_DIR = Path(__file__).resolve().parent
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

# Load environment configuration
root_env = SERVER_DIR.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

from db import test_connection, execute_query
from routes.kpi_routes import kpi_bp
from routes.vehicle_routes import vehicle_bp
from routes.driver_routes import driver_bp
from routes.service_center_routes import service_center_bp
from routes.operation_routes import operation_bp
from routes.report_routes import report_bp

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

# Register Modular Blueprint Routes
app.register_blueprint(kpi_bp)
app.register_blueprint(vehicle_bp)
app.register_blueprint(driver_bp)
app.register_blueprint(service_center_bp)
app.register_blueprint(operation_bp)
app.register_blueprint(report_bp)


@app.route("/", methods=["GET"])
def index():
    """Root landing endpoint with system status."""
    return jsonify({
        "system": "Fleet Vehicle Maintenance & Operations Management System",
        "type": "DBMS College Micro-Project Backend API",
        "status": "Online",
        "documentation": "/api/routes",
        "health": "/api/health"
    })


@app.route("/api/health", methods=["GET"])
def health_check():
    """Diagnostic health check verifying PostgreSQL database connectivity."""
    db_status = test_connection()
    table_counts = {}
    if db_status.get("connected"):
        try:
            counts = execute_query("""
                SELECT 'Vehicles' AS tbl, COUNT(*) FROM Vehicles
                UNION ALL SELECT 'Drivers', COUNT(*) FROM Drivers
                UNION ALL SELECT 'ServiceCenters', COUNT(*) FROM ServiceCenters
                UNION ALL SELECT 'TripLogs', COUNT(*) FROM TripLogs
                UNION ALL SELECT 'FuelLogs', COUNT(*) FROM FuelLogs
                UNION ALL SELECT 'MaintenanceRecords', COUNT(*) FROM MaintenanceRecords;
            """)
            table_counts = {item["tbl"]: item["count"] for item in counts}
        except Exception as e:
            table_counts = {"error": str(e)}

    return jsonify({
        "server": "Flask (Python 3.11)",
        "database": {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": os.getenv("DB_PORT", "5400"),
            "name": os.getenv("DB_NAME", "fleet_ops_db"),
            "connected": db_status.get("connected", False),
            "table_counts": table_counts,
            "diagnostic": db_status
        }
    })


@app.route("/api/routes", methods=["GET"])
def list_api_routes():
    """List all registered API endpoints for exploration and testing."""
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint != "static":
            routes.append({
                "endpoint": rule.rule,
                "methods": sorted(list(rule.methods - {"HEAD", "OPTIONS"}))
            })
    routes.sort(key=lambda x: x["endpoint"])
    return jsonify({"total_endpoints": len(routes), "routes": routes})


# Global 404 & 500 error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_ENV", "development") == "development"
    print(f"[*] Starting Fleet Ops API Server on http://localhost:{port} (Debug: {debug_mode})")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
