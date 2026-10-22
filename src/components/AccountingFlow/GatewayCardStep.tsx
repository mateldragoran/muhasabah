import React, { useState, useEffect } from 'react';
import { GatewayType, VigilanceState, GatewayAudit, EnemyTag } from '../../types/muhasabah';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { sound } from '../../services/soundService';
import {
  Ear,
  Eye,
  MessageSquare,
  Heart,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  Edit3,
} from 'lucide-react';
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
  activeBg: string;
  dotColor: string;
}[] = [
  {
    id: 'vigilant',
    title: 'Guarded & Pure',
    hint: 'Kept in remembrance',
    activeBg: 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-200',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'minor_lapse',
    title: 'Minor Slip',
    hint: 'Caught quickly',
    activeBg: 'bg-amber-500/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-amber-200',
    dotColor: 'bg-amber-400',
  },
  {
    id: 'compromised',
    title: 'Compromised',
    hint: 'Heedlessness took hold',
    activeBg: 'bg-rose-500/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)] text-rose-200',
    dotColor: 'bg-rose-400',
  },
  {
    id: 'rectified',
    title: 'Rectified',
    hint: 'Cleansed with Istighfar',
    activeBg: 'bg-sky-500/20 border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-sky-200',
    dotColor: 'bg-sky-400',
  },
];

const ADVERSARY_OPTIONS: { key: EnemyTag; label: string }[] = [
  { key: 'nafs', label: 'Nafs (Ego)' },
  { key: 'hawa', label: 'Hawa (Desire)' },
  { key: 'dunya', label: 'Dunya (World)' },
  { key: 'shaytan', label: 'Shaytan (Whispers)' },
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

  const activeStates: VigilanceState[] = audit.states && audit.states.length > 0
    ? audit.states
    : [audit.state || 'vigilant'];

  const activeEnemies: EnemyTag[] = audit.enemies && audit.enemies.length > 0
    ? audit.enemies
    : (audit.enemy && audit.enemy !== 'none' ? [audit.enemy] : []);

  const needsEnemyDiagnosis =
    activeStates.includes('minor_lapse') ||
    activeStates.includes('compromised');

  const handleToggleState = (stateId: VigilanceState) => {
    sound.playBeadChime();
    let nextStates: VigilanceState[];
    if (activeStates.includes(stateId)) {
      if (activeStates.length <= 1) {
        nextStates = stateId === 'vigilant' ? ['vigilant'] : ['vigilant'];
      } else {
        nextStates = activeStates.filter((s) => s !== stateId);
      }
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

    onChange({
      state: primaryState,
      states: nextStates,
    });
  };

  const handleToggleEnemy = (enemyKey: EnemyTag) => {
    sound.playBeadChime();
    let nextEnemies: EnemyTag[];
    if (activeEnemies.includes(enemyKey)) {
      nextEnemies = activeEnemies.filter((e) => e !== enemyKey);
    } else {
      nextEnemies = [...activeEnemies, enemyKey];
    }

    onChange({
      enemy: nextEnemies.length > 0 ? nextEnemies[0] : 'none',
      enemies: nextEnemies,
    });
  };

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
        handleToggleState('vigilant');
      } else if (e.key === '2') {
        handleToggleState('minor_lapse');
      } else if (e.key === '3') {
        handleToggleState('compromised');
      } else if (e.key === '4') {
        handleToggleState('rectified');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, activeStates]);

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
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      {/* Main Sanctuary Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-4 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 relative z-10">
          <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-semibold uppercase">
            Gateway {stepNumber} of {totalGateways}
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-arabic">
            {info.spiritualTitle}
          </span>
        </div>

        {/* Hero Identity */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-950/40">
            <Icon className="h-6 w-6 text-[#10B981]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
              {info.title}
            </h2>
            <div className="text-xs text-[#10B981] font-medium">
              {info.subTitle}
            </div>
          </div>
        </div>

        {/* Prompt Question */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#1F2937]/50 p-3.5 sm:p-4 text-xs sm:text-sm text-[#F9FAFB] font-medium leading-relaxed">
          {info.question}
        </div>

        {/* 4-State Selection Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 relative z-10 pt-1">
          {VIGILANCE_CARDS.map((opt) => {
            const isSelected = activeStates.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleToggleState(opt.id)}
                className={`group relative text-left p-3 rounded-2xl border transition-all duration-150 min-h-[52px] cursor-pointer ${
                  isSelected
                    ? `${opt.activeBg}`
                    : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                    <span className="font-semibold text-xs sm:text-sm truncate">
                      {opt.title}
                    </span>
                  </div>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded border border-white/20 shrink-0 opacity-40 group-hover:opacity-75" />
                  )}
                </div>
                <div className="text-[10px] opacity-70 mt-0.5 pl-4 truncate hidden sm:block">
                  {opt.hint}
                </div>
              </button>
            );
          })}
        </div>

        {/* Root Adversary Diagnostic */}
        {needsEnemyDiagnosis && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Root Adversary Diagnosed:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ADVERSARY_OPTIONS.map(({ key, label }) => {
                const isSelected = activeEnemies.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleEnemy(key)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/30 text-amber-200 shadow-xs'
                        : 'border-white/[0.06] bg-[#111827]/60 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection Note & Insight Toggles */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="flex items-center gap-1 text-[#10B981] font-medium hover:brightness-110 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{showNoteInput ? 'Close note' : audit.note ? 'Edit note' : '+ Add note'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTeaching(!showTeaching)}
            className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{showTeaching ? 'Hide insight' : 'Spiritual insight'}</span>
          </button>
        </div>

        {showNoteInput && (
          <textarea
            rows={2}
            value={audit.note}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Brief observation (optional)..."
            className="w-full rounded-2xl border border-white/[0.08] bg-[#0B1120]/70 p-3 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
          />
        )}

        {showTeaching && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#1F2937]/50 p-3 text-xs text-[#9CA3AF] italic leading-relaxed">
            {info.teachingNote}
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handlePrevWithSound}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNextWithSound}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 active:scale-98 transition-all shadow-md shadow-emerald-950/40 min-h-[44px] cursor-pointer"
          >
            <span>{stepNumber === totalGateways ? 'Prophetic Bond' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
