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
      className="w-full max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center"
    >
      {/* Header Banner - Clean Professional SaaS Copy */}
      <div className="glass-panel neon-card-magenta p-8 rounded-2xl relative overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-3.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
                style={{
                  background: 'rgba(255, 0, 127, 0.15)',
                  border: '1px solid rgba(255, 0, 127, 0.4)',
                  color: 'var(--neon-magenta)',
                }}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Service Alerts
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Overdue Maintenance
            </h2>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Vehicles requiring immediate maintenance based on current mileage.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-4">
            <div
              className="p-5 px-6 rounded-2xl border text-center min-w-[150px]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'rgba(255, 0, 127, 0.3)',
                boxShadow: 'var(--glow-magenta)',
              }}
            >
              <div className="text-3xl font-display font-extrabold mb-1" style={{ color: 'var(--neon-magenta)' }}>
                {records.length}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Overdue Assets
              </div>
            </div>

            <div
              className="p-5 px-6 rounded-2xl border text-center min-w-[150px]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-glass)',
              }}
            >
              <div className="text-2xl font-display font-bold font-mono mb-1" style={{ color: 'var(--neon-cyan)' }}>
                +{Number(maxDeficit).toLocaleString('en-IN')} <span className="text-xs font-normal">km</span>
              </div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Peak Deficit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Frosted-Glass Overdue Table - Centered & Spacious */}
      <div
        className="glass-table-panel p-8 shadow-2xl relative overflow-hidden w-full"
        style={{ borderColor: 'rgba(255, 0, 127, 0.28)' }}
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <span>Service Threshold Exceeded</span>
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Sorted by highest mileage deficit
          </span>
        </div>

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
                style={{ color: 'var(--text-muted)' }}
              >
                <th className="py-3 px-6 font-semibold">Vehicle</th>
                <th className="py-3 px-6 font-semibold">Model</th>
                <th className="py-3 px-6 font-semibold text-right">Odometer</th>
                <th className="py-3 px-6 font-semibold text-right">Limit</th>
                <th className="py-3 px-6 font-semibold text-center">Deficit</th>
                <th className="py-3 px-6 font-semibold">Last Service</th>
                <th className="py-3 px-6 font-semibold text-center">Priority</th>
                <th className="py-3 px-6 font-semibold text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Loading service records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-10 h-10" />
                      <p className="font-semibold text-base mt-2">
                        All Fleet Assets are Up-to-Date
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        Zero commercial delivery vehicles currently exceed their scheduled maintenance targets.
                      </p>
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
                  const sType = r.LastServiceType || r.lastservicetype || 'Initial Setup';

                  const severity =
                    overdueKm > 3000 ? 'CRITICAL' : overdueKm > 1000 ? 'HIGH' : 'ELEVATED';

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
                          '0 8px 26px -2px rgba(255, 0, 127, 0.24), inset 0 0 12px rgba(255, 0, 127, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-table-row)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      {/* Vehicle License */}
                      <td className="py-4 px-6 rounded-l-xl">
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider border shadow-sm transition-transform group-hover:scale-105"
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
                      <td className="py-4 px-6 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {model}
                      </td>

                      {/* Live Odometer */}
                      <td className="py-4 px-6 font-mono font-bold text-sm text-right" style={{ color: 'var(--text-primary)' }}>
                        {Number(odo).toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>km</span>
                      </td>

                      {/* Target Due Km */}
                      <td className="py-4 px-6 font-mono text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                        {Number(dueKm).toLocaleString('en-IN')} km
                      </td>

                      {/* Overdue Deficit */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold"
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
                      <td className="py-4 px-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="font-mono font-medium">{sDate}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sType}</div>
                      </td>

                      {/* Severity Badge */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor:
                              severity === 'CRITICAL'
                                ? 'rgba(225, 29, 72, 0.22)'
                                : 'rgba(245, 158, 11, 0.22)',
                            color:
                              severity === 'CRITICAL'
                                ? 'var(--neon-magenta)'
                                : 'var(--neon-amber)',
                            border: `1px solid ${
                              severity === 'CRITICAL'
                                ? 'rgba(225, 29, 72, 0.45)'
                                : 'rgba(245, 158, 11, 0.45)'
                            }`,
                          }}
                        >
                          {severity}
                        </span>
                      </td>

                      {/* 1-Click Repair Schedule */}
                      <td className="py-4 px-6 text-right rounded-r-xl">
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
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
