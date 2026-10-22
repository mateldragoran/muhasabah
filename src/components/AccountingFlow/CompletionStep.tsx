import React from 'react';
import { MuhasabaRecord } from '../../types/muhasabah';
import { CheckCircle2, Moon, ArrowRight, RotateCcw, Scale, UserPlus } from 'lucide-react';

interface CompletionStepProps {
  record: MuhasabaRecord;
  onOpenBedtime: () => void;
  onViewSummary: () => void;
  onRestart: () => void;
  isGuest?: boolean;
  onOpenAuthModal?: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  record,
  onOpenBedtime,
  onViewSummary,
  onRestart,
  isGuest,
  onOpenAuthModal,
}) => {
  return (
    <div className="mx-auto max-w-xl px-2 space-y-4">
      <div className="glass-card rounded-3xl p-6 sm:p-9 text-center space-y-5 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Check Crest */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] border border-emerald-400/30 text-white relative z-10 shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-semibold uppercase block">
            Hisab Sealed & Completed
          </span>
          <h2 className="font-cinzel text-2xl font-bold tracking-wide text-[#F9FAFB]">
            Daily Audit Recorded
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            May Allah accept your contemplation and grant steadfast vigilance.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.06] bg-[#0B1120]/70 p-4 relative z-10">
          <div>
            <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Net Light</div>
            <div className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
              record.netEnergy > 0 ? 'text-[#10B981]' : record.netEnergy < 0 ? 'text-rose-400' : 'text-[#F9FAFB]'
            }`}>
              {record.netEnergy > 0 ? `+${record.netEnergy}` : record.netEnergy}
            </div>
          </div>

          <div className="border-x border-white/[0.08] px-1">
            <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Gateways</div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#F9FAFB]">
              5/5
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Istighfar</div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#F59E0B] tabular-nums">
              {record.istighfarCount}x
            </div>
          </div>
        </div>

        {/* Guest Mode Notice */}
        {isGuest && onOpenAuthModal && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2 text-xs text-[#F9FAFB]">
              <UserPlus className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Guest session: sign in to sync with cloud backup</span>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-xs font-semibold text-[#10B981] hover:underline shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={onOpenBedtime}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 active:scale-98 transition-all shadow-md shadow-emerald-950/40 min-h-[44px] cursor-pointer"
          >
            <Moon className="w-4 h-4 text-[#F59E0B]" />
            <span>Proceed to Night Shield</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onViewSummary}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-white/[0.08] bg-[#1F2937]/40 text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04] transition-colors min-h-[44px] cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Review All Sections</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            title="Edit entry"
            className="p-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
