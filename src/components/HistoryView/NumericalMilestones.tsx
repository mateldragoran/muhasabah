import React from 'react';
import { StreakStats, NUMERICAL_MILESTONES } from '../../types/streak';
import { Check, Flame } from 'lucide-react';

interface NumericalMilestonesProps {
  stats: StreakStats;
}

export const NumericalMilestones: React.FC<NumericalMilestonesProps> = ({ stats }) => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/70 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#F59E0B]">
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-semibold tracking-wide text-[#F9FAFB]">
              Practice Consistency
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Consecutive days of completed nightly accounting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] text-[#9CA3AF] block">Current Streak</span>
            <span className="font-mono text-lg font-bold text-[#F59E0B]">
              {stats.currentStreak} <span className="text-xs font-normal text-[#9CA3AF]">days</span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/[0.08]" />
          <div className="text-right">
            <span className="text-[11px] text-[#9CA3AF] block">Longest Streak</span>
            <span className="font-mono text-lg font-semibold text-[#F9FAFB]">
              {stats.longestStreak} <span className="text-xs font-normal text-[#9CA3AF]">days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Milestones Progression Strip */}
      <div className="relative pt-1 pb-1">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {NUMERICAL_MILESTONES.map((target) => {
            const isReached = stats.currentStreak >= target;
            const isNext = stats.nextMilestone === target;
            const daysRemaining = Math.max(0, target - stats.currentStreak);

            return (
              <div
                key={target}
                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all text-center ${
                  isReached
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-[#10B981] shadow-xs'
                    : isNext
                    ? 'border-amber-500/50 bg-amber-500/15 text-[#F59E0B]'
                    : 'border-white/[0.06] bg-[#1F2937]/30 text-[#9CA3AF]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1.5 transition-all ${
                    isReached
                      ? 'bg-[#10B981] text-[#0B1120]'
                      : isNext
                      ? 'border border-amber-500 text-[#F59E0B] bg-amber-500/20'
                      : 'border border-white/10 text-[#9CA3AF] bg-white/[0.04]'
                  }`}
                >
                  {isReached ? <Check className="w-4 h-4 stroke-[3]" /> : target}
                </div>

                <span className="font-mono text-xs font-semibold tracking-tight text-[#F9FAFB]">
                  {target} <span className="text-[10px] font-normal text-[#9CA3AF]">Days</span>
                </span>

                <span className="text-[10px] mt-1 text-[#9CA3AF]">
                  {isReached ? (
                    <span className="text-[#10B981] font-medium">Earned</span>
                  ) : isNext ? (
                    <span className="text-[#F59E0B] font-medium">{daysRemaining} left</span>
                  ) : (
                    <span>Locked</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
