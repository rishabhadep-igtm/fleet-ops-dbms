-- ============================================================================
-- FLEET VEHICLE MAINTENANCE & OPERATIONS MANAGEMENT SYSTEM
-- Sample Seed Dataset (PostgreSQL DML)
-- File: seed.sql
-- Description: Realistic test dataset representing a commercial delivery fleet hub:
--              - 10 Master Vehicles (Vans, Box Trucks, Light Cargo)
--              - 10 Master Drivers (Assigned drivers with contact details)
--              - 6 Master Service Centers (Authorized regional garages)
--              - 15 Transactional Trip Logs (Triggers automated odometer updates)
--              - 15 Transactional Fuel Logs (Refueling receipts with computed amounts)
--              - 14 Transactional Maintenance Records (Routine & critical repairs)
-- ============================================================================

-- Clean existing data before seeding (TRUNCATE in cascade order)
TRUNCATE TABLE MaintenanceRecords, FuelLogs, TripLogs, ServiceCenters, Drivers, Vehicles RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. SEED MASTER TABLES
-- ============================================================================

-- 1.1 Master Vehicles (10 records)
-- Note: Initial odometers represent the baseline before latest trips are logged.
-- When TripLogs are inserted below, the database trigger will dynamically update these.
INSERT INTO Vehicles (VehicleID, LicensePlate, Model, CurrentOdometer, Status) VALUES
(1,  'KA-01-EA-1024', 'Ford Transit 350 High Roof',    45200, 'Active'),
(2,  'KA-01-EA-1025', 'Mercedes-Benz Sprinter 2500',   62100, 'Active'),
(3,  'KA-03-MB-4091', 'Ram ProMaster 2500 Cargo',      38900, 'Active'),
(4,  'KA-04-TC-8812', 'Tata Ace Gold EV',              18400, 'Active'),
(5,  'KA-05-AB-3301', 'Isuzu NPR HD Box Truck',        89400, 'Active'),
(6,  'KA-02-ZZ-5520', 'Freightliner M2 106 Medium Duty', 112000, 'In Shop'),
(7,  'KA-01-MC-7744', 'Ford Transit Connect LWB',      29500, 'Active'),
(8,  'KA-04-GH-6619', 'Mahindra Bolero Maxi Truck',    54300, 'Active'),
(9,  'KA-05-EF-2210', 'Chevrolet Express 3500 Van',    78100, 'In Shop'),
(10, 'KA-02-XX-9900', 'Eicher Pro 2049 Light Truck',   95000, 'Retired');

-- Reset identity sequence for Vehicles table
SELECT setval('vehicles_vehicleid_seq', (SELECT MAX(VehicleID) FROM Vehicles));


-- 1.2 Master Drivers (10 records)
INSERT INTO Drivers (DriverID, FullName, LicenseNumber, Phone, Status) VALUES
(1,  'Rajesh Kumar Sharma',   'DL-0420180014290', '+91 98450 11221', 'Active'),
(2,  'Amitabh Sengupta',      'DL-0120190088123', '+91 98450 22332', 'Active'),
(3,  'Venkatesh Murthy',      'DL-0520160033419', '+91 98450 33443', 'Active'),
(4,  'Harpreet Singh Dhillon','DL-0320200077182', '+91 98450 44554', 'Active'),
(5,  'Mohammed Farooq',       'DL-0220170099510', '+91 98450 55665', 'Active'),
(6,  'Kiran Babu Gowda',      'DL-0420210011832', '+91 98450 66776', 'Active'),
(7,  'Suresh Nair',           'DL-0120150066291', '+91 98450 77887', 'On Leave'),
(8,  'Deepak Patwardhan',     'DL-0520220022319', '+91 98450 88998', 'Active'),
(9,  'Manish Verma',          'DL-0220180055401', '+91 98450 99009', 'Active'),
(10, 'Anand Ranganathan',     'DL-0320140044199', '+91 98450 00110', 'Retired');

-- Reset identity sequence for Drivers table
SELECT setval('drivers_driverid_seq', (SELECT MAX(DriverID) FROM Drivers));


-- 1.3 Master Service Centers (6 records)
INSERT INTO ServiceCenters (CenterID, CenterName, City, ContactPhone) VALUES
(1, 'Express Fleet Care & Diesel Workshop', 'Bangalore Central', '+91 80 2555 1010'),
(2, 'Apex Commercial Vehicle Service Hub',  'Bangalore North',   '+91 80 2888 2020'),
(3, 'Metro Truck & Auto Mechanics Ltd',     'Bangalore South',   '+91 80 2666 3030'),
(4, 'Highway Star Heavy Fleet Repair',      'Hosur Road Hub',    '+91 80 2999 4040'),
(5, 'TransTech Authorized EV Care Hub',     'Whitefield Tech',   '+91 80 2777 5050'),
(6, 'Reliable Hydraulics & Transmission',   'Peenya Industrial', '+91 80 2444 6060');

-- Reset identity sequence for ServiceCenters table
SELECT setval('servicecenters_centerid_seq', (SELECT MAX(CenterID) FROM ServiceCenters));


-- ============================================================================
-- 2. SEED TRANSACTION / OPERATIONAL TABLES
-- ============================================================================

-- 2.1 Maintenance Records (14 records)
-- We insert maintenance records first so baseline service due thresholds are defined.
-- Notice:
--   - Vehicle 1 has NextServiceDueKm = 45000. When TripLogs advance it to 45680, it will become OVERDUE!
--   - Vehicle 2 has NextServiceDueKm = 63500. It will be near due / active.
--   - Vehicle 5 has NextServiceDueKm = 89000. It is already at 89400 km -> OVERDUE!
--   - Vehicle 8 has NextServiceDueKm = 55000. When trips advance it to 55210 -> OVERDUE!
INSERT INTO MaintenanceRecords (RecordID, VehicleID, CenterID, ServiceType, Cost, ServiceDate, NextServiceDueKm, Notes) VALUES
(1,  1, 1, 'Oil & Filter Change + 40-Point Inspection', 4500.00,  '2026-08-10', 44000, 'Synthetic oil and OEM filter replacement'),
(2,  1, 1, 'Brake Pad Replacement & Rotor Truing',      8200.00,  '2026-09-15', 45000, 'Front axle brake shoes and pad set'),
(3,  2, 2, 'Scheduled 60,000 Km Major Service',        16500.00,  '2026-07-22', 63500, 'Fuel injector cleaning and transmission flush'),
(4,  3, 3, 'Tire Balancing & Wheel Alignment',          3200.00,  '2026-09-05', 42000, 'All four wheels balanced; nitrogen refilled'),
(5,  4, 5, 'EV Battery Cell Diagnostic & Coolant Flush', 6800.00,  '2026-08-18', 25000, 'High voltage battery pack firmware update completed'),
(6,  5, 4, 'Heavy Suspension Bushing & Shock Overhaul', 22500.00,  '2026-06-30', 89000, 'Leaf springs retorqued; rear hydraulic shocks replaced'),
(7,  6, 6, 'Transmission Clutch Disc Overhaul',         31000.00,  '2026-10-12', 115000, 'Currently under mechanical overhaul in bay 4'),
(8,  7, 1, 'Air Conditioning Compressor & Belt Change',  7400.00,  '2026-08-25', 35000, 'R134a refrigerant recharged and compressor replaced'),
(9,  8, 3, 'Brake Fluid Flush & Rear Drum Resurfacing',  5600.00,  '2026-09-01', 54000, 'Brake lines bled and drums adjusted'),
(10, 9, 2, 'Engine Head Gasket & Thermostat Overhaul',  28000.00,  '2026-10-02', 82000, 'Coolant leak resolved; engine compression tested'),
(11, 2, 2, 'Air Intake Filter & Cabin Filter Set',       2100.00,  '2026-09-20', 65000, 'Air cleaner housing cleared of debris'),
(12, 3, 3, 'Headlamp Relay & Alternator Check',         2900.00,  '2026-10-01', 46000, 'Alternator voltage verified stable under load'),
(13, 5, 4, 'Diesel Particulate Filter (DPF) Regen',      8900.00,  '2026-09-10', 89500, 'Exhaust pressure back within OEM spec'),
(14, 8, 3, 'Steering Rack Boot & Tie Rod Ends',         6400.00,  '2026-10-05', 54500, 'Alignment realigned post rod end installation');

-- Reset identity sequence for MaintenanceRecords table
SELECT setval('maintenancerecords_recordid_seq', (SELECT MAX(RecordID) FROM MaintenanceRecords));


-- 2.2 Transactional Fuel Logs (15 records)
-- Tracks fuel quantity, unit cost, and computed total expense per vehicle & driver.
INSERT INTO FuelLogs (FuelID, VehicleID, DriverID, Liters, CostPerLiter, TotalAmount, LogDate) VALUES
(1,  1, 1, 65.50, 98.40, 6445.20, '2026-10-01'),
(2,  2, 2, 72.00, 98.40, 7084.80, '2026-10-02'),
(3,  3, 3, 58.20, 98.60, 5738.52, '2026-10-03'),
(4,  4, 4, 35.00, 15.00,  525.00, '2026-10-04'), -- EV fast charging rate
(5,  5, 5, 95.00, 98.60, 9367.00, '2026-10-05'),
(6,  7, 6, 44.80, 98.50, 4412.80, '2026-10-06'),
(7,  8, 8, 55.00, 98.50, 5417.50, '2026-10-07'),
(8,  1, 1, 68.00, 98.70, 6711.60, '2026-10-10'),
(9,  2, 2, 70.50, 98.70, 6958.35, '2026-10-11'),
(10, 3, 3, 60.00, 98.80, 5928.00, '2026-10-12'),
(11, 5, 5, 98.40, 98.80, 9721.92, '2026-10-14'),
(12, 7, 9, 46.00, 98.90, 4549.40, '2026-10-16'),
(13, 8, 8, 52.50, 98.90, 5192.25, '2026-10-18'),
(14, 1, 1, 64.00, 99.10, 6342.40, '2026-10-21'),
(15, 2, 2, 71.00, 99.10, 7036.10, '2026-10-23');

-- Reset identity sequence for FuelLogs table
SELECT setval('fuellogs_fuelid_seq', (SELECT MAX(FuelID) FROM FuelLogs));


-- 2.3 Transactional Trip Logs (15 records)
-- NOTE: As these rows are inserted, the trigger `trg_trip_update_odometer` executes
--       AFTER INSERT ON TripLogs, updating Vehicles.CurrentOdometer automatically.
INSERT INTO TripLogs (TripID, VehicleID, DriverID, StartDate, EndDate, StartKm, EndKm, Notes) VALUES
(1,  1, 1, '2026-10-01 08:00:00', '2026-10-01 17:30:00', 45200, 45360, 'Bangalore Central to Electronic City hub delivery run'),
(2,  2, 2, '2026-10-02 07:30:00', '2026-10-02 18:00:00', 62100, 62310, 'Airport logistics corridor and Devanahalli freight'),
(3,  3, 3, '2026-10-03 08:15:00', '2026-10-03 16:45:00', 38900, 39080, 'South Bangalore retail store inventory dispatch'),
(4,  4, 4, '2026-10-04 09:00:00', '2026-10-04 15:30:00', 18400, 18495, 'Koramangala and Indiranagar last-mile parcels'),
(5,  5, 5, '2026-10-05 06:00:00', '2026-10-05 20:00:00', 89400, 89750, 'Heavy industrial consignment to Peenya and Tumkur'),
(6,  7, 6, '2026-10-06 08:30:00', '2026-10-06 17:00:00', 29500, 29690, 'Whitefield corporate campus multi-drop delivery'),
(7,  8, 8, '2026-10-07 07:45:00', '2026-10-07 19:15:00', 54300, 54590, 'Outer Ring Road distribution center bulk transit'),
(8,  1, 1, '2026-10-10 08:00:00', '2026-10-10 18:30:00', 45360, 45540, 'Mysore Road e-commerce hub round trip'),
(9,  2, 2, '2026-10-11 07:15:00', '2026-10-11 19:00:00', 62310, 62580, 'Regional medical supplies urgent delivery'),
(10, 3, 3, '2026-10-12 08:30:00', '2026-10-12 17:15:00', 39080, 39250, 'Wholesale grocery chain weekend restocking'),
(11, 5, 5, '2026-10-14 06:30:00', '2026-10-14 21:00:00', 89750, 90120, 'Inter-state courier feeder trip (Hosur border)'),
(12, 7, 9, '2026-10-16 08:00:00', '2026-10-16 16:30:00', 29690, 29840, 'Commercial documentation and priority parcel run'),
(13, 8, 8, '2026-10-18 07:30:00', '2026-10-18 19:45:00', 54590, 54910, 'Heavy warehouse pallets transfer'),
(14, 1, 1, '2026-10-21 08:00:00', '2026-10-21 18:00:00', 45540, 45680, 'Electronic City hardware shipment (Triggers Overdue!)'),
(15, 2, 2, '2026-10-23 07:00:00', '2026-10-23 18:45:00', 62580, 62840, 'North express freight corridor distribution');

-- Reset identity sequence for TripLogs table
SELECT setval('triplogs_tripid_seq', (SELECT MAX(TripID) FROM TripLogs));


-- ============================================================================
-- 3. SYLLABUS VALIDATION & VERIFICATION QUERIES
-- ============================================================================

-- Query 3.1: Verify row counts across all master and transactional tables
SELECT 'Vehicles' AS TableName, COUNT(*) AS RecordCount FROM Vehicles
UNION ALL
SELECT 'Drivers', COUNT(*) FROM Drivers
UNION ALL
SELECT 'ServiceCenters', COUNT(*) FROM ServiceCenters
UNION ALL
SELECT 'TripLogs', COUNT(*) FROM TripLogs
UNION ALL
SELECT 'FuelLogs', COUNT(*) FROM FuelLogs
UNION ALL
SELECT 'MaintenanceRecords', COUNT(*) FROM MaintenanceRecords;

-- Query 3.2: Verify that Database Trigger trg_trip_update_odometer updated Vehicles.CurrentOdometer
-- Vehicles 1, 2, 3, 4, 5, 7, 8 should reflect the highest EndKm from their TripLogs
SELECT 
    v.VehicleID,
    v.LicensePlate,
    v.Model,
    v.CurrentOdometer AS UpdatedOdometerByTrigger,
    MAX(t.EndKm) AS ExpectedEndKmFromTrips,
    CASE 
        WHEN v.CurrentOdometer = MAX(t.EndKm) THEN 'VERIFIED: Trigger Fired Successfully'
        ELSE 'MISMATCH'
    END AS TriggerStatus
FROM Vehicles v
JOIN TripLogs t ON v.VehicleID = t.VehicleID
GROUP BY v.VehicleID, v.LicensePlate, v.Model, v.CurrentOdometer
ORDER BY v.VehicleID;

-- Query 3.3: Test Analytical View: view_overdue_maintenance
SELECT 
    VehicleID,
    LicensePlate,
    Model,
    CurrentOdometer,
    LatestDueKm,
    OverdueByKm,
    MaintenanceStatus,
    LastServiceType
FROM view_overdue_maintenance;

-- Query 3.4: Test Analytical View: view_vehicle_operating_cost
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
FROM view_vehicle_operating_cost;
