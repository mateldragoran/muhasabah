import React, { useState } from 'react';
import { EnergyTransaction } from '../../types/muhasabah';
import { DEFAULT_CREDITS, DEFAULT_DEBITS } from '../../data/defaultData';
import { Plus, Check, Trash2, ArrowUpRight, ArrowDownRight, Scale, Info } from 'lucide-react';

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
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Compute totals
  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.points, 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const netBalance = totalCredits - totalDebits;

  // Toggle pre-set item
  const togglePresetItem = (preset: { label: string; points: number; type: 'credit' | 'debit'; category?: string }) => {
    const existingIndex = transactions.findIndex((t) => t.label === preset.label);
    if (existingIndex >= 0) {
      // Remove
      const next = [...transactions];
      next.splice(existingIndex, 1);
      onChangeTransactions(next);
    } else {
      // Add
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

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    const parsedPts = Math.abs(parseInt(customPoints, 10) || 10);
    const finalPoints = customType === 'credit' ? parsedPts : -parsedPts;

    const newItem: EnergyTransaction = {
      id: `custom_${Date.now()}`,
      label: customLabel.trim(),
      points: finalPoints,
      type: customType,
      isCustom: true,
    };

    onChangeTransactions([...transactions, newItem]);
    setCustomLabel('');
    setShowCustomForm(false);
  };

  const handleRemoveItem = (id: string) => {
    onChangeTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E8DFD0] pb-2.5">
        <h2 className="font-cinzel text-base sm:text-lg font-semibold tracking-wide text-[#1E293B]">
          02. Energy Ledger
        </h2>
      </div>

      {/* Real-Time Energy Account Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-4 shadow-xs">
        {/* Credits */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#064E3B] border border-[#A7F3D0]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Spiritual Credits</div>
            <div className="text-lg font-bold text-[#064E3B] font-mono tabular-nums">+{totalCredits} pts</div>
          </div>
        </div>

        {/* Debits */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Energetic Debits</div>
            <div className="text-lg font-bold text-rose-600 font-mono tabular-nums">-{totalDebits} pts</div>
          </div>
        </div>

        {/* Net Status */}
        <div className="flex items-center gap-3 sm:border-l sm:border-[#E8DFD0] sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#064E3B] border border-[#E8DFD0]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Net Daily Balance</div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold font-mono tabular-nums ${
                netBalance > 0 ? 'text-[#064E3B]' : netBalance < 0 ? 'text-rose-600' : 'text-[#1E293B]'
              }`}>
                {netBalance > 0 ? `+${netBalance}` : netBalance}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                netBalance > 0
                  ? 'border-[#A7F3D0] text-[#064E3B] bg-[#ECFDF5]'
                  : netBalance < 0
                  ? 'border-rose-200 text-rose-700 bg-rose-50'
                  : 'border-[#E8DFD0] text-[#64748B] bg-[#FFFFFF]'
              }`}>
                {netBalance > 0 ? 'Surplus' : netBalance < 0 ? 'Deficit' : 'Neutral'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Pickers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credits Column */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-2 mb-3">
            <span className="font-cinzel text-xs font-semibold text-[#064E3B] tracking-wider uppercase">
              + Assets & Light Gained
            </span>
            <span className="text-[11px] text-[#64748B]">Tap to toggle</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_CREDITS.map((item) => {
              const isSelected = transactions.some((t) => t.label === item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => togglePresetItem(item)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors min-h-[44px] ${
                    isSelected
                      ? 'bg-[#ECFDF5] border-[#064E3B] text-[#1E293B] shadow-2xs'
                      : 'bg-[#FAF7F2] border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#E8DFD0]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="font-medium text-[#1E293B]">{item.label}</span>
                  </div>
                  <span className="font-mono text-[#064E3B] font-semibold text-[11px] shrink-0">
                    +{item.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Debits Column */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-2 mb-3">
            <span className="font-cinzel text-xs font-semibold text-rose-700 tracking-wider uppercase">
              - Energy Leaks & Drains
            </span>
            <span className="text-[11px] text-[#64748B]">Tap to record</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_DEBITS.map((item) => {
              const isSelected = transactions.some((t) => t.label === item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => togglePresetItem(item)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors min-h-[44px] ${
                    isSelected
                      ? 'bg-rose-50 border-rose-400 text-[#1E293B] shadow-2xs'
                      : 'bg-[#FAF7F2] border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-[#E8DFD0]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="font-medium text-[#1E293B]">{item.label}</span>
                  </div>
                  <span className="font-mono text-rose-600 font-semibold text-[11px] shrink-0">
                    {item.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Transaction Form / Active Custom Items */}
      <div className="rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1E293B]">
            Recorded Custom Actions ({transactions.filter((t) => t.isCustom).length})
          </span>
          <button
            type="button"
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="flex items-center gap-1 text-xs text-[#064E3B] font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCustomForm ? 'Cancel' : 'Add custom specific event'}</span>
          </button>
        </div>

        {showCustomForm && (
          <form onSubmit={handleAddCustom} className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E8DFD0]">
            <input
              type="text"
              placeholder="Action label (e.g. Fed stray animal, Gossiped with colleague)..."
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-3 py-2 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as 'credit' | 'debit')}
                className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-2.5 py-2 text-xs text-[#1E293B] focus:border-[#064E3B] focus:outline-none"
              >
                <option value="credit">+ Credit</option>
                <option value="debit">- Debit</option>
              </select>
              <input
                type="number"
                placeholder="Pts"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="w-16 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-2 py-2 text-xs text-[#1E293B] font-mono focus:border-[#064E3B] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#043B2C] transition-colors"
            >
              Add Action
            </button>
          </form>
        )}

        {/* Custom items chips */}
        {transactions.filter((t) => t.isCustom).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {transactions.filter((t) => t.isCustom).map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${
                  tx.type === 'credit'
                    ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#064E3B]'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                <span>{tx.label}</span>
                <span className="font-mono font-bold">({tx.points > 0 ? `+${tx.points}` : tx.points})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(tx.id)}
                  className="ml-1 text-[#64748B] hover:text-[#1E293B]"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
