import React, { useState } from 'react';
import { MuhasabaRecord, GatewayType, GatewayAudit, EnergyTransaction, PropheticConnectionState } from '../../types/muhasabah';
import { JourneyStep } from './JourneyStepper';
import { StickyCompactStepper } from './StickyCompactStepper';
import { IntentionLandingCard } from './IntentionLandingCard';
import { GatewayCardStep } from './GatewayCardStep';
import { PropheticConnectionStep } from './PropheticConnectionStep';
import { EnergyLedgerStep } from './EnergyLedgerStep';
import { IstighfarStep } from './IstighfarStep';
import { CompletionStep } from './CompletionStep';
import { GatewaysAuditSection } from './GatewaysAuditSection';
import { EnergyLedgerSection } from './EnergyLedgerSection';
import { IstighfarSection } from './IstighfarSection';
import { sound } from '../../services/soundService';
import { ArrowLeft, CheckCircle2, RotateCcw, HeartHandshake, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AccountingJourneyProps {
  record: MuhasabaRecord;
  selectedDate?: string;
  onUpdateGateway: (gateway: GatewayType, updated: Partial<GatewayAudit>) => void;
  onUpdatePropheticConnection: (state: PropheticConnectionState, note: string) => void;
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
  onUpdatePropheticConnection,
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
  // Phases: 'landing' -> 'active' -> 'summary' -> 'all-sections'
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
      setCurrentStep('prophetic_connection');
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
      {/* 1. DEFAULT LANDING PHASE */}
      {phase === 'landing' && (
        <motion.div
          key="phase-landing"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
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

      {/* 2. ACTIVE STEP-BY-STEP ACCOUNTING PHASE */}
      {phase === 'active' && (
        <div className="space-y-6">
          {/* Sticky Progress Bar */}
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
            {/* Step-by-Step Gateway Audit Cards (Ears -> Eyes -> Tongue -> Heart -> Limbs) */}
            {GATEWAY_ORDER.map((gw, idx) => {
              if (currentStep !== gw) return null;
              return (
                <motion.div
                  key={`step-${gw}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
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

            {/* Step 6: Prophetic Connection (Rabita ash-Sharifa) */}
            {currentStep === 'prophetic_connection' && (
              <motion.div
                key="step-prophetic-connection"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <PropheticConnectionStep
                  connectionState={record.propheticConnection || null}
                  note={record.propheticConnectionNote || ''}
                  onChangeConnection={(state) =>
                    onUpdatePropheticConnection(state, record.propheticConnectionNote || '')
                  }
                  onChangeNote={(note) =>
                    onUpdatePropheticConnection(record.propheticConnection || null, note)
                  }
                  onNext={() => {
                    sound.playStepTransition();
                    markStepDone('prophetic_connection');
                    setCurrentStep('ledger');
                  }}
                  onPrev={() => {
                    sound.playStepTransition();
                    setCurrentStep('body');
                  }}
                />
              </motion.div>
            )}

            {/* Step 7: Energy Ledger */}
            {currentStep === 'ledger' && (
              <motion.div
                key="step-ledger"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
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
                    setCurrentStep('prophetic_connection');
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
                transition={{ duration: 0.2 }}
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

      {/* 3. COMPLETION SUMMARY PHASE */}
      {phase === 'summary' && (
        <motion.div
          key="phase-summary"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
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
              setCompletedSteps(new Set());
              setCurrentStep('ears');
              setPhase('active');
            }}
            isGuest={isGuest}
            onOpenAuthModal={onOpenAuthModal}
          />
        </motion.div>
      )}

      {/* 4. EXPANDED ALL SECTIONS INSPECTION VIEW */}
      {phase === 'all-sections' && (
        <motion.div
          key="phase-all-sections"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <button
              onClick={() => {
                sound.playStepTransition();
                setPhase('landing');
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#10B981]" />
              <span>Back to Overview</span>
            </button>
            <span className="text-xs font-mono text-[#F59E0B]">
              Comprehensive Inspection
            </span>
          </div>

          <GatewaysAuditSection
            gateways={record.gateways}
            onChangeGateway={onUpdateGateway}
          />

          {/* Section: Prophetic Connection (Rabita ash-Sharifa) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1120]/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F9FAFB] uppercase tracking-wider font-mono flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#10B981]" />
                  Section 2: Prophetic Connection (Rabita)
                </h3>
                <p className="text-xs text-[#9CA3AF]">Spiritual bond & alignment with Sayyidina Muhammad ﷺ</p>
              </div>
              <span className="text-xs text-[#10B981] font-arabic hidden sm:inline font-semibold">
                الرابطة والمحبة الشريفة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playBeadChime();
                  onUpdatePropheticConnection('stronger', record.propheticConnectionNote || '');
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  record.propheticConnection === 'stronger'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                }`}
              >
                <span>Yes — Stronger Connection</span>
                {record.propheticConnection === 'stronger' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playBeadChime();
                  onUpdatePropheticConnection('weaker', record.propheticConnectionNote || '');
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  record.propheticConnection === 'weaker'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                }`}
              >
                <span>No — Weaker Connection</span>
                {record.propheticConnection === 'weaker' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            </div>

            <textarea
              rows={2}
              value={record.propheticConnectionNote || ''}
              onChange={(e) => onUpdatePropheticConnection(record.propheticConnection || null, e.target.value)}
              placeholder="Reflect on your Prophetic connection today (optional)..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <EnergyLedgerSection
            transactions={record.transactions}
            onChangeTransactions={onUpdateTransactions}
          />

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

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                sound.playSealChime();
                onSaveRecord();
                setPhase('summary');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Seal Accounting</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
