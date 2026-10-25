import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import InteractiveRoadCanvas from './components/InteractiveRoadCanvas';
import InteractiveSky from './components/InteractiveSky';
import LandingPage from './components/LandingPage';
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
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fleetops_theme') || 'dark';
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  const [dbHealth, setDbHealth] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [overdueReport, setOverdueReport] = useState(null);
  const [expensesReport, setExpensesReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fleetops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const showToast = (toast) => {
    setNotification(toast);
    setTimeout(() => {
      setNotification((curr) => (curr === toast ? null : curr));
    }, 6000);
    refreshAllData();
  };

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
      {/* 3D "Car on a Road" Forward Driving Interactive Highway Background */}
      <InteractiveRoadCanvas theme={theme} />

      {/* Dynamic Cursor-Responsive Environmental Sky Layer (Framer Motion Opposing Parallax) */}
      <InteractiveSky theme={theme} />

      {/* Route-Based View Transitions with Persistent Interactive Background */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* 1. Minimalist Landing / Gateway Page (Route: /) */}
          <Route
            path="/"
            element={<LandingPage theme={theme} toggleTheme={toggleTheme} />}
          />

          {/* 2. Full Commercial Fleet Operations Dashboard (Route: /dashboard) */}
          <Route
            path="/dashboard"
            element={
              <motion.div
                key="dashboard-view-container"
                initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -25, filter: 'blur(8px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 min-h-screen flex flex-col"
              >
                {/* Top Sticky Navigation Bar */}
                <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        dbHealth={dbHealth}
        onRefresh={refreshAllData}
        overdueCount={overdueCount}
      />

      {/* System Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-24 right-6 z-50 max-w-sm w-full shadow-2xl rounded-2xl border p-4 backdrop-blur-2xl"
            style={{
              backgroundColor: 'var(--bg-modal)',
              borderColor:
                notification.type === 'trigger' || notification.type === 'success'
                  ? 'var(--neon-cyan)'
                  : 'var(--neon-magenta)',
              boxShadow:
                notification.type === 'trigger' || notification.type === 'success'
                  ? 'var(--glow-cyan)'
                  : 'var(--glow-magenta)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background:
                    notification.type === 'error'
                      ? 'rgba(255, 0, 127, 0.2)'
                      : 'rgba(0, 243, 255, 0.2)',
                  color:
                    notification.type === 'error'
                      ? 'var(--neon-magenta)'
                      : 'var(--neon-cyan)',
                }}
              >
                {notification.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {notification.message}
                </div>
                {notification.detail && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {notification.detail}
                  </p>
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

      {/* Full-Height Flex Container with Absolute Vertical and Horizontal Centering */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <main className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center my-auto">
          <AnimatePresence mode="wait">
            {/* TAB 1: LIVE DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center space-y-8"
              >
                {/* Header Action Toolbar with Enlarged & Beautifully Padded Action Buttons */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Commercial Fleet Operations
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Real-time dispatch telemetry, vehicle health, and operational expenditure tracking.
                    </p>
                  </div>

                  {/* Action Buttons: h-11, w-auto, px-5 sm:px-6 py-2.5, flex items-center justify-center, whitespace-nowrap */}
                  <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedVehicle(null);
                        setTripModalOpen(true);
                      }}
                      className="btn-cyber-cyan h-11 w-auto px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer shadow-lg whitespace-nowrap"
                    >
                      <Navigation className="w-4 h-4 text-cyan-300 shrink-0" />
                      <span>Log Trip</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedVehicle(null);
                        setMaintModalOpen(true);
                      }}
                      className="btn-cyber-purple h-11 w-auto px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer shadow-lg whitespace-nowrap"
                    >
                      <Wrench className="w-4 h-4 text-purple-300 shrink-0" />
                      <span>Schedule Service</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedVehicle(null);
                        setFuelModalOpen(true);
                      }}
                      className="btn-cyber-emerald h-11 w-auto px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer shadow-lg whitespace-nowrap"
                    >
                      <Fuel className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>Record Fuel</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedVehicle(null);
                        setVehicleModalOpen(true);
                      }}
                      className="btn-cyber-blue h-11 w-auto px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer shadow-lg whitespace-nowrap"
                    >
                      <Truck className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Add Vehicle</span>
                    </motion.button>
                  </div>
                </div>

                {/* 4 Frosted Glass KPI Cards - Perfectly Centered */}
                <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
                  <KpiCards
                    kpis={kpis}
                    onOverdueClick={() => setActiveTab('overdue')}
                  />
                </div>

                {/* Main Data Table - Center-Aligned Horizontally */}
                <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
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
              </motion.div>
            )}

            {/* TAB 2: OVERDUE MAINTENANCE ALERTS */}
            {activeTab === 'overdue' && (
              <motion.div
                key="overdue-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center"
              >
                <ReportOverdue
                  overdueData={overdueReport}
                  loading={loading}
                  onScheduleMaintenance={openMaintenanceForVehicle}
                />
              </motion.div>
            )}

            {/* TAB 3: FLEET OPERATING EXPENSE SUMMARY */}
            {activeTab === 'expenses' && (
              <motion.div
                key="expenses-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center"
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
      </div>

      {/* Modal Dialogs */}
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
            </motion.div>
          }
        />

        {/* Catch-all fallback: redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  </div>
  );
}
