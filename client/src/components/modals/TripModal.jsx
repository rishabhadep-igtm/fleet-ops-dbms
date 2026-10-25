import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Zap, AlertCircle, ArrowRight, Gauge } from 'lucide-react';

export default function TripModal({
  isOpen,
  onClose,
  vehicles,
  drivers,
  selectedVehicle,
  onSuccess,
}) {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startKm, setStartKm] = useState(0);
  const [endKm, setEndKm] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const now = new Date();
      const isoNow = now.toISOString().slice(0, 16);
      setStartDate(isoNow);

      const later = new Date(now.getTime() + 4 * 3600 * 1000);
      setEndDate(later.toISOString().slice(0, 16));

      if (selectedVehicle) {
        const vid = selectedVehicle.VehicleID ?? selectedVehicle.vehicleid;
        const odo = selectedVehicle.CurrentOdometer ?? selectedVehicle.currentodometer ?? 0;
        setVehicleId(vid);
        setStartKm(odo);
        setEndKm(odo + 150);
      } else if (vehicles && vehicles.length > 0) {
        const v0 = vehicles[0];
        const vid = v0.VehicleID ?? v0.vehicleid;
        const odo = v0.CurrentOdometer ?? v0.currentodometer ?? 0;
        setVehicleId(vid);
        setStartKm(odo);
        setEndKm(odo + 150);
      }

      if (drivers && drivers.length > 0) {
        const did = drivers[0].DriverID ?? drivers[0].driverid;
        setDriverId(did);
      }
    }
  }, [isOpen, selectedVehicle, vehicles, drivers]);

  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const found = (vehicles || []).find(
      (v) => (v.VehicleID ?? v.vehicleid) === parseInt(vId, 10)
    );
    if (found) {
      const odo = found.CurrentOdometer ?? found.currentodometer ?? 0;
      setStartKm(odo);
      setEndKm(odo + 120);
    }
  };

  const tripDistance = Math.max(0, parseInt(endKm || 0, 10) - parseInt(startKm || 0, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(endKm, 10) < parseInt(startKm, 10)) {
      setError('Relational Constraint Violation: EndKm must be >= StartKm (CHECK constraint).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VehicleID: parseInt(vehicleId, 10),
          DriverID: parseInt(driverId, 10),
          StartDate: startDate.replace('T', ' ') + ':00',
          EndDate: endDate.replace('T', ' ') + ':00',
          StartKm: parseInt(startKm, 10),
          EndKm: parseInt(endKm, 10),
          Notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch trip');
      }

      onSuccess({
        type: 'trigger',
        message: data.message,
        detail: data.triggerDetail,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md bg-black/60"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass-panel w-full max-w-xl relative z-10 p-6 border neon-card-cyan shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-modal)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(0, 243, 255, 0.15)',
                    border: '1px solid rgba(0, 243, 255, 0.4)',
                    color: 'var(--neon-cyan)',
                    boxShadow: 'var(--glow-cyan)',
                  }}
                >
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Dispatch Fleet Trip
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"
                      style={{
                        background: 'rgba(0, 243, 255, 0.15)',
                        color: 'var(--neon-cyan)',
                        border: '1px solid rgba(0, 243, 255, 0.3)',
                      }}
                    >
                      <Zap className="w-3 h-3" /> Fires `trg_trip_update_odometer`
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trigger Notice */}
            <div
              className="my-4 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5"
              style={{
                backgroundColor: 'rgba(0, 243, 255, 0.05)',
                borderColor: 'rgba(0, 243, 255, 0.25)',
                color: 'var(--text-secondary)',
              }}
            >
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-400">PL/pgSQL Trigger Mechanism:</strong> Inserting this row fires{' '}
                <code className="text-cyan-300 font-mono">fn_update_vehicle_odometer()</code> to automatically advance{' '}
                <code className="text-cyan-300 font-mono">Vehicles.CurrentOdometer = EndKm</code> in PostgreSQL.
              </div>
            </div>

            {error && (
              <div
                className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(255, 0, 127, 0.1)',
                  borderColor: 'rgba(255, 0, 127, 0.4)',
                  color: 'var(--neon-magenta)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Dropdown */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Select Vehicle (FK)
                  </label>
                  <select
                    className="glass-input w-full font-mono text-xs"
                    value={vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    required
                  >
                    {(vehicles || []).map((v) => {
                      const vid = v.VehicleID ?? v.vehicleid;
                      const plate = v.LicensePlate || v.licenseplate;
                      const model = v.Model || v.model;
                      const odo = v.CurrentOdometer ?? v.currentodometer ?? 0;
                      return (
                        <option key={vid} value={vid} className="bg-slate-900 text-white">
                          {plate} — {model} ({odo} km)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Driver Dropdown */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Assign Driver (FK)
                  </label>
                  <select
                    className="glass-input w-full font-mono text-xs"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    required
                  >
                    {(drivers || []).map((d) => {
                      const did = d.DriverID ?? d.driverid;
                      const name = d.FullName || d.fullname;
                      const lic = d.LicenseNumber || d.licensenumber;
                      return (
                        <option key={did} value={did} className="bg-slate-900 text-white">
                          {name} ({lic})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Dispatch Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className="glass-input w-full text-xs font-mono"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Trip Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    className="glass-input w-full text-xs font-mono"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mileage progression calculation */}
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-glass)' }}>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Start Km</label>
                    <input
                      type="number"
                      className="glass-input w-full text-center font-mono font-semibold"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 mb-0.5">Calculated Run</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-sm text-cyan-400">
                      <span>+{tripDistance} km</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">End Km (New Odo)</label>
                    <input
                      type="number"
                      className="glass-input w-full text-center font-mono font-semibold"
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Delivery Notes / Consignment ID
                </label>
                <input
                  type="text"
                  className="glass-input w-full text-xs"
                  placeholder="e.g. Regional Hub express parcel run — Cargo Verified"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium border"
                  style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-cyber-cyan px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>{submitting ? 'Executing SQL Trigger...' : 'Record Trip & Fire Trigger'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
