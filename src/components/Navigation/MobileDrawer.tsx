import React, { useState } from 'react';
import {
  X,
  User,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  Download,
  BookOpen,
  ShieldCheck,
  Calendar,
  Sparkles,
  Moon,
} from 'lucide-react';
import { AuthUser } from '../../services/authService';
import { RegionalDateInfo } from '../../services/calendarService';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { NavTab } from '../Navigation';
import { IOSInstallSheet } from './IOSInstallSheet';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  streakCount: number;
  muted: boolean;
  onToggleSound: () => void;
  dateInfo: RegionalDateInfo;
  onOpenCalendarModal: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  streakCount,
  muted,
  onToggleSound,
  dateInfo,
  onOpenCalendarModal,
  activeTab,
  onSelectTab,
}) => {
  const { isInstallable, isInstalled, isIOS, isInAppBrowser, installPWA } = usePWAInstall();
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <aside
        className="absolute inset-y-0 right-0 max-w-[320px] w-full bg-[#0B1120] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 z-50 text-[#F9FAFB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gold accent hairline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20" />

        {/* Top Header & Main Content */}
        <div>
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#111827]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#10B981]/80 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-500/20">
                <Moon className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-cinzel text-sm font-bold tracking-widest text-[#F9FAFB] block">
                  MUHASABAH
                </span>
                <span className="text-[10px] text-[#9CA3AF]">Night Self-Accounting</span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="w-8 h-8 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Profile Strip */}
          <div className="p-3.5 m-3 rounded-2xl bg-[#111827]/70 border border-white/[0.08] shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F9FAFB] truncate">
                    {currentUser ? currentUser.name || currentUser.email : 'Guest Mode'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] truncate">
                    {currentUser ? 'Supabase Synced' : 'Local Storage Only'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-[#10B981] text-xs font-semibold hover:bg-emerald-500/25 transition-all cursor-pointer shrink-0"
              >
                {currentUser ? 'Profile' : 'Sign In'}
              </button>
            </div>
          </div>

          {/* Practice Consistency Metric */}
          {typeof streakCount === 'number' && (
            <div className="mx-3 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-[#F59E0B]">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F9FAFB]">Practice Consistency</div>
                  <div className="text-[10px] text-[#9CA3AF]">Consecutive daily audits</div>
                </div>
              </div>
              <div className="text-sm font-bold text-[#F59E0B] font-mono">{streakCount}d</div>
            </div>
          )}

          {/* Navigation Section */}
          <div className="px-3 py-2 space-y-1">
            <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2 py-1">
              Main Views
            </div>
            {[
              { id: 'accounting' as NavTab, label: 'Daily Accounting', icon: Moon },
              { id: 'bedtime' as NavTab, label: 'Night Shield', icon: ShieldCheck },
              { id: 'history' as NavTab, label: 'Spiritual History', icon: Calendar },
              { id: 'guidance' as NavTab, label: 'Teachings & Wisdom', icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981]/90 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/20'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Regional Calendar & Controls */}
          <div className="px-3 py-2 mt-2 space-y-1 border-t border-white/[0.08]">
            <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2 py-1">
              Settings & Preferences
            </div>

            {/* Regional Calendar Trigger */}
            <button
              onClick={() => {
                onClose();
                onOpenCalendarModal();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04] transition-colors min-h-[44px] cursor-pointer border border-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#10B981]" />
                <div className="text-left">
                  <div className="text-[#F9FAFB]">Regional Hijri Calendar</div>
                  <div className="text-[10px] text-[#10B981]">
                    {dateInfo.hijriShort} · {dateInfo.offsetDays === 0
                      ? 'Standard'
                      : dateInfo.offsetDays > 0
                      ? `+${dateInfo.offsetDays}d`
                      : `${dateInfo.offsetDays}d`}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-[#10B981] font-semibold">Calibrate</span>
            </button>

            {/* Audio Chimes Toggle */}
            <button
              onClick={onToggleSound}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04] transition-colors min-h-[44px] cursor-pointer border border-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                {muted ? (
                  <VolumeX className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#10B981]" />
                )}
                <span className="text-[#F9FAFB]">Auditory Affirmation</span>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                  muted ? 'bg-white/[0.06] text-[#9CA3AF]' : 'bg-emerald-500/15 text-[#10B981]'
                }`}
              >
                {muted ? 'Muted' : 'Active'}
              </span>
            </button>

            {/* Install PWA Button if available */}
            {!isInstalled && (isInstallable || isIOS) && (
              <button
                onClick={() => {
                  if (isIOS) {
                    setShowIOSSheet(true);
                  } else if (isInstallable) {
                    onClose();
                    installPWA();
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-[#10B981] hover:bg-emerald-500/25 border border-emerald-500/30 transition-all min-h-[44px] cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                <Download className="w-4 h-4 text-[#10B981] animate-bounce" />
                <span>Add App to Home Screen</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Sacred Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#111827]/50 text-center">
          <p className="text-[11px] text-[#9CA3AF]">
            Teachings of <span className="text-[#10B981] font-medium">Shaykh Nurjan Mirahmadi (Q)</span>
          </p>
          <p className="text-[10px] text-[#64748B] mt-0.5">Sufi Meditation Center</p>
        </div>
      </aside>

      {/* iOS Guided Install Sheet */}
      <IOSInstallSheet
        isOpen={showIOSSheet}
        onClose={() => {
          setShowIOSSheet(false);
          onClose();
        }}
        isInAppBrowser={isInAppBrowser}
      />
    </div>
  );
};
