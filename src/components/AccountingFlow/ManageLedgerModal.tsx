import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw, Sparkles, AlertTriangle, Check, SlidersHorizontal, Tag } from 'lucide-react';
import { LedgerOption } from '../../types/muhasabah';
import { storage } from '../../services/storageService';
import { INITIAL_LEDGER_OPTIONS } from '../../data/defaultData';
import { sound } from '../../services/soundService';

interface ManageLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CREDIT_CATEGORIES = ['Worship', 'Remembrance', 'Praise', 'Presence', 'Character', 'Service', 'Charity'];
const COMMON_DEBIT_CATEGORIES = ['Nafs', 'Ego', 'Fire', 'Tongue', 'Eyes', 'Ears', 'Neglect', 'Stomach'];

export const ManageLedgerModal: React.FC<ManageLedgerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit');
  const [options, setOptions] = useState<LedgerOption[]>(() => storage.getUserLedgerOptions());
  
  // New item form state
  const [newLabel, setNewLabel] = useState('');
  const [newPoints, setNewPoints] = useState('25');
  const [newCategory, setNewCategory] = useState('Worship');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Subscribe to storage updates
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setOptions(storage.getUserLedgerOptions());
    });
    return unsubscribe;
  }, []);

  // Update default category when switching tabs
  useEffect(() => {
    if (activeTab === 'credit') {
      setNewCategory('Worship');
      setNewPoints('25');
    } else {
      setNewCategory('Nafs');
      setNewPoints('30');
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const currentTabOptions = options.filter((o) => o.type === activeTab);
  const defaultItemsForTab = INITIAL_LEDGER_OPTIONS.filter((o) => o.type === activeTab);
  const missingDefaultCount = defaultItemsForTab.filter(
    (def) => !options.some((o) => o.label.toLowerCase() === def.label.toLowerCase())
  ).length;

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsSubmitting(true);
    sound.playBeadChime();
    const pts = Math.abs(parseInt(newPoints, 10) || 10);
    const finalPoints = activeTab === 'debit' ? -pts : pts;

    await storage.addLedgerOption({
      type: activeTab,
      label: newLabel.trim(),
      points: finalPoints,
      category: newCategory.trim() || (activeTab === 'credit' ? 'Remembrance' : 'Ego'),
    });

    setNewLabel('');
    setIsSubmitting(false);
    setStatusMessage(`Added "${newLabel.trim()}" to permanent options`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = async (id: string, label: string) => {
    sound.playBeadChime();
    await storage.deleteLedgerOption(id);
    setStatusMessage(`Removed "${label}"`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Restore all default Sunnah options? Your custom additions will be kept.')) {
      sound.playSealChime();
      await storage.resetLedgerOptionsToDefault();
      setStatusMessage('Standard Sunnah options restored');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const quickCreditPoints = [15, 25, 30, 40, 50, 100];
  const quickDebitPoints = [15, 20, 25, 35, 40, 50];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customize Energy Ledger Options"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] rounded-3xl border border-white/[0.1] bg-[#111827] shadow-2xl relative text-left text-[#F9FAFB] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sacred hairline accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-amber-400/40" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0B1120]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#10B981]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#F9FAFB] tracking-wide">
                Customize Energy Ledger
              </h2>
              <p className="text-[11px] text-[#9CA3AF]">
                Add your personal habits or delete options to tailor your daily audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Toast */}
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-[#10B981] flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Tab Selector: Light Deeds vs Energy Leaks */}
          <div className="grid grid-cols-2 gap-2 bg-[#0B1120] p-1 rounded-2xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                setActiveTab('credit');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'credit'
                  ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white shadow-md'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Light Deeds (+Credits)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                setActiveTab('debit');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'debit'
                  ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300 shadow-md'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Energy Leaks (-Debits)</span>
            </button>
          </div>

          {/* Add New Habit Form Card */}
          <form
            onSubmit={handleAddOption}
            className="p-3.5 rounded-2xl bg-[#0B1120]/70 border border-white/[0.08] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F9FAFB] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Add New Permanent {activeTab === 'credit' ? 'Light Deed' : 'Energy Leak'}</span>
              </span>
              <span className="text-[10px] text-[#9CA3AF]">Saves to your account</span>
            </div>

            {/* Label input */}
            <input
              type="text"
              required
              placeholder={
                activeTab === 'credit'
                  ? 'E.g. Tahajjud prayer, read 1 Juz Quran, fasted Monday...'
                  : 'E.g. Late night snacking, vaping slip, impatience with children...'
              }
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none"
            />

            {/* Category selection */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <Tag className="w-3 h-3 text-[#10B981]" />
                <span>Category Tag:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(activeTab === 'credit' ? COMMON_CREDIT_CATEGORIES : COMMON_DEBIT_CATEGORIES).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        newCategory === cat
                          ? 'bg-emerald-500/25 border border-emerald-500/50 text-[#10B981]'
                          : 'bg-white/[0.04] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Points Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-[#9CA3AF] shrink-0">Points:</span>
              <div className="flex flex-wrap gap-1">
                {(activeTab === 'credit' ? quickCreditPoints : quickDebitPoints).map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setNewPoints(pts.toString())}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      parseInt(newPoints, 10) === pts
                        ? activeTab === 'credit'
                          ? 'bg-[#10B981] text-[#0B1120]'
                          : 'bg-rose-500 text-white'
                        : 'bg-white/[0.05] text-[#9CA3AF] hover:text-[#F9FAFB]'
                    }`}
                  >
                    {activeTab === 'credit' ? `+${pts}` : `-${pts}`}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                max="500"
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                className="w-16 ml-auto rounded-lg border border-white/[0.08] bg-[#1F2937]/50 p-1 text-center text-xs font-mono font-bold text-[#F9FAFB] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newLabel.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] hover:brightness-110 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              Add to Permanent Options
            </button>
          </form>

          {/* Current Options List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] px-1">
              <span className="font-mono uppercase tracking-wider text-[10px] text-[#F9FAFB] font-semibold">
                Active {activeTab === 'credit' ? 'Light Deeds' : 'Energy Leaks'} ({currentTabOptions.length})
              </span>
              <span className="text-[10px] text-[#9CA3AF]">Click trash to delete any item</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {currentTabOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-[#0B1120]/50 hover:bg-[#0B1120]/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        opt.isDefault
                          ? 'bg-white/[0.06] text-[#9CA3AF]'
                          : 'bg-emerald-500/20 text-[#10B981] border border-emerald-500/30'
                      }`}
                    >
                      {opt.isDefault ? 'Standard' : 'Custom'}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-medium text-[#F9FAFB] block truncate">
                        {opt.label}
                      </span>
                      {opt.category && (
                        <span className="text-[10px] text-[#6B7280] block truncate">
                          {opt.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold ${
                        opt.type === 'credit' ? 'text-[#10B981]' : 'text-rose-400'
                      }`}
                    >
                      {opt.points > 0 ? `+${opt.points}` : opt.points}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(opt.id, opt.label)}
                      title={`Delete "${opt.label}"`}
                      className="p-1 rounded-lg text-[#9CA3AF] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Defaults Banner & Restore Button */}
          {missingDefaultCount > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-amber-200">
                <span>{missingDefaultCount} standard {activeTab} option(s) deleted.</span>
              </div>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Standard Items</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0B1120]/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] hover:brightness-110 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
