import React from 'react';
import { GatewayType } from '../../types/muhasabah';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AuraRadarChartProps {
  insights: { gateway: GatewayType; compromisedCount: number; topEnemy: string }[];
}

export const AuraRadarChart: React.FC<AuraRadarChartProps> = ({ insights }) => {
  const size = 320;
  const center = size / 2;
  const radius = 100;

  const gateways: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];
  const totalAxes = gateways.length;

  const points = gateways.map((gw, index) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const item = insights.find((i) => i.gateway === gw);
    const lapses = item ? item.compromisedCount : 0;
    const vigilanceRatio = Math.max(0.35, 1 - lapses * 0.15);
    const r = radius * vigilanceRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, gw, vigilanceRatio, lapses };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className="space-y-5">
      {/* Mystical Constellation Radar with Responsive viewBox */}
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative w-full max-w-[320px] aspect-square">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible select-none">
            <defs>
              <radialGradient id="auraGlowDark" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="polyGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Background Concentric Rings */}
            {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius * scale}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray={scale === 1 ? 'none' : '3,4'}
              />
            ))}

            {/* Radiating Axes */}
            {gateways.map((_, index) => {
              const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Polygon */}
            <path
              d={polygonPath}
              fill="url(#polyGradDark)"
              stroke="#10B981"
              strokeWidth="2"
              className="transition-all duration-700 ease-out"
            />

            {/* Nodes */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#10B981"
                stroke="#0B1120"
                strokeWidth="2"
              />
            ))}

            {/* Labels */}
            {points.map((p, idx) => {
              const labelR = radius + 22;
              const lx = center + labelR * Math.cos(p.angle);
              const ly = center + labelR * Math.sin(p.angle);
              const title = GATEWAY_METADATA[p.gw].title;
              return (
                <text
                  key={`lbl-${idx}`}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-[#F9FAFB] text-[10px] font-cinzel font-semibold tracking-wider"
                >
                  {title.replace('The ', '')}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5-Bar Horizontal Vigilance Map (Guaranteed Mobile Clarity) */}
      <div className="space-y-2 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#F9FAFB]">
          <span>14-Day Gateway Health Breakdown</span>
          <span className="text-[10px] text-[#9CA3AF] font-mono">Vigilance %</span>
        </div>

        <div className="space-y-2">
          {points.map((p) => {
            const meta = GATEWAY_METADATA[p.gw];
            const pct = Math.round(p.vigilanceRatio * 100);
            return (
              <div key={p.gw} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9CA3AF] font-medium">{meta.title}</span>
                  <span className={`font-mono font-semibold ${pct >= 80 ? 'text-[#10B981]' : pct >= 60 ? 'text-[#F59E0B]' : 'text-rose-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      pct >= 80
                        ? 'bg-gradient-to-r from-emerald-600 to-[#10B981]'
                        : pct >= 60
                        ? 'bg-gradient-to-r from-amber-600 to-[#F59E0B]'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs text-[#9CA3AF] flex items-center justify-center gap-1.5 pt-1">
        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>Expanded radius and bars denote unbroken spiritual presence.</span>
      </div>
    </div>
  );
};
