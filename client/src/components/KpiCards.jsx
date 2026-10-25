import React from 'react';
import { Truck, Users, AlertOctagon, DollarSign, Activity } from 'lucide-react';

export default function KpiCards({ kpis, onOverdueClick }) {
  const activeVehicles = kpis?.active_vehicles ?? 0;
  const totalVehicles = kpis?.total_vehicles ?? 0;
  const inShopVehicles = kpis?.in_shop_vehicles ?? 0;
  const retiredVehicles = kpis?.retired_vehicles ?? 0;

  const driversOnRoute = kpis?.drivers_on_route ?? 0;
  const totalDrivers = kpis?.total_drivers ?? 0;

  const overdueAlerts = kpis?.overdue_service_alerts ?? 0;

  const totalSpend = kpis?.total_operating_spend ?? 0;
  const fuelSpend = kpis?.total_fuel_spend ?? 0;
  const maintSpend = kpis?.total_maintenance_spend ?? 0;
  const avgCostPerKm = kpis?.avg_cost_per_km ?? 0;
  const totalDistance = kpis?.total_distance_km ?? 0;

  return (
    <div className="kpi-grid">
      {/* 1. Active Vehicles */}
      <div className="kpi-card">
        <div className="kpi-top">
          <span className="kpi-title">Active Fleet Assets</span>
          <div className="kpi-icon-wrap kpi-icon-blue">
            <Truck size={22} />
          </div>
        </div>
        <div>
          <div className="kpi-value">{activeVehicles} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ {totalVehicles}</span></div>
          <p className="kpi-meta">
            <span>{inShopVehicles} in shop</span> • <span>{retiredVehicles} retired</span>
          </p>
        </div>
      </div>

      {/* 2. Drivers on Route */}
      <div className="kpi-card">
        <div className="kpi-top">
          <span className="kpi-title">Drivers on Route</span>
          <div className="kpi-icon-wrap kpi-icon-emerald">
            <Users size={22} />
          </div>
        </div>
        <div>
          <div className="kpi-value">{driversOnRoute} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ {totalDrivers}</span></div>
          <p className="kpi-meta">
            Active certified delivery drivers
          </p>
        </div>
      </div>

      {/* 3. Overdue Service Alerts */}
      <div 
        className={`kpi-card ${overdueAlerts > 0 ? 'alert-pulse' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={onOverdueClick}
        title="Click to view detailed Overdue Report"
      >
        <div className="kpi-top">
          <span className="kpi-title">Overdue Service Alerts</span>
          <div className="kpi-icon-wrap kpi-icon-rose">
            <AlertOctagon size={22} />
          </div>
        </div>
        <div>
          <div className="kpi-value" style={{ color: overdueAlerts > 0 ? 'var(--accent-rose)' : 'inherit' }}>
            {overdueAlerts}
          </div>
          <p className="kpi-meta">
            {overdueAlerts > 0 ? '⚠️ High Priority: Exceeding scheduled km' : 'All fleet maintenance up-to-date'}
          </p>
        </div>
      </div>

      {/* 4. Total Operating Spend */}
      <div className="kpi-card">
        <div className="kpi-top">
          <span className="kpi-title">Total Operating Spend</span>
          <div className="kpi-icon-wrap kpi-icon-purple">
            <DollarSign size={22} />
          </div>
        </div>
        <div>
          <div className="kpi-value">₹{Number(totalSpend).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <p className="kpi-meta">
            Fuel: ₹{Number(fuelSpend).toLocaleString('en-IN', { maximumFractionDigits: 0 })} | Maint: ₹{Number(maintSpend).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="kpi-meta" style={{ marginTop: '4px', color: 'var(--accent-cyan)' }}>
            <Activity size={12} /> ₹{avgCostPerKm}/km across {Number(totalDistance).toLocaleString('en-IN')} km
          </p>
        </div>
      </div>
    </div>
  );
}
