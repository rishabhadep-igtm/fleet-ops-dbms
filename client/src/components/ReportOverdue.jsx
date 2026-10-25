import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertOctagon,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export default function ReportOverdue({ overdueData, loading, onScheduleMaintenance }) {
  const records = overdueData?.data || [];

  const maxDeficit =
    records.length > 0
      ? Math.max(...records.map((r) => Number(r.OverdueByKm ?? r.overduebykm ?? 0)))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Report 1 Header Banner */}
      <div className="glass-panel neon-card-magenta p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  background: 'rgba(255, 0, 127, 0.15)',
                  border: '1px solid rgba(255, 0, 127, 0.4)',
                  color: 'var(--neon-magenta)',
                }}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                DBMS Report 1: Overdue Maintenance
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                View: <code className="text-cyan-400">view_overdue_maintenance</code>
              </span>
            </div>

            <h2 className="text-2xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Critical Fleet Service & Mileage Deficit Alerts
            </h2>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This analytical report queries PostgreSQL analytical view{' '}
              <code className="font-mono text-cyan-400 px-1 py-0.5 rounded bg-cyan-950/40">
                view_overdue_maintenance
              </code>
              . It evaluates each vehicle's live <code className="font-mono text-cyan-400">CurrentOdometer</code>{' '}
              against the <code className="font-mono text-cyan-400">MAX(NextServiceDueKm)</code> recorded in{' '}
              <code className="font-mono text-cyan-400">MaintenanceRecords</code>, ranking overdue fleet assets by urgent mileage deficit.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div
              className="p-4 rounded-2xl border text-center min-w-[130px]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'rgba(255, 0, 127, 0.3)',
                boxShadow: 'var(--glow-magenta)',
              }}
            >
              <div className="text-3xl font-display font-extrabold" style={{ color: 'var(--neon-magenta)' }}>
                {records.length}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Overdue Assets
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border text-center min-w-[130px]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-glass)',
              }}
            >
              <div className="text-2xl font-display font-bold font-mono" style={{ color: 'var(--neon-cyan)' }}>
                +{Number(maxDeficit).toLocaleString('en-IN')} <span className="text-xs">km</span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Peak Deficit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Frosted-Glass Overdue Table Panel */}
      <div
        className="glass-table-panel p-6 shadow-2xl relative overflow-hidden"
        style={{ borderColor: 'rgba(255, 0, 127, 0.30)' }}
      >
        <div className="flex items-center justify-between mb-5 relative z-10">
          <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <span>Vehicles Exceeding Maintenance Thresholds</span>
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Ranked by mileage deficit
          </span>
        </div>

        <div
          className="overflow-x-auto rounded-2xl border"
          style={{
            borderColor: 'var(--border-glass-thin)',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <table className="w-full text-left text-sm border-separate border-spacing-y-1.5 px-2 py-2">
            <thead>
              <tr
                className="text-xs uppercase font-mono tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                <th className="py-2.5 px-4 font-semibold">Vehicle</th>
                <th className="py-2.5 px-4 font-semibold">Model</th>
                <th className="py-2.5 px-4 font-semibold">Live Odometer</th>
                <th className="py-2.5 px-4 font-semibold">Service Limit</th>
                <th className="py-2.5 px-4 font-semibold">Mileage Deficit</th>
                <th className="py-2.5 px-4 font-semibold">Last Serviced</th>
                <th className="py-2.5 px-4 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Evaluating view_overdue_maintenance SQL subqueries...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-10 h-10" />
                      <p className="font-semibold text-base mt-2">
                        All Fleet Assets Nominal
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Zero commercial delivery vehicles currently exceed their scheduled maintenance targets.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => {
                  const vid = r.VehicleID ?? r.vehicleid;
                  const plate = r.LicensePlate || r.licenseplate || '';
                  const model = r.Model || r.model || '';
                  const odo = r.CurrentOdometer ?? r.currentodometer ?? 0;
                  const dueKm = r.LatestDueKm ?? r.latestduekm ?? 0;
                  const overdueKm = r.OverdueByKm ?? r.overduebykm ?? 0;
                  const sDate = r.LastServiceDate || r.lastservicedate || 'N/A';
                  const sType = r.LastServiceType || r.lastservicetype || 'Initial Setup';

                  const severity =
                    overdueKm > 3000 ? 'EXTREME' : overdueKm > 1000 ? 'HIGH' : 'ELEVATED';

                  return (
                    <motion.tr
                      key={vid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.008, x: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="group rounded-xl cursor-default transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--bg-table-row)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-table-row-hover)';
                        e.currentTarget.style.boxShadow =
                          '0 6px 24px -2px rgba(255, 0, 127, 0.24), inset 0 0 12px rgba(255, 0, 127, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-table-row)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      {/* Vehicle License */}
                      <td className="py-3 px-4 rounded-l-xl">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs font-bold tracking-wider border shadow-sm transition-transform group-hover:scale-105"
                          style={{
                            background: 'rgba(255, 0, 127, 0.10)',
                            borderColor: 'rgba(255, 0, 127, 0.40)',
                            color: 'var(--neon-magenta)',
                          }}
                        >
                          {plate}
                        </span>
                      </td>

                      {/* Model */}
                      <td className="py-3 px-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {model}
                      </td>

                      {/* Live Odometer */}
                      <td className="py-3 px-4 font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {Number(odo).toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>km</span>
                      </td>

                      {/* Target Due Km */}
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {Number(dueKm).toLocaleString('en-IN')} km
                      </td>

                      {/* Overdue Deficit */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-extrabold"
                          style={{
                            background: 'rgba(255, 0, 127, 0.16)',
                            border: '1px solid rgba(255, 0, 127, 0.45)',
                            color: 'var(--neon-magenta)',
                            boxShadow: 'var(--glow-magenta)',
                          }}
                        >
                          +{Number(overdueKm).toLocaleString('en-IN')} km
                        </span>
                      </td>

                      {/* Last Serviced */}
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="font-mono font-medium">{sDate}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sType}</div>
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor:
                              severity === 'EXTREME'
                                ? 'rgba(225, 29, 72, 0.22)'
                                : 'rgba(245, 158, 11, 0.22)',
                            color:
                              severity === 'EXTREME'
                                ? 'var(--neon-magenta)'
                                : 'var(--neon-amber)',
                            border: `1px solid ${
                              severity === 'EXTREME'
                                ? 'rgba(225, 29, 72, 0.45)'
                                : 'rgba(245, 158, 11, 0.45)'
                            }`,
                          }}
                        >
                          {severity}
                        </span>
                      </td>

                      {/* 1-Click Repair Schedule */}
                      <td className="py-3 px-4 text-right rounded-r-xl">
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() =>
                            onScheduleMaintenance({
                              VehicleID: vid,
                              LicensePlate: plate,
                              CurrentOdometer: odo,
                              Model: model,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(255, 0, 127, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                            border: '1px solid rgba(255, 0, 127, 0.55)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 0 16px rgba(255, 0, 127, 0.28)',
                          }}
                          title="Schedule Maintenance in Workshop"
                        >
                          <Wrench className="w-3.5 h-3.5 text-rose-400" />
                          <span>Schedule</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
