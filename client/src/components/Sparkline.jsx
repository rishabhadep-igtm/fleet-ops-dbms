import React from 'react';

/**
 * Sparkline - Glowing micro-chart component with gradient fill and drop-shadow
 * Used in KPI cards to visualize operational trends (distance, fuel, asset activity).
 */
export default function Sparkline({
  data = [12, 19, 15, 25, 22, 30, 28, 38],
  color = 'cyan', // 'cyan' | 'magenta' | 'emerald' | 'purple'
  width = 120,
  height = 40,
}) {
  const colorMap = {
    cyan: {
      stroke: '#00f3ff',
      fillStart: 'rgba(0, 243, 255, 0.35)',
      fillEnd: 'rgba(0, 243, 255, 0.0)',
      glow: 'rgba(0, 243, 255, 0.8)',
    },
    magenta: {
      stroke: '#ff007f',
      fillStart: 'rgba(255, 0, 127, 0.35)',
      fillEnd: 'rgba(255, 0, 127, 0.0)',
      glow: 'rgba(255, 0, 127, 0.8)',
    },
    emerald: {
      stroke: '#00ff88',
      fillStart: 'rgba(0, 255, 136, 0.35)',
      fillEnd: 'rgba(0, 255, 136, 0.0)',
      glow: 'rgba(0, 255, 136, 0.8)',
    },
    purple: {
      stroke: '#a855f7',
      fillStart: 'rgba(168, 85, 247, 0.35)',
      fillEnd: 'rgba(168, 85, 247, 0.0)',
      glow: 'rgba(168, 85, 247, 0.8)',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const graphHeight = height - padding * 2;
  const graphWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((val - min) / range) * graphHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    // Smooth bezier curve
    const prev = arr[idx - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPt = points[points.length - 1];
  const filterId = `glow-${color}-${Math.random().toString(36).substr(2, 6)}`;
  const gradId = `grad-${color}-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <div className="relative inline-block overflow-visible" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scheme.fillStart} />
            <stop offset="100%" stopColor={scheme.fillEnd} />
          </linearGradient>
        </defs>

        {/* Gradient fill underneath curve */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Glowing stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={scheme.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />

        {/* End pulse dot */}
        {lastPt && (
          <circle
            cx={lastPt.x}
            cy={lastPt.y}
            r="3"
            fill={scheme.stroke}
            filter={`url(#${filterId})`}
          />
        )}
      </svg>
    </div>
  );
}
