import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveRoadCanvas from './components/InteractiveRoadCanvas';
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
import {
  Navigation,
  Fuel,
  Wrench,
  Truck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

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
      const [healthRes, kpisRes, vehiclesRes, driversRes, centersRes, overdueRes, expensesRes] =
        await Promise.all([
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
    }, 7000);
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

  const overdueCount = kpis?.overdue_service_alerts ?? 0;

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 3D "Car on a Road" Interactive Three.js Background with Lane Steering & Parallax */}
      <InteractiveRoadCanvas theme={theme} />

      {/* Top Cyber Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        dbHealth={dbHealth}
        onRefresh={refreshAllData}
        overdueCount={overdueCount}
      />

      {/* Floating System HUD Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-24 right-4 z-50 max-w-md w-full shadow-2xl rounded-2xl border p-4 backdrop-blur-2xl"
            style={{
              backgroundColor: 'var(--bg-modal)',
              borderColor:
                notification.type === 'trigger'
                  ? 'var(--neon-cyan)'
                  : notification.type === 'error'
                  ? 'var(--neon-magenta)'
                  : 'var(--neon-emerald)',
              boxShadow:
                notification.type === 'trigger'
                  ? 'var(--glow-cyan)'
                  : notification.type === 'error'
                  ? 'var(--glow-magenta)'
                  : 'var(--glow-emerald)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background:
                    notification.type === 'trigger'
                      ? 'rgba(0, 243, 255, 0.2)'
                      : notification.type === 'error'
                      ? 'rgba(255, 0, 127, 0.2)'
                      : 'rgba(0, 255, 136, 0.2)',
                  color:
                    notification.type === 'trigger'
                      ? 'var(--neon-cyan)'
                      : notification.type === 'error'
                      ? 'var(--neon-magenta)'
                      : 'var(--neon-emerald)',
                }}
              >
                {notification.type === 'trigger' ? (
                  <Zap className="w-5 h-5 animate-pulse" />
                ) : notification.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {notification.type === 'trigger'
                    ? 'PL/pgSQL Trigger Fired'
                    : notification.type === 'error'
                    ? 'DBMS Warning'
                    : 'Transaction Committed'}
                </div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {notification.message}
                </div>
                {notification.detail && (
                  <div
                    className="text-xs mt-1.5 p-2 rounded-lg font-mono leading-relaxed"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {notification.detail}
                  </div>
                )}
              </div>

              <button
                onClick={() => setNotification(null)}
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Canvas */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: LIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header Action Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                      Live Telemetry & Relational Hub
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Commercial Fleet Operations
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Live route dispatches, fuel accounting, and automated PL/pgSQL odometer triggers
                  </p>
                </div>

                {/* Cyber Action Buttons */}
                <div className="flex items-center flex-wrap gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedVehicle(null);
                      setTripModalOpen(true);
                    }}
                    className="btn-cyber-cyan px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Navigation className="w-4 h-4 text-cyan-300" />
                    <span>Log Trip</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      ⚡ Trigger
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedVehicle(null);
                      setMaintModalOpen(true);
                    }}
                    className="btn-cyber-purple px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Wrench className="w-4 h-4 text-purple-300" />
                    <span>+ Add Maintenance</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedVehicle(null);
                      setFuelModalOpen(true);
                    }}
                    className="btn-cyber-emerald px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Fuel className="w-4 h-4 text-emerald-300" />
                    <span>+ Record Fuel</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedVehicle(null);
                      setVehicleModalOpen(true);
                    }}
                    className="glass-panel px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer hover:border-cyan-400 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>+ Register Vehicle</span>
                  </motion.button>
                </div>
              </div>

              {/* 4 Frosted Glass KPI Cards */}
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
            </motion.div>
          )}

          {/* TAB 2: OVERDUE MAINTENANCE ALERTS (REPORT 1) */}
          {activeTab === 'overdue' && (
            <motion.div
              key="overdue-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ReportOverdue
                overdueData={overdueReport}
                loading={loading}
                onScheduleMaintenance={openMaintenanceForVehicle}
              />
            </motion.div>
          )}

          {/* TAB 3: FLEET OPERATING EXPENSE SUMMARY (REPORT 2) */}
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ReportExpenses
                expensesData={expensesReport}
                loading={loading}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Dialogs with Framer Motion Glass Backdrops */}
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
