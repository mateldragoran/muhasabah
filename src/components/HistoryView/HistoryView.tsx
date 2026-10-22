import React, { useState, useMemo } from 'react';
import { MuhasabaRecord, GatewayType } from '../../types/muhasabah';
import { storage } from '../../services/storageService';
import { calculateStreakStats } from '../../services/streakService';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { AuraRadarChart } from './AuraRadarChart';
import { EnergyWaveformChart } from './EnergyWaveformChart';
import { PropheticConnectionTrend } from './PropheticConnectionTrend';
import { NumericalMilestones } from './NumericalMilestones';
import {
  Download,
  Upload,
  Trash2,
  Calendar,
  Scale,
  Compass,
  Activity,
  ChevronRight,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

interface HistoryViewProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
  isGuest?: boolean;
  onOpenAuthModal?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectDate,
  selectedDate,
  isGuest,
  onOpenAuthModal,
}) => {
  const [activeViz, setActiveViz] = useState<'both' | 'waveform' | 'radar' | 'prophetic'>('both');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const allRecordsMap = storage.getAllRecords();
  const records = useMemo(() => {
    return Object.values(allRecordsMap).sort((a, b) => b.date.localeCompare(a.date));
  }, [allRecordsMap]);

  const streakStats = useMemo(() => {
    return calculateStreakStats(allRecordsMap);
  }, [allRecordsMap]);

  const insights = useMemo(() => {
    return storage.compute14DayInsights();
  }, []);

  const handleExport = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `muhasabah_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importData(content);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} records.`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus(`Restore error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local records? This cannot be undone without a backup.')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-2 px-2">
      {/* Prominent Guest Sign-Up Callout */}
      {isGuest && onOpenAuthModal && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#064E3B]/40 via-[#111827] to-[#0B1120] p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          {/* Sacred ambient background glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-amber-400/40" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-[#F59E0B] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Guest Mode · Local Storage Only</span>
              </div>

              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#F9FAFB] tracking-wide">
                Sign Up to Save & Track Your Spiritual History
              </h3>

              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                You are currently exploring as a guest. To permanently track your nightly accounting history, preserve consistency streaks (<span className="text-amber-400 font-medium">Istiqamah</span>), and view long-term sensory vigilance across all your devices, please create a free account.
              </p>

              {/* Value propositions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[#D1D5DB]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Permanent Cloud History</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Multi-Device Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Consistency Streak Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Local Audits Kept On Signup</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="relative group flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#064E3B] to-[#10B981] hover:brightness-110 text-white text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/40 transition-all cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-emerald-100" />
                <span>Sign Up to Track History</span>
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-[11px] text-[#9CA3AF] text-center">
                Free & instant · 1-click confirmation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-950/40">
              <Calendar className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
                Spiritual History
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Nightly self-accounting journey, consistency & sensory vigilance
              </p>
            </div>
          </div>

          {/* Viz Toggle */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-[#0B1120]/70 border border-white/[0.08] p-1">
            <button
              onClick={() => setActiveViz('both')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeViz === 'both' ? 'bg-[#10B981] text-[#0B1120] font-bold shadow-xs' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              All Visuals
            </button>
            <button
              onClick={() => setActiveViz('prophetic')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeViz === 'prophetic' ? 'bg-[#10B981] text-[#0B1120] font-bold shadow-xs' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              Prophetic Bond
            </button>
            <button
              onClick={() => setActiveViz('waveform')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeViz === 'waveform' ? 'bg-[#10B981] text-[#0B1120] font-bold shadow-xs' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              Waveform
            </button>
            <button
              onClick={() => setActiveViz('radar')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeViz === 'radar' ? 'bg-[#10B981] text-[#0B1120] font-bold shadow-xs' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
            >
              Senses Radar
            </button>
          </div>
        </div>
      </div>

      {/* Card 1: Practice Milestones & Consistency Streak */}
      <NumericalMilestones stats={streakStats} />

      {/* Card 2 & 3: Visual Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prophetic Connection (Rabita ash-Sharifa) Trajectory */}
        {(activeViz === 'both' || activeViz === 'prophetic') && (
          <div className="glass-card rounded-2xl p-6 space-y-4 bg-[#111827]/70 border border-white/[0.08] shadow-xl md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#10B981]" />
                <span className="font-cinzel text-xs font-semibold tracking-wider text-[#F9FAFB] uppercase">
                  Prophetic Connection Trajectory (Rabita ash-Sharifa)
                </span>
              </div>
              <span className="text-[10px] text-[#9CA3AF] font-mono">14-Day Trajectory</span>
            </div>
            <PropheticConnectionTrend records={records} />
          </div>
        )}

        {(activeViz === 'both' || activeViz === 'waveform') && (
          <div className={`glass-card rounded-2xl p-6 space-y-4 bg-[#111827]/70 border border-white/[0.08] shadow-xl ${activeViz === 'waveform' ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#10B981]" />
                <span className="font-cinzel text-xs font-semibold tracking-wider text-[#F9FAFB] uppercase">
                  Daily Energy Trajectory
                </span>
              </div>
              <span className="text-[10px] text-[#9CA3AF] font-mono">14-Day Waveform</span>
            </div>
            <EnergyWaveformChart records={records} />
          </div>
        )}

        {(activeViz === 'both' || activeViz === 'radar') && (
          <div className={`glass-card rounded-2xl p-6 space-y-4 bg-[#111827]/70 border border-white/[0.08] shadow-xl ${activeViz === 'radar' ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-cinzel text-xs font-semibold tracking-wider text-[#F9FAFB] uppercase">
                  5 Gateways Health
                </span>
              </div>
              <span className="text-[10px] text-[#9CA3AF] font-mono">Vigilance Map</span>
            </div>
            <AuraRadarChart insights={insights} />
          </div>
        )}
      </div>

      {/* 14-Day Gateway Breakdown */}
      <div className="glass-card rounded-2xl p-6 space-y-4 bg-[#111827]/70 border border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <span className="text-[11px] font-mono tracking-wider text-[#10B981] font-semibold uppercase block">
            14-Day Lapses by Gateway
          </span>
          <span className="text-xs text-[#9CA3AF]">Frequent adversaries identified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {insights.map((item: { gateway: GatewayType; compromisedCount: number; topEnemy: string }) => {
            const info = GATEWAY_METADATA[item.gateway];
            return (
              <div
                key={item.gateway}
                className="rounded-xl border border-white/[0.06] bg-[#0B1120]/60 p-3 text-center space-y-1 hover:border-emerald-500/40 transition-colors"
              >
                <div className="text-xs font-semibold text-[#F9FAFB]">
                  {info.title}
                </div>
                <div className="font-mono text-xl font-bold text-[#10B981] tabular-nums">
                  {item.compromisedCount}
                </div>
                <div className="text-[10px] text-[#9CA3AF]">
                  lapses logged
                </div>
                {item.topEnemy !== 'None' && (
                  <div className="text-[9px] text-rose-400 font-mono mt-1 border-t border-white/[0.08] pt-1 font-semibold truncate">
                    Adversary: {item.topEnemy}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Daily Logs (Collapsible Accordion) */}
      <div className="glass-card rounded-2xl p-5 space-y-3 bg-[#111827]/70 border border-white/[0.08]">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider font-mono">
              Historical Day-by-Day Logs ({records.length})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <span>{showLogs ? 'Collapse' : 'Expand'}</span>
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLogs && (
          <div className="pt-2 border-t border-white/[0.08]">
            {records.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9CA3AF]">
                No records logged yet.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto pr-1">
                {records.map((rec) => {
                  const isSelected = rec.date === selectedDate;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => onSelectDate(rec.date)}
                      className={`w-full flex items-center justify-between py-3 px-2 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-[#F9FAFB]'
                          : 'hover:bg-white/[0.04] text-[#9CA3AF]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#F9FAFB]">
                            {rec.date}
                          </span>
                          {rec.hijriDate && (
                            <span className="text-[10px] text-[#10B981] font-mono hidden sm:inline">
                              · {rec.hijriDate}
                            </span>
                          )}
                          {rec.propheticConnection === 'stronger' && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✦ Stronger Bond
                            </span>
                          )}
                          {rec.propheticConnection === 'weaker' && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⚠ Weaker Bond
                            </span>
                          )}
                        </div>
                        {rec.propheticConnectionNote && (
                          <span className="text-[10px] text-[#9CA3AF] italic truncate max-w-xs sm:max-w-md pt-0.5">
                            "{rec.propheticConnectionNote}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            rec.netEnergy > 0
                              ? 'text-[#10B981]'
                              : rec.netEnergy < 0
                              ? 'text-rose-400'
                              : 'text-[#9CA3AF]'
                          }`}
                        >
                          {rec.netEnergy > 0 ? `+${rec.netEnergy}` : rec.netEnergy} pts
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export / Backup */}
      <div className="glass-card rounded-2xl p-5 space-y-2.5 bg-[#111827]/70 border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-[#10B981] font-semibold uppercase block">
            Data Backup & Portability
          </span>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-[#10B981]">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#1F2937]/50 px-3.5 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-white/[0.06] transition-colors min-h-[40px] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#1F2937]/50 px-3.5 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-white/[0.06] transition-colors cursor-pointer min-h-[40px]">
            <Upload className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors ml-auto min-h-[40px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
