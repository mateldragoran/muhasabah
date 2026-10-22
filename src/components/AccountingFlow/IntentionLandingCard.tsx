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

  // Calculate gateway stats if record exists
  const guardedCount = Object.values(record.gateways).filter(
    (g) => g.state === 'vigilant' || g.state === 'rectified'
  ).length;

  return (
    <div className="mx-auto max-w-xl px-2">
      <div className="glass-card rounded-3xl p-6 sm:p-9 text-center space-y-6 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Sacred Ambient Backlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-48 h-48 bg-amber-500/08 rounded-full blur-2xl pointer-events-none" />

        {/* Top Minimal Date & Status */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F2937]/60 border border-white/[0.08] text-[11px] font-mono text-[#9CA3AF]">
            <Clock className="w-3 h-3 text-[#F59E0B]" />
            <span>{dateInfo.hijriShort}</span>
            <span className="text-white/20">·</span>
            <span>{dateInfo.solarFormatted}</span>
          </div>

          {hasCompletedAudit ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-[#10B981] font-medium">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              <span>Recorded Today</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-[#F59E0B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>Pending Tonight</span>
            </div>
          )}
        </div>

        {/* Center Iconic Crest */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981]/80 border border-emerald-400/30 text-white relative z-10 shadow-lg shadow-emerald-950/50">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>

        {/* Heading & Spiritual Contemplation */}
        <div className="space-y-3 relative z-10">
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide text-[#F9FAFB]">
            Nightly Accounting
          </h1>

          {/* Minimal 1-Line Aphorism */}
          <div className="rounded-2xl bg-[#1F2937]/50 border border-white/[0.06] p-4 sm:p-5 max-w-md mx-auto space-y-1.5">
            <p className="font-arabic text-lg sm:text-xl text-[#10B981] dir-rtl">
              حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا
            </p>
            <p className="text-xs sm:text-sm text-[#9CA3AF] italic">
              &ldquo;Take account of yourselves before you are taken to account.&rdquo;
            </p>
            <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider pt-0.5">
              Sayyiduna Umar ibn al-Khattab (RA)
            </div>
          </div>
        </div>

        {/* Today's Snapshot Card (If already touched today) */}
        {hasCompletedAudit && (
          <div className="rounded-2xl bg-[#0B1120]/60 border border-emerald-500/20 p-3.5 max-w-md mx-auto grid grid-cols-3 gap-2 text-center relative z-10">
            <div>
              <div className="text-[10px] text-[#9CA3AF]">Gateways</div>
              <div className="text-sm font-bold text-[#10B981] font-mono">{guardedCount}/5 Safe</div>
            </div>
            <div className="border-x border-white/[0.08]">
              <div className="text-[10px] text-[#9CA3AF]">Net Energy</div>
              <div className={`text-sm font-bold font-mono ${record.netEnergy >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                {record.netEnergy >= 0 ? `+${record.netEnergy}` : record.netEnergy}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#9CA3AF]">Istighfar</div>
              <div className="text-sm font-bold text-[#F59E0B] font-mono">{record.istighfarCount}x</div>
            </div>
          </div>
        )}

        {/* Main Actions: Unified Step-by-Step 'Begin Muhassaba' */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
            <span>{hasCompletedAudit ? 'Continue Muhassaba' : 'Begin Muhassaba'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onOpenBedtime && (
            <button
              type="button"
              onClick={onOpenBedtime}
              title="Bedtime Sunnah Protections"
              className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl border border-white/[0.08] bg-[#111827]/70 text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Moon className="w-4 h-4 text-[#F59E0B]" />
              <span className="sm:hidden">Bedtime Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
