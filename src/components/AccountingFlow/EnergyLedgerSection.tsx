import React, { useState, useEffect } from 'react';
import { EnergyTransaction, LedgerOption } from '../../types/muhasabah';
import { storage } from '../../services/storageService';
import { Plus, Check, Trash2, Scale, SlidersHorizontal } from 'lucide-react';
import { ManageLedgerModal } from './ManageLedgerModal';

interface EnergyLedgerSectionProps {
  transactions: EnergyTransaction[];
  onChangeTransactions: (transactions: EnergyTransaction[]) => void;
}

export const EnergyLedgerSection: React.FC<EnergyLedgerSectionProps> = ({
  transactions,
  onChangeTransactions,
}) => {
  const [customLabel, setCustomLabel] = useState('');
  const [customPoints, setCustomPoints] = useState('20');
  const [customType, setCustomType] = useState<'credit' | 'debit'>('credit');
  const [saveAsPermanent, setSaveAsPermanent] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>(() => storage.getUserLedgerOptions());

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setLedgerOptions(storage.getUserLedgerOptions());
    });
    return unsubscribe;
  }, []);

  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.points, 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const netBalance = totalCredits - totalDebits;

  const togglePresetItem = (preset: { label: string; points: number; type: 'credit' | 'debit'; category?: string }) => {
    const existingIndex = transactions.findIndex((t) => t.label === preset.label);
    if (existingIndex >= 0) {
      const next = [...transactions];
      next.splice(existingIndex, 1);
      onChangeTransactions(next);
    } else {
      const newItem: EnergyTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label: preset.label,
        points: preset.points,
        type: preset.type,
        category: preset.category,
      };
      onChangeTransactions([...transactions, newItem]);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    const parsedPts = Math.abs(parseInt(customPoints, 10) || 10);
    const finalPoints = customType === 'credit' ? parsedPts : -parsedPts;

    if (saveAsPermanent) {
      await storage.addLedgerOption({
        type: customType,
        label: customLabel.trim(),
        points: finalPoints,
        category: customType === 'credit' ? 'Remembrance' : 'Ego',
      });
    }

    const newItem: EnergyTransaction = {
      id: `custom_${Date.now()}`,
      label: customLabel.trim(),
      points: finalPoints,
      type: customType,
      isCustom: !saveAsPermanent,
    };

    onChangeTransactions([...transactions, newItem]);
    setCustomLabel('');
    setShowCustomForm(false);
  };

  const currentPresets = ledgerOptions.filter((opt) => opt.type === activeTab);
  const currentCustoms = transactions.filter((t) => t.isCustom && t.type === activeTab);

  const creditOptionsCount = ledgerOptions.filter((o) => o.type === 'credit').length;
  const debitOptionsCount = ledgerOptions.filter((o) => o.type === 'debit').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#F9FAFB] uppercase tracking-wider font-mono">
            Section 2: Spiritual Energy Ledger
          </h3>
          <p className="text-xs text-[#9CA3AF]">Reconcile lights earned against energy leaked</p>
        </div>

        <button
          type="button"
          onClick={() => setIsManageModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-[#10B981] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          title="Add personal habits or delete options"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>

      {/* Real-Time Balance Meter */}
      <div className="p-3.5 rounded-2xl bg-[#0B1120]/70 border border-white/[0.06] grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Light Generated</span>
          <span className="text-base font-bold font-mono text-[#10B981]">+{totalCredits}</span>
        </div>
        <div className="border-x border-white/[0.08] px-1">
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Energy Leaked</span>
          <span className="text-base font-bold font-mono text-rose-400">-{totalDebits}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Net Balance</span>
          <span className={`text-base font-bold font-mono ${netBalance >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
            {netBalance >= 0 ? `+${netBalance}` : netBalance}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#1F2937]/50 p-1 rounded-2xl border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab('credit')}
          className={`py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'credit'
              ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white shadow-xs'
              : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          + Spiritual Light ({creditOptionsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('debit')}
          className={`py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'debit'
              ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300 shadow-xs'
              : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          - Energy Leaks ({debitOptionsCount})
        </button>
      </div>

      {/* Presets List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] px-1 pb-0.5">
          <span className="font-semibold uppercase tracking-wider text-[#F9FAFB] font-mono">
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
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isChecked
                  ? activeTab === 'credit'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-[#F9FAFB]'
                    : 'bg-rose-500/15 border-rose-500/40 text-[#F9FAFB]'
                  : 'bg-[#1F2937]/30 border-white/[0.06] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isChecked
                      ? activeTab === 'credit'
                        ? 'bg-[#10B981] border-[#10B981] text-[#0B1120]'
                        : 'bg-rose-500 border-rose-500 text-white'
                      : 'border-white/20'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium truncate">{preset.label}</span>
              </div>
              <span className={`text-xs font-mono font-bold shrink-0 pl-2 ${activeTab === 'credit' ? 'text-[#10B981]' : 'text-rose-400'}`}>
                {preset.points > 0 ? `+${preset.points}` : preset.points}
              </span>
            </button>
          );
        })}

        {currentCustoms.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-[#1F2937]/50 text-[#F9FAFB]"
          >
            <span className="text-xs font-medium truncate">{tx.label}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-mono font-bold ${tx.points > 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                {tx.points > 0 ? `+${tx.points}` : tx.points}
              </span>
              <button
                type="button"
                onClick={() => onChangeTransactions(transactions.filter((t) => t.id !== tx.id))}
                className="p-1 text-[#9CA3AF] hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom item button */}
      <div className="pt-1 border-t border-white/[0.08]">
        {!showCustomForm ? (
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add custom action</span>
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="space-y-2 p-3 rounded-xl bg-[#0B1120]/70 border border-white/[0.08]">
            <input
              type="text"
              placeholder="Action name..."
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#1F2937]/50 p-2 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as 'credit' | 'debit')}
                className="rounded-lg border border-white/[0.08] bg-[#1F2937]/50 p-1.5 text-xs text-[#F9FAFB]"
              >
                <option value="credit">+ Light</option>
                <option value="debit">- Leak</option>
              </select>
              <input
                type="number"
                placeholder="Pts"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="w-20 rounded-lg border border-white/[0.08] bg-[#1F2937]/50 p-1.5 text-xs text-[#F9FAFB]"
              />
              <button type="submit" className="flex-1 rounded-lg bg-emerald-600 text-xs font-semibold text-white">
                Add
              </button>
              <button type="button" onClick={() => setShowCustomForm(false)} className="text-xs text-[#9CA3AF] px-2">
                Cancel
              </button>
            </div>

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

      <ManageLedgerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  );
};
