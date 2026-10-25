import React, { useState, useEffect } from 'react';
import { X, Fuel, AlertCircle } from 'lucide-react';

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
      if (vehicles && vehicles.length > 0) setVehicleId(vehicles[0].VehicleID);
      if (drivers && drivers.length > 0) setDriverId(drivers[0].DriverID);
    }
  }, [isOpen, vehicles, drivers]);

  // Dynamically calculate total fuel cost
  useEffect(() => {
    const l = parseFloat(liters) || 0;
    const c = parseFloat(costPerLiter) || 0;
    setTotalAmount((l * c).toFixed(2));
  }, [liters, costPerLiter]);

  if (!isOpen) return null;

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
          LogDate: logDate
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to log fuel voucher');
      }

      onSuccess({
        type: 'success',
        message: 'Fuel expenditure logged successfully.',
        detail: `Recorded ₹${totalAmount} for ${liters} L fuel.`
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
            <Fuel size={20} color="var(--accent-cyan)" />
            <h3 className="modal-title">Record Fleet Refueling Voucher</h3>
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
              <label className="form-label">Vehicle (Master Table)</label>
              <select
                className="form-select"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              >
                {vehicles.filter(v => (v.Status || v.status) !== 'Retired').map((v) => {
                  const vid = v.VehicleID ?? v.vehicleid;
                  const plate = v.LicensePlate || v.licenseplate || '';
                  const model = v.Model || v.model || '';
                  return (
                    <option key={vid} value={vid}>
                      {plate} — {model}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Driver Purchasing Fuel</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Fuel Volume (Liters)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input cell-mono"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  min="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Per Liter (₹/L)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input cell-mono"
                  value={costPerLiter}
                  onChange={(e) => setCostPerLiter(e.target.value)}
                  min="0.01"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input cell-mono"
                  value={totalAmount}
                  readOnly
                  style={{ background: 'var(--bg-secondary)', fontWeight: 700 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Receipt Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Voucher...' : 'Log Fuel Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
