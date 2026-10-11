import React, { useState, useMemo } from 'react';
import { MuhasabaRecord, GatewayType } from '../../types/muhasabah';
import { storage } from '../../services/storageService';
import { calculateStreakStats } from '../../services/streakService';
import { GATEWAY_METADATA } from '../../data/defaultData';
import { AuraRadarChart } from './AuraRadarChart';
import { EnergyWaveformChart } from './EnergyWaveformChart';
import { NumericalMilestones } from './NumericalMilestones';
import { Download, Upload, Trash2, Calendar, Scale, Compass, Activity, ChevronRight, UserPlus } from 'lucide-react';

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
  const [activeViz, setActiveViz] = useState<'both' | 'waveform' | 'radar'>('both');
  const [importStatus, setImportStatus] = useState<string | null>(null);

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
    <div className="mx-auto max-w-4xl space-y-6 py-2">
      {/* Guest Mode Banner */}
      {isGuest && onOpenAuthModal && (
        <div className="rounded-2xl border border-[#C5A059]/40 bg-[#FDF8ED] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-[#B88728] shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#1E293B]">
                Viewing as Guest
              </div>
              <div className="text-[11px] text-[#64748B]">
                Sign in to save your history permanently across devices.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#064E3B] text-xs font-semibold text-white hover:bg-[#043B2C] transition-colors shrink-0 self-start sm:self-auto"
          >
            Sign In / Create Account
          </button>
        </div>
      )}

      {/* Overview Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
              <Calendar className="w-5 h-5 text-[#064E3B]" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
                Spiritual History
              </h2>
              <p className="text-xs text-[#64748B]">
                Daily energy balance & vigilance trends
              </p>
            </div>
          </div>

          {/* Viz Toggle */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0] p-1">
            <button
              onClick={() => setActiveViz('both')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeViz === 'both' ? 'bg-[#064E3B] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              All Visuals
            </button>
            <button
              onClick={() => setActiveViz('waveform')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeViz === 'waveform' ? 'bg-[#064E3B] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Waveform
            </button>
            <button
              onClick={() => setActiveViz('radar')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeViz === 'radar' ? 'bg-[#064E3B] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Senses Radar
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Practice Milestones & Consistency */}
      <NumericalMilestones stats={streakStats} />

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeViz === 'both' || activeViz === 'waveform') && (
          <div className={`glass-card rounded-2xl p-6 space-y-4 bg-[#FFFFFF] border border-[#E8DFD0] ${activeViz === 'waveform' ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#064E3B]" />
                <span className="font-cinzel text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                  Daily Energy Trajectory
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">Recent Spline</span>
            </div>
            <EnergyWaveformChart records={records} />
          </div>
        )}

        {(activeViz === 'both' || activeViz === 'radar') && (
          <div className={`glass-card rounded-2xl p-6 space-y-4 bg-[#FFFFFF] border border-[#E8DFD0] ${activeViz === 'radar' ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#064E3B]" />
                <span className="font-cinzel text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                  5 Senses Balance
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">Vigilance Radar</span>
            </div>
            <AuraRadarChart insights={insights} />
          </div>
        )}
      </div>

      {/* 14-Day Breakdown */}
      <div className="glass-card rounded-2xl p-6 space-y-4 bg-[#FFFFFF] border border-[#E8DFD0]">
        <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
          <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
            14-Day Senses Summary
          </span>
          <span className="text-xs text-[#64748B]">Lapses identified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {insights.map((item: { gateway: GatewayType; compromisedCount: number; topEnemy: string }) => {
            const info = GATEWAY_METADATA[item.gateway];
            return (
              <div
                key={item.gateway}
                className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-3 text-center space-y-1 hover:border-[#064E3B] transition-colors"
              >
                <div className="text-xs font-semibold text-[#1E293B]">
                  {info.title}
                </div>
                <div className="font-mono text-xl font-bold text-[#064E3B] tabular-nums">
                  {item.compromisedCount}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  lapses recorded
                </div>
                {item.topEnemy !== 'None' && (
                  <div className="text-[9px] text-rose-600 font-mono mt-1 border-t border-[#E8DFD0] pt-1 font-semibold">
                    Root: {item.topEnemy}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Records List */}
      <div className="glass-card rounded-2xl p-6 space-y-3 bg-[#FFFFFF] border border-[#E8DFD0]">
        <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
          <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
            Recorded Days ({records.length})
          </span>
          <span className="text-[11px] text-[#64748B]">Tap day to inspect</span>
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No records logged yet. Begin your first accounting entry in the Accounting tab!
          </div>
        ) : (
          <div className="divide-y divide-[#E8DFD0]">
            {records.map((rec) => {
              const isSelected = rec.date === selectedDate;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onSelectDate(rec.date)}
                  className={`w-full flex items-center justify-between py-3.5 px-3 rounded-xl transition-all text-left min-h-[48px] ${
                    isSelected
                      ? 'bg-[#ECFDF5] border border-[#064E3B] text-[#1E293B]'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs font-bold text-[#1E293B]">
                      {rec.date}
                    </div>
                    {rec.hijriDate && (
                      <span className="text-[11px] text-[#064E3B] font-medium hidden sm:inline font-mono">
                        · {rec.hijriDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#64748B]" />
                      <span
                        className={`text-xs font-mono font-bold tabular-nums ${
                          rec.netEnergy > 0
                            ? 'text-[#064E3B]'
                            : rec.netEnergy < 0
                            ? 'text-rose-600'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {rec.netEnergy > 0 ? `+${rec.netEnergy}` : rec.netEnergy} pts
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B] font-mono hidden sm:inline">
                      {rec.istighfarCount} Istighfar
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Export / Backup */}
      <div className="glass-card rounded-2xl p-5 space-y-2.5 bg-[#FFFFFF] border border-[#E8DFD0]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-[#064E3B] font-semibold uppercase block">
            Data Backup & Export
          </span>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#064E3B] text-xs text-[#064E3B]">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E293B] hover:bg-[#FFFFFF] transition-colors min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E293B] hover:bg-[#FFFFFF] transition-colors cursor-pointer min-h-[40px]">
            <Upload className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors ml-auto min-h-[40px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
