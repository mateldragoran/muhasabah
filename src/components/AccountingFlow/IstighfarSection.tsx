import React, { useState, useEffect } from 'react';
import { RotateCcw, Wind, Heart, Save, CheckCircle2 } from 'lucide-react';

interface IstighfarSectionProps {
  istighfarCount: number;
  istighfarTarget: number;
  reflectionNote: string;
  onChangeIstighfar: (count: number) => void;
  onChangeTarget: (target: number) => void;
  onChangeNote: (note: string) => void;
  onSaveEntry: () => void;
  isSaving: boolean;
}

export const IstighfarSection: React.FC<IstighfarSectionProps> = ({
  istighfarCount,
  istighfarTarget,
  reflectionNote,
  onChangeIstighfar,
  onChangeTarget,
  onChangeNote,
  onSaveEntry,
  isSaving,
}) => {
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    onChangeIstighfar(istighfarCount + 1);
  };

  const handleSaveWithFeedback = () => {
    onSaveEntry();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const progress = Math.min(100, Math.round((istighfarCount / istighfarTarget) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-[#F9FAFB] uppercase tracking-wider font-mono">
            Section 3: Istighfar & Reflections
          </h3>
          <p className="text-xs text-[#9CA3AF]">Cleanse errors and seal your nightly accounting</p>
        </div>
      </div>

      {/* Formula Card */}
      <div className="p-4 rounded-2xl bg-[#0B1120]/70 border border-white/[0.06] text-center space-y-1">
        <div className="font-arabic text-2xl text-[#10B981] dir-rtl">
          أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ
        </div>
        <div className="text-xs text-[#9CA3AF] italic">
          Astaghfirullah al-Azim wa atubu ilayh
        </div>
      </div>

      {/* Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1120]/50 border border-white/[0.06]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleIncrement}
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white font-mono text-xl font-bold flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <span>{istighfarCount}</span>
            <span className="text-[8px] opacity-80">TAP</span>
          </button>
          <div>
            <div className="text-xs font-semibold text-[#F9FAFB]">Total Repetitions</div>
            <div className="text-[11px] text-[#9CA3AF] font-mono">Goal: {istighfarTarget} ({progress}%)</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[100, 500, 1000].map((tgt) => (
            <button
              key={tgt}
              type="button"
              onClick={() => onChangeTarget(tgt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                istighfarTarget === tgt
                  ? 'bg-emerald-600/40 border-emerald-500/50 text-white'
                  : 'bg-white/[0.04] border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              {tgt}x
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChangeIstighfar(0)}
            className="p-1.5 rounded-lg border border-white/[0.08] text-[#9CA3AF] hover:text-rose-400"
            title="Reset counter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breathing Box */}
      <div className="p-3.5 rounded-2xl bg-[#0B1120]/50 border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F9FAFB]">
          <Wind className="w-4 h-4 text-[#10B981]" />
          <span>Hush dar Dam (Conscious Breath)</span>
        </div>
        <button
          type="button"
          onClick={() => setBreathActive(!breathActive)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
            breathActive ? 'bg-emerald-600/40 border-emerald-500/50 text-white' : 'border-white/[0.08] text-[#9CA3AF]'
          }`}
        >
          {breathActive ? 'Active' : 'Start'}
        </button>
      </div>

      {/* Note area */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#F9FAFB] block">Closing Reflection Note</label>
        <textarea
          rows={3}
          value={reflectionNote}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Record insights, dreams, spiritual observations, or sincere prayers..."
          className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-3 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveWithFeedback}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>{isSaving ? 'Saving...' : 'Save All Reflections'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
