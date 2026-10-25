import React from 'react';
import { AlertOctagon, Wrench, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function ReportOverdue({ overdueData, loading, onScheduleMaintenance }) {
  const records = overdueData?.data || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Report Explanation Card */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-red" style={{ fontSize: '0.8rem' }}>
                <ShieldAlert size={14} /> Report 1: Overdue Maintenance Alert
              </span>
              <span className="cell-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Source: view_overdue_maintenance
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
              High-Priority Fleet Service Thresholds
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '850px' }}>
              This analytical report queries PostgreSQL view <code style={{ color: 'var(--accent-blue)' }}>view_overdue_maintenance</code>. 
              It compares each vehicle's live <code style={{ color: 'var(--accent-blue)' }}>CurrentOdometer</code> against the <code style={{ color: 'var(--accent-blue)' }}>MAX(NextServiceDueKm)</code> recorded 
              in <code style={{ color: 'var(--accent-blue)' }}>MaintenanceRecords</code> using correlated subqueries, ranking overdue vehicles by mileage deficit.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-rose)' }}>
              {records.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Vehicles Requiring Service
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Vehicles Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Model</th>
                <th>Live Odometer</th>
                <th>Service Limit</th>
                <th>Overdue Mileage</th>
                <th>Last Serviced</th>
                <th>Last Service Type</th>
                <th>Urgency Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Executing view_overdue_maintenance query...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      <CheckCircle2 size={18} /> Excellent! All commercial fleet vehicles are currently operating within safe mileage limits.
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const vid = r.VehicleID ?? r.vehicleid;
                  const plate = r.LicensePlate || r.licenseplate || '';
                  const model = r.Model || r.model || '';
                  const odo = r.CurrentOdometer ?? r.currentodometer ?? 0;
                  const dueKm = r.LatestDueKm ?? r.latestduekm ?? 0;
                  const overdueKm = r.OverdueByKm ?? r.overduebykm ?? 0;
                  const sDate = r.LastServiceDate || r.lastservicedate || 'N/A';
                  const sType = r.LastServiceType || r.lastservicetype || 'Initial registration';
                  const mStatus = r.MaintenanceStatus || r.maintenancestatus || 'Overdue';

                  return (
                    <tr key={vid}>
                      <td>
                        <span className="cell-mono" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                          {plate}
                        </span>
                      </td>
                      <td>{model}</td>
                      <td>
                        <span className="cell-mono" style={{ fontWeight: 600 }}>
                          {Number(odo).toLocaleString('en-IN')} km
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono">
                          {Number(dueKm).toLocaleString('en-IN')} km
                        </span>
                      </td>
                      <td>
                        <span
                          className="cell-mono"
                          style={{
                            fontWeight: 700,
                            color: 'var(--accent-rose)',
                            background: 'rgba(244, 63, 94, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          +{Number(overdueKm).toLocaleString('en-IN')} km
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {sDate}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {sType}
                      </td>
                      <td>
                        <span className="badge badge-red">
                          <AlertOctagon size={12} /> {mStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-emerald"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => onScheduleMaintenance(r)}
                        >
                          <Wrench size={13} />
                          Record Service
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
