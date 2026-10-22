import React, { useState, useEffect } from 'react';
import { PropheticConnectionState } from '../../types/muhasabah';
import { sound } from '../../services/soundService';
import {
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit3,
  Heart,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PropheticConnectionStepProps {
  connectionState: PropheticConnectionState;
  note: string;
  onChangeConnection: (state: PropheticConnectionState) => void;
  onChangeNote: (note: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PropheticConnectionStep: React.FC<PropheticConnectionStepProps> = ({
  connectionState,
  note,
  onChangeConnection,
  onChangeNote,
  onNext,
  onPrev,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(Boolean(note));
  const [salawatCount, setSalawatCount] = useState(0);

  // Keyboard navigation & quick shortcuts
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
        handleSelectState('stronger');
      } else if (e.key === '2') {
        handleSelectState('weaker');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, connectionState]);

  const handleSelectState = (state: PropheticConnectionState) => {
    sound.playBeadChime();
    onChangeConnection(state);
  };

  const handleNextWithSound = () => {
    sound.playStepTransition();
    onNext();
  };

  const handlePrevWithSound = () => {
    sound.playStepTransition();
    onPrev();
  };

  const handleIncrementSalawat = () => {
    sound.playBeadChime();
    setSalawatCount((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Sacred ambient subtle backlight */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 relative z-10">
          <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-semibold uppercase">
            Step 6 of 8 · Prophetic Bond
          </span>
          <span className="text-xs text-[#10B981] font-arabic font-semibold tracking-wide">
            الرابطة الشريفة
          </span>
        </div>

        {/* Hero Identity */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-950/40">
            <HeartHandshake className="h-5 w-5 text-[#10B981]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB] truncate">
              Prophetic Connection
            </h2>
            <div className="text-xs text-[#10B981] font-medium">
              Rabita ash-Sharifa with Sayyidina Muhammad ﷺ
            </div>
          </div>
        </div>

        {/* Concise Prompt Question */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#1F2937]/50 p-3.5 sm:p-4 text-xs sm:text-sm text-[#F9FAFB] font-medium leading-relaxed">
          Did your actions, speech, and inner presence today draw your heart closer in connection to Sayyidina Muhammad ﷺ?
        </div>

        {/* Minimal Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
          {/* Card 1: Stronger Connection */}
          <button
            type="button"
            onClick={() => handleSelectState('stronger')}
            className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer min-h-[58px] ${
              connectionState === 'stronger'
                ? 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-200 ring-1 ring-emerald-400/30'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#F9FAFB] block">
                    Yes — Stronger Connection
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] block truncate">
                    Love, Sunnah alignment & presence
                  </span>
                </div>
              </div>
              {connectionState === 'stronger' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-[#0B1120] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 opacity-40 group-hover:opacity-75" />
              )}
            </div>
          </button>

          {/* Card 2: Weaker Connection */}
          <button
            type="button"
            onClick={() => handleSelectState('weaker')}
            className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer min-h-[58px] ${
              connectionState === 'weaker'
                ? 'bg-amber-500/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-amber-200 ring-1 ring-amber-400/30'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#F9FAFB] block">
                    No — Weaker Connection
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] block truncate">
                    Heedlessness, irritation or distance
                  </span>
                </div>
              </div>
              {connectionState === 'weaker' ? (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-[#0B1120] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 opacity-40 group-hover:opacity-75" />
              )}
            </div>
          </button>
        </div>

        {/* Minimal Controls Strip: Note Toggle & Inline Salawat Pill */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="flex items-center gap-1.5 text-[#10B981] font-medium hover:brightness-110 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{showNoteInput ? 'Close note' : note ? 'Edit note' : '+ Add note'}</span>
          </button>

          {/* Compact Salawat Bead Chip */}
          <button
            type="button"
            onClick={handleIncrementSalawat}
            title="Send blessings upon the Prophet ﷺ"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-xs font-medium transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400/40" />
            <span>+1 Salawat</span>
            {salawatCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-emerald-500 text-[#0B1120] text-[10px] font-bold font-mono">
                {salawatCount}
              </span>
            )}
          </button>
        </div>

        {/* Reflection Note Textarea (Collapsible) */}
        {showNoteInput && (
          <textarea
            rows={2}
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            placeholder="Add a brief reflection on your bond today (optional)..."
            className="w-full rounded-2xl border border-white/[0.08] bg-[#0B1120]/70 p-3 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
          />
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
            <span>Continue to Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
