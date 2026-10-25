-- ============================================================================
-- FLEET VEHICLE MAINTENANCE & OPERATIONS MANAGEMENT SYSTEM
-- DBMS Micro-Project Database Schema (PostgreSQL DDL)
-- File: schema.sql
-- Description: Full relational schema definition demonstrating core DBMS concepts:
--              1. ER-to-Relational Mapping & Integrity Constraints (PK, FK, UNIQUE, CHECK, NOT NULL)
--              2. Referential Integrity Actions (ON DELETE RESTRICT, ON DELETE CASCADE)
--              3. PL/pgSQL Database Trigger for automated state synchronization
--              4. Advanced Analytical Database Views using JOIN, GROUP BY, SUM, and Subqueries
-- ============================================================================

-- Clean up any existing objects to ensure idempotent script execution
DROP VIEW IF EXISTS view_vehicle_operating_cost CASCADE;
DROP VIEW IF EXISTS view_overdue_maintenance CASCADE;
DROP TRIGGER IF EXISTS trg_trip_update_odometer ON TripLogs;
DROP FUNCTION IF EXISTS fn_update_vehicle_odometer();
DROP TABLE IF EXISTS MaintenanceRecords CASCADE;
DROP TABLE IF EXISTS FuelLogs CASCADE;
DROP TABLE IF EXISTS TripLogs CASCADE;
DROP TABLE IF EXISTS ServiceCenters CASCADE;
DROP TABLE IF EXISTS Drivers CASCADE;
DROP TABLE IF EXISTS Vehicles CASCADE;

-- ============================================================================
-- SECTION 1: MASTER ENTITY TABLES
-- ============================================================================

-- Table 1.1: Vehicles
-- Represents the delivery hub fleet assets (commercial vans and trucks).
-- Syllabus Concepts: Primary Key, Unique Constraint, Domain Check Constraints, Default Values.
CREATE TABLE Vehicles (
    VehicleID SERIAL PRIMARY KEY,
    LicensePlate VARCHAR(20) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    CurrentOdometer INT NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints:
    CONSTRAINT uq_vehicles_license_plate UNIQUE (LicensePlate),
    CONSTRAINT chk_vehicles_odometer_non_negative CHECK (CurrentOdometer >= 0),
    CONSTRAINT chk_vehicles_status CHECK (Status IN ('Active', 'In Shop', 'Retired'))
);

COMMENT ON TABLE Vehicles IS 'Master table storing commercial fleet vehicles with current status and odometer readings.';
COMMENT ON COLUMN Vehicles.CurrentOdometer IS 'Total accumulated distance (in km). Automatically updated via TripLogs trigger.';
COMMENT ON COLUMN Vehicles.Status IS 'Operational state: Active (on duty), In Shop (under maintenance), Retired (decommissioned).';


-- Table 1.2: Drivers
-- Represents certified delivery personnel assigned to trips and fuel logs.
-- Syllabus Concepts: Entity integrity, Unique identification, Not Null integrity.
CREATE TABLE Drivers (
    DriverID SERIAL PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    LicenseNumber VARCHAR(50) NOT NULL,
    Phone VARCHAR(20),
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints:
    CONSTRAINT uq_drivers_license_number UNIQUE (LicenseNumber),
    CONSTRAINT chk_drivers_status CHECK (Status IN ('Active', 'On Leave', 'Suspended', 'Retired'))
);

COMMENT ON TABLE Drivers IS 'Master table storing driver profiles, driving license credentials, and duty status.';


-- Table 1.3: ServiceCenters
-- Represents authorized workshops and third-party maintenance facilities.
-- Syllabus Concepts: Master reference table for referential integrity.
CREATE TABLE ServiceCenters (
    CenterID SERIAL PRIMARY KEY,
    CenterName VARCHAR(100) NOT NULL,
    City VARCHAR(50) NOT NULL,
    ContactPhone VARCHAR(20),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ServiceCenters IS 'Master table containing authorized external service and maintenance centers.';


-- ============================================================================
-- SECTION 2: TRANSACTION / OPERATIONAL TABLES
-- ============================================================================

-- Table 2.1: TripLogs
-- Records daily transport routes, driver assignments, and distance covered.
-- Syllabus Concepts: Foreign Key Referential Constraints, Tuple Relational Constraint (EndKm >= StartKm).
CREATE TABLE TripLogs (
    TripID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL,
    DriverID INT NOT NULL,
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    StartKm INT NOT NULL,
    EndKm INT NOT NULL,
    Notes TEXT,

    -- Foreign Key Constraints with ON DELETE RESTRICT (Prevents deleting vehicles or drivers with active trip audit history):
    CONSTRAINT fk_triplogs_vehicle FOREIGN KEY (VehicleID) 
        REFERENCES Vehicles(VehicleID) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_triplogs_driver FOREIGN KEY (DriverID) 
        REFERENCES Drivers(DriverID) 
        ON DELETE RESTRICT,

    -- Table-level Integrity Constraints:
    CONSTRAINT chk_triplogs_km_valid CHECK (EndKm >= StartKm),
    CONSTRAINT chk_triplogs_startkm_positive CHECK (StartKm >= 0),
    CONSTRAINT chk_triplogs_dates_valid CHECK (EndDate >= StartDate)
);

COMMENT ON TABLE TripLogs IS 'Transactional table logging daily commercial delivery runs and kilometer readings.';
COMMENT ON CONSTRAINT fk_triplogs_vehicle ON TripLogs IS 'ON DELETE RESTRICT ensures vehicle audit records cannot be orphaned.';


-- Table 2.2: FuelLogs
-- Tracks diesel/petrol refueling expenses, fuel volume, and unit costs.
-- Syllabus Concepts: Foreign Keys, Domain Check constraints (> 0), Derived attribute storage.
CREATE TABLE FuelLogs (
    FuelID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL,
    DriverID INT NOT NULL,
    Liters NUMERIC(8, 2) NOT NULL,
    CostPerLiter NUMERIC(8, 2) NOT NULL,
    TotalAmount NUMERIC(10, 2) NOT NULL,
    LogDate DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Foreign Key Constraints:
    CONSTRAINT fk_fuellogs_vehicle FOREIGN KEY (VehicleID) 
        REFERENCES Vehicles(VehicleID) 
        ON DELETE RESTRICT,

    CONSTRAINT fk_fuellogs_driver FOREIGN KEY (DriverID) 
        REFERENCES Drivers(DriverID) 
        ON DELETE RESTRICT,

    -- Integrity Constraints:
    CONSTRAINT chk_fuellogs_liters_positive CHECK (Liters > 0),
    CONSTRAINT chk_fuellogs_cost_positive CHECK (CostPerLiter > 0),
    CONSTRAINT chk_fuellogs_total_non_negative CHECK (TotalAmount >= 0)
);

COMMENT ON TABLE FuelLogs IS 'Operational log tracking fleet refueling instances and fuel expenditure.';


-- Table 2.3: MaintenanceRecords
-- Logs repair history, routine servicing, and future scheduled service thresholds.
-- Syllabus Concepts: ON DELETE CASCADE (Vehicle maintenance history purged if vehicle record is permanently removed),
--                    ON DELETE RESTRICT (ServiceCenter cannot be deleted if past invoices are linked).
CREATE TABLE MaintenanceRecords (
    RecordID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL,
    CenterID INT NOT NULL,
    ServiceType VARCHAR(100) NOT NULL,
    Cost NUMERIC(10, 2) NOT NULL,
    ServiceDate DATE NOT NULL DEFAULT CURRENT_DATE,
    NextServiceDueKm INT NOT NULL,
    Notes TEXT,

    -- Referential Actions showcasing both RESTRICT and CASCADE:
    CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (VehicleID) 
        REFERENCES Vehicles(VehicleID) 
        ON DELETE CASCADE,

    CONSTRAINT fk_maintenance_center FOREIGN KEY (CenterID) 
        REFERENCES ServiceCenters(CenterID) 
        ON DELETE RESTRICT,

    -- Integrity Constraints:
    CONSTRAINT chk_maintenance_cost_non_negative CHECK (Cost >= 0),
    CONSTRAINT chk_maintenance_due_positive CHECK (NextServiceDueKm > 0)
);

COMMENT ON TABLE MaintenanceRecords IS 'Service history table recording vehicle repairs, expenses, and next service mileage targets.';
COMMENT ON CONSTRAINT fk_maintenance_vehicle ON MaintenanceRecords IS 'ON DELETE CASCADE automatically cascades deletion when an obsolete vehicle is purged.';


-- ============================================================================
-- SECTION 3: DATABASE TRIGGER (AUTOMATED ODOMETER SYNCHRONIZATION)
-- ============================================================================
-- Syllabus Requirement:
-- "Write a PostgreSQL trigger (AFTER INSERT ON TripLogs) that automatically updates
--  Vehicles.CurrentOdometer with the latest EndKm."
--
-- Rationale:
-- Centralizes business logic inside the database engine. Guarantees Vehicles.CurrentOdometer
-- is always consistent with the latest trip endpoint without relying on error-prone application code.

CREATE OR REPLACE FUNCTION fn_update_vehicle_odometer()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the master vehicle odometer only if the completed trip logged a higher kilometer reading
    UPDATE Vehicles
    SET CurrentOdometer = NEW.EndKm
    WHERE VehicleID = NEW.VehicleID
      AND NEW.EndKm > CurrentOdometer;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_update_vehicle_odometer() IS 'Trigger function to advance Vehicles.CurrentOdometer on new TripLogs insertion.';

CREATE TRIGGER trg_trip_update_odometer
AFTER INSERT ON TripLogs
FOR EACH ROW
EXECUTE FUNCTION fn_update_vehicle_odometer();


-- ============================================================================
-- SECTION 4: DATABASE VIEWS (ANALYTICAL REPORTING & SYLLABUS QUERIES)
-- ============================================================================

-- View 4.1: view_overdue_maintenance
-- Syllabus Requirement:
-- "Compares Vehicles.CurrentOdometer against MAX(NextServiceDueKm) from MaintenanceRecords
--  using subqueries to flag overdue vehicles."
--
-- Query Logic:
-- 1. Uses an inner subquery with GROUP BY to identify the most recent NextServiceDueKm threshold per vehicle.
-- 2. Compares the vehicle's live CurrentOdometer with this threshold.
-- 3. Flags vehicles that have exceeded the due mileage and ranks them by urgency (OverdueByKm DESC).
CREATE OR REPLACE VIEW view_overdue_maintenance AS
SELECT 
    v.VehicleID,
    v.LicensePlate,
    v.Model,
    v.Status,
    v.CurrentOdometer,
    latest_maint.LatestDueKm,
    (v.CurrentOdometer - latest_maint.LatestDueKm) AS OverdueByKm,
    CASE 
        WHEN v.CurrentOdometer >= latest_maint.LatestDueKm THEN 'Overdue'
        WHEN (latest_maint.LatestDueKm - v.CurrentOdometer) <= 1000 THEN 'Due Soon'
        ELSE 'Good'
    END AS MaintenanceStatus,
    latest_maint.LastServiceDate,
    latest_maint.LastServiceType
FROM Vehicles v
JOIN (
    -- Correlated/grouped subquery to get the latest maintenance record per vehicle
    SELECT 
        mr.VehicleID,
        MAX(mr.NextServiceDueKm) AS LatestDueKm,
        MAX(mr.ServiceDate) AS LastServiceDate,
        (
            SELECT mr_inner.ServiceType 
            FROM MaintenanceRecords mr_inner 
            WHERE mr_inner.VehicleID = mr.VehicleID 
            ORDER BY mr_inner.ServiceDate DESC, mr_inner.RecordID DESC 
            LIMIT 1
        ) AS LastServiceType
    FROM MaintenanceRecords mr
    GROUP BY mr.VehicleID
) latest_maint ON v.VehicleID = latest_maint.VehicleID
WHERE v.CurrentOdometer >= latest_maint.LatestDueKm
  AND v.Status != 'Retired'
ORDER BY OverdueByKm DESC;

COMMENT ON VIEW view_overdue_maintenance IS 'Analytical view identifying vehicles exceeding their maximum scheduled service kilometer limit.';


-- View 4.2: view_vehicle_operating_cost
-- Syllabus Requirement:
-- "Aggregates total fuel cost, repair cost, and total distance traveled using JOIN, GROUP BY, and SUM."
--
-- Architecture & Academic Note on Cartesian Traps:
-- Joining FuelLogs, MaintenanceRecords, and TripLogs directly in a single SELECT produces
-- a Cartesian product of child records, leading to multiplied SUM results.
-- To solve this classically and cleanly in relational SQL, we aggregate each child dimension
-- in dedicated GROUP BY subqueries before performing LEFT OUTER JOINs with the master Vehicles table.
CREATE OR REPLACE VIEW view_vehicle_operating_cost AS
SELECT 
    v.VehicleID,
    v.LicensePlate,
    v.Model,
    v.Status,
    COALESCE(trip_agg.TotalDistanceKm, 0) AS TotalDistanceKm,
    COALESCE(fuel_agg.TotalFuelCost, 0.00) AS TotalFuelCost,
    COALESCE(maint_agg.TotalMaintenanceCost, 0.00) AS TotalMaintenanceCost,
    (COALESCE(fuel_agg.TotalFuelCost, 0.00) + COALESCE(maint_agg.TotalMaintenanceCost, 0.00)) AS TotalOperatingCost,
    CASE 
        WHEN COALESCE(trip_agg.TotalDistanceKm, 0) > 0 
        THEN ROUND(((COALESCE(fuel_agg.TotalFuelCost, 0.00) + COALESCE(maint_agg.TotalMaintenanceCost, 0.00)) / trip_agg.TotalDistanceKm)::numeric, 2)
        ELSE 0.00 
    END AS CostPerKm
FROM Vehicles v
LEFT JOIN (
    -- Subquery 1: Aggregate total kilometers logged per vehicle
    SELECT 
        VehicleID, 
        SUM(EndKm - StartKm) AS TotalDistanceKm
    FROM TripLogs
    GROUP BY VehicleID
) trip_agg ON v.VehicleID = trip_agg.VehicleID
LEFT JOIN (
    -- Subquery 2: Aggregate total fuel expenses per vehicle
    SELECT 
        VehicleID, 
        SUM(TotalAmount) AS TotalFuelCost
    FROM FuelLogs
    GROUP BY VehicleID
) fuel_agg ON v.VehicleID = fuel_agg.VehicleID
LEFT JOIN (
    -- Subquery 3: Aggregate total maintenance and repair expenses per vehicle
    SELECT 
        VehicleID, 
        SUM(Cost) AS TotalMaintenanceCost
    FROM MaintenanceRecords
    GROUP BY VehicleID
) maint_agg ON v.VehicleID = maint_agg.VehicleID
ORDER BY TotalOperatingCost DESC;

COMMENT ON VIEW view_vehicle_operating_cost IS 'Analytical view summarizing total operating expenses (fuel + repairs) and cost-per-km efficiency per vehicle.';

-- ============================================================================
-- END OF SCHEMA DEFINITION
-- ============================================================================
