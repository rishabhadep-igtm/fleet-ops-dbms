import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VehicleModal({ isOpen, onClose, vehicleToEdit, onSuccess }) {
  const isEditing = Boolean(vehicleToEdit);

  const [licensePlate, setLicensePlate] = useState('');
  const [model, setModel] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (vehicleToEdit) {
        setLicensePlate(vehicleToEdit.LicensePlate || vehicleToEdit.licenseplate || '');
        setModel(vehicleToEdit.Model || vehicleToEdit.model || '');
        setCurrentOdometer(
          vehicleToEdit.CurrentOdometer ?? vehicleToEdit.currentodometer ?? 0
        );
        setStatus(vehicleToEdit.Status || vehicleToEdit.status || 'Active');
      } else {
        setLicensePlate('');
        setModel('');
        setCurrentOdometer(0);
        setStatus('Active');
      }
    }
  }, [isOpen, vehicleToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(currentOdometer, 10) < 0) {
      setError('Check Constraint: CurrentOdometer cannot be negative.');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing
        ? `/api/vehicles/${vehicleToEdit.VehicleID ?? vehicleToEdit.vehicleid}`
        : '/api/vehicles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LicensePlate: licensePlate.trim().toUpperCase(),
          Model: model.trim(),
          CurrentOdometer: parseInt(currentOdometer, 10),
          Status: status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Master vehicle record [${licensePlate}] updated in PostgreSQL database.`,
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
            className="glass-panel w-full max-w-lg relative z-10 p-6 border neon-card-cyan shadow-2xl overflow-hidden"
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
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {isEditing ? 'Modify Fleet Asset' : 'Register Master Vehicle'}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Master Entity Table: Vehicles
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
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  License Plate Number (UNIQUE)
                </label>
                <input
                  type="text"
                  className="glass-input w-full font-mono font-bold tracking-wider uppercase text-cyan-400"
                  placeholder="e.g. KA-01-EA-1024"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Vehicle Model & Manufacturer
                </label>
                <input
                  type="text"
                  className="glass-input w-full text-xs"
                  placeholder="e.g. Tata Ace Gold 2023 Delivery Cargo"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Starting Odometer (Km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full font-mono"
                    value={currentOdometer}
                    onChange={(e) => setCurrentOdometer(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Operational Status (CHECK)
                  </label>
                  <select
                    className="glass-input w-full font-mono text-xs"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active" className="bg-slate-900 text-white">Active (On Duty)</option>
                    <option value="In Shop" className="bg-slate-900 text-white">In Shop (Maintenance)</option>
                    <option value="Retired" className="bg-slate-900 text-white">Retired (Decommissioned)</option>
                  </select>
                </div>
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
                  className="btn-cyber-cyan px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>{submitting ? 'Executing SQL...' : isEditing ? 'Update Profile' : 'Save Master Asset'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
