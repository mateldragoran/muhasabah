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

  // Breathing pacer effect (4s inhale, 4s hold, 4s exhale)
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
      <div className="border-b border-[#E8DFD0] pb-2.5">
        <h2 className="font-cinzel text-base sm:text-lg font-semibold tracking-wide text-[#1E293B]">
          03. Istighfar & Humility
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Digital Tasbih Card */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-5 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="text-[11px] font-mono text-[#064E3B] font-semibold uppercase tracking-wider mb-1">
            Recitation Formula
          </div>
          <div className="font-arabic text-xl sm:text-2xl text-[#1E293B] font-medium max-w-xs leading-relaxed">
            أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ
          </div>
          <div className="text-[11px] text-[#064E3B] font-semibold italic mt-0.5">
            Astaghfirullah al-Azim wa atubu ilayh
          </div>

          {/* Interactive Circular Bead Counter */}
          <div className="relative my-5 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-36 h-36 -rotate-90 transform">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="6"
                className="text-[#E8DFD0]"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
                strokeLinecap="round"
                className="text-[#064E3B] transition-all duration-150"
                fill="transparent"
              />
            </svg>

            {/* Inner Tap Button */}
            <button
              type="button"
              onClick={handleIncrement}
              className="absolute h-28 w-28 rounded-full bg-[#FAF7F2] border border-[#C5A059] flex flex-col items-center justify-center hover:bg-[#FFFFFF] hover:border-[#064E3B] active:scale-95 transition-all focus:outline-none shadow-sm"
            >
              <span className="font-mono text-3xl font-bold text-[#1E293B] tabular-nums">
                {istighfarCount}
              </span>
              <span className="text-[10px] text-[#64748B]">
                of {istighfarTarget}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#064E3B] font-bold mt-0.5">
                TAP TO COUNT
              </span>
            </button>
          </div>

          {/* Counter Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeTarget(100)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                istighfarTarget === 100
                  ? 'border-[#064E3B] text-white bg-[#064E3B]'
                  : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FAF7F2]'
              }`}
            >
              100x Target
            </button>
            <button
              type="button"
              onClick={() => onChangeTarget(500)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                istighfarTarget === 500
                  ? 'border-[#064E3B] text-white bg-[#064E3B]'
                  : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FAF7F2]'
              }`}
            >
              500x Target
            </button>
            <button
              type="button"
              onClick={() => onChangeIstighfar(0)}
              title="Reset counter"
              className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breath & Reflection Column */}
        <div className="space-y-4">
          {/* Hush dar Dam (Conscious Breathing Pacer) */}
          <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#064E3B]" />
                <span className="font-cinzel text-xs font-semibold text-[#1E293B] tracking-wider uppercase">
                  Hush dar Dam (Conscious Breath)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBreathActive(!breathActive)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                  breathActive
                    ? 'border-[#064E3B] text-white bg-[#064E3B]'
                    : 'border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] bg-[#FAF7F2]'
                }`}
              >
                {breathActive ? 'Pause Guide' : 'Start Guide'}
              </button>
            </div>

            {breathActive ? (
              <div className="py-3 flex flex-col items-center justify-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'scale-125 border-[#064E3B] bg-[#ECFDF5] text-[#064E3B] shadow-md'
                      : breathPhase === 'hold'
                      ? 'scale-110 border-[#C5A059] bg-[#FDF8ED] text-[#B88728] shadow-sm'
                      : 'scale-90 border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B]'
                  }`}
                >
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-[#1E293B] mt-2 uppercase tracking-wide">
                  {breathPhase === 'inhale' && 'Inhale Divine Light (Nur)'}
                  {breathPhase === 'hold' && 'Hold with Divine Presence'}
                  {breathPhase === 'exhale' && 'Exhale Lower Impurities'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] leading-relaxed">
                Connect the breath between the nostrils and heart. A single mindful breath draws protective heavenly light before sleep.
              </p>
            )}
          </div>

          {/* Evening Reflection Note */}
          <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 shadow-xs">
            <label className="text-xs font-semibold text-[#1E293B] mb-2 block">
              Evening Reflection & Private Munajat
            </label>
            <textarea
              rows={3}
              value={reflectionNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Record any realization, gratitude, or intention before closing your ledger tonight..."
              className="w-full rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-2.5 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none"
            />
          </div>

          {/* Save Action */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveWithFeedback}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] p-3 text-xs font-bold text-white hover:bg-[#043B2C] active:scale-[0.99] transition-all shadow-sm min-h-[44px]"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Accounting Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Daily Accounting'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
