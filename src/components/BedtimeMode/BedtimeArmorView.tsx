import React, { useState } from 'react';
import { BedtimeProtectionLog } from '../../types/muhasabah';
import { sound } from '../../services/soundService';
import { Moon, Check, Sparkles, Bed, CheckCircle2, RotateCcw, ShieldCheck, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface BedtimeArmorViewProps {
  log: BedtimeProtectionLog;
  onUpdateLog: (updated: Partial<BedtimeProtectionLog>) => void;
  onSaveLog: () => void;
}

export const BedtimeArmorView: React.FC<BedtimeArmorViewProps> = ({
  log,
  onUpdateLog,
  onSaveLog,
}) => {
  const [sealed, setSealed] = useState(Boolean(log.completedAt));

  const handleIncrementFalaq = () => {
    sound.playBeadChime();
    onUpdateLog({ falaqCount: Math.min(4, log.falaqCount + 1) });
  };

  const handleIncrementNas = () => {
    sound.playBeadChime();
    onUpdateLog({ nasCount: Math.min(3, log.nasCount + 1) });
  };

  const handleIncrementIkhlas = () => {
    sound.playBeadChime();
    onUpdateLog({ ikhlasCount: Math.min(2, log.ikhlasCount + 1) });
  };

  const handleSealBedtime = () => {
    sound.playSealChime();
    onUpdateLog({ completedAt: new Date().toISOString() });
    onSaveLog();
    setSealed(true);
  };

  const handleReset = () => {
    sound.playStepTransition();
    onUpdateLog({
      wuduDone: false,
      salatulWuduDone: false,
      falaqCount: 0,
      nasCount: 0,
      ikhlasCount: 0,
      rightSidePosture: false,
      headCovered: false,
      wipedBody: false,
      completedAt: undefined,
    });
    setSealed(false);
  };

  const toggleCheck = (key: keyof BedtimeProtectionLog) => {
    sound.playBeadChime();
    onUpdateLog({ [key]: !log[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl space-y-4 py-2 px-2"
    >
      {/* Night Shield Hero Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        <div className="absolute -top-20 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] border border-emerald-400/30 text-white shadow-lg shadow-emerald-950/40">
              <Moon className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
                Night Shield
              </h2>
              <span className="text-xs text-[#9CA3AF]">
                Calming prophetic protections before sleep
              </span>
            </div>
          </div>

          {sealed && (
            <button
              onClick={handleReset}
              title="Reset protections"
              className="text-[#9CA3AF] hover:text-[#F9FAFB] p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ritual Purity */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#111827]/70 border border-white/[0.08]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#10B981] font-semibold uppercase">
          <Droplets className="w-3.5 h-3.5" />
          <span>1. Ritual Purity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toggleCheck('wuduDone')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[48px] flex items-center justify-between cursor-pointer ${
              log.wuduDone
                ? 'border-emerald-500/50 bg-emerald-500/15 text-[#F9FAFB]'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <span className="font-medium text-xs sm:text-sm">Fresh Wudu</span>
            <div
              className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                log.wuduDone ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]' : 'border-white/20'
              }`}
            >
              {log.wuduDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('salatulWuduDone')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[48px] flex items-center justify-between cursor-pointer ${
              log.salatulWuduDone
                ? 'border-emerald-500/50 bg-emerald-500/15 text-[#F9FAFB]'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <span className="font-medium text-xs sm:text-sm">2 Rakahs Salatul Wudu</span>
            <div
              className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                log.salatulWuduDone ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]' : 'border-white/20'
              }`}
            >
              {log.salatulWuduDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Protective Surahs */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#111827]/70 border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-[#10B981] font-semibold uppercase block">
            2. Three Protective Surahs
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-mono">Tap count to advance</span>
        </div>

        <div className="space-y-2">
          {/* Surah Falaq (4x) */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B1120]/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#F9FAFB]">
                  Surah Al-Falaq
                </span>
                <span className="font-arabic text-xs text-[#10B981]">الفلق</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#10B981]">
                  {log.falaqCount}/4
                </span>
                <button
                  type="button"
                  onClick={handleIncrementFalaq}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    log.falaqCount >= 4
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-[#10B981]'
                      : 'border-amber-500/40 bg-amber-500/10 text-[#F59E0B] hover:bg-amber-500/20 active:scale-95'
                  }`}
                >
                  {log.falaqCount >= 4 ? '✓ Completed' : '+ Recite'}
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-[#10B981] transition-all duration-300"
                style={{ width: `${(log.falaqCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Surah Nas (3x) */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B1120]/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#F9FAFB]">
                  Surah An-Nas
                </span>
                <span className="font-arabic text-xs text-[#10B981]">الناس</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#10B981]">
                  {log.nasCount}/3
                </span>
                <button
                  type="button"
                  onClick={handleIncrementNas}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    log.nasCount >= 3
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-[#10B981]'
                      : 'border-amber-500/40 bg-amber-500/10 text-[#F59E0B] hover:bg-amber-500/20 active:scale-95'
                  }`}
                >
                  {log.nasCount >= 3 ? '✓ Completed' : '+ Recite'}
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-[#10B981] transition-all duration-300"
                style={{ width: `${(log.nasCount / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Surah Ikhlas (2x) */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B1120]/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#F9FAFB]">
                  Surah Al-Ikhlas
                </span>
                <span className="font-arabic text-xs text-[#10B981]">الإخلاص</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#10B981]">
                  {log.ikhlasCount}/2
                </span>
                <button
                  type="button"
                  onClick={handleIncrementIkhlas}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    log.ikhlasCount >= 2
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-[#10B981]'
                      : 'border-amber-500/40 bg-amber-500/10 text-[#F59E0B] hover:bg-amber-500/20 active:scale-95'
                  }`}
                >
                  {log.ikhlasCount >= 2 ? '✓ Completed' : '+ Recite'}
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-[#10B981] transition-all duration-300"
                style={{ width: `${(log.ikhlasCount / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shielding Postures */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#111827]/70 border border-white/[0.08]">
        <span className="text-[11px] font-mono tracking-wider text-[#10B981] font-semibold uppercase block">
          3. Prophetic Sleep Postures
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => toggleCheck('wipedBody')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between cursor-pointer ${
              log.wipedBody
                ? 'border-emerald-500/50 bg-emerald-500/15 text-[#F9FAFB]'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-medium text-xs">Blow & Wipe Body</span>
            </div>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                log.wipedBody ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]' : 'border-white/20'
              }`}
            >
              {log.wipedBody && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('rightSidePosture')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between cursor-pointer ${
              log.rightSidePosture
                ? 'border-emerald-500/50 bg-emerald-500/15 text-[#F9FAFB]'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bed className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-medium text-xs">Right Side Rest</span>
            </div>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                log.rightSidePosture ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]' : 'border-white/20'
              }`}
            >
              {log.rightSidePosture && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('headCovered')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between cursor-pointer ${
              log.headCovered
                ? 'border-emerald-500/50 bg-emerald-500/15 text-[#F9FAFB]'
                : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-medium text-xs">Head Covered</span>
            </div>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                log.headCovered ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]' : 'border-white/20'
              }`}
            >
              {log.headCovered && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Seal Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSealBedtime}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#10B981] py-3.5 px-4 text-xs sm:text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-950/50 min-h-[48px] cursor-pointer"
        >
          {sealed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              <span>Bedtime Protections Sealed</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>Seal Bedtime Protections</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
