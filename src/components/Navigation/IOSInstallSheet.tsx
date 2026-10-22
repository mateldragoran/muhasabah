import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share,
  PlusSquare,
  Compass,
  Copy,
  Check,
  ArrowDown,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';

interface IOSInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isInAppBrowser?: boolean;
}

export const IOSInstallSheet: React.FC<IOSInstallSheetProps> = ({
  isOpen,
  onClose,
  isInAppBrowser = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install Muhasabah on iPhone"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/[0.12] bg-[#111827] p-5 sm:p-6 shadow-2xl relative text-left text-[#F9FAFB] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for touch gesture */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Sacred hairline accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-amber-400/40 rounded-t-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close install sheet"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sheet Identity Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] p-0.5 shadow-lg shadow-emerald-950/60 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#0B1120] flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="Muhasabah App" className="w-9 h-9 rounded-xl object-contain" />
            </div>
          </div>
          <div className="pr-6">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#F9FAFB] tracking-wide">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-[#10B981] font-medium">
              Full-screen app · Works offline · No App Store needed
            </p>
          </div>
        </div>

        {/* In-App Browser Warning (WhatsApp, Instagram, Telegram, etc.) */}
        {isInAppBrowser ? (
          <div className="space-y-3.5 my-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Opened in an In-App Browser</span>
              </div>
              <p className="text-xs text-[#D1D5DB] leading-relaxed">
                Apple disables the <strong className="text-white">"Add to Home Screen"</strong> option inside embedded browsers (like WhatsApp, Instagram, or Telegram).
              </p>
              <div className="pt-1 border-t border-white/[0.06] text-xs text-[#9CA3AF] space-y-1">
                <p>1. Tap the <strong className="text-amber-300">Compass</strong> or <strong className="text-amber-300">... (Menu)</strong> icon in the corner.</p>
                <p>2. Select <strong className="text-white">"Open in Safari"</strong>.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-[#F9FAFB] transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981]">Link Copied! Open Safari & Paste</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#9CA3AF]" />
                  <span>Copy Link to Paste in Safari</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step-by-Step iPhone Installation Walkthrough */
          <div className="space-y-2.5 my-3 text-xs">
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed pb-0.5">
              Follow these simple steps on your device:
            </p>

            {/* Step 1: Tap the 3 dots (...) */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#F9FAFB] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>Step 1: Tap the 3 Dots</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                    ...
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  Tap the <strong className="text-white">3 dots (...)</strong> in the bottom right of your browser bar.
                </p>
              </div>
            </div>

            {/* Step 2: Tap Share */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Share className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#F9FAFB] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>Step 2: Tap Share</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                    [↑]
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  Select <strong className="text-white">Share</strong> from the menu options.
                </p>
              </div>
            </div>

            {/* Step 3: Tap View More */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
                <ChevronRight className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#F9FAFB] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>Step 3: Tap "View More"</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                    More
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  Scroll across or down and tap <strong className="text-white">View More</strong>.
                </p>
              </div>
            </div>

            {/* Step 4: Tap Add to Home Screen */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#0B1120] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#F9FAFB] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>Step 4: Tap "Add to Home Screen"</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    [+]
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  Tap <strong className="text-white">Add to Home Screen</strong>, then tap <strong className="text-white">Add</strong> in the top-right corner.
                </p>
              </div>
            </div>

            {/* Pointer guidance toward bottom-right bar */}
            <div className="flex items-center justify-center gap-1.5 pt-1.5 text-center text-[#10B981] font-mono text-[11px] animate-bounce">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Look for the 3 dots (...) in the bottom right</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] hover:brightness-110 active:scale-98 text-xs font-bold text-white transition-all shadow-md shadow-emerald-950/40 cursor-pointer text-center"
        >
          {isInAppBrowser ? 'Dismiss' : 'Got It, I’ll Tap the 3 Dots (...) [↑]'}
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
