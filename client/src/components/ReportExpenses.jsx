import React from 'react';
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
import { BarChart3, Fuel, Wrench, DollarSign, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportExpenses({ expensesData, loading, theme }) {
  const summary = expensesData?.summary || {};
  const data = expensesData?.data || [];
  const chartDataPayload = expensesData?.chartData || { labels: [], fuelCosts: [], maintenanceCosts: [] };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  const chartData = {
    labels: chartDataPayload.labels || [],
    datasets: [
      {
        label: 'Fuel Spend (₹)',
        data: chartDataPayload.fuelCosts || [],
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.85)' : 'rgba(37, 99, 235, 0.85)',
        borderColor: isDark ? '#38BDF8' : '#2563EB',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Maintenance Cost (₹)',
        data: chartDataPayload.maintenanceCosts || [],
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.85)' : 'rgba(124, 58, 237, 0.85)',
        borderColor: isDark ? '#A855F7' : '#7C3AED',
        borderWidth: 1,
        borderRadius: 6,
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
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹${Number(context.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Report Explanation Card */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-purple" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
            <BarChart3 size={14} /> Report 2: Fleet Expense Summary
          </span>
          <span className="cell-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Source: view_vehicle_operating_cost
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
          Operating Spend & Cost-Per-Km Efficiency
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Aggregates total fuel spend (<code style={{ color: 'var(--accent-blue)' }}>FuelLogs</code>), 
          repair expenditure (<code style={{ color: 'var(--accent-blue)' }}>MaintenanceRecords</code>), and 
          accumulated route distance (<code style={{ color: 'var(--accent-blue)' }}>TripLogs</code>). 
          Demonstrates SQL <code style={{ color: 'var(--accent-blue)' }}>JOIN</code>, <code style={{ color: 'var(--accent-blue)' }}>GROUP BY</code>, and <code style={{ color: 'var(--accent-blue)' }}>SUM</code> without Cartesian product anomalies.
        </p>

        {/* 3 Summary Badges */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div className="db-pill" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
            <Fuel size={16} color="var(--accent-cyan)" />
            <span>Fuel Spend: <strong>₹{Number(totalFuel).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
          </div>
          <div className="db-pill" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
            <Wrench size={16} color="var(--accent-purple)" />
            <span>Maintenance Spend: <strong>₹{Number(totalMaint).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
          </div>
          <div className="db-pill" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
            <DollarSign size={16} color="var(--accent-emerald)" />
            <span>Total Fleet Operating Cost: <strong>₹{Number(totalCost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Chart.js Visualizer */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Fuel Spend vs. Maintenance Cost Per Vehicle
        </h3>
        <div style={{ height: '360px', width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Loading Chart.js analytics...
            </div>
          ) : chartDataPayload.labels?.length === 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No financial logs available to render chart.
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
          Detailed Operating Expense Table
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Model</th>
                <th>Status</th>
                <th>Distance Covered</th>
                <th>Fuel Spend</th>
                <th>Maintenance Cost</th>
                <th>Total Operating Cost</th>
                <th>Cost Per Km</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Fetching records from view_vehicle_operating_cost...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No operating records found.
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const vid = row.VehicleID ?? row.vehicleid;
                  const plate = row.LicensePlate || row.licenseplate || '';
                  const model = row.Model || row.model || '';
                  const status = row.Status || row.status || '';
                  const dist = row.TotalDistanceKm ?? row.totaldistancekm ?? 0;
                  const fuelCost = row.TotalFuelCost ?? row.totalfuelcost ?? 0;
                  const maintCost = row.TotalMaintenanceCost ?? row.totalmaintenancecost ?? 0;
                  const totalCost = row.TotalOperatingCost ?? row.totaloperatingcost ?? 0;
                  const costPerKm = row.CostPerKm ?? row.costperkm ?? 0;

                  return (
                    <tr key={vid}>
                      <td>
                        <span className="cell-mono" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                          {plate}
                        </span>
                      </td>
                      <td>{model}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono">
                          {Number(dist).toLocaleString('en-IN')} km
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono" style={{ color: 'var(--accent-cyan)' }}>
                          ₹{Number(fuelCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono" style={{ color: 'var(--accent-purple)' }}>
                          ₹{Number(maintCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <strong className="cell-mono" style={{ color: 'var(--text-primary)' }}>
                          ₹{Number(totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td>
                        <span
                          className="cell-mono"
                          style={{
                            fontWeight: 700,
                            color: costPerKm > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                          }}
                        >
                          ₹{Number(costPerKm).toFixed(2)}/km
                        </span>
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
