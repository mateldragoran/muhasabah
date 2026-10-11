import React, { useState, useEffect } from 'react';
import { GatewayType, VigilanceState, GatewayAudit } from '../../types/muhasabah';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { sound } from '../../services/soundService';
import { Ear, Eye, MessageSquare, Heart, Shield, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

interface GatewayCardStepProps {
  gateway: GatewayType;
  stepNumber: number;
  totalGateways: number;
  audit: GatewayAudit;
  onChange: (updated: Partial<GatewayAudit>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const GATEWAY_ICONS: Record<GatewayType, React.ComponentType<{ className?: string }>> = {
  ears: Ear,
  eyes: Eye,
  tongue: MessageSquare,
  heart: Heart,
  body: Shield,
};

const VIGILANCE_CARDS: {
  id: VigilanceState;
  title: string;
  hint: string;
  colorBorder: string;
  activeBg: string;
  dotColor: string;
}[] = [
  {
    id: 'vigilant',
    title: 'Guarded & Pure',
    hint: 'Kept in remembrance',
    colorBorder: 'border-[#064E3B]',
    activeBg: 'bg-[#ECFDF5] ring-1 ring-[#064E3B]/40',
    dotColor: 'bg-[#064E3B]',
  },
  {
    id: 'minor_lapse',
    title: 'Minor Slip',
    hint: 'Caught quickly',
    colorBorder: 'border-[#B88728]',
    activeBg: 'bg-[#FDF8ED] ring-1 ring-[#B88728]/40',
    dotColor: 'bg-[#B88728]',
  },
  {
    id: 'compromised',
    title: 'Compromised',
    hint: 'Heedlessness took hold',
    colorBorder: 'border-rose-400',
    activeBg: 'bg-rose-50 ring-1 ring-rose-300',
    dotColor: 'bg-rose-600',
  },
  {
    id: 'rectified',
    title: 'Rectified',
    hint: 'Cleansed with Istighfar',
    colorBorder: 'border-sky-400',
    activeBg: 'bg-sky-50 ring-1 ring-sky-300',
    dotColor: 'bg-sky-600',
  },
];

const ADVERSARY_OPTIONS = [
  { key: 'nafs' as const, label: 'Nafs (Ego)' },
  { key: 'hawa' as const, label: 'Hawa (Desire)' },
  { key: 'dunya' as const, label: 'Dunya (World)' },
  { key: 'shaytan' as const, label: 'Shaytan (Whispers)' },
];

export const GatewayCardStep: React.FC<GatewayCardStepProps> = ({
  gateway,
  stepNumber,
  totalGateways,
  audit,
  onChange,
  onNext,
  onPrev,
}) => {
  const info = GATEWAY_METADATA[gateway];
  const Icon = GATEWAY_ICONS[gateway];
  const [showNoteInput, setShowNoteInput] = useState(Boolean(audit.note));
  const [showTeaching, setShowTeaching] = useState(false);

  const needsEnemyDiagnosis = audit.state === 'minor_lapse' || audit.state === 'compromised';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        sound.playStepTransition();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        sound.playStepTransition();
        onPrev();
      } else if (e.key === '1') {
        sound.playBeadChime();
        onChange({ state: 'vigilant' });
      } else if (e.key === '2') {
        sound.playBeadChime();
        onChange({ state: 'minor_lapse' });
      } else if (e.key === '3') {
        sound.playBeadChime();
        onChange({ state: 'compromised' });
      } else if (e.key === '4') {
        sound.playBeadChime();
        onChange({ state: 'rectified' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onChange]);

  const handleStateSelect = (state: VigilanceState) => {
    sound.playBeadChime();
    onChange({ state });
  };

  const handleNextWithSound = () => {
    sound.playStepTransition();
    onNext();
  };

  const handlePrevWithSound = () => {
    sound.playStepTransition();
    onPrev();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      {/* Main Sanctuary Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3 relative z-10">
          <span className="text-[11px] font-mono tracking-widest text-[#064E3B] font-semibold uppercase">
            Gateway {stepNumber} of {totalGateways}
          </span>
          <span className="text-[11px] text-[#64748B] font-mono font-medium">
            {info.spiritualTitle}
          </span>
        </div>

        {/* Hero Identity: Clean & Uncluttered */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B] shadow-2xs">
            <Icon className="h-6 w-6 text-[#064E3B]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
              {info.title}
            </h2>
            <div className="text-xs text-[#064E3B] font-medium">
              {info.subTitle}
            </div>
          </div>
        </div>

        {/* Concise Prompt Question */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3.5 sm:p-4 text-xs sm:text-sm text-[#1E293B] font-medium leading-relaxed">
          {info.question}
        </div>

        {/* 4-State Selection Grid - Sleek & Compact */}
        <div className="space-y-2 relative z-10">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {VIGILANCE_CARDS.map((opt) => {
              const isSelected = audit.state === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStateSelect(opt.id)}
                  className={`group relative text-left p-3 rounded-2xl border transition-all duration-150 min-h-[52px] ${
                    isSelected
                      ? `${opt.colorBorder} ${opt.activeBg} shadow-xs`
                      : 'border-[#E8DFD0] bg-[#FFFFFF] hover:bg-[#FAF7F2] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                      <span className="font-semibold text-xs sm:text-sm text-[#1E293B] truncate">
                        {opt.title}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#064E3B] stroke-[2.5] shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 pl-4 truncate hidden sm:block">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Root Adversary Diagnostic: Compact Pills */}
        {needsEnemyDiagnosis && (
          <div className="rounded-2xl border border-[#C5A059]/40 bg-[#FDF8ED] p-3.5 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B88728]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Root Adversary:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ADVERSARY_OPTIONS.map(({ key, label }) => {
                const isSelected = audit.enemy === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      sound.playBeadChime();
                      onChange({ enemy: key });
                    }}
                    className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-[#064E3B] bg-[#064E3B] text-white shadow-xs'
                        : 'border-[#E8DFD0] bg-[#FFFFFF] text-[#1E293B] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimal Optional Note & Wisdom Toggles */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="flex items-center gap-1 text-[#064E3B] font-medium hover:text-[#043B2C] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{showNoteInput ? 'Close note' : audit.note ? 'Edit note' : '+ Add note'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTeaching(!showTeaching)}
            className="flex items-center gap-1 text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B88728]" />
            <span>{showTeaching ? 'Hide insight' : 'Spiritual insight'}</span>
          </button>
        </div>

        {showNoteInput && (
          <textarea
            rows={2}
            value={audit.note}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Brief observation (optional)..."
            className="w-full rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none transition-all"
          />
        )}

        {showTeaching && (
          <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 text-xs text-[#64748B] italic leading-relaxed">
            {info.teachingNote}
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD0]">
          <button
            type="button"
            onClick={handlePrevWithSound}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNextWithSound}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] active:scale-98 transition-all shadow-sm min-h-[44px]"
          >
            <span>{stepNumber === totalGateways ? 'Energy Ledger' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
