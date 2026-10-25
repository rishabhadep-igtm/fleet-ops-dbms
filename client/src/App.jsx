import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import FleetTable from './components/FleetTable';
import ReportOverdue from './components/ReportOverdue';
import ReportExpenses from './components/ReportExpenses';
import TripModal from './components/modals/TripModal';
import FuelModal from './components/modals/FuelModal';
import MaintenanceModal from './components/modals/MaintenanceModal';
import VehicleModal from './components/modals/VehicleModal';
import DeleteModal from './components/modals/DeleteModal';
import { Plus, Navigation, Fuel, Wrench, Truck, CheckCircle2, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state: defaults to sleek dark mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fleetops_theme') || 'dark';
  });

  // Navigation tab: 'dashboard' | 'overdue' | 'expenses'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Backend data state
  const [dbHealth, setDbHealth] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [overdueReport, setOverdueReport] = useState(null);
  const [expensesReport, setExpensesReport] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modal states
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Apply theme to DOM document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fleetops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch all live data from Flask API
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [healthRes, kpisRes, vehiclesRes, driversRes, centersRes, overdueRes, expensesRes] = await Promise.all([
        fetch('/api/health').then((r) => r.json()).catch(() => null),
        fetch('/api/kpis').then((r) => r.json()).catch(() => null),
        fetch('/api/vehicles').then((r) => r.json()).catch(() => null),
        fetch('/api/drivers').then((r) => r.json()).catch(() => null),
        fetch('/api/service-centers').then((r) => r.json()).catch(() => null),
        fetch('/api/reports/overdue').then((r) => r.json()).catch(() => null),
        fetch('/api/reports/operating-cost').then((r) => r.json()).catch(() => null),
      ]);

      if (healthRes) setDbHealth(healthRes);
      if (kpisRes && kpisRes.success) setKpis(kpisRes.kpis);
      if (vehiclesRes && vehiclesRes.success) setVehicles(vehiclesRes.vehicles);
      if (driversRes && driversRes.success) setDrivers(driversRes.drivers);
      if (centersRes && centersRes.success) setServiceCenters(centersRes.service_centers);
      if (overdueRes && overdueRes.success) setOverdueReport(overdueRes);
      if (expensesRes && expensesRes.success) setExpensesReport(expensesRes);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Show toast notification
  const showToast = (toast) => {
    setNotification(toast);
    setTimeout(() => {
      setNotification((curr) => (curr === toast ? null : curr));
    }, 6000);
    refreshAllData();
  };

  // Quick Action handlers
  const openTripForVehicle = (v) => {
    setSelectedVehicle(v);
    setTripModalOpen(true);
  };

  const openEditVehicle = (v) => {
    setSelectedVehicle(v);
    setVehicleModalOpen(true);
  };

  const openDeleteVehicle = (v) => {
    setSelectedVehicle(v);
    setDeleteModalOpen(true);
  };

  const openMaintenanceForVehicle = (v) => {
    setSelectedVehicle(v);
    setMaintModalOpen(true);
  };

  return (
    <div className="app-wrapper">
      {/* Ambient Animated Glowing Blobs */}
      <div className="ambient-background">
        <div className="ambient-blob blob-1" />
        <div className="ambient-blob blob-2" />
        <div className="ambient-blob blob-3" />
      </div>

      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        dbHealth={dbHealth}
        onRefresh={refreshAllData}
      />

      <main className="main-content">
        {/* Dynamic System Alert / Trigger Notification Banner */}
        {notification && (
          <div
            className={`alert-banner ${notification.type === 'trigger' ? 'trigger' : notification.type === 'error' ? 'error' : 'success'}`}
          >
            {notification.type === 'trigger' ? (
              <Zap size={20} style={{ flexShrink: 0 }} />
            ) : notification.type === 'error' ? (
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <strong>{notification.message}</strong>
              {notification.detail && <div style={{ fontSize: '0.84rem', marginTop: '2px' }}>{notification.detail}</div>}
            </div>
          </div>
        )}

        {/* TAB 1: LIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Quick Action Buttons Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700 }}>
                  Delivery Fleet Operations Command
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  Live operational tracking, driver assignments, and automated maintenance triggers
                </p>
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setTripModalOpen(true);
                  }}
                >
                  <Navigation size={15} />
                  + Log Trip (Trigger)
                </button>
                <button
                  className="btn btn-purple"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setMaintModalOpen(true);
                  }}
                >
                  <Wrench size={15} />
                  + Add Maintenance
                </button>
                <button
                  className="btn btn-emerald"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setFuelModalOpen(true);
                  }}
                >
                  <Fuel size={15} />
                  + Record Fuel
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setVehicleModalOpen(true);
                  }}
                >
                  <Truck size={15} />
                  + Register Vehicle
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <KpiCards
              kpis={kpis}
              onOverdueClick={() => setActiveTab('overdue')}
            />

            {/* Live Fleet Status Table */}
            <FleetTable
              vehicles={vehicles}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onOpenTripModal={openTripForVehicle}
              onEditVehicle={openEditVehicle}
              onDeleteVehicle={openDeleteVehicle}
              loading={loading}
            />
          </div>
        )}

        {/* TAB 2: OVERDUE MAINTENANCE ALERTS (REPORT 1) */}
        {activeTab === 'overdue' && (
          <ReportOverdue
            overdueData={overdueReport}
            loading={loading}
            onScheduleMaintenance={openMaintenanceForVehicle}
          />
        )}

        {/* TAB 3: FLEET OPERATING EXPENSE SUMMARY (REPORT 2) */}
        {activeTab === 'expenses' && (
          <ReportExpenses
            expensesData={expensesReport}
            loading={loading}
            theme={theme}
          />
        )}
      </main>

      {/* MODAL DIALOGS */}
      <TripModal
        isOpen={tripModalOpen}
        onClose={() => setTripModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        selectedVehicle={selectedVehicle}
        onSuccess={showToast}
      />

      <FuelModal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        onSuccess={showToast}
      />

      <MaintenanceModal
        isOpen={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
        vehicles={vehicles}
        serviceCenters={serviceCenters}
        selectedVehicle={selectedVehicle}
        onSuccess={showToast}
      />

      <VehicleModal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        vehicleToEdit={selectedVehicle}
        onSuccess={showToast}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        vehicle={selectedVehicle}
        onSuccess={showToast}
      />
    </div>
  );
}
