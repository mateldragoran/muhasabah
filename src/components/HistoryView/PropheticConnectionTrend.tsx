import React, { useState } from 'react';
import { MuhasabaRecord } from '../../types/muhasabah';
import { HeartHandshake, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface PropheticConnectionTrendProps {
  records: MuhasabaRecord[];
}

export const PropheticConnectionTrend: React.FC<PropheticConnectionTrendProps> = ({ records }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take the last 14 days sorted chronologically (oldest to newest)
  const sortedRecords = [...records].reverse().slice(-14);

  // Calculate statistics
  const recordedDays = sortedRecords.filter(
    (r) => r.propheticConnection === 'stronger' || r.propheticConnection === 'weaker'
  );

  const strongerCount = recordedDays.filter((r) => r.propheticConnection === 'stronger').length;
  const weakerCount = recordedDays.filter((r) => r.propheticConnection === 'weaker').length;
  const harmonyRate = recordedDays.length > 0 ? Math.round((strongerCount / recordedDays.length) * 100) : 0;

  // Calculate current streak of stronger days from the most recent records
  let currentStreak = 0;
  for (let i = sortedRecords.length - 1; i >= 0; i--) {
    if (sortedRecords[i].propheticConnection === 'stronger') {
      currentStreak++;
    } else if (sortedRecords[i].propheticConnection === 'weaker') {
      break;
    }
  }

  if (sortedRecords.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-[#9CA3AF]">
        No records evaluated yet to generate a Prophetic Connection trend. Complete tonight's reflection!
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 32;

  // Mapping points:
  // stronger = 1, weaker = -1, null = 0
  const points = sortedRecords.map((rec, idx) => {
    const x = paddingX + (idx / Math.max(1, sortedRecords.length - 1)) * (width - 2 * paddingX);
    let val = 0;
    if (rec.propheticConnection === 'stronger') val = 1;
    else if (rec.propheticConnection === 'weaker') val = -1;

    // Y position: 1 maps to paddingY + 10, -1 maps to height - paddingY - 10, 0 maps to height / 2
    const y =
      val === 1
        ? paddingY + 12
        : val === -1
        ? height - paddingY - 12
        : height / 2;

    return { x, y, val, record: rec };
  });

  // Create smooth curved path across evaluated points
  const evaluatedPoints = points.filter((p) => p.val !== 0);

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = createSmoothPath(evaluatedPoints);
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="w-full space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#0B1120]/70 border border-white/[0.06] text-center">
        <div>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Connection Rate</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#10B981]">
            {recordedDays.length > 0 ? `${harmonyRate}%` : '—'}
          </span>
        </div>
        <div className="border-x border-white/[0.08] px-1">
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Stronger Days</span>
          <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
            {strongerCount} <span className="text-xs text-[#9CA3AF] font-normal">/ {recordedDays.length}</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Closeness Streak</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#F59E0B]">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Trajectory Waveform SVG */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="propheticLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <filter id="propheticGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Upper Zone Guide: Stronger */}
          <line
            x1={paddingX}
            y1={paddingY + 12}
            x2={width - paddingX}
            y2={paddingY + 12}
            stroke="rgba(16, 185, 129, 0.2)"
            strokeDasharray="4,4"
          />
          <text
            x={paddingX - 10}
            y={paddingY + 15}
            textAnchor="end"
            className="fill-emerald-400/80 text-[9px] font-mono font-semibold"
          >
            +1 Stronger
          </text>

          {/* Center Neutral Guideline */}
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray="2,2"
          />

          {/* Lower Zone Guide: Weaker */}
          <line
            x1={paddingX}
            y1={height - paddingY - 12}
            x2={width - paddingX}
            y2={height - paddingY - 12}
            stroke="rgba(245, 158, 11, 0.2)"
            strokeDasharray="4,4"
          />
          <text
            x={paddingX - 10}
            y={height - paddingY - 9}
            textAnchor="end"
            className="fill-amber-400/80 text-[9px] font-mono font-semibold"
          >
            -1 Weaker
          </text>

          {/* Trajectory Connecting Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#propheticLineGradient)"
              strokeWidth="2.5"
              filter="url(#propheticGlow)"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive Daily Nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isStronger = pt.val === 1;
            const isWeaker = pt.val === -1;
            const isUnset = pt.val === 0;

            const fillColor = isStronger ? '#10B981' : isWeaker ? '#F59E0B' : '#4B5563';
            const strokeColor = isStronger ? '#34D399' : isWeaker ? '#FBBF24' : '#6B7280';

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
              >
                {/* Hit area */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {/* Node Ring */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Main Node */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isUnset ? 3 : 5}
                  fill={fillColor}
                  stroke={isUnset ? 'rgba(255,255,255,0.2)' : strokeColor}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />

                {/* Day label below */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[9px] font-mono transition-colors ${
                    isHovered ? 'fill-emerald-400 font-bold' : 'fill-[#6B7280]'
                  }`}
                >
                  {pt.record.date.slice(8, 10)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Touch Interactive Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none rounded-xl border border-white/[0.12] bg-[#0B1120]/95 backdrop-blur-xl p-3 shadow-2xl transition-all max-w-[220px]"
            style={{
              left: `${Math.min(75, Math.max(15, (hoveredPoint.x / width) * 100))}%`,
              top: hoveredPoint.val === 1 ? '45%' : '10%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-1.5 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-[#F9FAFB]">
                {hoveredPoint.record.date}
              </span>
              {hoveredPoint.record.hijriDate && (
                <span className="text-[10px] text-emerald-400/80 font-arabic truncate">
                  {hoveredPoint.record.hijriDate}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {hoveredPoint.val === 1 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Stronger Connection</span>
                  </>
                ) : hoveredPoint.val === -1 ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">Weaker Connection</span>
                  </>
                ) : (
                  <span className="text-[#9CA3AF]">Not Evaluated</span>
                )}
              </div>

              {hoveredPoint.record.propheticConnectionNote && (
                <p className="text-[11px] text-[#D1D5DB] italic leading-tight pt-1 border-t border-white/[0.06]">
                  "{hoveredPoint.record.propheticConnectionNote}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 14-Day Sacred Bead Matrix */}
      <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] px-0.5">
          <span className="uppercase font-mono tracking-wider">14-Day Bead Matrix</span>
          <span className="text-[10px] text-emerald-400/80">
            {strongerCount} Closer · {weakerCount} Mending Needed
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          {sortedRecords.map((r, idx) => {
            const isStronger = r.propheticConnection === 'stronger';
            const isWeaker = r.propheticConnection === 'weaker';
            const isHovered = hoveredIndex === idx;

            return (
              <button
                key={r.date}
                type="button"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                title={`${r.date}: ${isStronger ? 'Stronger' : isWeaker ? 'Weaker' : 'Not recorded'}`}
                className={`group flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'border-emerald-400/60 bg-emerald-500/20 scale-105'
                    : isStronger
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : isWeaker
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border-white/[0.06] bg-[#0B1120]/40 text-[#6B7280]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isStronger
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : isWeaker
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'border border-dashed border-white/25 bg-transparent'
                  }`}
                />
                <span className="text-[9px] font-mono font-medium">
                  {r.date.slice(8, 10)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
