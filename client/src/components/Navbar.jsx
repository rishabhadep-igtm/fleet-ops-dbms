import React from 'react';
import { Truck, Moon, Sun, Database, RefreshCw, BarChart3, AlertTriangle, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, dbHealth, onRefresh }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand & Title */}
        <div className="brand-section">
          <div className="brand-logo">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="brand-title">FleetOps DBMS</h1>
            <p className="brand-subtitle">Commercial Delivery Hub Operations & Maintenance</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={16} />
            Live Dashboard
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            <AlertTriangle size={16} />
            Overdue Alerts
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <BarChart3 size={16} />
            Expense Analytics
          </button>
        </nav>

        {/* System Diagnostics & Theme Toggle */}
        <div className="nav-actions">
          {/* Database Health Pill */}
          <div className="db-pill" title={`PostgreSQL Port: ${dbHealth?.database?.port || '5400'} | DB: ${dbHealth?.database?.name || 'fleet_ops_db'}`}>
            <span className={`status-dot ${dbHealth?.database?.connected ? 'online' : 'offline'}`} />
            <span>{dbHealth?.database?.connected ? 'PostgreSQL 18 Connected' : 'DB Disconnected'}</span>
          </div>

          <button className="theme-toggle-btn" onClick={onRefresh} title="Refresh Data">
            <RefreshCw size={17} />
          </button>

          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
