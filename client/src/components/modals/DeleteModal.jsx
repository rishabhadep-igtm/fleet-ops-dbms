import React, { useState } from 'react';
import { X, AlertTriangle, Archive, Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, vehicle, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  if (!isOpen || !vehicle) return null;

  const vid = vehicle?.VehicleID ?? vehicle?.vehicleid;
  const plate = vehicle?.LicensePlate || vehicle?.licenseplate || '';
  const model = vehicle?.Model || vehicle?.model || '';

  const handleDelete = async (archive = false) => {
    setSubmitting(true);
    setErrorInfo(null);

    const url = `/api/vehicles/${vid}${archive ? '?archive=true' : ''}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        if (data.isConstraintViolation) {
          setErrorInfo({
            error: data.error,
            suggestion: data.suggestion,
          });
          return;
        }
        throw new Error(data.error || 'Failed to delete vehicle');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: archive
          ? `Vehicle ${plate} archived to status Retired.`
          : `Vehicle ${plate} permanently deleted.`,
      });
      onClose();
    } catch (err) {
      setErrorInfo({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--accent-rose)" />
            <h3 className="modal-title">Delete / Archive Vehicle</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '14px', color: 'var(--text-secondary)' }}>
            You are managing Vehicle <strong>#{vid}</strong> (
            <code style={{ color: 'var(--accent-blue)' }}>{plate}</code> — {model}).
          </p>

          {/* Academic constraint violation alert */}
          {errorInfo ? (
            <div
              className="alert-banner error"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ShieldAlert size={18} /> Syllabus Concept: Referential Integrity Action
              </div>
              <p style={{ fontSize: '0.84rem' }}>{errorInfo.error}</p>
              {errorInfo.suggestion && (
                <div
                  style={{
                    fontSize: '0.82rem',
                    background: 'rgba(0,0,0,0.15)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                  }}
                >
                  💡 <strong>DBMS Rule:</strong> {errorInfo.suggestion}
                </div>
              )}
            </div>
          ) : (
            <div className="alert-banner trigger" style={{ fontSize: '0.82rem' }}>
              <strong>Evaluation Note:</strong> Permanent deletion is guarded by PostgreSQL foreign key constraint 
              <code> ON DELETE RESTRICT</code> on <code>TripLogs</code> and <code>FuelLogs</code> to prevent orphan audit records.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>

          {/* Archive Option (Recommended when RESTRICT is triggered) */}
          <button
            type="button"
            className="btn btn-amber"
            onClick={() => handleDelete(true)}
            disabled={submitting}
          >
            <Archive size={14} />
            Archive Vehicle (Set Retired)
          </button>

          {/* Direct Delete Attempt */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            onClick={() => handleDelete(false)}
            disabled={submitting}
          >
            <Trash2 size={14} />
            {submitting ? 'Checking DB...' : 'Attempt Hard Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
