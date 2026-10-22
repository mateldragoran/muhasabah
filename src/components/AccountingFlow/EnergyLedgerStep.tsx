import React, { useState, useEffect } from 'react';
import { EnergyTransaction, LedgerOption } from '../../types/muhasabah';
import { storage } from '../../services/storageService';
import { sound } from '../../services/soundService';
import { Plus, Check, Trash2, Scale, ArrowLeft, ArrowRight, Sparkles, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ManageLedgerModal } from './ManageLedgerModal';

interface EnergyLedgerStepProps {
  transactions: EnergyTransaction[];
  onChangeTransactions: (transactions: EnergyTransaction[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const EnergyLedgerStep: React.FC<EnergyLedgerStepProps> = ({
  transactions,
  onChangeTransactions,
  onNext,
  onPrev,
}) => {
  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit');
  const [customLabel, setCustomLabel] = useState('');
  const [customPoints, setCustomPoints] = useState('25');
  const [customType, setCustomType] = useState<'credit' | 'debit'>('credit');
  const [saveAsPermanent, setSaveAsPermanent] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>(() => storage.getUserLedgerOptions());

  // Subscribe to storage updates so customized items reflect immediately
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setLedgerOptions(storage.getUserLedgerOptions());
    });
    return unsubscribe;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        sound.playStepTransition();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        sound.playStepTransition();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev]);

  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.points, 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const netBalance = totalCredits - totalDebits;

  const togglePresetItem = (preset: { label: string; points: number; type: 'credit' | 'debit'; category?: string }) => {
    sound.playBeadChime();
    const existingIndex = transactions.findIndex((t) => t.label === preset.label);
    if (existingIndex >= 0) {
      const next = [...transactions];
      next.splice(existingIndex, 1);
      onChangeTransactions(next);
    } else {
      const next: EnergyTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: preset.type,
        label: preset.label,
        points: preset.type === 'debit' ? -Math.abs(preset.points) : Math.abs(preset.points),
        category: preset.category || (preset.type === 'credit' ? 'dhikr' : 'heedlessness'),
        isCustom: false,
      };
      onChangeTransactions([...transactions, next]);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    sound.playBeadChime();
    const pts = parseInt(customPoints, 10) || 10;
    const finalPts = customType === 'debit' ? -Math.abs(pts) : Math.abs(pts);

    if (saveAsPermanent) {
      await storage.addLedgerOption({
        type: customType,
        label: customLabel.trim(),
        points: finalPts,
        category: customType === 'credit' ? 'Remembrance' : 'Ego',
      });
    }

    const newTx: EnergyTransaction = {
      id: `custom_${Date.now()}`,
      type: customType,
      label: customLabel.trim(),
      points: finalPts,
      category: customType === 'credit' ? 'good_deed' : 'ego_lapse',
      isCustom: !saveAsPermanent,
    };

    onChangeTransactions([...transactions, newTx]);
    setCustomLabel('');
    setShowCustomForm(false);
  };

  const handleRemove = (id: string) => {
    sound.playBeadChime();
    onChangeTransactions(transactions.filter((t) => t.id !== id));
  };

  const currentPresets = ledgerOptions.filter((opt) => opt.type === activeTab);
  const currentCustoms = transactions.filter((t) => t.isCustom && t.type === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 relative z-10 gap-2">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-semibold uppercase block">
              Spiritual Balance Meter
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
              Energy Ledger
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playBeadChime();
                setIsManageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-[#10B981] transition-all cursor-pointer shadow-xs active:scale-95"
              title="Add personal habits or delete options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-950/40 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Real-Time Balance Meter */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0B1120]/70 p-4 text-center">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-mono">
                + Light
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-[#10B981] tabular-nums">
                +{totalCredits}
              </div>
            </div>

            <div className="border-x border-white/[0.08] px-1">
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-mono">
                - Leaks
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-rose-400 tabular-nums">
                -{totalDebits}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-mono">
                Net Mizan
              </div>
              <div
                className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
                  netBalance >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                }`}
              >
                {netBalance >= 0 ? `+${netBalance}` : netBalance}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Tab Split Toggle: [+ Light] vs [- Leaks] */}
        <div className="grid grid-cols-2 gap-2 bg-[#1F2937]/50 p-1 rounded-2xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              sound.playBeadChime();
              setActiveTab('credit');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'credit'
                ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white shadow-md shadow-emerald-950/40'
                : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Spiritual Light (+Credits)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playBeadChime();
              setActiveTab('debit');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'debit'
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300 shadow-md'
                : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Energy Leaks (-Debits)</span>
          </button>
        </div>

        {/* Transaction Rows List */}
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] px-1 pb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#F9FAFB] font-mono">
              {activeTab === 'credit' ? 'Light Deeds' : 'Energy Leaks'}
            </span>
          </div>
          {currentPresets.map((preset) => {
            const isChecked = transactions.some((t) => t.label === preset.label);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => togglePresetItem(preset)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all min-h-[48px] cursor-pointer ${
                  isChecked
                    ? activeTab === 'credit'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-[#F9FAFB] shadow-xs'
                      : 'bg-rose-500/15 border-rose-500/40 text-[#F9FAFB] shadow-xs'
                    : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? activeTab === 'credit'
                          ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]'
                          : 'bg-rose-500 border-rose-500 text-white'
                        : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-medium block truncate">
                      {preset.label}
                    </span>
                    {preset.category && (
                      <span className="text-[10px] text-[#6B7280] block truncate">
                        {preset.category}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono shrink-0 pl-2 ${
                    activeTab === 'credit' ? 'text-[#10B981]' : 'text-rose-400'
                  }`}
                >
                  {preset.points > 0 ? `+${preset.points}` : preset.points}
                </span>
              </button>
            );
          })}

          {/* User's Custom Transactions */}
          {currentCustoms.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-white/[0.08] bg-[#1F2937]/50 text-[#F9FAFB]"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-xs font-medium truncate">{tx.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-mono font-bold ${tx.points > 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(tx.id)}
                  className="p-1 text-[#9CA3AF] hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Custom Entry */}
        <div className="pt-1 border-t border-white/[0.08]">
          {!showCustomForm ? (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold hover:brightness-110 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add custom action</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-2.5 p-3 rounded-2xl bg-[#0B1120]/70 border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F9FAFB]">New Custom Entry</span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#F9FAFB]"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="E.g. Visited sick brother, read Surah Yasin..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as 'credit' | 'debit')}
                  className="rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2 text-xs text-[#F9FAFB] focus:outline-none"
                >
                  <option value="credit">+ Light (Credit)</option>
                  <option value="debit">- Leak (Debit)</option>
                </select>
                <input
                  type="number"
                  placeholder="Points"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  className="w-24 rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2 text-xs text-[#F9FAFB] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
                >
                  Save Entry
                </button>
              </div>

              {/* Permanent Option Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none text-[11px] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
                <input
                  type="checkbox"
                  checked={saveAsPermanent}
                  onChange={(e) => setSaveAsPermanent(e.target.checked)}
                  className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Save as permanent option in my ledger for future days</span>
              </label>
            </form>
          )}
        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              sound.playStepTransition();
              onPrev();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playStepTransition();
              onNext();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 active:scale-98 transition-all shadow-md shadow-emerald-950/40 min-h-[44px] cursor-pointer"
          >
            <span>Continue to Istighfar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customize Permanent Ledger Options Modal */}
      <ManageLedgerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </motion.div>
  );
};
