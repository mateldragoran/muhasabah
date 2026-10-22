import React, { useState, useEffect } from 'react';
import { RotateCcw, Wind, Heart, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../../services/soundService';
import { motion, AnimatePresence } from 'motion/react';

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
        navigator.vibrate(20);
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
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 relative z-10">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-semibold uppercase block">
              Purification & Sealing
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
              Istighfar
            </h2>
          </div>
          <div className="text-xs text-[#10B981] font-mono font-semibold">
            {istighfarCount} / {istighfarTarget}
          </div>
        </div>

        {/* Sacred Formula Display */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0B1120]/70 p-4 text-center space-y-1.5 relative z-10">
          <div className="font-arabic text-2xl sm:text-3xl text-[#10B981] leading-relaxed dir-rtl">
            أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ
          </div>
          <div className="text-xs text-[#9CA3AF] italic">
            Astaghfirullah al-Azim wa atubu ilayh
          </div>
        </div>

        {/* Luminous Interactive Tasbih Counter */}
        <div className="flex flex-col items-center justify-center py-2 relative z-10">
          <div className="relative flex items-center justify-center">
            {/* Outer Glowing Progress SVG */}
            <svg className="w-48 h-48 -rotate-90 transform select-none">
              <circle
                cx="96"
                cy="96"
                r="78"
                stroke="currentColor"
                strokeWidth="5"
                className="text-white/[0.06]"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="78"
                stroke="url(#emeraldGradient)"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-150"
                fill="transparent"
              />
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Glowing Tap Button */}
            <button
              type="button"
              onClick={handleIncrement}
              className="absolute h-36 w-36 rounded-full bg-gradient-to-b from-[#1F2937] to-[#111827] border-2 border-emerald-500/30 flex flex-col items-center justify-center hover:border-emerald-400 active:scale-95 transition-all shadow-[0_0_25px_rgba(16,185,129,0.15)] focus:outline-none cursor-pointer group"
            >
              <span className="font-mono text-4xl sm:text-5xl font-bold text-[#F9FAFB] tabular-nums tracking-tight group-hover:text-[#10B981] transition-colors">
                {istighfarCount}
              </span>
              <span className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">
                Target: {istighfarTarget}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#10B981] font-bold mt-1">
                TAP TO COUNT
              </span>
            </button>
          </div>

          {/* Quick Target Chips & Reset */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                onChangeTarget(100);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                istighfarTarget === 100
                  ? 'border-emerald-500/50 text-white bg-emerald-600/40 shadow-xs'
                  : 'border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] bg-[#1F2937]/40'
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
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                istighfarTarget === 500
                  ? 'border-emerald-500/50 text-white bg-emerald-600/40 shadow-xs'
                  : 'border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] bg-[#1F2937]/40'
              }`}
            >
              500x
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                onChangeTarget(1000);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                istighfarTarget === 1000
                  ? 'border-emerald-500/50 text-white bg-emerald-600/40 shadow-xs'
                  : 'border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] bg-[#1F2937]/40'
              }`}
            >
              1000x
            </button>
            <button
              type="button"
              onClick={() => onChangeCount(0)}
              title="Reset counter"
              className="p-1.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Conscious Breathing (Hush dar Dam) */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#1F2937]/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#F9FAFB]">
              <Wind className="w-4 h-4 text-[#10B981]" />
              <span>Conscious Breath (Hush dar Dam)</span>
            </div>
            <button
              type="button"
              onClick={() => setBreathActive(!breathActive)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                breathActive
                  ? 'border-emerald-500/50 text-white bg-emerald-600/40'
                  : 'border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] bg-white/[0.04]'
              }`}
            >
              {breathActive ? 'Pause' : 'Start'}
            </button>
          </div>

          <AnimatePresence>
            {breathActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="py-3 flex flex-col items-center justify-center text-center overflow-hidden"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'scale-115 border-emerald-400 bg-emerald-500/20 text-[#10B981] shadow-[0_0_20px_#10B981]'
                      : breathPhase === 'hold'
                      ? 'scale-105 border-amber-400 bg-amber-500/20 text-[#F59E0B] shadow-[0_0_15px_#F59E0B]'
                      : 'scale-90 border-white/20 bg-white/5 text-[#9CA3AF]'
                  }`}
                >
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-[#F9FAFB] mt-2.5 uppercase tracking-wider">
                  {breathPhase === 'inhale' && 'Inhale Divine Light'}
                  {breathPhase === 'hold' && 'Hold in Contemplation'}
                  {breathPhase === 'exhale' && 'Exhale Darkness'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsible Closing Reflection Note */}
        <div>
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            className="text-xs text-[#10B981] font-semibold hover:brightness-110 transition-colors cursor-pointer"
          >
            {showNote ? 'Hide note' : reflectionNote ? 'Edit closing note' : '+ Add closing note'}
          </button>
          {showNote && (
            <textarea
              rows={2}
              value={reflectionNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Closing intention, prayer, or reflection..."
              className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#0B1120]/70 p-3 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
            />
          )}
        </div>

        {/* Navigation Step */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              sound.playStepTransition();
              onPrev();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSeal}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#F59E0B] text-xs font-bold text-white hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            <span>{isSaving ? 'Sealing...' : '✦ Seal Tonight\'s Entry'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
