import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Navigation,
  Edit2,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Archive,
  X,
} from 'lucide-react';

export default function FleetTable({
  vehicles,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onOpenTripModal,
  onEditVehicle,
  onDeleteVehicle,
  loading,
}) {
  const allVehicles = vehicles || [];

  const counts = {
    all: allVehicles.length,
    Active: allVehicles.filter((v) => (v.Status || v.status) === 'Active').length,
    'Service Due': allVehicles.filter(
      (v) => (v.ServiceHealthBadge || v.servicehealthbadge) === 'Service Due'
    ).length,
    'In Shop': allVehicles.filter((v) => (v.Status || v.status) === 'In Shop').length,
    Retired: allVehicles.filter((v) => (v.Status || v.status) === 'Retired').length,
  };

  const filteredVehicles = allVehicles.filter((v) => {
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
    <div className="glass-table-panel p-8 shadow-2xl relative overflow-hidden transition-all duration-300 w-full mx-auto">
      {/* Table Header & Controls with generous spacing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 relative z-10">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 opacity-80" />
          <input
            type="text"
            className="glass-input w-full pl-11 pr-10 py-3 text-sm font-sans"
            placeholder="Search vehicles by plate or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills with Badge Counters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'Active', 'Service Due', 'In Shop', 'Retired'].map((filter) => {
            const isSelected = statusFilter === filter;
            const count = counts[filter] || 0;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isSelected ? 'shadow-md' : 'hover:opacity-100 opacity-75'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                  border: isSelected
                    ? '1px solid var(--border-neon-cyan)'
                    : '1px solid transparent',
                  color: isSelected ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                }}
              >
                <span>{filter === 'all' ? 'All Vehicles' : filter}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(0, 243, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: isSelected ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Frosted-Glass Table Surface - Perfectly Centered & Spacious */}
      <div
        className="overflow-x-auto rounded-2xl border"
        style={{
          borderColor: 'var(--border-glass-thin)',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <table className="w-full text-left text-sm border-separate border-spacing-y-2 px-3 py-3">
          <thead>
            <tr
              className="text-xs uppercase font-mono tracking-wider"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-3 px-5 font-semibold text-center w-20">ID</th>
              <th className="py-3 px-6 font-semibold">License Plate</th>
              <th className="py-3 px-6 font-semibold">Vehicle Model</th>
              <th className="py-3 px-6 font-semibold text-right">Odometer</th>
              <th className="py-3 px-6 font-semibold text-right">Next Due</th>
              <th className="py-3 px-6 font-semibold text-center">Status</th>
              <th className="py-3 px-6 font-semibold text-center">Health</th>
              <th className="py-3 px-6 font-semibold text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      Loading fleet data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    No fleet vehicles match the active query.
                  </p>
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
                  <motion.tr
                    key={vid}
                    whileHover={{ scale: 1.008, x: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="group rounded-xl cursor-default transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-table-row)',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-table-row-hover)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 26px -2px rgba(0, 243, 255, 0.24), inset 0 0 12px rgba(0, 243, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-table-row)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    {/* ID */}
                    <td className="py-4 px-5 font-mono text-xs font-semibold text-center rounded-l-xl" style={{ color: 'var(--text-muted)' }}>
                      #{vid}
                    </td>

                    {/* License Plate */}
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center px-3 py-1.5 rounded-lg font-mono text-xs font-extrabold tracking-wider border shadow-sm transition-transform group-hover:scale-105"
                        style={{
                          background: 'rgba(0, 243, 255, 0.10)',
                          borderColor: 'rgba(0, 243, 255, 0.40)',
                          color: 'var(--neon-cyan)',
                        }}
                      >
                        {plate}
                      </span>
                    </td>

                    {/* Model */}
                    <td className="py-4 px-6 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {model}
                    </td>

                    {/* Odometer */}
                    <td className="py-4 px-6 font-mono font-bold text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                      {Number(odo).toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>km</span>
                    </td>

                    {/* Next Due Km */}
                    <td className="py-4 px-6 font-mono text-xs text-right">
                      {dueKm ? (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {Number(dueKm).toLocaleString('en-IN')} km
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Operational Status */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background:
                            status === 'Active'
                              ? 'rgba(0, 255, 136, 0.14)'
                              : status === 'In Shop'
                              ? 'rgba(255, 170, 0, 0.14)'
                              : 'rgba(100, 116, 139, 0.14)',
                          color:
                            status === 'Active'
                              ? 'var(--neon-emerald)'
                              : status === 'In Shop'
                              ? 'var(--neon-amber)'
                              : 'var(--text-muted)',
                          border: `1px solid ${
                            status === 'Active'
                              ? 'rgba(0, 255, 136, 0.35)'
                              : status === 'In Shop'
                              ? 'rgba(255, 170, 0, 0.35)'
                              : 'rgba(100, 116, 139, 0.25)'
                          }`,
                        }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Active' ? 'pulse-radar' : ''
                          }`}
                          style={{
                            backgroundColor:
                              status === 'Active'
                                ? 'var(--neon-emerald)'
                                : status === 'In Shop'
                                ? 'var(--neon-amber)'
                                : 'var(--text-muted)',
                          }}
                        />
                        {status}
                      </span>
                    </td>

                    {/* Service Health */}
                    <td className="py-4 px-6 text-center">
                      {isOverdue ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono animate-pulse"
                          style={{
                            background: 'rgba(255, 0, 127, 0.16)',
                            borderColor: 'rgba(255, 0, 127, 0.50)',
                            borderWidth: 1,
                            color: 'var(--neon-magenta)',
                            boxShadow: 'var(--glow-magenta)',
                          }}
                          title={`Overdue by ${overdueKm} km`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>+{Number(overdueKm).toLocaleString('en-IN')} km</span>
                        </span>
                      ) : status === 'In Shop' ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(255, 170, 0, 0.12)',
                            color: 'var(--neon-amber)',
                          }}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>In Service</span>
                        </span>
                      ) : status === 'Retired' ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(100, 116, 139, 0.12)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Decommissioned</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(0, 255, 136, 0.12)',
                            color: 'var(--neon-emerald)',
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right rounded-r-xl">
                      <div className="inline-flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100">
                        {/* Log Trip */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onOpenTripModal(v)}
                          className="p-2 rounded-xl border transition-all cursor-pointer"
                          style={{
                            background: 'rgba(0, 243, 255, 0.14)',
                            borderColor: 'rgba(0, 243, 255, 0.40)',
                            color: 'var(--neon-cyan)',
                          }}
                          title="Log Route Trip"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Edit */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onEditVehicle(v)}
                          className="p-2 rounded-xl border transition-all cursor-pointer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'var(--border-glass)',
                            color: 'var(--text-secondary)',
                          }}
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Delete / Archive */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onDeleteVehicle(v)}
                          className="p-2 rounded-xl border transition-all cursor-pointer"
                          style={{
                            background: 'rgba(255, 0, 127, 0.10)',
                            borderColor: 'rgba(255, 0, 127, 0.35)',
                            color: 'var(--neon-magenta)',
                          }}
                          title="Archive or Retire Vehicle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-xs font-mono relative z-10"
        style={{ color: 'var(--text-muted)' }}
      >
        <div>
          Showing {filteredVehicles.length} of {allVehicles.length} registered vehicles
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full pulse-radar" style={{ backgroundColor: 'var(--neon-cyan)' }} />
          <span>Fleet telemetry synchronized</span>
        </div>
      </div>
    </div>
  );
}
