import React from 'react';
import {
  Ear,
  Eye,
  MessageSquare,
  Heart,
  Shield,
  Scale,
  Sparkles,
  ChevronLeft,
  HeartHandshake,
} from 'lucide-react';
import { JourneyStep } from './JourneyStepper';
import { sound } from '../../services/soundService';

interface StickyCompactStepperProps {
  currentStep: JourneyStep;
  onSelectStep: (step: JourneyStep) => void;
  onExitToLanding: () => void;
  completedSteps: Set<JourneyStep>;
}

const STEPS: { id: JourneyStep; label: string; subLabel: string; icon: React.ElementType }[] = [
  { id: 'ears', label: 'Ears', subLabel: "Sam'", icon: Ear },
  { id: 'eyes', label: 'Eyes', subLabel: 'Basar', icon: Eye },
  { id: 'tongue', label: 'Tongue', subLabel: 'Lisan', icon: MessageSquare },
  { id: 'heart', label: 'Heart', subLabel: 'Qalb', icon: Heart },
  { id: 'body', label: 'Limbs', subLabel: 'Jawarih', icon: Shield },
  { id: 'prophetic_connection', label: 'Prophetic Bond', subLabel: 'Rabita', icon: HeartHandshake },
  { id: 'ledger', label: 'Energy Ledger', subLabel: 'Mizan', icon: Scale },
  { id: 'istighfar', label: 'Istighfar', subLabel: 'Tawbah', icon: Sparkles },
];

export const StickyCompactStepper: React.FC<StickyCompactStepperProps> = ({
  currentStep,
  onSelectStep,
  onExitToLanding,
  completedSteps,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const activeStep = STEPS[currentIndex] || STEPS[0];
  const IconComponent = activeStep.icon;
  const progressPercent = Math.round(((Math.max(0, currentIndex) + 1) / STEPS.length) * 100);

  const handleStepClick = (stepId: JourneyStep) => {
    sound.playStepTransition();
    onSelectStep(stepId);
  };

  return (
    <div className="sticky top-14 sm:top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md transition-all">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Top bar row: Exit / Step title / Counter */}
        <div className="flex items-center justify-between gap-3">
          {/* Current Step Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onExitToLanding}
              title="Return to overview"
              className="p-1.5 -ml-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#10B981]">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#F9FAFB] truncate">
                    {activeStep.label}
                  </span>
                  <span className="text-[10px] font-arabic text-[#10B981] hidden sm:inline">
                    ({activeStep.subLabel})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step metrics & progress percentage */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-[#10B981] font-semibold">
              Step {currentIndex + 1}/{STEPS.length}
            </span>
            <span className="text-[10px] font-mono text-[#9CA3AF]">
              ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Segmented Progress Tracker (Clickable on all steps) */}
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
          {STEPS.map((s, idx) => {
            const isCompleted = completedSteps.has(s.id);
            const isCurrent = s.id === currentStep;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepClick(s.id)}
                title={`${s.label} (${s.subLabel})`}
                className={`group relative h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-400 to-[#10B981] shadow-xs shadow-emerald-500/40 ring-1 ring-emerald-400/50'
                    : isCompleted
                    ? 'bg-emerald-600/80 hover:bg-emerald-500'
                    : 'bg-white/[0.08] hover:bg-white/[0.15]'
                }`}
              >
                <span className="sr-only">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
