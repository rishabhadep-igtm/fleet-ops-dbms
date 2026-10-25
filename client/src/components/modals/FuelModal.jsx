import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fuel, AlertCircle, Calculator, IndianRupee } from 'lucide-react';

export default function FuelModal({ isOpen, onClose, vehicles, drivers, onSuccess }) {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [liters, setLiters] = useState('50.00');
  const [costPerLiter, setCostPerLiter] = useState('98.50');
  const [totalAmount, setTotalAmount] = useState('4925.00');
  const [logDate, setLogDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLogDate(new Date().toISOString().slice(0, 10));
      if (vehicles && vehicles.length > 0) {
        setVehicleId(vehicles[0].VehicleID ?? vehicles[0].vehicleid);
      }
      if (drivers && drivers.length > 0) {
        setDriverId(drivers[0].DriverID ?? drivers[0].driverid);
      }
    }
  }, [isOpen, vehicles, drivers]);

  useEffect(() => {
    const l = parseFloat(liters) || 0;
    const c = parseFloat(costPerLiter) || 0;
    setTotalAmount((l * c).toFixed(2));
  }, [liters, costPerLiter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(liters) <= 0 || parseFloat(costPerLiter) <= 0) {
      setError('Check Constraint: Liters and CostPerLiter must be strictly positive (> 0).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VehicleID: parseInt(vehicleId, 10),
          DriverID: parseInt(driverId, 10),
          Liters: parseFloat(liters),
          CostPerLiter: parseFloat(costPerLiter),
          TotalAmount: parseFloat(totalAmount),
          LogDate: logDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record fuel log');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Added ₹${totalAmount} fuel voucher to vehicle operating cost aggregation view.`,
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
            className="glass-panel w-full max-w-lg relative z-10 p-6 border neon-card-emerald shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-modal)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(0, 255, 136, 0.15)',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    color: 'var(--neon-emerald)',
                    boxShadow: 'var(--glow-emerald)',
                  }}
                >
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Record Refueling Expense
                  </h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Transactional Table: FuelLogs
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
                    Target Vehicle (FK)
                  </label>
                  <select
                    className="glass-input w-full font-mono text-xs"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                  >
                    {(vehicles || []).map((v) => {
                      const vid = v.VehicleID ?? v.vehicleid;
                      const plate = v.LicensePlate || v.licenseplate;
                      const model = v.Model || v.model;
                      return (
                        <option key={vid} value={vid} className="bg-slate-900 text-white">
                          {plate} — {model}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Fuel Card Authorized Driver (FK)
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
                      return (
                        <option key={did} value={did} className="bg-slate-900 text-white">
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Liters & Cost/Liter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Dispensed Liters
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="glass-input w-full font-mono"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Price Per Liter (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="glass-input w-full font-mono"
                    value={costPerLiter}
                    onChange={(e) => setCostPerLiter(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Cost Total Banner */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'rgba(0, 255, 136, 0.35)',
                  boxShadow: 'var(--glow-emerald)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Calculated Fuel Spend:</span>
                </div>
                <div className="text-xl font-display font-bold font-mono" style={{ color: 'var(--neon-emerald)' }}>
                  ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Voucher Timestamp Date
                </label>
                <input
                  type="date"
                  className="glass-input w-full font-mono text-xs"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
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
                  className="btn-cyber-emerald px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Fuel className="w-4 h-4 text-emerald-400" />
                  <span>{submitting ? 'Inserting Fuel Row...' : 'Log Fuel Voucher'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
