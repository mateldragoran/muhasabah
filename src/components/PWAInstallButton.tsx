import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={installPWA}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C5A059]/40 bg-[#FDF8ED] hover:bg-[#F9F0DB] text-xs font-semibold text-[#B88728] transition-all shadow-2xs"
        title="Install Muhasabah to your device"
      >
        <Download className="w-3.5 h-3.5 text-[#B88728]" />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFD0] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-xs font-semibold text-[#1E293B] transition-all shadow-2xs"
          title="Add to Home Screen"
        >
          <Download className="w-3.5 h-3.5 text-[#064E3B]" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#E8DFD0] bg-[#FFFFFF] p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1E293B] font-cinzel tracking-wide">
                    Install on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Add Muhasabah to your home screen</p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-[#1E293B]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0]">
                  <Share className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                  <span>
                    1. Tap the <strong>Share</strong> icon in the bottom Safari toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0]">
                  <PlusSquare className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                  <span>
                    2. Scroll down and choose <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#043B2C] text-xs font-semibold text-white transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
