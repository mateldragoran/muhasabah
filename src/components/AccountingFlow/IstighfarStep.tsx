import React, { useState, useEffect } from 'react';
import { RotateCcw, Wind, Heart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { sound } from '../../services/soundService';
import { motion } from 'motion/react';

interface IstighfarStepProps {
  istighfarCount: number;
  istighfarTarget: number;
  reflectionNote: string;
  onChangeCount: (count: number) => void;
  onChangeTarget: (target: number) => void;
  onChangeNote: (note: string) => void;
  onSealAndComplete: () => void;
  onPrev: () => void;
  isSaving: boolean;
}

export const IstighfarStep: React.FC<IstighfarStepProps> = ({
  istighfarCount,
  istighfarTarget,
  reflectionNote,
  onChangeCount,
  onChangeTarget,
  onChangeNote,
  onSealAndComplete,
  onPrev,
  isSaving,
}) => {
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [showNote, setShowNote] = useState(Boolean(reflectionNote));

  useEffect(() => {
    if (!breathActive) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [breathActive]);

  const handleIncrement = () => {
    sound.playBeadChime();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    onChangeCount(istighfarCount + 1);
  };

  // Keyboard Spacebar listener to count beads
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleIncrement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleSeal = () => {
    sound.playSuccessFanfare();
    onSealAndComplete();
  };

  const progress = Math.min(100, Math.round((istighfarCount / istighfarTarget) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3 relative z-10">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#064E3B] font-semibold uppercase block">
              Step 7 of 8
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
              Istighfar
            </h2>
          </div>
          <div className="text-xs text-[#64748B] font-mono">
            {istighfarCount} / {istighfarTarget}
          </div>
        </div>

        {/* Formula Display - Clean & Centered */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-4 text-center space-y-1 relative z-10">
          <div className="font-arabic text-2xl sm:text-3xl text-[#1E293B] leading-relaxed dir-rtl">
            أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ
          </div>
          <div className="text-xs text-[#064E3B] font-medium italic">
            Astaghfirullah al-Azim wa atubu ilayh
          </div>
        </div>

        {/* The Minimal Tasbih Bead Counter */}
        <div className="flex flex-col items-center justify-center py-2 relative z-10">
          <div className="relative flex items-center justify-center">
            {/* Outer Progress Ring */}
            <svg className="w-44 h-44 -rotate-90 transform select-none">
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="currentColor"
                strokeWidth="5"
                className="text-[#E8DFD0]/70"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
                strokeLinecap="round"
                className="text-[#064E3B] transition-all duration-150"
                fill="transparent"
              />
            </svg>

            {/* Inner Glowing Tap Button */}
            <button
              type="button"
              onClick={handleIncrement}
              className="absolute h-32 w-32 rounded-full bg-[#FAF7F2] border border-[#C5A059] flex flex-col items-center justify-center hover:bg-[#FFFFFF] hover:border-[#064E3B] active:scale-95 transition-all shadow-sm focus:outline-none cursor-pointer"
            >
              <span className="font-mono text-4xl font-bold text-[#1E293B] tabular-nums tracking-tight">
                {istighfarCount}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                Target: {istighfarTarget}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-[#064E3B] font-bold mt-0.5">
                TAP TO COUNT
              </span>
            </button>
          </div>

          {/* Target Pickers */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                onChangeTarget(100);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                istighfarTarget === 100
                  ? 'border-[#064E3B] text-white bg-[#064E3B]'
                  : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FFFFFF]'
              }`}
            >
              100x
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                onChangeTarget(500);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                istighfarTarget === 500
                  ? 'border-[#064E3B] text-white bg-[#064E3B]'
                  : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FFFFFF]'
              }`}
            >
              500x
            </button>
            <button
              type="button"
              onClick={() => onChangeCount(0)}
              title="Reset counter"
              className="p-1 rounded-full text-[#64748B] hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Conscious Breathing */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E293B]">
              <Wind className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Conscious Breath (Hush dar Dam)</span>
            </div>
            <button
              type="button"
              onClick={() => setBreathActive(!breathActive)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                breathActive
                  ? 'border-[#064E3B] text-white bg-[#064E3B]'
                  : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FFFFFF]'
              }`}
            >
              {breathActive ? 'Pause' : 'Start'}
            </button>
          </div>

          {breathActive && (
            <div className="py-2 flex flex-col items-center justify-center text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-1000 ${
                  breathPhase === 'inhale'
                    ? 'scale-110 border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                    : breathPhase === 'hold'
                    ? 'scale-105 border-[#C5A059] bg-[#FDF8ED] text-[#B88728]'
                    : 'scale-95 border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B]'
                }`}
              >
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-[#1E293B] mt-2 uppercase tracking-wider">
                {breathPhase === 'inhale' && 'Inhale Light'}
                {breathPhase === 'hold' && 'Hold'}
                {breathPhase === 'exhale' && 'Exhale'}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Optional Reflection Note */}
        <div>
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            className="text-xs text-[#064E3B] font-medium hover:text-[#043B2C] transition-colors"
          >
            {showNote ? 'Hide note' : reflectionNote ? 'Edit closing note' : '+ Add closing note'}
          </button>
          {showNote && (
            <textarea
              rows={2}
              value={reflectionNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Closing intention or prayer..."
              className="mt-2 w-full rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none transition-all"
            />
          )}
        </div>

        {/* Navigation Step */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD0]">
          <button
            type="button"
            onClick={() => {
              sound.playStepTransition();
              onPrev();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSeal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] active:scale-98 transition-all shadow-sm disabled:opacity-50 min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{isSaving ? 'Sealing...' : 'Seal Entry'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
