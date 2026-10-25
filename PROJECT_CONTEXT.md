# Fleet Vehicle Maintenance & Operations Management System - Project Context

> **Persistent Context Memory Document**  
> *Maintained across all development prompts for state tracking, architectural reference, and evaluation readiness.*  
> **Last Updated:** Prompt 4 (Live Database Created, Seeded, and Verified on PostgreSQL 18 Port 5400)

---

## 1. Project Overview & Objectives

- **System Purpose:** A centralized relational database and full-stack management dashboard for a commercial delivery fleet hub (15–20 vans & trucks). It prevents missed maintenance, tracks fuel economics, enforces driver accountability, and computes live operational efficiency metrics (cost-per-km).
- **Academic Focus (DBMS Micro-Project):** Designed explicitly to showcase core relational database syllabus concepts:
  - Strict ER-to-Relational mapping with entity and domain constraints (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`, `DEFAULT`).
  - Referential integrity actions (`ON DELETE RESTRICT` for audit logs; `ON DELETE CASCADE` for maintenance history).
  - PL/pgSQL database trigger (`trg_trip_update_odometer`) on `TripLogs` to maintain state consistency across entities without relying on client-side code.
  - Analytical SQL views with `JOIN`, `GROUP BY`, `SUM`, and subqueries (`view_overdue_maintenance`, `view_vehicle_operating_cost`).
  - Pure raw SQL querying (no ORM abstraction) via `psycopg2`.
- **Target Tech Stack:**
  - **Database:** PostgreSQL (v18.6 installed locally, listening on port 5400, superuser: `postgres`, password: `jay`).
  - **Backend:** Python (Flask 3.1) using pure raw SQL with `psycopg2` and `RealDictCursor`.
  - **Frontend:** React 19 + Vite, responsive dashboard with ambient animated glowing background, dark/light mode toggle, dynamic forms, and Chart.js visualizations.

---

## 2. Current Implementation Status

### Phase 1: Database Foundation — [COMPLETED & VERIFIED LIVE]
- [x] Complete PostgreSQL DDL schema script generated (`schema.sql`).
  - [x] Master tables: `Vehicles`, `Drivers`, `ServiceCenters`.
  - [x] Transactional tables: `TripLogs`, `FuelLogs`, `MaintenanceRecords`.
  - [x] Table & column constraints (`CHECK`, `UNIQUE`, `DEFAULT`, `NOT NULL`).
  - [x] Referential actions (`ON DELETE RESTRICT`, `ON DELETE CASCADE`).
  - [x] PL/pgSQL trigger function `fn_update_vehicle_odometer` and trigger `trg_trip_update_odometer`.
  - [x] Analytical view `view_overdue_maintenance` using subqueries and `MAX(NextServiceDueKm)`.
  - [x] Analytical view `view_vehicle_operating_cost` using subquery aggregations avoiding Cartesian traps.
- [x] Realistic sample seed dataset generated (`seed.sql`).
  - [x] 10 Master Vehicles with realistic commercial models and statuses.
  - [x] 10 Master Drivers with license credentials.
  - [x] 6 Master Service Centers across regional hubs.
  - [x] 15 Transactional Trip Logs designed to trigger automated odometer progression.
  - [x] 15 Transactional Fuel Logs with fuel volume and calculated amounts.
  - [x] 14 Maintenance Records with scheduled service targets, creating 3 active overdue alert scenarios.
- [x] Automated Database runner & seeder script (`init_db.py`):
  - [x] Created `fleet_ops_db` database on PostgreSQL port 5400.
  - [x] Executed DDL `schema.sql` and `seed.sql`.
  - [x] Verified trigger execution (`trg_trip_update_odometer` updated `Vehicles.CurrentOdometer`).
  - [x] Verified Analytical Views (`view_overdue_maintenance` returned 3 overdue vehicles; `view_vehicle_operating_cost` computed expenses and cost/km).

### Phase 2: Backend API & Database Connectivity — [COMPLETED & TESTED]
- [x] Connection pooling & raw SQL execution layer (`server/db.py`) with PostgreSQL error mapping (`23505`, `23503`, `23514`).
- [x] Live tested `/api/health` against PostgreSQL: returns 10 vehicles, 10 drivers, 6 centers, 15 trips, 15 fuel logs, 14 maintenance records.
- [x] Live tested `/api/kpis`: returns 7 active vehicles, 2 in shop, 1 retired, 3 overdue service alerts, ₹2,45,430.84 total operating spend.
- [x] Master entity CRUD routes for Vehicles (`/api/vehicles`) with search filtering, health badges, and referential integrity protection.
- [x] Master entity CRUD routes for Drivers (`/api/drivers`) and Service Centers (`/api/service-centers`).
- [x] Transactional routes (`/api/trips`, `/api/fuel`, `/api/maintenance`).
- [x] Analytical report endpoints (`/api/reports/overdue`, `/api/reports/operating-cost`).

### Phase 3: Frontend Interactive Dashboard — [COMPLETED & BUILT]
- [x] React + Vite project built (`npm run build` passed cleanly with 0 errors).
- [x] Ambient animated glowing background blobs.
- [x] Dark / Light theme toggle with `localStorage` memory.
- [x] Database health pill verifying live PostgreSQL connection.
- [x] 4 Live KPI metric cards with hover micro-animations and glowing alert pulse.
- [x] Live Fleet Status table with real-time search, status tabs, and color-coded service health badges.
- [x] Interactive CRUD & transactional modal dialogs with master table dynamic dropdowns.
- [x] Report 1 (`ReportOverdue`): Exposes `view_overdue_maintenance` with urgency indicators and 1-click repair scheduling.
- [x] Report 2 (`ReportExpenses`): Grouped Chart.js bar chart comparing Fuel Spend vs. Maintenance Cost per vehicle.

---

## 3. Database Schema Snapshot

### 3.1 Master Tables
| Table | Primary Key | Key Attributes & Types | Constraints & Defaults |
| :--- | :--- | :--- | :--- |
| `Vehicles` | `VehicleID SERIAL` | `LicensePlate VARCHAR(20)`, `Model VARCHAR(100)`, `CurrentOdometer INT`, `Status VARCHAR(20)` | `UNIQUE(LicensePlate)`, `CHECK(CurrentOdometer >= 0)`, `CHECK(Status IN ('Active', 'In Shop', 'Retired'))`, `DEFAULT Status = 'Active'` |
| `Drivers` | `DriverID SERIAL` | `FullName VARCHAR(100)`, `LicenseNumber VARCHAR(50)`, `Phone VARCHAR(20)`, `Status VARCHAR(20)` | `UNIQUE(LicenseNumber)`, `CHECK(Status IN ('Active', 'On Leave', 'Suspended', 'Retired'))`, `DEFAULT Status = 'Active'` |
| `ServiceCenters` | `CenterID SERIAL` | `CenterName VARCHAR(100)`, `City VARCHAR(50)`, `ContactPhone VARCHAR(20)` | `NOT NULL(CenterName, City)` |

### 3.2 Transactional Tables
| Table | Primary Key | Foreign Keys & Actions | Integrity Constraints |
| :--- | :--- | :--- | :--- |
| `TripLogs` | `TripID SERIAL` | `VehicleID -> Vehicles(VehicleID) ON DELETE RESTRICT`<br>`DriverID -> Drivers(DriverID) ON DELETE RESTRICT` | `CHECK(EndKm >= StartKm)`, `CHECK(StartKm >= 0)`, `CHECK(EndDate >= StartDate)` |
| `FuelLogs` | `FuelID SERIAL` | `VehicleID -> Vehicles(VehicleID) ON DELETE RESTRICT`<br>`DriverID -> Drivers(DriverID) ON DELETE RESTRICT` | `CHECK(Liters > 0)`, `CHECK(CostPerLiter > 0)`, `CHECK(TotalAmount >= 0)`, `DEFAULT LogDate = CURRENT_DATE` |
| `MaintenanceRecords` | `RecordID SERIAL` | `VehicleID -> Vehicles(VehicleID) ON DELETE CASCADE`<br>`CenterID -> ServiceCenters(CenterID) ON DELETE RESTRICT` | `CHECK(Cost >= 0)`, `CHECK(NextServiceDueKm > 0)`, `DEFAULT ServiceDate = CURRENT_DATE` |

### 3.3 Triggers & Procedural Logic
- **`trg_trip_update_odometer`**:
  - Event: `AFTER INSERT ON TripLogs FOR EACH ROW`
  - Function: `fn_update_vehicle_odometer()`
  - Action: Updates `Vehicles.CurrentOdometer = NEW.EndKm` when `NEW.EndKm > CurrentOdometer`.
  - Status: **Verified working live via `init_db.py`**.

### 3.4 Database Views
- **`view_overdue_maintenance`**:
  - Compares `Vehicles.CurrentOdometer` against `MAX(NextServiceDueKm)` from `MaintenanceRecords`.
  - Returns 3 overdue vehicles (`KA-01-EA-1024`, `KA-05-AB-3301`, `KA-04-GH-6619`).
- **`view_vehicle_operating_cost`**:
  - Pre-aggregates `TripLogs`, `FuelLogs`, and `MaintenanceRecords` before `LEFT JOIN`ing onto `Vehicles` to prevent Cartesian duplication.
  - Outputs `TotalDistanceKm`, `TotalFuelCost`, `TotalMaintenanceCost`, `TotalOperatingCost`, and `CostPerKm`.

---

## 4. Implemented Endpoints & Pages

| Method | Endpoint / Route | Target View / SQL Operation | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root API documentation link | **Active** |
| `GET` | `/api/health` | Diagnostic DB status & table record counts | **Active** |
| `GET` | `/api/routes` | Registered routes list | **Active** |
| `GET` | `/api/kpis` | Aggregated dashboard KPI cards metrics | **Active** |
| `GET` | `/api/vehicles` | Vehicles list with search & health badges | **Active** |
| `GET` | `/api/vehicles/:id` | Vehicle details & profile | **Active** |
| `POST` | `/api/vehicles` | Register new vehicle | **Active** |
| `PUT` | `/api/vehicles/:id` | Update vehicle profile | **Active** |
| `DELETE` | `/api/vehicles/:id` | Delete or archive (`?archive=true`) | **Active** |
| `GET` | `/api/drivers` | Drivers list & dropdown source | **Active** |
| `POST` | `/api/drivers` | Register new driver | **Active** |
| `PUT` | `/api/drivers/:id` | Update driver profile | **Active** |
| `DELETE` | `/api/drivers/:id` | Delete or retire driver | **Active** |
| `GET` | `/api/service-centers` | Service centers list | **Active** |
| `POST` | `/api/service-centers` | Register service workshop | **Active** |
| `DELETE` | `/api/service-centers/:id` | Remove service center | **Active** |
| `GET` | `/api/trips` | Trip logs dispatches list | **Active** |
| `POST` | `/api/trips` | **Fires `trg_trip_update_odometer`** | **Active** |
| `GET` | `/api/fuel` | Refueling vouchers list | **Active** |
| `POST` | `/api/fuel` | Log refueling expense | **Active** |
| `GET` | `/api/maintenance` | Maintenance invoices list | **Active** |
| `POST` | `/api/maintenance` | Log repair & next service due km | **Active** |
| `GET` | `/api/reports/overdue` | Query `view_overdue_maintenance` | **Active** |
| `GET` | `/api/reports/operating-cost` | Query `view_vehicle_operating_cost` + Chart Data | **Active** |

---

## 5. Execution Guide: Running Both Servers

### Step 1: Database Credentials (Configured & Verified)
Your active [.env](file:///c:/DBMS%20mini%20project/fleet-ops-dbms/.env) is configured with:
```ini
DB_HOST=localhost
DB_PORT=5400
DB_NAME=fleet_ops_db
DB_USER=postgres
DB_PASSWORD=jay
```

### Step 2: Database Initialization (Completed)
Database `fleet_ops_db` is created and seeded. If you ever want to re-seed from scratch:
```powershell
python init_db.py
```

### Step 3: Run the Backend Flask API (Terminal 1)
```powershell
python server/app.py
```
*API runs on `http://localhost:5000`.*

### Step 4: Run the React + Vite Frontend (Terminal 2)
```powershell
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Known Issues & Resolved Technical Hurdles

1. **PostgreSQL Service Port:** The local PostgreSQL 18 instance on Windows is configured to port **5400** (rather than default 5432). Resolved: All configurations (`.env`, `init_db.py`, `server/db.py`) default to port 5400.
2. **PostgreSQL Identifier Folding:** PostgreSQL folds unquoted column names to lowercase (e.g. `licenseplate`, `currentodometer`). When the React frontend attempted to access `v.LicensePlate.toLowerCase()`, it threw `TypeError: Cannot read properties of undefined`.
   - **Resolved in Backend:** In [server/db.py](file:///c:/DBMS%20mini%20project/fleet-ops-dbms/server/db.py), `serialize_row` maps all PostgreSQL lowercase column names to their exact PascalCase schema names via `COLUMN_MAP`, providing both casings.
   - **Resolved in Frontend:** All React components ([FleetTable.jsx](file:///c:/DBMS%20mini%20project/fleet-ops-dbms/client/src/components/FleetTable.jsx), [ReportOverdue.jsx](file:///c:/DBMS%20mini%20project/fleet-ops-dbms/client/src/components/ReportOverdue.jsx), [ReportExpenses.jsx](file:///c:/DBMS%20mini%20project/fleet-ops-dbms/client/src/components/ReportExpenses.jsx), and all modals) now use defensive accessors (`v.LicensePlate || v.licenseplate || ''`).

---

## 6. Suggested Next Prompts

1. **Option A (Viva & Evaluation Cheat Sheet):**  
   *"Generate a comprehensive Viva/Evaluation Cheat Sheet summarizing all DBMS syllabus concepts in FleetOps (Triggers, Views, Constraints, ON DELETE actions, and SQL optimizations) with sample examiner questions and answers."*
2. **Option B (End-to-End Test Suite):**  
   *"Create an automated integration test script in Python to test all API endpoints against the database and print a formatted verification report."*
3. **Option C (Project Documentation & Readme):**  
   *"Generate a complete project README.md with architecture diagrams, setup instructions, and database screenshots guide for college submission."*

