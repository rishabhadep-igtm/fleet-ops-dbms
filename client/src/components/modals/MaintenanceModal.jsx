import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, AlertCircle, ShieldCheck, PlusCircle } from 'lucide-react';

export default function MaintenanceModal({
  isOpen,
  onClose,
  vehicles,
  serviceCenters,
  selectedVehicle,
  onSuccess,
}) {
  const [vehicleId, setVehicleId] = useState('');
  const [centerId, setCenterId] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceType, setServiceType] = useState('Periodic 10,000 km Service & Inspection');
  const [cost, setCost] = useState('8500.00');
  const [nextDueKm, setNextDueKm] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setServiceDate(new Date().toISOString().slice(0, 10));

      const vTarget = selectedVehicle || (vehicles && vehicles[0]);
      if (vTarget) {
        const vid = vTarget.VehicleID ?? vTarget.vehicleid;
        const odo = vTarget.CurrentOdometer ?? vTarget.currentodometer ?? 0;
        setVehicleId(vid);
        setNextDueKm(odo + 10000);
      }

      if (serviceCenters && serviceCenters.length > 0) {
        setCenterId(serviceCenters[0].CenterID ?? serviceCenters[0].centerid);
      }
    }
  }, [isOpen, selectedVehicle, vehicles, serviceCenters]);

  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const found = (vehicles || []).find(
      (v) => (v.VehicleID ?? v.vehicleid) === parseInt(vId, 10)
    );
    if (found) {
      const odo = found.CurrentOdometer ?? found.currentodometer ?? 0;
      setNextDueKm(odo + 10000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(cost) < 0) {
      setError('Check Constraint Violation: Cost must be >= 0.');
      return;
    }
    if (parseInt(nextDueKm, 10) <= 0) {
      setError('Check Constraint Violation: NextServiceDueKm must be strictly positive (> 0).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VehicleID: parseInt(vehicleId, 10),
          CenterID: parseInt(centerId, 10),
          ServiceDate: serviceDate,
          ServiceType: serviceType,
          Cost: parseFloat(cost),
          NextServiceDueKm: parseInt(nextDueKm, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record maintenance');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Next service due target pushed to ${Number(nextDueKm).toLocaleString('en-IN')} km. Resetting overdue alerts in view_overdue_maintenance!`,
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md bg-black/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass-panel w-full max-w-xl relative z-10 p-6 border neon-card-purple shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-modal)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: 'var(--neon-purple)',
                    boxShadow: 'var(--glow-purple)',
                  }}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Log Maintenance Invoice
                  </h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Transactional Table: MaintenanceRecords
                  </p>
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

            {error && (
              <div
                className="my-4 p-3 rounded-xl border text-xs flex items-center gap-2"
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
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Serviced Vehicle (FK)
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

                {/* Service Center Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Authorized Workshop (FK)
                  </label>
                  <select
                    className="glass-input w-full font-mono text-xs"
                    value={centerId}
                    onChange={(e) => setCenterId(e.target.value)}
                    required
                  >
                    {(serviceCenters || []).map((sc) => {
                      const cid = sc.CenterID ?? sc.centerid;
                      const name = sc.CenterName || sc.centername;
                      const city = sc.City || sc.city;
                      return (
                        <option key={cid} value={cid} className="bg-slate-900 text-white">
                          {name} ({city})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Service Type Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Service Type / Work Order Description
                </label>
                <input
                  type="text"
                  className="glass-input w-full text-xs"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Engine Overhaul, Brake Pad Renewal, Suspension Bushing"
                  required
                />
              </div>

              {/* Cost & Service Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Total Invoice Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="glass-input w-full font-mono"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Service Completion Date
                  </label>
                  <input
                    type="date"
                    className="glass-input w-full font-mono text-xs"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Next Due Km Target */}
              <div
                className="p-4 rounded-xl border space-y-1.5"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                  boxShadow: 'var(--glow-purple)',
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-purple-300">
                    Next Service Due Threshold (Km)
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Analytical View Baseline
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  className="glass-input w-full font-mono text-base font-bold text-cyan-400"
                  value={nextDueKm}
                  onChange={(e) => setNextDueKm(e.target.value)}
                  required
                />
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Sets <code className="text-cyan-400">NextServiceDueKm</code>. When vehicle odometer exceeds this value,{' '}
                  <code className="text-rose-400">view_overdue_maintenance</code> automatically triggers an alert.
                </p>
              </div>

              {/* Action Buttons */}
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
                  className="btn-cyber-purple px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-purple-400" />
                  <span>{submitting ? 'Inserting Service Record...' : 'Save Maintenance Invoice'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
