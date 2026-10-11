import React from 'react';
import { GatewayType } from '../../types/muhasabah';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { Sparkles } from 'lucide-react';

interface AuraRadarChartProps {
  insights: { gateway: GatewayType; compromisedCount: number; topEnemy: string }[];
}

export const AuraRadarChart: React.FC<AuraRadarChartProps> = ({ insights }) => {
  const size = 300;
  const center = size / 2;
  const radius = 105;

  const gateways: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];
  const totalAxes = gateways.length;

  // Calculate score for each gateway: 100% vigilance if 0 lapses, decreasing as lapses increase
  const points = gateways.map((gw, index) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const item = insights.find((i) => i.gateway === gw);
    const lapses = item ? item.compromisedCount : 0;
    // Score from 0.35 to 1.0
    const vigilanceRatio = Math.max(0.35, 1 - lapses * 0.15);
    const r = radius * vigilanceRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, gw, vigilanceRatio, lapses };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#C5A059" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#C5A059" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0B5A44" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Background Concentric Energy Rings */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * scale}
              fill="none"
              stroke="#E8DFD0"
              strokeDasharray={scale === 1 ? 'none' : '3,4'}
            />
          ))}

          {/* Radiating Gateway Axes */}
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
                stroke="#E8DFD0"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Spiritual Aura Polygon */}
          <path
            d={polygonPath}
            fill="url(#polyGrad)"
            stroke="#064E3B"
            strokeWidth="2"
            className="transition-all duration-700 ease-out"
          />

          {/* Axis Vertex Nodes */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#064E3B"
              strokeWidth="2"
            />
          ))}

          {/* Gateway Label Texts */}
          {points.map((p, idx) => {
            const labelR = radius + 25;
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
                className="fill-[#1E293B] text-[11px] font-cinzel font-semibold tracking-wider"
              >
                {title.replace('The ', '')}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 text-center text-xs text-[#64748B] flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#B88728]" />
        <span>Vigilance Constellation: Greater outward radius denotes unbroken spiritual presence.</span>
      </div>
    </div>
  );
};
