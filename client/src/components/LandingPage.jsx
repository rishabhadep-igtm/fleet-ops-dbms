import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Radio } from 'lucide-react';

export default function LandingPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 pointer-events-none select-none"
    >
      {/* Top Floating Minimalist Controls (Brand Pill & Theme Switcher) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto"
      >
        {/* Subtle Brand Badge */}
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl transition-all shadow-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-glass)',
          }}
        >
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </div>
          <span className="font-display font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
            FleetOps
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'rgba(0, 243, 255, 0.12)',
              color: 'var(--neon-cyan)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
            }}
          >
            SYS ONLINE
          </span>
        </div>

        {/* Ambient Theme Switcher */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          aria-label="Toggle Environment Theme"
          className="p-3 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer shadow-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-glass)',
            color: isDark ? 'var(--neon-amber)' : 'var(--neon-purple)',
          }}
          title={isDark ? 'Switch to Sunlit Sky Mode' : 'Switch to Cosmic Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </motion.button>
      </motion.div>

      {/* Dead-Center Prominent Gateway Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex flex-col items-center text-center max-w-lg w-full"
        >
          {/* Ambient Glowing Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-semibold uppercase tracking-widest backdrop-blur-xl shadow-lg"
            style={{
              backgroundColor: isDark ? 'rgba(10, 16, 34, 0.65)' : 'rgba(255, 255, 255, 0.85)',
              borderColor: isDark ? 'rgba(0, 243, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)',
              color: isDark ? 'var(--neon-cyan)' : '#0284c7',
            }}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Telemetry & Control Gateway</span>
          </motion.div>

          {/* Prominent Glassmorphism Gateway Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/dashboard')}
            className="group relative cursor-pointer px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-display font-extrabold text-base sm:text-xl tracking-wider flex items-center justify-center gap-4 transition-all duration-300 w-auto"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.22) 0%, rgba(168, 85, 247, 0.28) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 249, 255, 0.98) 100%)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: isDark
                ? '1.5px solid rgba(0, 243, 255, 0.55)'
                : '1.5px solid rgba(2, 132, 199, 0.45)',
              boxShadow: isDark
                ? '0 0 35px rgba(0, 243, 255, 0.35), 0 0 70px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : '0 16px 40px -8px rgba(2, 132, 199, 0.3), 0 0 25px rgba(2, 132, 199, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              color: isDark ? '#ffffff' : '#0369a1',
            }}
          >
            {/* Ambient Animated Hover Glow */}
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 opacity-25 group-hover:opacity-75 blur-xl transition-all duration-500 -z-10" />

            {/* Glowing Activity Indicator Dot */}
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 shadow-[0_0_12px_#00f3ff]" />
            </span>

            {/* Main Label */}
            <span className="relative z-10 whitespace-nowrap">
              Launch Fleet Command
            </span>

            {/* Dynamic Arrow Transition Indicator */}
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 shrink-0 group-hover:translate-x-2 transition-transform duration-300" />
          </motion.button>

          {/* Minimalist Subtext Below Gateway with Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 px-4 py-1.5 rounded-full backdrop-blur-xl border text-[11px] sm:text-xs font-mono tracking-wider shadow-md"
            style={{
              backgroundColor: isDark ? 'rgba(8, 14, 30, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-secondary)',
            }}
          >
            Real-Time Telemetry • Maintenance Automation • Operating Analytics
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Minimalist Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono tracking-wider opacity-60 pointer-events-auto"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>ENTERPRISE FLEET DBMS v2.4</span>
        <span>POSTGRESQL 18 DISTRIBUTED</span>
      </motion.div>
    </motion.div>
  );
}
