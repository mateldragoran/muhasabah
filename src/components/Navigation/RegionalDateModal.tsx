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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#E8DFD0] shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gold hairline at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C5A059]/40 via-[#C5A059] to-[#C5A059]/40" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 id="calendar-modal-title" className="text-base font-semibold text-[#1E293B]">
                Regional Calendar Settings
              </h3>
              <p className="text-xs text-[#64748B]">Solar & Lunar Hijri Synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xl border border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5EFE6] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Regional Coordinates */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0]/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#64748B]">
              <Globe className="w-3.5 h-3.5 text-[#064E3B]" />
              Detected Timezone
            </span>
            <span className="font-mono font-medium text-[#1E293B]">{dateInfo.timeZone}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8DFD0]/50">
            <span className="text-[#64748B]">Solar Gregorian</span>
            <span className="font-medium text-[#1E293B]">{dateInfo.solarFormatted}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8DFD0]/50">
            <span className="flex items-center gap-1.5 text-[#64748B]">
              <Moon className="w-3.5 h-3.5 text-[#C5A059]" />
              Lunar Hijri
            </span>
            <span className="font-medium text-[#064E3B]">{dateInfo.hijriFormatted}</span>
          </div>
        </div>

        {/* Moon-Sighting Calibration */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider">
              Moon-Sighting Calibration
            </label>
            <span className="text-[11px] text-[#64748B]">Adjust for local crescent</span>
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
                      ? 'bg-[#064E3B] text-[#FFFFFF] border-[#064E3B] shadow-sm'
                      : 'bg-[#FFFFFF] text-[#1E293B] border-[#E8DFD0] hover:bg-[#FAF7F2] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {opt.label}
                    {isSelected && <Check className="w-3 h-3 text-[#FFFFFF]" />}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-[#ECFDF5]' : 'text-[#64748B]'
                    }`}
                  >
                    {opt.value === 0 ? 'Astronomical' : opt.value > 0 ? '+1 Day' : '-1 Day'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#64748B] pt-1 leading-relaxed">
            Regional moon-sighting committees may announce new Islamic months one day earlier or later depending on local sky clarity and sighting protocols.
          </p>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 pt-3 border-t border-[#E8DFD0]/60 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#043B2C] transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
