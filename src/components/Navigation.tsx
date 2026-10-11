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
  Flame,
  Menu,
  Compass,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [hijriOffset, setHijriOffset] = useState(() => getStoredHijriOffset());
  const [dateInfo, setDateInfo] = useState<RegionalDateInfo>(() =>
    getRegionalDateInfo(selectedDate, hijriOffset)
  );

  // Recalculate regional date when selectedDate or offset changes
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
    { id: 'accounting' as NavTab, label: 'Accounting', icon: Moon },
    { id: 'bedtime' as NavTab, label: 'Bedtime', icon: ShieldCheck },
    { id: 'history' as NavTab, label: 'History', icon: Calendar },
    { id: 'guidance' as NavTab, label: 'Guidance', icon: BookOpen },
  ];

  return (
    <>
      {/* =========================================================================
          MAIN TOP APP BAR (Responsive: Desktop & Mobile)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8DFD0] transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark (Unified Single-Line Brand Contract) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleSelectTab('accounting')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <Moon className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-base font-bold tracking-widest text-[#1E293B] group-hover:text-[#064E3B] transition-colors">
                  MUHASABAH
                </span>
                <span className="text-[10px] text-[#64748B] tracking-tight hidden sm:inline">
                  Contemplative Self-Accounting
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Zone 2: Regional Date Chip & Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Regional Dual Date Navigator */}
            <div className="flex items-center gap-1 border border-[#E8DFD0] rounded-xl px-2 py-1 bg-[#FAF7F2]">
              <button
                onClick={handlePrevDay}
                aria-label="Previous day"
                className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#FFFFFF] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCalendarModalOpen(true)}
                title="Click to calibrate regional moon sighting & calendar"
                className="px-2 py-0.5 text-center group hover:bg-[#FFFFFF] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1E293B]">
                  <span>{isToday ? 'Today' : dateInfo.solarShort}</span>
                  <Compass className="w-3 h-3 text-[#064E3B] opacity-70 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-[#064E3B] font-medium tracking-tight">
                  {dateInfo.hijriShort}
                </div>
              </button>

              <button
                onClick={handleNextDay}
                aria-label="Next day"
                className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#FFFFFF] rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Zone 3 Desktop & Mobile Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Date Switcher (Compact, Clean, Center-Right on mobile) */}
            <div className="flex md:hidden items-center border border-[#E8DFD0] rounded-xl px-1.5 py-1 bg-[#FAF7F2]">
              <button
                onClick={handlePrevDay}
                aria-label="Previous day"
                className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#1E293B]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="px-1.5 text-center"
              >
                <div className="text-[11px] font-semibold text-[#1E293B] whitespace-nowrap">
                  {isToday ? 'Today' : dateInfo.solarShort}
                </div>
                <div className="text-[9px] text-[#064E3B] font-medium leading-none whitespace-nowrap">
                  {dateInfo.hijriShort}
                </div>
              </button>

              <button
                onClick={handleNextDay}
                aria-label="Next day"
                className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#1E293B]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Streak Badge */}
            {typeof streakCount === 'number' && streakCount > 0 && (
              <button
                onClick={() => handleSelectTab('history')}
                title={`${streakCount} consecutive days of nightly accounting`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#C5A059]/40 bg-[#FDF8ED] text-xs font-mono font-semibold text-[#B88728] hover:bg-[#F9F0DB] transition-all shadow-2xs"
              >
                <Flame className="w-3.5 h-3.5 text-[#B88728]" />
                <span>{streakCount}d</span>
              </button>
            )}

            {/* Desktop PWA Install Button */}
            <div className="hidden lg:block">
              <PWAInstallButton />
            </div>

            {/* Desktop Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={muted ? 'Turn audio chimes on' : 'Mute audio chimes'}
              className="hidden sm:flex items-center justify-center h-8 w-8 rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] transition-colors"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#064E3B]" />}
            </button>

            {/* Desktop Account Button */}
            <button
              onClick={onOpenAuthModal}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#064E3B] bg-[#064E3B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#043B2C] transition-all shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{currentUser ? 'Profile' : 'Sign In'}</span>
            </button>

            {/* Mobile Hamburger Drawer Trigger (At least 44x44px touch area) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile menu"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] text-[#1E293B] hover:bg-[#FAF7F2] transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-[#1E293B]" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          REFINED MOBILE BOTTOM TAB BAR
          4 evenly spaced destinations in the natural thumb zone
          ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8DFD0] bg-[#FFFFFF]/95 backdrop-blur-xl transition-all"
      >
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all min-h-[44px] ${
                  isActive ? 'text-[#064E3B]' : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-[#ECFDF5] text-[#064E3B]' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4] text-[#064E3B]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] tracking-tight ${isActive ? 'font-semibold text-[#064E3B]' : 'font-medium'}`}>
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

      {/* Mobile Slide-Over Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
