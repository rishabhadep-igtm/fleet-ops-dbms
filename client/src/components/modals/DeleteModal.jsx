import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Archive, Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, vehicle, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) return null;

  const vid = vehicle.VehicleID ?? vehicle.vehicleid;
  const plate = vehicle.LicensePlate || vehicle.licenseplate || '';
  const model = vehicle.Model || vehicle.model || '';

  const handleRetire = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/vehicles/${vid}?archive=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to archive vehicle');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Vehicle [${plate}] safely archived to 'Retired' status. All foreign key audit history preserved.`,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHardDelete = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/vehicles/${vid}?archive=false`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Foreign key constraint violation');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Hard deleted master vehicle row [${plate}]. Maintenance records cascaded.`,
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
            className="glass-panel w-full max-w-lg relative z-10 p-6 border neon-card-magenta shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-modal)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 0, 127, 0.15)',
                    border: '1px solid rgba(255, 0, 127, 0.4)',
                    color: 'var(--neon-magenta)',
                    boxShadow: 'var(--glow-magenta)',
                  }}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Referential Integrity Protection
                  </h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    PostgreSQL Foreign Key Actions Guard
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

            {/* Target Vehicle Details */}
            <div
              className="my-4 p-4 rounded-xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-glass)',
              }}
            >
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {plate}
                </span>
                <p className="text-xs text-slate-300 mt-0.5">{model}</p>
              </div>
              <span className="text-xs font-mono text-slate-500">ID #{vid}</span>
            </div>

            {/* Constraint Explanations */}
            <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{
                  backgroundColor: 'rgba(0, 243, 255, 0.05)',
                  borderColor: 'rgba(0, 243, 255, 0.25)',
                }}
              >
                <Archive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-400">Recommended Action (Retire):</strong> Sets{' '}
                  <code className="text-cyan-300 font-mono">Status = 'Retired'</code>. This preserves all historical{' '}
                  <code className="text-cyan-300 font-mono">TripLogs</code> and{' '}
                  <code className="text-cyan-300 font-mono">FuelLogs</code> for audit compliance.
                </div>
              </div>

              <div
                className="p-3 rounded-xl border flex items-start gap-2.5"
                style={{
                  backgroundColor: 'rgba(255, 0, 127, 0.05)',
                  borderColor: 'rgba(255, 0, 127, 0.25)',
                }}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-400">Hard SQL Delete:</strong> Executes{' '}
                  <code className="text-rose-300 font-mono">DELETE FROM Vehicles WHERE VehicleID = {vid}</code>. If this vehicle is referenced by{' '}
                  <code className="text-rose-300 font-mono">TripLogs</code> or{' '}
                  <code className="text-rose-300 font-mono">FuelLogs</code>, PostgreSQL will block execution via{' '}
                  <code className="text-rose-300 font-mono">ON DELETE RESTRICT</code>.
                </div>
              </div>
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
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-glass)' }}>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium border"
                style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={submitting}
                onClick={handleRetire}
                className="w-full sm:w-auto btn-cyber-cyan px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Retire Vehicle (Safe)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={submitting}
                onClick={handleHardDelete}
                className="w-full sm:w-auto btn-cyber-magenta px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hard SQL Delete</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
