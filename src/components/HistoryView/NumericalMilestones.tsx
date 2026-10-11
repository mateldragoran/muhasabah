import React from 'react';
import { StreakStats, NUMERICAL_MILESTONES } from '../../types/streak';
import { Check, Flame } from 'lucide-react';

interface NumericalMilestonesProps {
  stats: StreakStats;
}

export const NumericalMilestones: React.FC<NumericalMilestonesProps> = ({ stats }) => {
  return (
    <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
            <Flame className="w-5 h-5 text-[#064E3B]" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-semibold tracking-wide text-[#1E293B]">
              Practice Consistency
            </h3>
            <p className="text-xs text-[#64748B]">
              Consecutive days of completed nightly accounting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] text-[#64748B] block">Current Streak</span>
            <span className="font-mono text-lg font-bold text-[#064E3B]">
              {stats.currentStreak} <span className="text-xs font-normal text-[#64748B]">days</span>
            </span>
          </div>
          <div className="h-8 w-px bg-[#E8DFD0]" />
          <div className="text-right">
            <span className="text-[11px] text-[#64748B] block">Longest Streak</span>
            <span className="font-mono text-lg font-semibold text-[#1E293B]">
              {stats.longestStreak} <span className="text-xs font-normal text-[#64748B]">days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Milestones Progression Strip */}
      <div className="relative pt-2 pb-1">
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
                    ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B] shadow-2xs'
                    : isNext
                    ? 'border-[#C5A059] bg-[#FDF8ED] text-[#B88728]'
                    : 'border-[#E8DFD0] bg-[#FAF7F2] text-[#64748B]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1.5 transition-all ${
                    isReached
                      ? 'bg-[#064E3B] text-white'
                      : isNext
                      ? 'border border-[#C5A059] text-[#B88728] bg-[#FFFFFF]'
                      : 'border border-[#E8DFD0] text-[#64748B] bg-[#FFFFFF]'
                  }`}
                >
                  {isReached ? <Check className="w-4 h-4 stroke-[2.5]" /> : target}
                </div>

                <span className="font-mono text-xs font-semibold tracking-tight text-[#1E293B]">
                  {target} <span className="text-[10px] font-normal text-[#64748B]">Days</span>
                </span>

                <span className="text-[10px] mt-1 text-[#64748B]">
                  {isReached ? (
                    <span className="text-[#064E3B] font-medium">Completed</span>
                  ) : isNext ? (
                    <span className="text-[#B88728] font-medium">{daysRemaining} left</span>
                  ) : (
                    <span>Pending</span>
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
