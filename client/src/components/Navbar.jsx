import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Truck,
  Layers,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Sun,
  Moon,
  Home,
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

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Layers, accent: 'cyan' },
    {
      id: 'overdue',
      label: 'Overdue Maintenance',
      icon: AlertTriangle,
      accent: 'magenta',
      badge: overdueCount > 0 ? overdueCount : null,
    },
    { id: 'expenses', label: 'Operating Expense Analytics', icon: BarChart3, accent: 'purple' },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-2xl border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-glass)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
        {/* Brand & Subtitle (Links back to Gateway) */}
        <Link
          to="/"
          className="flex items-center gap-3.5 shrink-0 cursor-pointer group"
          title="Return to Gateway Home"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              border: '1px solid var(--border-neon-cyan)',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <Truck className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all">
                FleetOps
              </span>
              <span
                className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold tracking-wider border"
                style={{
                  background: 'rgba(0, 243, 255, 0.1)',
                  borderColor: 'rgba(0, 243, 255, 0.3)',
                  color: 'var(--neon-cyan)',
                }}
              >
                PRO
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Commercial Fleet Operations
            </p>
          </div>
        </Link>

        {/* Cyber Navigation Tabs with generous spacing & comfortable padding */}
        <nav
          className="hidden md:flex items-center gap-2 lg:gap-4 p-1.5 px-2.5 rounded-2xl border relative w-auto shrink-0"
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
                className={`relative h-10 lg:h-11 w-auto px-3.5 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 lg:gap-2.5 transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'border-transparent text-white'
                    : 'border-white/10 hover:border-cyan-400/40 hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? 'transparent' : 'var(--bg-card)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabGlow"
                    className="absolute inset-0 rounded-xl"
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
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span
                    className="relative z-10 px-2 py-0.5 text-xs font-mono font-bold rounded-full animate-pulse text-white leading-none flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--neon-magenta)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Status & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* PostgreSQL Connection Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium shadow-sm transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: isConnected ? 'rgba(0, 255, 136, 0.35)' : 'rgba(255, 0, 127, 0.4)',
              color: 'var(--text-secondary)',
            }}
            title="Database Connection Status"
          >
            <div className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
            </div>
            <span className="hidden sm:inline">
              {isConnected ? 'PostgreSQL 18 Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onRefresh}
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh Fleet Data"
          >
            <RefreshCw className="w-4 h-4 hover:text-cyan-400 transition-colors" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--neon-cyan)',
              boxShadow: '0 0 12px rgba(0, 243, 255, 0.15)',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </motion.button>

          {/* Gateway Return Link */}
          <Link
            to="/"
            className="p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center opacity-75 hover:opacity-100 hover:border-cyan-400/50"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-secondary)',
            }}
            title="Return to Launch Gateway"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile nav items with clean gap */}
      <div className="md:hidden flex items-center justify-around px-4 py-2.5 border-t gap-4" style={{ borderColor: 'var(--border-glass)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'border shadow-sm' : ''
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
