import React from 'react';
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
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();

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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <aside
        className="absolute inset-y-0 right-0 max-w-[320px] w-full bg-[#FAF7F2] border-l border-[#E8DFD0] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-[#E8DFD0] bg-[#FFFFFF]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center shadow-sm">
                <Moon className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <span className="font-cinzel text-sm font-semibold tracking-wider text-[#1E293B] block">
                  MUHASABAH
                </span>
                <span className="text-[10px] text-[#64748B]">Nightly Self-Accounting</span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="w-10 h-10 rounded-xl border border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5EFE6] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Profile Strip */}
          <div className="p-4 m-4 rounded-2xl bg-[#FFFFFF] border border-[#E8DFD0] shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1E293B] truncate">
                    {currentUser ? currentUser.name || currentUser.email : 'Guest Mode'}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {currentUser ? 'Supabase Sync Ready' : 'Local Storage Only'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3 py-1.5 rounded-lg border border-[#064E3B] bg-[#064E3B] text-white text-xs font-medium hover:bg-[#043B2C] transition-colors"
              >
                {currentUser ? 'Profile' : 'Sign In'}
              </button>
            </div>
          </div>

          {/* Practice Consistency Metric */}
          {streakCount > 0 && (
            <div className="mx-4 mb-4 p-3.5 rounded-xl bg-[#FDF8ED] border border-[#C5A059]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 flex items-center justify-center text-[#B88728]">
                  <Flame className="w-4 h-4 text-[#B88728]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1E293B]">Consistency Streak</div>
                  <div className="text-[11px] text-[#64748B]">Strict consecutive daily audits</div>
                </div>
              </div>
              <div className="text-sm font-bold text-[#B88728] font-mono">{streakCount}d</div>
            </div>
          )}

          {/* Navigation Section */}
          <div className="px-4 py-2 space-y-1">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-2 py-1">
              Views
            </div>
            {[
              { id: 'accounting' as NavTab, label: 'Daily Accounting', icon: Moon },
              { id: 'bedtime' as NavTab, label: 'Bedtime Armor', icon: ShieldCheck },
              { id: 'history' as NavTab, label: 'History & Trends', icon: Calendar },
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'text-[#1E293B] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Regional Calendar & Controls */}
          <div className="px-4 py-2 mt-2 space-y-1 border-t border-[#E8DFD0]">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-2 py-1">
              Settings & Preferences
            </div>

            {/* Regional Calendar Trigger */}
            <button
              onClick={() => {
                onClose();
                onOpenCalendarModal();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1E293B] hover:bg-[#F5EFE6] transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#064E3B]" />
                <div className="text-left">
                  <div>Regional Hijri Calendar</div>
                  <div className="text-[10px] text-[#64748B]">
                    {dateInfo.offsetDays === 0
                      ? 'Astronomical Standard'
                      : dateInfo.offsetDays > 0
                      ? `+${dateInfo.offsetDays} Day Offset`
                      : `${dateInfo.offsetDays} Day Offset`}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-[#064E3B] font-medium">Calibrate</span>
            </button>

            {/* Audio Chimes Toggle */}
            <button
              onClick={onToggleSound}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1E293B] hover:bg-[#F5EFE6] transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                {muted ? (
                  <VolumeX className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#064E3B]" />
                )}
                <span>Auditory Affirmation</span>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                  muted ? 'bg-[#E8DFD0]/60 text-[#64748B]' : 'bg-[#064E3B]/10 text-[#064E3B]'
                }`}
              >
                {muted ? 'Muted' : 'Active'}
              </span>
            </button>

            {/* Install PWA Button if available */}
            {!isInstalled && (isInstallable || isIOS) && (
              <button
                onClick={installPWA}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#B88728] hover:bg-[#FDF8ED] transition-colors min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#B88728]" />
                <span>Add to Home Screen</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E8DFD0] bg-[#FFFFFF] text-center">
          <p className="text-[11px] text-[#64748B]">
            Teachings of <span className="text-[#064E3B] font-medium">Shaykh Nurjan Mirahmadi (Q)</span>
          </p>
          <p className="text-[10px] text-[#64748B]/70 mt-0.5">Sufi Meditation Center</p>
        </div>
      </aside>
    </div>
  );
};
