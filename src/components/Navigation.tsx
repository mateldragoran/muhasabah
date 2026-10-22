import React, { useState, useEffect } from 'react';
import {
  Moon,
  ShieldCheck,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  User,
  Compass,
  Menu,
} from 'lucide-react';
import { soundEffects } from '../services/soundService';
import { AuthUser } from '../services/authService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  getRegionalDateInfo,
  RegionalDateInfo,
  getStoredHijriOffset,
} from '../services/calendarService';
import { RegionalDateModal } from './Navigation/RegionalDateModal';
import { MobileDrawer } from './Navigation/MobileDrawer';

export type NavTab = 'accounting' | 'bedtime' | 'history' | 'guidance';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  setActiveTab?: (tab: NavTab) => void;
  selectedDate: string;
  onSelectDate?: (date: string) => void;
  setSelectedDate?: (date: string) => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  streakCount?: number;
  hijriDate?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  selectedDate,
  onSelectDate,
  setSelectedDate,
  currentUser,
  onOpenAuthModal,
  streakCount = 0,
}) => {
  const handleSelectTab = (tab: NavTab) => {
    if (onSelectTab) onSelectTab(tab);
    else if (setActiveTab) setActiveTab(tab);
  };

  const handleSelectDate = (date: string) => {
    if (onSelectDate) onSelectDate(date);
    else if (setSelectedDate) setSelectedDate(date);
  };

  const [muted, setMuted] = useState(() => soundEffects.isMuted());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hijriOffset, setHijriOffset] = useState(() => getStoredHijriOffset());
  const [dateInfo, setDateInfo] = useState<RegionalDateInfo>(() =>
    getRegionalDateInfo(selectedDate, hijriOffset)
  );

  useEffect(() => {
    setDateInfo(getRegionalDateInfo(selectedDate, hijriOffset));
  }, [selectedDate, hijriOffset]);

  const handleToggleSound = () => {
    const nextMuted = soundEffects.toggleMute();
    setMuted(nextMuted);
  };

  const handlePrevDay = () => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() - 1);
    handleSelectDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + 1);
    handleSelectDate(current.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const navItems = [
    { id: 'accounting' as NavTab, label: 'Audit', icon: Moon },
    { id: 'bedtime' as NavTab, label: 'Night Shield', icon: ShieldCheck },
    { id: 'history' as NavTab, label: 'History', icon: Calendar },
    { id: 'guidance' as NavTab, label: 'Wisdom', icon: BookOpen },
  ];

  return (
    <>
      {/* =========================================================================
          SURFACE 1: MINIMAL TOP HEADER (Mobile & Desktop)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectTab('accounting')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#10B981]/80 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-500/20 transition-transform group-hover:scale-105">
                <Moon className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-sm sm:text-base font-bold tracking-widest text-[#F9FAFB] group-hover:text-[#10B981] transition-colors leading-none">
                  MUHASABAH
                </span>
                <span className="text-[10px] text-[#9CA3AF] tracking-tight hidden sm:inline mt-0.5">
                  Night Self-Accounting
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111827]/80 border border-white/[0.08] p-1 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981]/90 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/20'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Center-Right Controls: Date Navigator + Install + Burger Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Regional Dual Date Navigator */}
            <div className="flex items-center border border-white/[0.08] rounded-xl px-0.5 sm:px-1.5 py-0.5 sm:py-1 bg-[#111827]/70 backdrop-blur-md">
              <button
                onClick={handlePrevDay}
                aria-label="Previous day"
                className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setIsCalendarModalOpen(true)}
                title="Calibrate regional moon sighting and calendar"
                className="px-1 sm:px-2 py-0.5 text-center group hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer max-w-[80px] sm:max-w-none"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold text-[#F9FAFB] leading-tight">
                  <span>{isToday ? 'Today' : dateInfo.solarShort}</span>
                  <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#10B981] opacity-80 group-hover:opacity-100" />
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#10B981] font-medium tracking-tight leading-tight truncate">
                  {dateInfo.hijriShort}
                </div>
              </button>

              <button
                onClick={handleNextDay}
                aria-label="Next day"
                className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Audio Toggle (Desktop only - accessible in mobile burger menu) */}
            <button
              onClick={handleToggleSound}
              title={muted ? 'Turn audio chimes on' : 'Mute audio chimes'}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-xl border border-white/[0.08] bg-[#111827]/70 text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />}
            </button>

            {/* PWA Install Button (With striking green glow on both Mobile & Desktop) */}
            <PWAInstallButton />

            {/* Profile / Account Button (Desktop only - accessible in mobile burger menu) */}
            <button
              onClick={onOpenAuthModal}
              title={currentUser ? `Signed in as ${currentUser.name || currentUser.email}` : 'Sign in / Profile'}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-[#10B981] hover:bg-emerald-900/40 hover:text-white transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{currentUser ? 'Profile' : 'Sign In'}</span>
            </button>

            {/* Mobile Hamburger Burger Menu Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl border border-white/[0.08] bg-[#111827]/70 text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#F9FAFB]" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SURFACE 2: UNIFIED BOTTOM TAB BAR (Thumb Zone Optimized)
          ========================================================================= */}
      <nav
        aria-label="Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0B1120]/90 backdrop-blur-xl"
      >
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all min-h-[48px] relative ${
                  isActive ? 'text-[#10B981]' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent rounded-full shadow-[0_0_8px_#10B981]" />
                )}
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-500/15 text-[#10B981]' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4] text-[#10B981]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] tracking-tight ${isActive ? 'font-semibold text-[#10B981]' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Regional Date Calibration Modal */}
      <RegionalDateModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        dateInfo={dateInfo}
        onOffsetChange={(offset) => setHijriOffset(offset)}
      />

      {/* Mobile Drawer (Burger Menu) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
        streakCount={streakCount}
        muted={muted}
        onToggleSound={handleToggleSound}
        dateInfo={dateInfo}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />
    </>
  );
};
