import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';

export default function MaintenanceModal({ isOpen, onClose, vehicles, serviceCenters, selectedVehicle, onSuccess }) {
  const [vehicleId, setVehicleId] = useState('');
  const [centerId, setCenterId] = useState('');
  const [serviceType, setServiceType] = useState('Oil & Filter Change + 40-Point Inspection');
  const [cost, setCost] = useState('4500.00');
  const [serviceDate, setServiceDate] = useState('');
  const [nextDueKm, setNextDueKm] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setServiceDate(new Date().toISOString().slice(0, 10));

      const v = selectedVehicle || (vehicles && vehicles.length > 0 ? vehicles[0] : null);
      if (v) {
        const vid = v.VehicleID ?? v.vehicleid;
        const odo = v.CurrentOdometer ?? v.currentodometer ?? 0;
        setVehicleId(vid);
        setNextDueKm(odo + 10000);
      }

      if (serviceCenters && serviceCenters.length > 0) {
        const cid = serviceCenters[0].CenterID ?? serviceCenters[0].centerid;
        setCenterId(cid);
      }
    }
  }, [isOpen, selectedVehicle, vehicles, serviceCenters]);

  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const found = vehicles.find((v) => (v.VehicleID ?? v.vehicleid) === parseInt(vId, 10));
    if (found) {
      const odo = found.CurrentOdometer ?? found.currentodometer ?? 0;
      setNextDueKm(odo + 10000);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(cost) < 0) {
      setError('Check Constraint: Cost must be non-negative (>= 0).');
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
          ServiceType: serviceType,
          Cost: parseFloat(cost),
          ServiceDate: serviceDate,
          NextServiceDueKm: parseInt(nextDueKm, 10),
          Notes: notes
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record maintenance');
      }

      onSuccess({
        type: 'success',
        message: 'Maintenance record saved successfully.',
        detail: `Next scheduled service set to ${nextDueKm} km.`
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
            <Wrench size={20} color="var(--accent-purple)" />
            <h3 className="modal-title">Record Maintenance Service / Repair</h3>
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
              <label className="form-label">Serviced Vehicle (Master Table)</label>
              <select
                className="form-select"
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                required
              >
                {vehicles.map((v) => {
                  const vid = v.VehicleID ?? v.vehicleid;
                  const plate = v.LicensePlate || v.licenseplate || '';
                  const model = v.Model || v.model || '';
                  const odo = v.CurrentOdometer ?? v.currentodometer ?? 0;
                  return (
                    <option key={vid} value={vid}>
                      {plate} — {model} (Odo: {Number(odo).toLocaleString('en-IN')} km)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Authorized Service Center (Master Table)</label>
              <select
                className="form-select"
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                required
              >
                {serviceCenters.map((c) => {
                  const cid = c.CenterID ?? c.centerid;
                  const name = c.CenterName || c.centername || '';
                  const city = c.City || c.city || '';
                  return (
                    <option key={cid} value={cid}>
                      {name} ({city})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type / Work Performed</label>
              <select
                className="form-select"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              >
                <option value="Oil & Filter Change + 40-Point Inspection">Oil & Filter Change + 40-Point Inspection</option>
                <option value="Brake Pad Replacement & Rotor Truing">Brake Pad Replacement & Rotor Truing</option>
                <option value="Scheduled 60,000 Km Major Service">Scheduled Major Service</option>
                <option value="Tire Balancing & Wheel Alignment">Tire Balancing & Wheel Alignment</option>
                <option value="EV Battery Cell Diagnostic & Coolant Flush">EV Battery Cell Diagnostic</option>
                <option value="Heavy Suspension Bushing & Shock Overhaul">Heavy Suspension Overhaul</option>
                <option value="Transmission Clutch Disc Overhaul">Transmission Overhaul</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Invoice Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input cell-mono"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Service Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Next Service Due Mileage Target (Km)</label>
              <input
                type="number"
                className="form-input cell-mono"
                value={nextDueKm}
                onChange={(e) => setNextDueKm(e.target.value)}
                min="1000"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sets the threshold for <code>view_overdue_maintenance</code> alerts.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Mechanic Notes / Replaced Parts</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Details of OEM parts, oil viscosity grade, technician..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={submitting}>
              {submitting ? 'Saving Record...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
