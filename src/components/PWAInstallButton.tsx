import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Smartphone, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IOSInstallSheet } from './Navigation/IOSInstallSheet';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInAppBrowser, installPWA } = usePWAInstall();
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed and running in standalone window, don't show the install button
  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isIOS) {
      setShowIOSSheet(true);
      return;
    }

    if (isInstallable) {
      installPWA();
    } else {
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative group flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[11px] sm:text-xs font-semibold shadow-[0_0_16px_rgba(16,185,129,0.45)] hover:shadow-[0_0_24px_rgba(16,185,129,0.75)] border border-emerald-400/50 transition-all cursor-pointer active:scale-95 shrink-0"
        title="Install Muhasabah to your device"
      >
        {/* Sacred ambient green glow aura */}
        <span className="absolute -inset-0.5 rounded-xl bg-emerald-400/30 blur-xs opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none -z-10 animate-pulse" />

        <Download className="w-3.5 h-3.5 text-white animate-bounce group-hover:scale-110 transition-transform" />
        <span className="font-medium tracking-tight">Install</span>
      </button>

      {/* iOS Guided Install Sheet (Apple Safari / In-App Browser) */}
      <IOSInstallSheet
        isOpen={showIOSSheet}
        onClose={() => setShowIOSSheet(false)}
        isInAppBrowser={isInAppBrowser}
      />

      {/* Android / Desktop Browser Manual Guide Fallback */}
      {showAndroidGuide && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowAndroidGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#111827] p-6 shadow-2xl relative text-left text-[#F9FAFB]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sacred hairline accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 rounded-t-3xl" />

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#F59E0B]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F9FAFB] font-cinzel tracking-wide">
                  Install Muhasabah App
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">Full-screen, offline-ready spiritual ledger</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-[#9CA3AF]">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.06]">
                <MoreVertical className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong className="text-white">browser menu (⋮)</strong> at the top right of your screen.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.06]">
                <Download className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  2. Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                </span>
              </div>
              <p className="text-[10px] text-[#9CA3AF]/70 italic px-1">
                Note: In modern Android Chrome, tap "Install" whenever prompted to get the native app icon and full-screen experience.
              </p>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] hover:brightness-110 text-xs font-semibold text-white transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

