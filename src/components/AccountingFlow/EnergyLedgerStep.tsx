import React, { useState, useEffect } from 'react';
import { EnergyTransaction } from '../../types/muhasabah';
import { DEFAULT_CREDITS, DEFAULT_DEBITS } from '../../data/defaultData';
import { sound } from '../../services/soundService';
import { Plus, Check, Trash2, Scale, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [activeView, setActiveView] = useState<'both' | 'credits' | 'debits'>('both');
  const [customLabel, setCustomLabel] = useState('');
  const [customPoints, setCustomPoints] = useState('25');
  const [customType, setCustomType] = useState<'credit' | 'debit'>('credit');
  const [showCustomForm, setShowCustomForm] = useState(false);

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

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    sound.playBeadChime();
    const pts = parseInt(customPoints, 10) || 10;
    const newTx: EnergyTransaction = {
      id: `custom_${Date.now()}`,
      type: customType,
      label: customLabel.trim(),
      points: customType === 'debit' ? -Math.abs(pts) : Math.abs(pts),
      category: customType === 'credit' ? 'good_deed' : 'ego_lapse',
      isCustom: true,
    };

    onChangeTransactions([...transactions, newTx]);
    setCustomLabel('');
    setShowCustomForm(false);
  };

  const handleRemove = (id: string) => {
    sound.playBeadChime();
    onChangeTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl px-2 space-y-4"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3 relative z-10">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#064E3B] font-semibold uppercase block">
              Step 6 of 8
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
              Energy Ledger
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Real-Time Balance Hero Meter - Compact */}
        <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-4 text-center">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
                +Credits
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-[#064E3B] tabular-nums">
                +{totalCredits}
              </div>
            </div>

            <div className="border-x border-[#E8DFD0] px-1">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
                -Debits
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 tabular-nums">
                -{totalDebits}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
                Net Balance
              </div>
              <div
                className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
                  netBalance > 0 ? 'text-[#064E3B]' : netBalance < 0 ? 'text-rose-600' : 'text-[#1E293B]'
                }`}
              >
                {netBalance > 0 ? `+${netBalance}` : netBalance}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips & Custom Action */}
        <div className="flex items-center gap-1.5 border-b border-[#E8DFD0] pb-2.5">
          <button
            type="button"
            onClick={() => setActiveView('both')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
              activeView === 'both' ? 'bg-[#064E3B] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveView('credits')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
              activeView === 'credits' ? 'bg-[#064E3B] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            + Credits
          </button>
          <button
            type="button"
            onClick={() => setActiveView('debits')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
              activeView === 'debits' ? 'bg-rose-600 text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            - Debits
          </button>

          <button
            type="button"
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="ml-auto flex items-center gap-1 text-xs text-[#064E3B] font-medium hover:text-[#043B2C]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCustomForm ? 'Close' : 'Custom'}</span>
          </button>
        </div>

        {/* Custom Transaction Inserter */}
        {showCustomForm && (
          <form onSubmit={handleAddCustom} className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-3.5 space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Action..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="sm:col-span-2 rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:outline-none"
              />
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as 'credit' | 'debit')}
                className="rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] px-2 py-2 text-xs text-[#1E293B] focus:border-[#064E3B] focus:outline-none"
              >
                <option value="credit">+ Credit</option>
                <option value="debit">- Debit</option>
              </select>
              <input
                type="number"
                placeholder="Pts"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1E293B] font-mono focus:border-[#064E3B] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-[#064E3B] text-xs font-semibold text-white hover:bg-[#043B2C] transition-colors"
            >
              Add Action
            </button>
          </form>
        )}

        {/* Preset Items Grid - Compact Chips */}
        <div className="space-y-3.5">
          {(activeView === 'both' || activeView === 'credits') && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono tracking-wider text-[#064E3B] uppercase font-semibold">
                Spiritual Assets (+Light)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_CREDITS.map((item) => {
                  const isChecked = transactions.some((t) => t.label === item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => togglePresetItem(item)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all min-h-[46px] ${
                        isChecked
                          ? 'border-[#064E3B] bg-[#ECFDF5] text-[#1E293B] shadow-2xs'
                          : 'border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B] hover:bg-[#FAF7F2] hover:text-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border shrink-0 ${
                            isChecked ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium text-[#1E293B] leading-snug">{item.label}</span>
                      </div>
                      <span className="font-mono text-[#064E3B] font-semibold text-[11px] shrink-0 ml-1">
                        +{item.points}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(activeView === 'both' || activeView === 'debits') && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-mono tracking-wider text-rose-700 uppercase font-semibold">
                Spiritual Drains (-Leaks)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_DEBITS.map((item) => {
                  const isChecked = transactions.some((t) => t.label === item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => togglePresetItem(item)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all min-h-[46px] ${
                        isChecked
                          ? 'border-rose-400 bg-rose-50 text-[#1E293B] shadow-2xs'
                          : 'border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B] hover:bg-[#FAF7F2] hover:text-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border shrink-0 ${
                            isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium text-[#1E293B] leading-snug">{item.label}</span>
                      </div>
                      <span className="font-mono text-rose-600 font-semibold text-[11px] shrink-0 ml-1">
                        {item.points}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Actions Registered */}
        {transactions.filter((t) => t.isCustom).length > 0 && (
          <div className="pt-2 border-t border-[#E8DFD0] space-y-1.5">
            <span className="text-[11px] text-[#64748B] font-semibold">Custom Entries:</span>
            <div className="flex flex-wrap gap-1.5">
              {transactions.filter((t) => t.isCustom).map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] ${
                    tx.type === 'credit'
                      ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#064E3B]'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <span>{tx.label}</span>
                  <span className="font-mono font-bold">({tx.points > 0 ? `+${tx.points}` : tx.points})</span>
                  <button type="button" onClick={() => handleRemove(tx.id)} className="text-[#64748B] hover:text-[#1E293B]">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Step */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD0]">
          <button
            type="button"
            onClick={() => {
              sound.playStepTransition();
              onPrev();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
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
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] active:scale-98 transition-all shadow-sm min-h-[44px]"
          >
            <span>Istighfar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
