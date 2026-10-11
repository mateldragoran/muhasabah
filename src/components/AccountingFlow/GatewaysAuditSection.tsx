import React, { useState } from 'react';
import { GatewayType, VigilanceState, EnemyTag, GatewayAudit } from '../../types/muhasabah';
import { GATEWAY_METADATA, ENEMY_METADATA } from '../../data/defaultData';
import { Ear, Eye, MessageSquare, Heart, Shield, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

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
}[] = [
  {
    id: 'vigilant',
    label: 'Guarded',
    activeClass: 'bg-[#ECFDF5] border-[#064E3B] text-[#064E3B] ring-1 ring-[#064E3B]/30',
  },
  {
    id: 'minor_lapse',
    label: 'Minor Slip',
    activeClass: 'bg-[#FDF8ED] border-[#B88728] text-[#B88728] ring-1 ring-[#B88728]/30',
  },
  {
    id: 'compromised',
    label: 'Compromised',
    activeClass: 'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-300',
  },
  {
    id: 'rectified',
    label: 'Rectified',
    activeClass: 'bg-sky-50 border-sky-400 text-sky-800 ring-1 ring-sky-300',
  },
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

  const gatewayList: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E8DFD0] pb-2.5">
        <h2 className="font-cinzel text-base sm:text-lg font-semibold tracking-wide text-[#1E293B]">
          01. Gateways & Senses Audit
        </h2>
      </div>

      <div className="space-y-3">
        {gatewayList.map((gwKey) => {
          const info = GATEWAY_METADATA[gwKey];
          const audit = gateways[gwKey] || { gateway: gwKey, state: 'vigilant', enemy: 'none', note: '' };
          const Icon = GATEWAY_ICONS[gwKey];
          const isNoteOpen = expandedNotes[gwKey] || Boolean(audit.note);
          const needsEnemyCheck = audit.state === 'minor_lapse' || audit.state === 'compromised';

          return (
            <div
              key={gwKey}
              className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 sm:p-5 transition-all shadow-xs"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD0] pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-sm font-semibold text-[#1E293B]">
                        {info.title}
                      </span>
                      <span className="text-[11px] text-[#064E3B] font-mono font-medium">
                        ({info.spiritualTitle})
                      </span>
                    </div>
                    <span className="text-xs text-[#64748B]">{info.subTitle}</span>
                  </div>
                </div>

                {/* Status indicator text */}
                <div className="text-xs text-[#64748B] flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[11px]">State:</span>
                  <span className="font-semibold text-[#1E293B]">
                    {VIGILANCE_OPTIONS.find((o) => o.id === audit.state)?.label}
                  </span>
                </div>
              </div>

              {/* Core Contemplative Guidance */}
              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                {info.question}
              </p>

              {/* 4-State Vigilance Selector */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VIGILANCE_OPTIONS.map((opt) => {
                  const isSelected = audit.state === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeGateway(gwKey, { state: opt.id })}
                      className={`rounded-xl border px-2.5 py-2 text-left text-xs transition-all min-h-[44px] ${
                        isSelected
                          ? opt.activeClass
                          : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:border-[#064E3B] hover:text-[#1E293B]'
                      }`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Enemy Diagnosis */}
              {needsEnemyCheck && (
                <div className="mt-3 rounded-xl border border-[#C5A059]/40 bg-[#FDF8ED] p-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#B88728] mb-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Adversary: Which enemy bypassed this gate?</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['nafs', 'hawa', 'dunya', 'shaytan'] as const).map((enemyKey) => {
                      const isEnemySelected = audit.enemy === enemyKey;
                      const enemyInfo = ENEMY_METADATA[enemyKey];
                      return (
                        <button
                          key={enemyKey}
                          type="button"
                          onClick={() => onChangeGateway(gwKey, { enemy: enemyKey })}
                          className={`rounded-lg border px-2 py-1 text-left text-[11px] transition-all min-h-[38px] ${
                            isEnemySelected
                              ? 'border-[#064E3B] bg-[#064E3B] text-white shadow-xs'
                              : 'border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B] hover:text-[#1E293B]'
                          }`}
                        >
                          <div className="font-semibold">{enemyInfo.name.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Micro-Note Toggle */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleNote(gwKey)}
                  className="flex items-center gap-1 text-[11px] text-[#064E3B] font-semibold hover:underline"
                >
                  {isNoteOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span>{audit.note ? 'Edit observation' : '+ Add private note'}</span>
                </button>

                {isNoteOpen && (
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      value={audit.note}
                      onChange={(e) => onChangeGateway(gwKey, { note: e.target.value })}
                      placeholder="Brief note on what entered or was protected..."
                      className="w-full rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-2.5 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
