import React, { useState } from 'react';
import { MuhasabaRecord } from '../../types/muhasabah';
import { Scale } from 'lucide-react';

interface EnergyWaveformChartProps {
  records: MuhasabaRecord[];
}

export const EnergyWaveformChart: React.FC<EnergyWaveformChartProps> = ({ records }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take chronological records (oldest to newest, max 14)
  const sortedRecords = [...records].reverse().slice(-14);

  if (sortedRecords.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#64748B]">
        No daily records logged yet to generate an energy waveform. Complete today's accounting!
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  // Find max and min balance
  const values = sortedRecords.map((r) => r.netEnergy);
  const maxVal = Math.max(50, ...values);
  const minVal = Math.min(-50, ...values);
  const range = maxVal - minVal || 100;

  // Map to SVG coordinates
  const points = sortedRecords.map((rec, idx) => {
    const x = paddingX + (idx / Math.max(1, sortedRecords.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (rec.netEnergy - minVal) / range;
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y, record: rec };
  });

  // Calculate smooth Bézier curve
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

  const linePath = createSmoothPath(points);
  // Area fill under the curve down to bottom
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Zero baseline Y coordinate
  const zeroY = height - paddingY - (0 - minVal) / range * (height - 2 * paddingY);

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#C5A059" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="50%" stopColor="#0B5A44" />
              <stop offset="100%" stopColor="#C5A059" />
            </linearGradient>
          </defs>

          {/* Zero Balance Baseline */}
          <line
            x1={paddingX}
            y1={zeroY}
            x2={width - paddingX}
            y2={zeroY}
            stroke="#E8DFD0"
            strokeDasharray="4,4"
          />
          <text
            x={paddingX - 10}
            y={zeroY + 3}
            textAnchor="end"
            className="fill-[#64748B] text-[9px] font-mono"
          >
            0
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#waveGradient)" />

          {/* Luminous Spline */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineStrokeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isPositive = p.record.netEnergy >= 0;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4}
                  fill={isPositive ? '#064E3B' : '#E11D48'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute -top-1 rounded-xl bg-[#FFFFFF] border border-[#E8DFD0] px-3 py-1.5 text-xs text-[#1E293B] shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
            }}
          >
            <div className="font-mono text-[11px] text-[#064E3B] font-semibold">
              {points[hoveredIndex].record.date}
            </div>
            <div className="font-bold">
              {points[hoveredIndex].record.netEnergy > 0 ? `+${points[hoveredIndex].record.netEnergy}` : points[hoveredIndex].record.netEnergy} pts
              <span className="text-[10px] text-[#64748B] font-normal ml-1">
                ({points[hoveredIndex].record.balanceStatus})
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#64748B] px-2 font-mono">
        <span>{sortedRecords[0]?.date}</span>
        <div className="flex items-center gap-1 text-[#064E3B] font-medium">
          <Scale className="w-3 h-3" />
          <span>Energetic Trajectory</span>
        </div>
        <span>{sortedRecords[sortedRecords.length - 1]?.date}</span>
      </div>
    </div>
  );
};
