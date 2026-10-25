import React from 'react';
import { Search, Navigation, Edit2, Trash2, Archive, AlertCircle } from 'lucide-react';

export default function FleetTable({
  vehicles,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onOpenTripModal,
  onEditVehicle,
  onDeleteVehicle,
  loading
}) {
  const filteredVehicles = (vehicles || []).filter((v) => {
    const license = v.LicensePlate || v.licenseplate || '';
    const model = v.Model || v.model || '';
    const status = v.Status || v.status || '';
    const healthBadge = v.ServiceHealthBadge || v.servicehealthbadge || '';

    const matchesSearch =
      license.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      model.toLowerCase().includes((searchTerm || '').toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'Service Due') return healthBadge === 'Service Due';
    return status === statusFilter;
  });

  return (
    <div className="glass-card">
      {/* Toolbar: Search & Status Filters */}
      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search vehicles by license plate or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="nav-tabs" style={{ background: 'var(--bg-primary)' }}>
          {['all', 'Active', 'Service Due', 'In Shop', 'Retired'].map((filter) => (
            <button
              key={filter}
              className={`nav-tab-btn ${statusFilter === filter ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === 'all' ? 'All Vehicles' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table Surface */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>License Plate</th>
              <th>Vehicle Model</th>
              <th>Live Odometer</th>
              <th>Next Due Km</th>
              <th>Operational Status</th>
              <th>Service Health</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Loading fleet data from PostgreSQL...
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No vehicles found matching criteria.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                const vid = v.VehicleID ?? v.vehicleid;
                const plate = v.LicensePlate || v.licenseplate || '';
                const model = v.Model || v.model || '';
                const odo = v.CurrentOdometer ?? v.currentodometer ?? 0;
                const dueKm = v.LatestDueKm ?? v.latestduekm;
                const status = v.Status || v.status || 'Active';
                const overdueKm = v.OverdueByKm ?? v.overduebykm ?? 0;
                const healthBadge = v.ServiceHealthBadge || v.servicehealthbadge || 'Ready';
                const isOverdue = healthBadge === 'Service Due';

                return (
                  <tr key={vid}>
                    <td className="cell-mono">#{vid}</td>
                    <td style={{ fontWeight: 600 }}>
                      <span className="cell-mono" style={{ color: 'var(--accent-blue)', fontSize: '0.92rem' }}>
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
                      {dueKm ? (
                        <span className="cell-mono">
                          {Number(dueKm).toLocaleString('en-IN')} km
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None recorded</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            status === 'Active'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : status === 'In Shop'
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'rgba(148, 163, 184, 0.12)',
                          color:
                            status === 'Active'
                              ? 'var(--accent-emerald)'
                              : status === 'In Shop'
                              ? 'var(--accent-amber)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      {isOverdue ? (
                        <span className="badge badge-red" title={`Overdue by ${overdueKm} km`}>
                          ⚠️ Service Due (+{Number(overdueKm).toLocaleString('en-IN')} km)
                        </span>
                      ) : status === 'In Shop' ? (
                        <span className="badge badge-amber">🔧 In Shop</span>
                      ) : status === 'Retired' ? (
                        <span className="badge badge-slate">Retired</span>
                      ) : (
                        <span className="badge badge-green">✓ Ready</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {/* Quick Log Trip for this vehicle */}
                        {status === 'Active' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            onClick={() => onOpenTripModal(v)}
                            title="Log new delivery trip (triggers odometer update)"
                          >
                            <Navigation size={13} />
                            Log Trip
                          </button>
                        )}
                        {/* Edit vehicle */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => onEditVehicle(v)}
                          title="Edit vehicle details"
                        >
                          <Edit2 size={13} />
                        </button>
                        {/* Archive or Delete vehicle */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: 'var(--accent-rose)' }}
                          onClick={() => onDeleteVehicle(v)}
                          title="Delete or Archive vehicle (Enforces ON DELETE RESTRICT)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
