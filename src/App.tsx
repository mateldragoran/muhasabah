import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, Navigation } from './components/Navigation';
import { AccountingJourney } from './components/AccountingFlow/AccountingJourney';
import { BedtimeArmorView } from './components/BedtimeMode/BedtimeArmorView';
import { HistoryView } from './components/HistoryView/HistoryView';
import { GuidanceView } from './components/GuidanceView/GuidanceView';
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { storage } from './services/storageService';
import { auth, AuthUser } from './services/authService';
import { calculateStreakStats } from './services/streakService';
import { MuhasabaRecord, BedtimeProtectionLog, GatewayType, GatewayAudit, EnergyTransaction, PropheticConnectionState } from './types/muhasabah';
import { formatSimpleDate } from './data/defaultData';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatSimpleDate(new Date()));
  const [activeTab, setActiveTab] = useState<NavTab>('accounting');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => auth.getCurrentUser());
  const [isSaving, setIsSaving] = useState(false);
  const [streakStats, setStreakStats] = useState(() => calculateStreakStats(storage.getAllRecords()));

  const refreshStreakStats = useCallback(() => {
    setStreakStats(calculateStreakStats(storage.getAllRecords()));
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = auth.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Active records for selected date
  const [currentRecord, setCurrentRecord] = useState<MuhasabaRecord>(() => storage.getRecordByDate(selectedDate));
  const [currentBedtime, setCurrentBedtime] = useState<BedtimeProtectionLog>(() => storage.getBedtimeLogByDate(selectedDate));

  // Reload records whenever selectedDate changes or storage updates (e.g. cloud sync completes)
  useEffect(() => {
    setCurrentRecord(storage.getRecordByDate(selectedDate));
    setCurrentBedtime(storage.getBedtimeLogByDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const unsubscribeStorage = storage.subscribe(() => {
      setCurrentRecord(storage.getRecordByDate(selectedDate));
      setCurrentBedtime(storage.getBedtimeLogByDate(selectedDate));
      refreshStreakStats();
    });
    return unsubscribeStorage;
  }, [selectedDate, refreshStreakStats]);

  // Handler for updating gateway audit
  const handleGatewayChange = useCallback((gateway: GatewayType, updated: Partial<GatewayAudit>) => {
    setCurrentRecord((prev) => {
      const nextGateways = {
        ...prev.gateways,
        [gateway]: {
          ...prev.gateways[gateway],
          ...updated,
        },
      };
      const updatedRecord = { ...prev, gateways: nextGateways };
      storage.saveRecord(updatedRecord);
      refreshStreakStats();
      return updatedRecord;
    });
  }, [refreshStreakStats]);

  // Handler for updating energy transactions
  const handleTransactionsChange = useCallback((transactions: EnergyTransaction[]) => {
    setCurrentRecord((prev) => {
      const updatedRecord = { ...prev, transactions };
      storage.saveRecord(updatedRecord);
      refreshStreakStats();
      return updatedRecord;
    });
  }, [refreshStreakStats]);

  // Handler for updating Istighfar
  const handleIstighfarChange = useCallback((count: number) => {
    setCurrentRecord((prev) => {
      const updatedRecord = { ...prev, istighfarCount: count };
      storage.saveRecord(updatedRecord);
      refreshStreakStats();
      return updatedRecord;
    });
  }, [refreshStreakStats]);

  const handleTargetChange = useCallback((target: number) => {
    setCurrentRecord((prev) => {
      const updatedRecord = { ...prev, istighfarTarget: target };
      storage.saveRecord(updatedRecord);
      return updatedRecord;
    });
  }, []);

  const handlePropheticConnectionChange = useCallback(
    (state: PropheticConnectionState, note: string) => {
      setCurrentRecord((prev) => {
        const updatedRecord = {
          ...prev,
          propheticConnection: state,
          propheticConnectionNote: note,
        };
        storage.saveRecord(updatedRecord);
        return updatedRecord;
      });
    },
    []
  );

  const handleNoteChange = useCallback((note: string) => {
    setCurrentRecord((prev) => {
      const updatedRecord = { ...prev, reflectionNote: note };
      storage.saveRecord(updatedRecord);
      refreshStreakStats();
      return updatedRecord;
    });
  }, [refreshStreakStats]);

  // Explicit Save action
  const handleSaveEntry = async () => {
    setIsSaving(true);
    const completedRecord: MuhasabaRecord = {
      ...currentRecord,
      isCompleted: true,
      completedAt: currentRecord.completedAt || new Date().toISOString(),
    };
    setCurrentRecord(completedRecord);
    await storage.saveRecord(completedRecord);
    refreshStreakStats();
    setIsSaving(false);
  };

  // Bedtime updates
  const handleUpdateBedtime = useCallback((updated: Partial<BedtimeProtectionLog>) => {
    setCurrentBedtime((prev) => {
      const updatedLog = { ...prev, ...updated };
      storage.saveBedtimeLog(updatedLog);
      return updatedLog;
    });
  }, []);

  const handleSaveBedtime = async () => {
    await storage.saveBedtimeLog(currentBedtime);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F9FAFB] relative overflow-hidden">
      {/* Sacred Night Sky Ambient Light */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-amber-500/05 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-10 -right-48 w-[450px] h-[450px] bg-amber-500/08 blur-[130px]" />
      </div>

      {/* Navigation (Responsive Desktop Top Bar & Ergonomic Mobile Header / Bottom Bar) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        streakCount={streakStats.currentStreak}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 pb-28 md:pb-16 relative z-10">
        {activeTab === 'accounting' && (
          <AccountingJourney
            record={currentRecord}
            selectedDate={selectedDate}
            onUpdateGateway={handleGatewayChange}
            onUpdatePropheticConnection={handlePropheticConnectionChange}
            onUpdateTransactions={handleTransactionsChange}
            onUpdateIstighfar={handleIstighfarChange}
            onUpdateTarget={handleTargetChange}
            onUpdateNote={handleNoteChange}
            onSaveRecord={handleSaveEntry}
            onSwitchToBedtime={() => setActiveTab('bedtime')}
            isSaving={isSaving}
            isGuest={auth.isGuest()}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab 2: Decoupled Standalone Bedtime Mode */}
        {activeTab === 'bedtime' && (
          <BedtimeArmorView
            log={currentBedtime}
            onUpdateLog={handleUpdateBedtime}
            onSaveLog={handleSaveBedtime}
          />
        )}

        {/* Tab 3: History & Trends */}
        {activeTab === 'history' && (
          <HistoryView
            onSelectDate={(d) => {
              setSelectedDate(d);
              setActiveTab('accounting');
            }}
            selectedDate={selectedDate}
            isGuest={auth.isGuest()}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab 4: Teachings & Guidance */}
        {activeTab === 'guidance' && (
          <GuidanceView />
        )}
      </main>

      {/* Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Understated Dignified Footer - Desktop Only */}
      <footer className="hidden md:block border-t border-white/[0.08] bg-[#0B1120]/80 backdrop-blur-md py-4 text-center text-xs text-[#9CA3AF] relative z-10">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Muhasabah · Daily Self-Accounting
          </span>
          <span className="text-[11px] text-[#10B981] font-medium">
            Teachings of Shaykh Nurjan Mirahmadi (Q)
          </span>
        </div>
      </footer>
    </div>
  );
}
