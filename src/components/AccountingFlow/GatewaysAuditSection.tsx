import React, { useState } from 'react';
import { GatewayType, VigilanceState, EnemyTag, GatewayAudit } from '../../types/muhasabah';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { Ear, Eye, MessageSquare, Heart, Shield, ChevronDown, ChevronUp, AlertCircle, Edit3 } from 'lucide-react';

interface GatewaysAuditSectionProps {
  gateways: Record<GatewayType, GatewayAudit>;
  onChangeGateway: (gateway: GatewayType, updated: Partial<GatewayAudit>) => void;
}

const GATEWAY_ICONS: Record<GatewayType, React.ComponentType<{ className?: string }>> = {
  ears: Ear,
  eyes: Eye,
  tongue: MessageSquare,
  heart: Heart,
  body: Shield,
};

const VIGILANCE_OPTIONS: {
  id: VigilanceState;
  label: string;
  activeClass: string;
  dotColor: string;
}[] = [
  {
    id: 'vigilant',
    label: 'Guarded',
    activeClass: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-xs',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'minor_lapse',
    label: 'Minor Slip',
    activeClass: 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-xs',
    dotColor: 'bg-amber-400',
  },
  {
    id: 'compromised',
    label: 'Breached',
    activeClass: 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-xs',
    dotColor: 'bg-rose-400',
  },
  {
    id: 'rectified',
    label: 'Rectified',
    activeClass: 'bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-xs',
    dotColor: 'bg-sky-400',
  },
];

const ADVERSARY_OPTIONS: { key: EnemyTag; label: string }[] = [
  { key: 'nafs', label: 'Nafs (Ego)' },
  { key: 'hawa', label: 'Hawa (Desire)' },
  { key: 'dunya', label: 'Dunya (World)' },
  { key: 'shaytan', label: 'Shaytan (Whisper)' },
];

export const GatewaysAuditSection: React.FC<GatewaysAuditSectionProps> = ({
  gateways,
  onChangeGateway,
}) => {
  const [expandedNotes, setExpandedNotes] = useState<Record<GatewayType, boolean>>({
    ears: false,
    eyes: false,
    tongue: false,
    heart: false,
    body: false,
  });

  const toggleNote = (gw: GatewayType) => {
    setExpandedNotes((prev) => ({ ...prev, [gw]: !prev[gw] }));
  };

  const gatewayKeys: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-[#F9FAFB] uppercase tracking-wider font-mono">
            Section 1: The 5 Sensory Gateways
          </h3>
          <p className="text-xs text-[#9CA3AF]">Audit vigilance across all physical and spiritual doors</p>
        </div>
      </div>

      <div className="space-y-3">
        {gatewayKeys.map((gw) => {
          const info = GATEWAY_METADATA[gw];
          const audit: GatewayAudit = gateways[gw] || {
            gateway: gw,
            state: 'vigilant',
            states: ['vigilant'],
            enemy: 'none',
            enemies: [],
            note: '',
          };
          const Icon = GATEWAY_ICONS[gw];
          const activeStates: VigilanceState[] = audit.states && audit.states.length > 0
            ? audit.states
            : [audit.state || 'vigilant'];

          const activeEnemies: EnemyTag[] = audit.enemies && audit.enemies.length > 0
            ? audit.enemies
            : (audit.enemy && audit.enemy !== 'none' ? [audit.enemy] : []);

          const needsEnemy = activeStates.includes('minor_lapse') || activeStates.includes('compromised');
          const isNoteOpen = expandedNotes[gw];

          const handleToggleState = (stateId: VigilanceState) => {
            let nextStates: VigilanceState[];
            if (activeStates.includes(stateId)) {
              nextStates = activeStates.length <= 1 ? ['vigilant'] : activeStates.filter((s) => s !== stateId);
            } else {
              nextStates = [...activeStates, stateId];
            }
            const primaryState: VigilanceState = nextStates.includes('compromised')
              ? 'compromised'
              : nextStates.includes('minor_lapse')
              ? 'minor_lapse'
              : nextStates.includes('rectified')
              ? 'rectified'
              : 'vigilant';

            onChangeGateway(gw, {
              state: primaryState,
              states: nextStates,
            });
          };

          const handleToggleEnemy = (enemyKey: EnemyTag) => {
            let nextEnemies: EnemyTag[];
            if (activeEnemies.includes(enemyKey)) {
              nextEnemies = activeEnemies.filter((e) => e !== enemyKey);
            } else {
              nextEnemies = [...activeEnemies, enemyKey];
            }
            onChangeGateway(gw, {
              enemy: nextEnemies.length > 0 ? nextEnemies[0] : 'none',
              enemies: nextEnemies,
            });
          };

          return (
            <div
              key={gw}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#0B1120]/60 border border-white/[0.06] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#10B981] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F9FAFB]">{info.title}</span>
                      <span className="text-[10px] font-arabic text-[#10B981] opacity-80 hidden sm:inline">
                        {info.spiritualTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9CA3AF] line-clamp-1">{info.question}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleNote(gw)}
                  className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                    audit.note ? 'text-[#10B981] bg-emerald-500/15' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                  }`}
                  title={audit.note ? 'Edit note' : 'Add note'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* State Segmented Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {VIGILANCE_OPTIONS.map((opt) => {
                    const isSelected = activeStates.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleState(opt.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? opt.activeClass
                            : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor} shrink-0`} />
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {isSelected && <span className="text-[10px] font-bold text-white">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adversary diagnosis */}
              {needsEnemy && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-amber-400">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Root Adversary Diagnosed:</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {ADVERSARY_OPTIONS.map(({ key, label }) => {
                      const isSelected = activeEnemies.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleToggleEnemy(key)}
                          className={`py-1 px-2 rounded-lg border text-center text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:text-[#F9FAFB]'
                          }`}
                        >
                          <span>{label} {isSelected ? '✓' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note editor */}
              {isNoteOpen && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <textarea
                    rows={2}
                    value={audit.note}
                    onChange={(e) => onChangeGateway(gw, { note: e.target.value })}
                    placeholder="Brief observation..."
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
