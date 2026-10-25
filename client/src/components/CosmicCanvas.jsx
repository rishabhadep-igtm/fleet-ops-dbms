import React, { useEffect, useRef } from 'react';

/**
 * CosmicCanvas - Interactive starry night & nebula background
 * Features:
 * - Dynamic stars with twinkling & subtle drift
 * - Interactive mouse reaction: cursor gravitational illumination & deflection
 * - Cosmic nebula clouds that blend seamlessly in dark & light themes
 * - High-efficiency requestAnimationFrame loop with devicePixelRatio scaling
 */
export default function CosmicCanvas({ theme = 'dark' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth damping
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
      lastMoveTime: Date.now(),
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isMoving = true;
      mouse.lastMoveTime = Date.now();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle definitions
    const PARTICLE_COUNT = Math.min(130, Math.floor((width * height) / 12000));
    let particles = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isBright = Math.random() > 0.85;
        const colorPalette =
          theme === 'dark'
            ? [
                'rgba(0, 243, 255, ', // cyan
                'rgba(255, 0, 127, ', // magenta
                'rgba(168, 85, 247, ', // purple
                'rgba(0, 255, 136, ', // emerald
                'rgba(255, 255, 255, ', // pure star
              ]
            : [
                'rgba(2, 132, 199, ',
                'rgba(225, 29, 72, ',
                'rgba(124, 58, 237, ',
                'rgba(5, 150, 105, ',
                'rgba(71, 85, 105, ',
              ];

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          originX: Math.random() * width,
          originY: Math.random() * height,
          radius: isBright ? Math.random() * 2.2 + 1.2 : Math.random() * 1.4 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          colorBase: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          alpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          isBright,
        });
      }
    };

    initParticles();

    // Render loop
    let step = 0;
    const render = () => {
      step += 0.01;

      // Mouse lerp interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';

      // 1. Draw ambient cosmic nebula clouds
      const g1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(step * 0.4) * 80,
        height * 0.3 + Math.cos(step * 0.3) * 60,
        20,
        width * 0.2,
        height * 0.3,
        width * 0.55
      );
      if (isDark) {
        g1.addColorStop(0, 'rgba(0, 243, 255, 0.07)');
        g1.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)');
        g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        g1.addColorStop(0, 'rgba(2, 132, 199, 0.08)');
        g1.addColorStop(0.5, 'rgba(59, 130, 246, 0.04)');
        g1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(step * 0.35) * 90,
        height * 0.65 + Math.sin(step * 0.45) * 70,
        30,
        width * 0.8,
        height * 0.65,
        width * 0.5
      );
      if (isDark) {
        g2.addColorStop(0, 'rgba(255, 0, 127, 0.06)');
        g2.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
        g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        g2.addColorStop(0, 'rgba(225, 29, 72, 0.06)');
        g2.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
        g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive cursor halo
      const cursorGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        320
      );
      if (isDark) {
        cursorGlow.addColorStop(0, 'rgba(0, 243, 255, 0.12)');
        cursorGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.06)');
        cursorGlow.addColorStop(0.7, 'rgba(255, 0, 127, 0.02)');
        cursorGlow.addColorStop(1, 'transparent');
      } else {
        cursorGlow.addColorStop(0, 'rgba(2, 132, 199, 0.14)');
        cursorGlow.addColorStop(0.4, 'rgba(124, 58, 237, 0.06)');
        cursorGlow.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = cursorGlow;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Stars & Particles with mouse deflection
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse reaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let extraAlpha = 0;
        let pushX = 0;
        let pushY = 0;

        if (dist < 180) {
          const factor = (1 - dist / 180);
          extraAlpha = factor * 0.6;
          // Gentle deflection
          pushX = -dx * factor * 0.04;
          pushY = -dy * factor * 0.04;
        }

        // Twinkle calculation
        p.twinklePhase += p.twinkleSpeed;
        const currentAlpha = Math.min(
          1,
          Math.max(0.1, p.alpha + Math.sin(p.twinklePhase) * 0.25 + extraAlpha)
        );

        ctx.beginPath();
        ctx.arc(p.x + pushX, p.y + pushY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${currentAlpha})`;
        ctx.fill();

        // Cross spike for bright stars
        if (p.isBright && currentAlpha > 0.45) {
          ctx.strokeStyle = `${p.colorBase}${currentAlpha * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x + pushX - p.radius * 3, p.y + pushY);
          ctx.lineTo(p.x + pushX + p.radius * 3, p.y + pushY);
          ctx.moveTo(p.x + pushX, p.y + pushY - p.radius * 3);
          ctx.lineTo(p.x + pushX, p.y + pushY + p.radius * 3);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Subtle futuristic cyber grid overlay */}
      <div className="absolute inset-0 cyber-grid-overlay opacity-40 pointer-events-none" />
    </div>
  );
}
