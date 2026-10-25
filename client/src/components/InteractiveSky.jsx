import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';

/**
 * InteractiveSky - Dynamic, cursor-responsive environmental sky layer
 * Powered by Framer Motion
 *
 * Features:
 * - Parallax Effect: Celestial elements shift subtly in the OPPOSITE direction of the cursor.
 * - Light Mode: Animated golden sun with pulsing coronas and multi-layered drifting clouds.
 * - Dark Mode: Glowing celestial moon with atmospheric rings and twinkling cosmic stars.
 */
export default function InteractiveSky({ theme = 'dark' }) {
  // Motion values for smooth mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for opposing parallax motion
  const springConfig = { damping: 28, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax layer depths (shifting in OPPOSITE direction of cursor coordinates)
  // Sun & Moon Parallax (smooth 35px shift)
  const sunMoonX = useTransform(smoothX, (v) => v * 35);
  const sunMoonY = useTransform(smoothY, (v) => v * 25);

  // Procedural Clouds (multi-plane depth: 45px, 30px, 20px)
  const cloudsSlowX = useTransform(smoothX, (v) => v * 45);
  const cloudsSlowY = useTransform(smoothY, (v) => v * 22);

  const cloudsMidX = useTransform(smoothX, (v) => v * 30);
  const cloudsMidY = useTransform(smoothY, (v) => v * 15);

  const cloudsFastX = useTransform(smoothX, (v) => v * 20);
  const cloudsFastY = useTransform(smoothY, (v) => v * 10);

  // Twinkling Cosmic Stars Parallax Layer (28px shift)
  const starsX = useTransform(smoothX, (v) => v * 28);
  const starsY = useTransform(smoothY, (v) => v * 18);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalized between -1 and 1
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      // Invert sign to shift subtly in the OPPOSITE direction of the cursor!
      mouseX.set(-normX);
      mouseY.set(-normY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const isDark = theme === 'dark';

  // Generate twinkling stars positions once
  const [stars] = useState(() => {
    return Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 65, // In the upper 65% of the viewport
      size: Math.random() * 2.5 + 1,
      color:
        i % 4 === 0
          ? 'rgba(0, 243, 255, 0.95)' // Cyan
          : i % 4 === 1
          ? 'rgba(255, 0, 127, 0.85)' // Magenta
          : i % 4 === 2
          ? 'rgba(168, 85, 247, 0.9)' // Purple
          : 'rgba(255, 255, 255, 0.95)', // White
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {/* LIGHT MODE: ANIMATED SUN & DRIFTING CLOUDS */}
        {!isDark ? (
          <motion.div
            key="light-sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Animated Sun with Multi-Layered Pulsing Coronas (Opposing Parallax) */}
            <motion.div
              style={{
                x: sunMoonX,
                y: sunMoonY,
              }}
              className="absolute top-[8%] right-[14%] flex items-center justify-center"
            >
              {/* Outer soft ambient corona */}
              <motion.div
                animate={{
                  scale: [1, 1.14, 1],
                  opacity: [0.35, 0.55, 0.35],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-64 h-64 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(253, 224, 71, 0.45) 0%, rgba(56, 189, 248, 0.15) 55%, transparent 75%)',
                  filter: 'blur(16px)',
                }}
              />

              {/* Mid sun rays halo */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="absolute w-44 h-44 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(254, 240, 138, 0.75) 0%, rgba(253, 224, 71, 0.35) 50%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />

              {/* Radiant Sun Core */}
              <div
                className="w-24 h-24 rounded-full shadow-2xl relative z-10"
                style={{
                  background:
                    'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef08a 45%, #f59e0b 100%)',
                  boxShadow:
                    '0 0 50px rgba(253, 224, 71, 0.9), 0 0 100px rgba(245, 158, 11, 0.5)',
                }}
              />
            </motion.div>

            {/* Drifting Procedural Clouds with Multi-Plane Depth & Opposing Parallax */}
            {/* Cloud Layer 1 - High & Slow */}
            <motion.div
              style={{
                x: cloudsSlowX,
                y: cloudsSlowY,
              }}
              className="absolute top-[6%] left-[-10%] w-[120%]"
            >
              <motion.div
                animate={{ x: ['-10%', '110%'] }}
                transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
                className="opacity-60"
              >
                <svg width="220" height="90" viewBox="0 0 220 90" fill="none">
                  <path
                    d="M30 65C13.4315 65 0 51.5685 0 35C0 18.4315 13.4315 5 30 5C32.1934 5 34.3331 5.23545 36.3934 5.68453C43.2087 2.16439 51.0427 0 59.5 0C80.2107 0 97 16.7893 97 37.5C97 38.647 96.9486 39.7824 96.8485 40.9033C100.91 38.4111 105.748 37 111 37C124.807 37 136 48.1929 136 62C136 63.0366 135.937 64.0583 135.815 65H30Z"
                    fill="white"
                    fillOpacity="0.85"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Cloud Layer 2 - Mid Altitude */}
            <motion.div
              style={{
                x: cloudsMidX,
                y: cloudsMidY,
              }}
              className="absolute top-[16%] left-[-20%] w-[130%]"
            >
              <motion.div
                animate={{ x: ['-20%', '100%'] }}
                transition={{ duration: 55, repeat: Infinity, ease: 'linear', delay: 12 }}
                className="opacity-75"
              >
                <svg width="280" height="110" viewBox="0 0 280 110" fill="none">
                  <path
                    d="M40 85C17.9086 85 0 67.0914 0 45C0 22.9086 17.9086 5 40 5C43.1979 5 46.2917 5.37568 49.2562 6.08272C58.3308 2.2472 68.3262 0 79 0C106.614 0 129 22.3858 129 50C129 51.5293 128.931 53.0432 128.798 54.5377C134.213 51.2148 140.664 49.3333 147.5 49.3333C165.725 49.3333 180.5 64.1079 180.5 82.3333C180.5 83.238 180.463 84.1337 180.392 85H40Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Cloud Layer 3 - Lower & Faster */}
            <motion.div
              style={{
                x: cloudsFastX,
                y: cloudsFastY,
              }}
              className="absolute top-[24%] left-[-15%] w-[130%]"
            >
              <motion.div
                animate={{ x: ['-15%', '105%'] }}
                transition={{ duration: 42, repeat: Infinity, ease: 'linear', delay: 24 }}
                className="opacity-65"
              >
                <svg width="190" height="80" viewBox="0 0 190 80" fill="none">
                  <path
                    d="M25 60C11.1929 60 0 48.8071 0 35C0 21.1929 11.1929 10 25 10C27.2341 10 29.3879 10.2936 31.4285 10.8443C37.4912 6.5518 44.8966 4 52.8889 4C72.5312 4 88.4444 19.9132 88.4444 39.5556C88.4444 40.5401 88.4042 41.5146 88.3248 42.4776C92.0006 40.0632 96.3867 38.6667 101.111 38.6667C113.882 38.6667 124.222 49.0069 124.222 61.7778C124.222 62.536 124.185 63.2858 124.113 64.0245H25V60Z"
                    fill="white"
                    fillOpacity="0.8"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          /* DARK MODE: GLOWING MOON & TWINKLING STARS */
          <motion.div
            key="dark-sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Twinkling Cosmic Stars with Opposing Parallax */}
            <motion.div
              style={{
                x: starsX,
                y: starsY,
              }}
              className="absolute inset-0 w-full h-full"
            >
              {stars.map((star) => (
                <motion.div
                  key={star.id}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.85, 1.35, 0.85],
                  }}
                  transition={{
                    duration: star.duration,
                    delay: star.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute rounded-full"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    backgroundColor: star.color,
                    boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
                  }}
                />
              ))}
            </motion.div>

            {/* Glowing Celestial Moon with Opposing Parallax */}
            <motion.div
              style={{
                x: sunMoonX,
                y: sunMoonY,
              }}
              className="absolute top-[8%] left-[12%] flex items-center justify-center"
            >
              {/* Outer atmospheric aura */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.35, 0.55, 0.35],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-56 h-56 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0, 243, 255, 0.3) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 72%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Inner Moon Halo */}
              <div
                className="absolute w-36 h-36 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(248, 250, 252, 0.45) 0%, rgba(0, 243, 255, 0.25) 55%, transparent 75%)',
                  filter: 'blur(10px)',
                }}
              />

              {/* Crescent/Celestial Moon Body */}
              <div
                className="w-20 h-20 rounded-full relative z-10 overflow-hidden"
                style={{
                  background:
                    'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 40%, #94a3b8 80%, #475569 100%)',
                  boxShadow:
                    '0 0 35px rgba(0, 243, 255, 0.8), inset -4px -4px 10px rgba(15, 23, 42, 0.6)',
                }}
              >
                {/* Subtle moon surface crater detailing */}
                <div
                  className="absolute w-5 h-5 rounded-full top-3 left-4 opacity-25"
                  style={{ backgroundColor: '#64748b' }}
                />
                <div
                  className="absolute w-3 h-3 rounded-full top-8 left-9 opacity-20"
                  style={{ backgroundColor: '#64748b' }}
                />
                <div
                  className="absolute w-6 h-6 rounded-full bottom-3 left-7 opacity-20"
                  style={{ backgroundColor: '#64748b' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
