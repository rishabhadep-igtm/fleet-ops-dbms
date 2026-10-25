import React, { useState, useEffect } from 'react';
import { X, Navigation, Zap, AlertCircle } from 'lucide-react';

export default function TripModal({ isOpen, onClose, vehicles, drivers, selectedVehicle, onSuccess }) {
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
      // Set default dates (today)
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

  // When selected vehicle changes in dropdown, auto-update start odometer
  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const found = vehicles.find((v) => (v.VehicleID ?? v.vehicleid) === parseInt(vId, 10));
    if (found) {
      const odo = found.CurrentOdometer ?? found.currentodometer ?? 0;
      setStartKm(odo);
      setEndKm(odo + 120);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(endKm, 10) < parseInt(startKm, 10)) {
      setError('Relational Constraint Violation: EndKm must be greater than or equal to StartKm.');
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
          Notes: notes
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to log trip');
      }

      onSuccess({
        type: 'trigger',
        message: data.message,
        detail: data.triggerDetail
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
            <Navigation size={20} color="var(--accent-blue)" />
            <h3 className="modal-title">Log Commercial Delivery Trip</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Academic syllabus reminder box */}
            <div className="alert-banner trigger" style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
              <Zap size={16} />
              <div>
                <strong>Syllabus Trigger Automation:</strong> Submitting this trip automatically executes PostgreSQL trigger 
                <code> trg_trip_update_odometer</code>, updating the vehicle's live odometer to the End Km reading.
              </div>
            </div>

            {error && (
              <div className="alert-banner error">
                <AlertCircle size={16} />
                <div>{error}</div>
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="form-group">
              <label className="form-label">Assigned Vehicle (Master Table Dropdown)</label>
              <select
                className="form-select"
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                required
              >
                {vehicles.filter(v => (v.Status || v.status) !== 'Retired').map((v) => {
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

            {/* Driver Selection */}
            <div className="form-group">
              <label className="form-label">Assigned Driver (Master Table Dropdown)</label>
              <select
                className="form-select"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
              >
                {drivers.filter(d => (d.Status || d.status) === 'Active').map((d) => {
                  const did = d.DriverID ?? d.driverid;
                  const name = d.FullName || d.fullname || '';
                  const lic = d.LicenseNumber || d.licensenumber || '';
                  return (
                    <option key={did} value={did}>
                      {name} ({lic})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Return Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Kilometer Readings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Odometer (Km)</label>
                <input
                  type="number"
                  className="form-input cell-mono"
                  value={startKm}
                  onChange={(e) => setStartKm(e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Odometer (Km)</label>
                <input
                  type="number"
                  className="form-input cell-mono"
                  value={endKm}
                  onChange={(e) => setEndKm(e.target.value)}
                  min={startKm}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Route Notes / Cargo Destination</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="e.g. Electronic City warehouse distribution run..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Executing Trigger...' : 'Record Trip & Fire Trigger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
