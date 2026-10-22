import React from 'react';
import { X, Globe, Moon, Check, Compass } from 'lucide-react';
import { RegionalDateInfo, setStoredHijriOffset } from '../../services/calendarService';

interface RegionalDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateInfo: RegionalDateInfo;
  onOffsetChange: (newOffset: number) => void;
}

const OFFSET_OPTIONS = [
  { value: -1, label: '-1 Day', desc: 'Crescent sighted day earlier' },
  { value: 0, label: 'Standard (0)', desc: 'Umm al-Qura astronomical' },
  { value: 1, label: '+1 Day', desc: 'Crescent sighted day later' },
];

export const RegionalDateModal: React.FC<RegionalDateModalProps> = ({
  isOpen,
  onClose,
  dateInfo,
  onOffsetChange,
}) => {
  if (!isOpen) return null;

  const handleSelectOffset = (offset: number) => {
    setStoredHijriOffset(offset);
    onOffsetChange(offset);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#111827] border border-white/[0.08] shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gold hairline at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#10B981]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 id="calendar-modal-title" className="text-base font-semibold text-[#F9FAFB]">
                Regional Calendar Settings
              </h3>
              <p className="text-xs text-[#9CA3AF]">Solar & Lunar Hijri Synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Regional Coordinates */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#1F2937]/50 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#9CA3AF]">
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              Detected Timezone
            </span>
            <span className="font-mono font-medium text-[#F9FAFB]">{dateInfo.timeZone}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
            <span className="text-[#9CA3AF]">Solar Gregorian</span>
            <span className="font-medium text-[#F9FAFB]">{dateInfo.solarFormatted}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
            <span className="flex items-center gap-1.5 text-[#9CA3AF]">
              <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
              Lunar Hijri
            </span>
            <div className="flex items-center gap-1.5 text-right">
              <span className="font-medium text-[#10B981]">{dateInfo.hijriFormatted}</span>
              {dateInfo.hijriMonthArabic && (
                <span className="text-[11px] font-arabic text-emerald-400/80">
                  ({dateInfo.hijriMonthArabic})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Moon-Sighting Calibration */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#F9FAFB] uppercase tracking-wider">
              Moon-Sighting Calibration
            </label>
            <span className="text-[11px] text-[#9CA3AF]">Adjust for local crescent</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {OFFSET_OPTIONS.map((opt) => {
              const isSelected = dateInfo.offsetDays === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOffset(opt.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-[58px] ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white border-emerald-400/30 shadow-md shadow-emerald-950/40'
                      : 'bg-[#1F2937]/40 text-[#9CA3AF] border-white/[0.08] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {opt.label}
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-emerald-100' : 'text-[#6B7280]'
                    }`}
                  >
                    {opt.value === 0 ? 'Astronomical' : opt.value > 0 ? '+1 Day' : '-1 Day'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#9CA3AF] pt-1 leading-relaxed">
            Regional moon-sighting committees may announce new Islamic months one day earlier or later depending on local sky clarity and sighting protocols.
          </p>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
