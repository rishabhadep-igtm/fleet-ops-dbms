import React from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Layers,
  AlertTriangle,
  BarChart3,
  Database,
  RefreshCw,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  dbHealth,
  onRefresh,
  overdueCount = 0,
}) {
  const isConnected = dbHealth?.database?.connected;
  const dbPort = dbHealth?.database?.port || '5400';
  const dbName = dbHealth?.database?.name || 'fleet_ops_db';

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Layers, accent: 'cyan' },
    {
      id: 'overdue',
      label: 'Overdue Alerts',
      icon: AlertTriangle,
      accent: 'magenta',
      badge: overdueCount > 0 ? overdueCount : null,
    },
    { id: 'expenses', label: 'Expense Analytics', icon: BarChart3, accent: 'purple' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-glass)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid var(--border-neon-cyan)',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <Truck className="w-6 h-6" style={{ color: 'var(--neon-cyan)' }} />
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                FleetOps
              </span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-full font-semibold tracking-wider border"
                style={{
                  background: 'rgba(0, 243, 255, 0.1)',
                  borderColor: 'rgba(0, 243, 255, 0.3)',
                  color: 'var(--neon-cyan)',
                }}
              >
                DBMS PRO
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Commercial Vehicle Fleet & Analytics Terminal
            </p>
          </div>
        </div>

        {/* Cyber Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1.5 rounded-xl border relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-glass)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  isActive ? 'text-white' : 'hover:opacity-100'
                }`}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabGlow"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background:
                        item.accent === 'cyan'
                          ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.18), rgba(59, 130, 246, 0.18))'
                          : item.accent === 'magenta'
                          ? 'linear-gradient(135deg, rgba(255, 0, 127, 0.18), rgba(244, 63, 94, 0.18))'
                          : 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(124, 58, 237, 0.18))',
                      border: `1px solid ${
                        item.accent === 'cyan'
                          ? 'var(--neon-cyan)'
                          : item.accent === 'magenta'
                          ? 'var(--neon-magenta)'
                          : 'var(--neon-purple)'
                      }`,
                      boxShadow:
                        item.accent === 'cyan'
                          ? 'var(--glow-cyan)'
                          : item.accent === 'magenta'
                          ? 'var(--glow-magenta)'
                          : 'var(--glow-purple)',
                    }}
                    transition={{ type: 'spring', bounce: 0.22, duration: 0.5 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
                {item.badge && (
                  <span
                    className="relative z-10 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full animate-pulse text-white"
                    style={{ backgroundColor: 'var(--neon-magenta)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Diagnostics & Actions */}
        <div className="flex items-center gap-3">
          {/* Live PostgreSQL Health Pill */}
          <div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-mono font-medium shadow-sm transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: isConnected ? 'rgba(0, 255, 136, 0.35)' : 'rgba(255, 0, 127, 0.4)',
              color: 'var(--text-secondary)',
            }}
            title={`PostgreSQL Port: ${dbPort} | DB: ${dbName} | Real-Time Raw SQL Connection Active`}
          >
            <div className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
            </div>
            <span className="hidden sm:inline">
              {isConnected ? `PG-18 :${dbPort}` : 'DB OFFLINE'}
            </span>
          </div>

          {/* Quick Refresh */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, rotate: 180 }}
            onClick={onRefresh}
            className="p-2 rounded-xl border transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh Live Fleet Data"
          >
            <RefreshCw className="w-4 h-4 hover:text-cyan-400 transition-colors" />
          </motion.button>

          {/* Theme Toggle (Dark / Light) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--neon-cyan)',
              boxShadow: '0 0 12px rgba(0, 243, 255, 0.15)',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light Cosmic Pearl' : 'Dark Cosmic Obsidian'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile nav items */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t" style={{ borderColor: 'var(--border-glass)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'border' : ''
              }`}
              style={{
                borderColor: isActive ? 'var(--neon-cyan)' : 'transparent',
                backgroundColor: isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                color: isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1 text-[9px] rounded-full bg-rose-500 text-white font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
