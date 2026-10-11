import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Clock, Moon } from 'lucide-react';
import { MuhasabaRecord } from '../../types/muhasabah';
import { getFormattedRegionalDate } from '../../services/calendarService';
import { sound } from '../../services/soundService';

interface IntentionLandingCardProps {
  record: MuhasabaRecord;
  selectedDate: string;
  onBeginAccounting: () => void;
  onInspectAllSections?: () => void;
  onOpenBedtime?: () => void;
}

export const IntentionLandingCard: React.FC<IntentionLandingCardProps> = ({
  record,
  selectedDate,
  onBeginAccounting,
  onInspectAllSections,
  onOpenBedtime,
}) => {
  const dateInfo = getFormattedRegionalDate(new Date(selectedDate));
  const hasCompletedAudit = Boolean(record.isCompleted || record.istighfarCount > 0);

  const handleStart = () => {
    sound.playStepTransition();
    onBeginAccounting();
  };

  return (
    <div className="mx-auto max-w-xl px-2">
      <div className="glass-card rounded-3xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        {/* Subtle Ambient Backlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Minimal Date & Status */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[11px] font-mono text-[#64748B]">
            <Clock className="w-3 h-3 text-[#B88728]" />
            <span>{dateInfo.hijriShort}</span>
            <span className="text-[#CBD5E1]">·</span>
            <span>{dateInfo.solarFormatted}</span>
          </div>

          {hasCompletedAudit ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-mono text-[#064E3B] font-medium">
              <CheckCircle2 className="w-3 h-3 text-[#064E3B]" />
              <span>Recorded Today</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[11px] font-mono text-[#92400E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              <span>Pending</span>
            </div>
          )}
        </div>

        {/* Center Iconic Crest */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B] relative z-10 shadow-2xs">
          <ShieldCheck className="h-7 w-7 text-[#064E3B]" />
        </div>

        {/* Quiet Intention Heading & Short Contemplation */}
        <div className="space-y-3 relative z-10">
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide text-[#1E293B]">
            Daily Accounting
          </h1>

          {/* Minimal 1-Line Aphorism */}
          <div className="rounded-2xl bg-[#FAF7F2] border border-[#E8DFD0] p-4 sm:p-5 max-w-md mx-auto space-y-1.5">
            <p className="font-arabic text-base sm:text-lg text-[#064E3B] dir-rtl">
              حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا
            </p>
            <p className="text-xs text-[#475569] italic">
              &ldquo;Take account of yourselves before you are taken to account.&rdquo;
            </p>
            <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider pt-0.5">
              Sayyiduna Umar ibn al-Khattab
            </div>
          </div>
        </div>

        {/* Main Begin Accounting Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-[#064E3B] text-white font-semibold text-xs sm:text-sm hover:bg-[#043B2C] active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#C5A059] group-hover:rotate-12 transition-transform" />
            <span>{hasCompletedAudit ? 'Revisit Accounting' : 'Begin Accounting'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {hasCompletedAudit && onInspectAllSections && (
            <button
              type="button"
              onClick={onInspectAllSections}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] text-[#1E293B] font-medium text-xs hover:bg-[#F5EFE6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Review Sections</span>
            </button>
          )}

          {onOpenBedtime && (
            <button
              type="button"
              onClick={onOpenBedtime}
              title="Bedtime Sunnah Protections"
              className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Moon className="w-4 h-4 text-[#C5A059]" />
              <span className="sm:hidden">Bedtime Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
