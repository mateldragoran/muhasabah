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
      <div className="glass-card rounded-3xl p-6 sm:p-8 text-center space-y-5 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        {/* Check Crest */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B] relative z-10 shadow-2xs">
          <CheckCircle2 className="h-7 w-7 text-[#064E3B]" />
        </div>

        {/* Title */}
        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-mono tracking-widest text-[#064E3B] font-semibold uppercase block">
            Hisab Completed
          </span>
          <h2 className="font-cinzel text-2xl font-bold tracking-wide text-[#1E293B]">
            Daily Audit Sealed
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3.5 relative z-10">
          <div>
            <div className="text-[10px] text-[#64748B] uppercase font-mono">Net Energy</div>
            <div className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
              record.netEnergy > 0 ? 'text-[#064E3B]' : record.netEnergy < 0 ? 'text-rose-600' : 'text-[#1E293B]'
            }`}>
              {record.netEnergy > 0 ? `+${record.netEnergy}` : record.netEnergy}
            </div>
          </div>

          <div className="border-x border-[#E8DFD0] px-1">
            <div className="text-[10px] text-[#64748B] uppercase font-mono">Gateways</div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#1E293B]">
              5/5
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#64748B] uppercase font-mono">Istighfar</div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#B88728] tabular-nums">
              {record.istighfarCount}x
            </div>
          </div>
        </div>

        {/* Guest Mode Notice: Minimal Single Line */}
        {isGuest && onOpenAuthModal && (
          <div className="rounded-xl border border-[#C5A059]/40 bg-[#FDF8ED] p-3 text-left flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2 text-xs text-[#1E293B]">
              <UserPlus className="w-4 h-4 text-[#B88728] shrink-0" />
              <span>Guest session: sign in to save records</span>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-xs font-semibold text-[#064E3B] hover:underline shrink-0"
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] active:scale-98 transition-all shadow-sm min-h-[44px]"
          >
            <Moon className="w-4 h-4 text-[#C5A059]" />
            <span>Bedtime Protections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onViewSummary}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] text-xs font-semibold text-[#1E293B] hover:bg-[#F5EFE6] transition-colors min-h-[44px]"
          >
            <Scale className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Review All Sections</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            title="Edit entry"
            className="p-2.5 rounded-xl border border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
