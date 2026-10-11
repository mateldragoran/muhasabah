import React from 'react';
import { Ear, Eye, MessageSquare, Heart, Shield, Scale, Moon, Check, Sparkles } from 'lucide-react';

export type JourneyStep =
  | 'niyyah'
  | 'ears'
  | 'eyes'
  | 'tongue'
  | 'heart'
  | 'body'
  | 'ledger'
  | 'istighfar'
  | 'summary';

interface JourneyStepperProps {
  currentStep: JourneyStep;
  onSelectStep: (step: JourneyStep) => void;
  completedSteps: Set<JourneyStep>;
}

const STEPS: { id: JourneyStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'niyyah', label: 'Intention', icon: Sparkles },
  { id: 'ears', label: 'Ears', icon: Ear },
  { id: 'eyes', label: 'Eyes', icon: Eye },
  { id: 'tongue', label: 'Tongue', icon: MessageSquare },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'body', label: 'Body', icon: Shield },
  { id: 'ledger', label: 'Ledger', icon: Scale },
  { id: 'istighfar', label: 'Istighfar', icon: Moon },
];

export const JourneyStepper: React.FC<JourneyStepperProps> = ({
  currentStep,
  onSelectStep,
  completedSteps,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = currentIndex >= 0 ? Math.round(((currentIndex) / (STEPS.length - 1)) * 100) : 100;

  return (
    <div className="w-full space-y-3">
      {/* Progress Line */}
      <div className="relative h-1.5 w-full rounded-full bg-[#E8DFD0]/70 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#064E3B] via-[#0B5A44] to-[#C5A059] transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepper Buttons */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isDone = completedSteps.has(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 min-h-[36px] ${
                isActive
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : isDone
                  ? 'bg-[#ECFDF5] text-[#064E3B] border border-[#A7F3D0]/70 hover:bg-[#D1FAE5]'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive
                    ? 'bg-[#C5A059] text-white font-bold'
                    : isDone
                    ? 'bg-[#064E3B] text-white'
                    : 'bg-[#E8DFD0] text-[#64748B]'
                }`}
              >
                {isDone && !isActive ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] tracking-wide font-medium">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
