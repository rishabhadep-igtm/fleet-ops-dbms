import React, { useState, useEffect } from 'react';
import { X, Truck, AlertCircle } from 'lucide-react';

export default function VehicleModal({ isOpen, onClose, vehicleToEdit, onSuccess }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [model, setModel] = useState('');
  const [odometer, setOdometer] = useState(0);
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(vehicleToEdit);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (vehicleToEdit) {
        setLicensePlate(vehicleToEdit.LicensePlate || vehicleToEdit.licenseplate || '');
        setModel(vehicleToEdit.Model || vehicleToEdit.model || '');
        setOdometer(vehicleToEdit.CurrentOdometer ?? vehicleToEdit.currentodometer ?? 0);
        setStatus(vehicleToEdit.Status || vehicleToEdit.status || 'Active');
      } else {
        setLicensePlate('');
        setModel('');
        setOdometer(0);
        setStatus('Active');
      }
    }
  }, [isOpen, vehicleToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(odometer, 10) < 0) {
      setError('Check Constraint Violation: CurrentOdometer cannot be negative (>= 0).');
      return;
    }

    setSubmitting(true);
    const vid = vehicleToEdit?.VehicleID ?? vehicleToEdit?.vehicleid;
    const url = isEditing ? `/api/vehicles/${vid}` : '/api/vehicles';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LicensePlate: licensePlate.trim().toUpperCase(),
          Model: model.trim(),
          CurrentOdometer: parseInt(odometer, 10),
          Status: status
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      onSuccess({
        type: 'success',
        message: data.message,
        detail: `Vehicle ${licensePlate} saved with status ${status}.`
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--accent-blue)" />
            <h3 className="modal-title">{isEditing ? 'Edit Vehicle Profile' : 'Register New Fleet Vehicle'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-banner error">
                <AlertCircle size={16} />
                <div>{error}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">License Plate (UNIQUE Constraint)</label>
              <input
                type="text"
                className="form-input cell-mono"
                placeholder="e.g. KA-01-EA-2048"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Model & Specification</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mercedes-Benz Sprinter 2500 High Roof"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Odometer (Km) [CHECK &gt;= 0]</label>
                <input
                  type="number"
                  className="form-input cell-mono"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Active">Active (On Duty)</option>
                  <option value="In Shop">In Shop (Repair)</option>
                  <option value="Retired">Retired (Decommissioned)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
