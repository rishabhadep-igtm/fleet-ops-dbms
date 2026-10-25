import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  BarChart3,
  Fuel,
  Wrench,
  DollarSign,
  Activity,
  TrendingUp,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportExpenses({ expensesData, loading, theme }) {
  const summary = expensesData?.summary || {};
  const data = expensesData?.data || [];
  const chartDataPayload = expensesData?.chartData || {
    labels: [],
    fuelCosts: [],
    maintenanceCosts: [],
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#334155';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';

  const chartData = {
    labels: chartDataPayload.labels || [],
    datasets: [
      {
        label: 'Fuel Spend (₹)',
        data: chartDataPayload.fuelCosts || [],
        backgroundColor: isDark
          ? 'rgba(0, 243, 255, 0.82)'
          : 'rgba(2, 132, 199, 0.85)',
        borderColor: isDark ? '#00f3ff' : '#0284c7',
        borderWidth: 1.5,
        borderRadius: 8,
        hoverBackgroundColor: isDark ? '#00f3ff' : '#0369a1',
      },
      {
        label: 'Maintenance Cost (₹)',
        data: chartDataPayload.maintenanceCosts || [],
        backgroundColor: isDark
          ? 'rgba(168, 85, 247, 0.82)'
          : 'rgba(124, 58, 237, 0.85)',
        borderColor: isDark ? '#a855f7' : '#7c3aed',
        borderWidth: 1.5,
        borderRadius: 8,
        hoverBackgroundColor: isDark ? '#a855f7' : '#6d28d9',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12, weight: '600' },
          padding: 18,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(8, 14, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#F8FAFC' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#334155',
        borderColor: isDark ? 'rgba(0, 243, 255, 0.35)' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ₹${Number(context.raw).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'JetBrains Mono', size: 11 },
        },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          callback: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  const totalFuel = summary.total_fleet_fuel_cost ?? 0;
  const totalMaint = summary.total_fleet_maintenance_cost ?? 0;
  const totalCost = summary.total_fleet_operating_cost ?? 0;
  const avgCostKm = summary.overall_avg_cost_per_km ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Report 2 Header Banner */}
      <div className="glass-panel neon-card-purple p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: 'var(--neon-purple)',
                }}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                DBMS Report 2: Operating Expense Summary
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                View: <code className="text-cyan-400">view_vehicle_operating_cost</code>
              </span>
            </div>

            <h2 className="text-2xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Fleet Operating Spend & Cost-Per-Km Efficiency
            </h2>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This analytical report queries PostgreSQL analytical view{' '}
              <code className="font-mono text-cyan-400 px-1 py-0.5 rounded bg-cyan-950/40">
                view_vehicle_operating_cost
              </code>
              . It demonstrates multi-table relational aggregation by pre-grouping{' '}
              <code className="font-mono text-cyan-400">TripLogs</code>,{' '}
              <code className="font-mono text-cyan-400">FuelLogs</code>, and{' '}
              <code className="font-mono text-cyan-400">MaintenanceRecords</code> before joining onto{' '}
              <code className="font-mono text-cyan-400">Vehicles</code>, completely avoiding Cartesian product inflation.
            </p>
          </div>

          {/* Efficiency Metric */}
          <div
            className="p-5 rounded-2xl border text-center min-w-[180px]"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(168, 85, 247, 0.35)',
              boxShadow: 'var(--glow-purple)',
            }}
          >
            <div className="flex items-center justify-center gap-1 text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--neon-cyan)' }}>
              <Activity className="w-3.5 h-3.5" />
              <span>Fleet Efficiency</span>
            </div>
            <div className="text-3xl font-display font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>
              ₹{avgCostKm}
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Average Cost Per Km
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="glass-panel p-5 border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
              Total Fleet Spend
            </span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-display font-bold font-mono mt-2" style={{ color: 'var(--text-primary)' }}>
            ₹{Number(totalCost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Fuel + Maintenance combined
          </div>
        </div>

        {/* Total Fuel */}
        <div className="glass-panel p-5 border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
              Total Fuel Expense
            </span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-display font-bold font-mono mt-2" style={{ color: 'var(--neon-cyan)' }}>
            ₹{Number(totalFuel).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {((totalFuel / (totalCost || 1)) * 100).toFixed(1)}% of total budget
          </div>
        </div>

        {/* Total Maintenance */}
        <div className="glass-panel p-5 border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
              Total Maintenance Cost
            </span>
            <Wrench className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-display font-bold font-mono mt-2" style={{ color: 'var(--neon-purple)' }}>
            ₹{Number(totalMaint).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {((totalMaint / (totalCost || 1)) * 100).toFixed(1)}% of total budget
          </div>
        </div>

        {/* Efficiency Index */}
        <div className="glass-panel p-5 border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
              Operating Distance
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold font-mono mt-2" style={{ color: 'var(--neon-emerald)' }}>
            {Number(summary.total_fleet_distance_km ?? 0).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal">km</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Recorded trip mileage
          </div>
        </div>
      </div>

      {/* Cyber Neon Grouped Bar Chart */}
      <div className="glass-panel border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Fuel Spend vs. Maintenance Cost per Vehicle</span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Visualizing PostgreSQL aggregated costs by vehicle license plate
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--neon-cyan)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Fuel Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--neon-purple)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Maintenance</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Advanced Frosted-Glass Vehicle Operating Cost Table */}
      <div
        className="glass-table-panel p-6 shadow-2xl relative overflow-hidden"
        style={{ borderColor: 'rgba(168, 85, 247, 0.30)' }}
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Vehicle Operating Cost Breakdown
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Computed in real-time via PostgreSQL SQL Views
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
                <th className="py-2.5 px-4 font-semibold">License Plate</th>
                <th className="py-2.5 px-4 font-semibold">Model</th>
                <th className="py-2.5 px-4 font-semibold">Distance (km)</th>
                <th className="py-2.5 px-4 font-semibold">Fuel Spend</th>
                <th className="py-2.5 px-4 font-semibold">Maintenance</th>
                <th className="py-2.5 px-4 font-semibold">Total Cost</th>
                <th className="py-2.5 px-4 font-semibold text-right">Cost / Km</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const vid = row.VehicleID ?? row.vehicleid;
                const plate = row.LicensePlate || row.licenseplate || '';
                const model = row.Model || row.model || '';
                const km = row.TotalDistanceKm ?? row.totaldistancekm ?? 0;
                const fuel = row.TotalFuelCost ?? row.totalfuelcost ?? 0;
                const maint = row.TotalMaintenanceCost ?? row.totalmaintenancecost ?? 0;
                const total = row.TotalOperatingCost ?? row.totaloperatingcost ?? 0;
                const costKm = row.CostPerKm ?? row.costperkm ?? 0;

                const isEfficient = costKm <= 40;

                return (
                  <motion.tr
                    key={vid}
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
                        '0 6px 24px -2px rgba(168, 85, 247, 0.24), inset 0 0 12px rgba(168, 85, 247, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-table-row)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <td className="py-3 px-4 rounded-l-xl font-mono font-bold text-xs" style={{ color: 'var(--neon-cyan)' }}>
                      {plate}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {model}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {Number(km).toLocaleString('en-IN')} km
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      ₹{Number(fuel).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      ₹{Number(maint).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      ₹{Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right rounded-r-xl">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono font-bold text-xs shadow-sm"
                        style={{
                          backgroundColor: isEfficient
                            ? 'rgba(0, 255, 136, 0.14)'
                            : 'rgba(255, 170, 0, 0.14)',
                          color: isEfficient ? 'var(--neon-emerald)' : 'var(--neon-amber)',
                          border: `1px solid ${
                            isEfficient
                              ? 'rgba(0, 255, 136, 0.35)'
                              : 'rgba(255, 170, 0, 0.35)'
                          }`,
                        }}
                      >
                        ₹{Number(costKm).toFixed(2)}/km
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
