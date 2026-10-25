import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, AlertOctagon, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import Sparkline from './Sparkline';

export default function KpiCards({ kpis, onOverdueClick }) {
  const activeVehicles = kpis?.active_vehicles ?? 0;
  const totalVehicles = kpis?.total_vehicles ?? 0;
  const inShopVehicles = kpis?.in_shop_vehicles ?? 0;
  const retiredVehicles = kpis?.retired_vehicles ?? 0;

  const driversOnRoute = kpis?.drivers_on_route ?? 0;
  const totalDrivers = kpis?.total_drivers ?? 0;

  const overdueAlerts = kpis?.overdue_service_alerts ?? 0;

  const totalSpend = kpis?.total_operating_spend ?? 0;
  const avgCostPerKm = kpis?.avg_cost_per_km ?? 0;
  const totalDistance = kpis?.total_distance_km ?? 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 w-full max-w-7xl mx-auto"
    >
      {/* 1. Active Fleet Assets */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, scale: 1.015 }}
        className="glass-panel neon-card-cyan p-6 rounded-2xl flex flex-col justify-between group cursor-default min-h-[180px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
              Active Fleet Assets
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {activeVehicles}
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                / {totalVehicles} Total
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
            style={{
              background: 'rgba(0, 243, 255, 0.12)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--neon-cyan)',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
            <div><span className="font-semibold text-amber-400">{inShopVehicles}</span> in service</div>
            <div><span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{retiredVehicles}</span> decommissioned</div>
          </div>
          <Sparkline
            data={[8, 9, 8, 10, 9, 9, 10, activeVehicles || 7]}
            color="cyan"
            width={90}
            height={30}
          />
        </div>
      </motion.div>

      {/* 2. Drivers on Route */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, scale: 1.015 }}
        className="glass-panel neon-card-emerald p-6 rounded-2xl flex flex-col justify-between group cursor-default min-h-[180px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
              Drivers on Route
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {driversOnRoute}
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                / {totalDrivers} Assigned
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
            style={{
              background: 'rgba(0, 255, 136, 0.12)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: 'var(--neon-emerald)',
              boxShadow: 'var(--glow-emerald)',
            }}
          >
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: 'var(--neon-emerald)' }} />
            Active delivery shifts
          </div>
          <Sparkline
            data={[5, 7, 6, 8, 7, 9, 8, driversOnRoute || 8]}
            color="emerald"
            width={90}
            height={30}
          />
        </div>
      </motion.div>

      {/* 3. Overdue Service Alerts */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, scale: 1.015 }}
        onClick={onOverdueClick}
        className={`glass-panel neon-card-magenta p-6 rounded-2xl flex flex-col justify-between group cursor-pointer min-h-[180px] ${
          overdueAlerts > 0 ? 'alert-pulse-glow' : ''
        }`}
        title="View overdue maintenance report"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Overdue Service
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-display font-extrabold tracking-tight"
                style={{ color: overdueAlerts > 0 ? 'var(--neon-magenta)' : 'var(--text-primary)' }}
              >
                {overdueAlerts}
              </span>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: overdueAlerts > 0 ? 'rgba(255, 0, 127, 0.15)' : 'rgba(0, 255, 136, 0.15)',
                  color: overdueAlerts > 0 ? 'var(--neon-magenta)' : 'var(--neon-emerald)',
                }}
              >
                {overdueAlerts > 0 ? 'ATTENTION' : 'NOMINAL'}
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
            style={{
              background: 'rgba(255, 0, 127, 0.12)',
              border: '1px solid rgba(255, 0, 127, 0.3)',
              color: 'var(--neon-magenta)',
              boxShadow: 'var(--glow-magenta)',
            }}
          >
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="text-xs font-medium" style={{ color: overdueAlerts > 0 ? 'var(--neon-magenta)' : 'var(--text-secondary)' }}>
            {overdueAlerts > 0 ? 'Requires immediate maintenance' : 'All maintenance current'}
          </div>
          <Sparkline
            data={[1, 2, 2, 4, 3, 5, 4, overdueAlerts || 3]}
            color="magenta"
            width={90}
            height={30}
          />
        </div>
      </motion.div>

      {/* 4. Total Operating Spend */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, scale: 1.015 }}
        className="glass-panel neon-card-purple p-6 rounded-2xl flex flex-col justify-between group cursor-default min-h-[180px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
              Total Fleet Spend
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-display font-extrabold tracking-tight font-mono" style={{ color: 'var(--text-primary)' }}>
                ₹{Number(totalSpend).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
            style={{
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: 'var(--neon-purple)',
              boxShadow: 'var(--glow-purple)',
            }}
          >
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 font-mono font-medium" style={{ color: 'var(--neon-cyan)' }}>
              <Activity className="w-3 h-3" />
              <span>₹{avgCostPerKm}/km</span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              across {Number(totalDistance).toLocaleString('en-IN')} km
            </div>
          </div>
          <Sparkline
            data={[140, 160, 185, 200, 220, 235, 245]}
            color="purple"
            width={90}
            height={30}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
