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
  X,
  Check,
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
    <div className="sticky top-14 sm:top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD0] shadow-2xs transition-all">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Top bar row: Exit / Step title / Counter */}
        <div className="flex items-center justify-between gap-3">
          {/* Current Step Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onExitToLanding}
              title="Pause and return to overview"
              className="p-1.5 -ml-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FFFFFF] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#064E3B] text-white shadow-2xs shrink-0">
              <IconComponent className="h-3.5 w-3.5" />
            </div>

            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1E293B] truncate">
                  {activeStep.label}
                </span>
                <span className="text-[10px] font-arabic text-[#064E3B] opacity-80 hidden sm:inline">
                  ({activeStep.subLabel})
                </span>
              </div>
            </div>
          </div>

          {/* Step metrics & quick dots */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Step navigation dots on desktop/tablet */}
            <div className="hidden sm:flex items-center gap-1.5">
              {STEPS.map((step, idx) => {
                const isCurrent = step.id === currentStep;
                const isDone = completedSteps.has(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    title={`${step.label} (${idx + 1} of ${STEPS.length})`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      isCurrent
                        ? 'w-6 bg-[#064E3B]'
                        : isDone
                        ? 'w-2 bg-[#064E3B]/40 hover:bg-[#064E3B]/70'
                        : 'w-2 bg-[#E8DFD0] hover:bg-[#CBD5E1]'
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-[11px] font-mono font-semibold text-[#064E3B] tabular-nums">
              {currentIndex >= 0 ? currentIndex + 1 : 1}/{STEPS.length}
            </span>

            <button
              type="button"
              onClick={onExitToLanding}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors px-1.5 py-0.5 rounded hover:bg-[#FFFFFF]"
            >
              Pause
            </button>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="h-1 w-full bg-[#E8DFD0]/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#064E3B] to-[#0D9488] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
