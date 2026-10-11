import React, { useState } from 'react';
import { MuhasabaRecord, GatewayType, GatewayAudit, EnergyTransaction } from '../../types/muhasabah';
import { JourneyStep } from './JourneyStepper';
import { StickyCompactStepper } from './StickyCompactStepper';
import { IntentionLandingCard } from './IntentionLandingCard';
import { GatewayCardStep } from './GatewayCardStep';
import { EnergyLedgerStep } from './EnergyLedgerStep';
import { IstighfarStep } from './IstighfarStep';
import { CompletionStep } from './CompletionStep';
import { GatewaysAuditSection } from './GatewaysAuditSection';
import { EnergyLedgerSection } from './EnergyLedgerSection';
import { IstighfarSection } from './IstighfarSection';
import { sound } from '../../services/soundService';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AccountingJourneyProps {
  record: MuhasabaRecord;
  selectedDate?: string;
  onUpdateGateway: (gateway: GatewayType, updated: Partial<GatewayAudit>) => void;
  onUpdateTransactions: (transactions: EnergyTransaction[]) => void;
  onUpdateIstighfar: (count: number) => void;
  onUpdateTarget: (target: number) => void;
  onUpdateNote: (note: string) => void;
  onSaveRecord: () => void;
  onSwitchToBedtime: () => void;
  isSaving: boolean;
  isGuest: boolean;
  onOpenAuthModal: () => void;
}

const GATEWAY_ORDER: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];

export const AccountingJourney: React.FC<AccountingJourneyProps> = ({
  record,
  selectedDate,
  onUpdateGateway,
  onUpdateTransactions,
  onUpdateIstighfar,
  onUpdateTarget,
  onUpdateNote,
  onSaveRecord,
  onSwitchToBedtime,
  isSaving,
  isGuest,
  onOpenAuthModal,
}) => {
  // Phases: 'landing' (quiet intention card) -> 'active' (sticky compact stepper + steps) -> 'summary' (completion card) -> 'all-sections'
  const [phase, setPhase] = useState<'landing' | 'active' | 'summary' | 'all-sections'>('landing');
  const [currentStep, setCurrentStep] = useState<JourneyStep>('ears');
  const [completedSteps, setCompletedSteps] = useState<Set<JourneyStep>>(new Set());

  const markStepDone = (step: JourneyStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  };

  const handleBeginAccounting = () => {
    sound.playStepTransition();
    setPhase('active');
    setCurrentStep('ears');
  };

  const handleNextFromGateway = (currentIndex: number) => {
    sound.playStepTransition();
    const currentGw = GATEWAY_ORDER[currentIndex];
    markStepDone(currentGw as JourneyStep);

    if (currentIndex + 1 < GATEWAY_ORDER.length) {
      setCurrentStep(GATEWAY_ORDER[currentIndex + 1] as JourneyStep);
    } else {
      setCurrentStep('ledger');
    }
  };

  const handlePrevFromGateway = (currentIndex: number) => {
    sound.playStepTransition();
    if (currentIndex > 0) {
      setCurrentStep(GATEWAY_ORDER[currentIndex - 1] as JourneyStep);
    } else {
      setPhase('landing');
    }
  };

  const handleCompleteJourney = () => {
    markStepDone('istighfar');
    onSaveRecord();
    sound.playSealChime();
    setPhase('summary');
  };

  return (
    <div className="space-y-6">
      {/* 1. DEFAULT LANDING PHASE: Quiet Intention Card (No Stepper, No Multi-Section Clutter) */}
      {phase === 'landing' && (
        <motion.div
          key="phase-landing"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <IntentionLandingCard
            record={record}
            selectedDate={selectedDate || record.date}
            onBeginAccounting={handleBeginAccounting}
            onInspectAllSections={() => {
              sound.playStepTransition();
              setPhase('all-sections');
            }}
            onOpenBedtime={onSwitchToBedtime}
          />
        </motion.div>
      )}

      {/* 2. ACTIVE ACCOUNTING PHASE: Sticky Top Progress Bar + Step Cards */}
      {phase === 'active' && (
        <div className="space-y-6">
          {/* Sticky Compact Top Stepper */}
          <StickyCompactStepper
            currentStep={currentStep}
            onSelectStep={(step) => {
              sound.playStepTransition();
              setCurrentStep(step);
            }}
            onExitToLanding={() => {
              sound.playStepTransition();
              setPhase('landing');
            }}
            completedSteps={completedSteps}
          />

          <AnimatePresence mode="wait">
            {/* Steps 1 to 5: Sensory Gateways */}
            {GATEWAY_ORDER.map((gw, idx) => {
              if (currentStep !== gw) return null;
              return (
                <motion.div
                  key={`step-${gw}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <GatewayCardStep
                    gateway={gw}
                    stepNumber={idx + 1}
                    totalGateways={5}
                    audit={record.gateways[gw]}
                    onChange={(upd) => onUpdateGateway(gw, upd)}
                    onNext={() => handleNextFromGateway(idx)}
                    onPrev={() => handlePrevFromGateway(idx)}
                  />
                </motion.div>
              );
            })}

            {/* Step 6: Energy Ledger */}
            {currentStep === 'ledger' && (
              <motion.div
                key="step-ledger"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                <EnergyLedgerStep
                  transactions={record.transactions}
                  onChangeTransactions={onUpdateTransactions}
                  onNext={() => {
                    sound.playStepTransition();
                    markStepDone('ledger');
                    setCurrentStep('istighfar');
                  }}
                  onPrev={() => {
                    sound.playStepTransition();
                    setCurrentStep('body');
                  }}
                />
              </motion.div>
            )}

            {/* Step 7: Istighfar & Sealing */}
            {currentStep === 'istighfar' && (
              <motion.div
                key="step-istighfar"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                <IstighfarStep
                  istighfarCount={record.istighfarCount}
                  istighfarTarget={record.istighfarTarget}
                  reflectionNote={record.reflectionNote}
                  onChangeCount={onUpdateIstighfar}
                  onChangeTarget={onUpdateTarget}
                  onChangeNote={onUpdateNote}
                  onSealAndComplete={handleCompleteJourney}
                  onPrev={() => {
                    sound.playStepTransition();
                    setCurrentStep('ledger');
                  }}
                  isSaving={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. COMPLETION SUMMARY PHASE: Dignified Card with Option to Review All Sections */}
      {phase === 'summary' && (
        <motion.div
          key="phase-summary"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <CompletionStep
            record={record}
            onOpenBedtime={onSwitchToBedtime}
            onViewSummary={() => {
              sound.playStepTransition();
              setPhase('all-sections');
            }}
            onRestart={() => {
              sound.playStepTransition();
              setPhase('active');
              setCurrentStep('ears');
            }}
            isGuest={isGuest}
            onOpenAuthModal={onOpenAuthModal}
          />
        </motion.div>
      )}

      {/* 4. ALL SECTIONS REVIEW PHASE: Shown after completion or when explicitly inspected */}
      {phase === 'all-sections' && (
        <motion.div
          key="phase-all-sections"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Top Bar for Review Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#FFFFFF] border border-[#E8DFD0] p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playStepTransition();
                  setPhase('summary');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] text-xs font-semibold text-[#1E293B] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Summary</span>
              </button>

              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">All Sections Comprehensive Review</h2>
                <p className="text-[11px] text-[#64748B]">
                  Inspect and fine-tune your sensory audits, transactions, and reflections.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playStepTransition();
                  setPhase('active');
                  setCurrentStep('ears');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Step-by-Step Edit</span>
              </button>

              <button
                type="button"
                onClick={onSaveRecord}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] transition-colors shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>{isSaving ? 'Saving...' : 'Save Updates'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: All 5 Gateways */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E8DFD0] shadow-2xs">
            <GatewaysAuditSection
              gateways={record.gateways}
              onChangeGateway={onUpdateGateway}
            />
          </section>

          {/* Section 2: Energy Transactions Ledger */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E8DFD0] shadow-2xs">
            <EnergyLedgerSection
              transactions={record.transactions}
              onChangeTransactions={onUpdateTransactions}
            />
          </section>

          {/* Section 3: Istighfar & Reflection Note */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E8DFD0] shadow-2xs">
            <IstighfarSection
              istighfarCount={record.istighfarCount}
              istighfarTarget={record.istighfarTarget}
              reflectionNote={record.reflectionNote}
              onChangeIstighfar={onUpdateIstighfar}
              onChangeTarget={onUpdateTarget}
              onChangeNote={onUpdateNote}
              onSaveEntry={onSaveRecord}
              isSaving={isSaving}
            />
          </section>
        </motion.div>
      )}
    </div>
  );
};
