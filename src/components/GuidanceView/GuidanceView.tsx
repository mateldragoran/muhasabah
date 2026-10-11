import React, { useState } from 'react';
import { BookOpen, Shield, Heart, Wind, Moon, Scale, ChevronDown, ChevronUp } from 'lucide-react';

export const GuidanceView: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const sections = [
    {
      icon: Scale,
      title: 'The Spiritual Energy Bank Account',
      summary: 'Every deed, glance, and word either deposits heavenly light or causes an energetic drain.',
      body: `Every human being operates with a spiritual energy bank account. Actions and thoughts either deposit heavenly light (Hasanat/Barakah) or cause a spiritual leak. When a person incurs heavy debits through anger or heedlessness without Istighfar, their spiritual balance runs dry. Muhasabah is the daily discipline of auditing and sealing this ledger before sleep.`,
    },
    {
      icon: Shield,
      title: 'The Four Enemies of the Soul',
      summary: 'Spiritual warfare targets four adversaries: Nafs (Ego), Hawa (Desire), Dunya (Illusion), and Shaytan (Whispers).',
      body: `Traditional Naqshbandi spiritual discipline identifies four coordinated adversaries:
• Nafs (The Ego): The self-worshiping part that justifies anger and demands to be right.
• Hawa (Base Desires): The pursuit of bodily impulses and immediate gratification.
• Dunya (Material Illusion): Comparison, consumerism, and anxieties about worldly status.
• Shaytan (External Whispers): Waswasa that breeds suspicion, fear of poverty, and despair.`,
    },
    {
      icon: Heart,
      title: 'Guarding the Gateways (The 7 Openings)',
      summary: 'The physical senses are the gates to the castle of the heart—what enters through them forms the soul.',
      body: `The physical senses are the gates to the heart:
• The Ears are the door to the soul. Guarding against slander and vanity lets divine guidance enter.
• The Eyes are the veil of the heart. Guarding the gaze (Nazar bar Qadam) preserves the inner light.
• The Tongue is an instrument of immense fire or fragrance. Silence is golden armor against the ego.`,
    },
    {
      icon: Wind,
      title: 'Hush dar Dam (Conscious Breathing)',
      summary: 'Draw heavenly light into the heart with every inhale; expel darkness and heedlessness with every exhale.',
      body: `One of the eleven principles of the Naqshbandi spiritual path. Between every inhale and exhale, remain conscious of the divine gift of life. When inhaling, visualize drawing divine heavenly light (Nur) into the heart. When exhaling, expel heedlessness and internal agitation.`,
    },
    {
      icon: Moon,
      title: 'Sunnah Bedtime Protections',
      summary: 'During sleep, conscious defenses drop. Seal the soul with Wudu, Surah protections, and right-side rest.',
      body: `During sleep, the soul ascends and physical conscious defenses lower. The Sunnah teaches taking fresh Wudu, reciting Surah Al-Falaq (4x), Surah An-Nas (3x), Surah Al-Ikhlas (2x), blowing over the hands and wiping the body, and resting on the right side to guard the heart.`,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-2 px-2">
      {/* Hero Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#FFFFFF] border border-[#E8DFD0] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
            <BookOpen className="w-5 h-5 text-[#064E3B]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#1E293B]">
              Spiritual Principles
            </h2>
            <p className="text-xs text-[#64748B]">
              Core foundations of Muhasabah & spiritual vigilance
            </p>
          </div>
        </div>
      </div>

      {/* Discourses Stack - Interactive Clean Cards */}
      <div className="space-y-2.5">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 sm:p-5 bg-[#FFFFFF] border border-[#E8DFD0] hover:border-[#064E3B]/50 transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20 mt-0.5">
                    <Icon className="w-4 h-4 text-[#064E3B]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#1E293B] leading-snug">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      {sec.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[#64748B] p-1">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#064E3B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-[#E8DFD0] text-xs text-[#475569] leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
                  {sec.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
