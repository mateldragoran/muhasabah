import React, { useState } from 'react';
import { BedtimeProtectionLog } from '../../types/muhasabah';
import { sound } from '../../services/soundService';
import { Moon, Check, Sparkles, Bed, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
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
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl space-y-4 py-2 px-2"
    >
      {/* Hero Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
              <Moon className="w-5 h-5 text-[#064E3B]" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
                Bedtime Protections
              </h2>
              <span className="text-xs text-[#64748B]">
                Sunnah armor before sleep
              </span>
            </div>
          </div>

          {sealed && (
            <button
              onClick={handleReset}
              title="Reset checks"
              className="text-[#64748B] hover:text-[#1E293B] p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Purity Checks */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#FFFFFF] border border-[#E8DFD0]">
        <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
          Ritual Purity
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toggleCheck('wuduDone')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[48px] flex items-center justify-between ${
              log.wuduDone
                ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B]'
                : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:bg-[#FFFFFF]'
            }`}
          >
            <span className="font-medium text-xs sm:text-sm text-[#1E293B]">Fresh Wudu</span>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                log.wuduDone ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
              }`}
            >
              {log.wuduDone && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('salatulWuduDone')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[48px] flex items-center justify-between ${
              log.salatulWuduDone
                ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B]'
                : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:bg-[#FFFFFF]'
            }`}
          >
            <span className="font-medium text-xs sm:text-sm text-[#1E293B]">2 Rakahs Salatul Wudu</span>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                log.salatulWuduDone ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
              }`}
            >
              {log.salatulWuduDone && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Protective Surahs */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#FFFFFF] border border-[#E8DFD0]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
            Three Protective Surahs
          </span>
          <span className="text-[10px] text-[#64748B] font-mono">Tap to count</span>
        </div>

        <div className="space-y-2">
          {/* Surah Falaq (4x) */}
          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold text-[#1E293B]">
                Surah Al-Falaq
              </span>
              <span className="font-arabic text-xs text-[#064E3B]">الفلق</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs text-[#64748B]">
                {log.falaqCount}/4
              </span>
              <button
                type="button"
                onClick={handleIncrementFalaq}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  log.falaqCount >= 4
                    ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                    : 'border-[#C5A059] bg-[#FDF8ED] text-[#B88728] active:scale-95'
                }`}
              >
                {log.falaqCount >= 4 ? 'Done' : '+ Count'}
              </button>
            </div>
          </div>

          {/* Surah Nas (3x) */}
          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold text-[#1E293B]">
                Surah An-Nas
              </span>
              <span className="font-arabic text-xs text-[#064E3B]">الناس</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs text-[#64748B]">
                {log.nasCount}/3
              </span>
              <button
                type="button"
                onClick={handleIncrementNas}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  log.nasCount >= 3
                    ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                    : 'border-[#C5A059] bg-[#FDF8ED] text-[#B88728] active:scale-95'
                }`}
              >
                {log.nasCount >= 3 ? 'Done' : '+ Count'}
              </button>
            </div>
          </div>

          {/* Surah Ikhlas (2x) */}
          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold text-[#1E293B]">
                Surah Al-Ikhlas
              </span>
              <span className="font-arabic text-xs text-[#064E3B]">الإخلاص</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs text-[#64748B]">
                {log.ikhlasCount}/2
              </span>
              <button
                type="button"
                onClick={handleIncrementIkhlas}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  log.ikhlasCount >= 2
                    ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                    : 'border-[#C5A059] bg-[#FDF8ED] text-[#B88728] active:scale-95'
                }`}
              >
                {log.ikhlasCount >= 2 ? 'Done' : '+ Count'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shielding Postures */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 bg-[#FFFFFF] border border-[#E8DFD0]">
        <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
          Shielding Postures
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => toggleCheck('wipedBody')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between ${
              log.wipedBody
                ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B]'
                : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B88728]" />
              <span className="font-medium text-xs text-[#1E293B]">Blow & Wipe</span>
            </div>
            <div
              className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border shrink-0 ${
                log.wipedBody ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
              }`}
            >
              {log.wipedBody && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('rightSidePosture')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between ${
              log.rightSidePosture
                ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B]'
                : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bed className="w-3.5 h-3.5 text-[#B88728]" />
              <span className="font-medium text-xs text-[#1E293B]">Right Side Rest</span>
            </div>
            <div
              className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border shrink-0 ${
                log.rightSidePosture ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
              }`}
            >
              {log.rightSidePosture && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheck('headCovered')}
            className={`p-3 rounded-xl border text-left transition-all min-h-[46px] flex items-center justify-between ${
              log.headCovered
                ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B]'
                : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88728]" />
              <span className="font-medium text-xs text-[#1E293B]">Head Covered</span>
            </div>
            <div
              className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border shrink-0 ${
                log.headCovered ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
              }`}
            >
              {log.headCovered && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Seal Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleSealBedtime}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#064E3B] py-3.5 px-4 text-xs sm:text-sm font-bold text-white hover:bg-[#043B2C] active:scale-[0.98] transition-all shadow-sm min-h-[46px]"
        >
          {sealed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>Protections Sealed</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Seal Bedtime Protections</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
