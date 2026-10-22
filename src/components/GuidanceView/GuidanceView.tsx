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
      body: `Every human being operates with a spiritual energy bank account. Actions and thoughts either deposit heavenly light (Hasanat and Barakah) or cause an energetic puncture. When a person incurs heavy debits through anger or heedlessness without Istighfar, their spiritual reservoir runs dry. Muhasabah is the nightly prophetic discipline of auditing and sealing this ledger before sleep.`,
    },
    {
      icon: Shield,
      title: 'The Four Enemies of the Soul',
      summary: 'Spiritual warfare targets four coordinated adversaries: Nafs (Ego), Hawa (Desire), Dunya (Illusion), and Shaytan (Whispers).',
      body: `Traditional Naqshbandi spiritual discipline identifies four coordinated adversaries:
• Nafs (The Ego): The self-worshiping part that justifies anger, arrogance, and defends its pride.
• Hawa (Base Desires): The pursuit of physical comfort, instant gratification, and bodily cravings.
• Dunya (Material Illusion): Comparison, consumerism, and chronic anxieties over worldly status.
• Shaytan (Spiritual Whispers): Waswasa that breeds suspicion, fear of poverty, division, and despair.`,
    },
    {
      icon: Heart,
      title: 'Guarding the Sensory Gateways',
      summary: 'The physical senses are the gates to the castle of the heart—what enters through them directly forms the soul.',
      body: `The physical senses are the gates to the heart:
• The Ears are the door to the soul. Guarding against slander, rumors, and agitation lets divine guidance enter.
• The Eyes are the veil of the heart. Guarding the gaze (Nazar bar Qadam) preserves the inner light of contemplation.
• The Tongue is an instrument of fire or light. Guarding speech through silence preserves heavenly blessings.`,
    },
    {
      icon: Wind,
      title: 'Hush dar Dam (Conscious Breathing)',
      summary: 'Draw heavenly light into the heart with every inhale; expel darkness and heedlessness with every exhale.',
      body: `One of the eleven sacred principles of the Naqshbandi spiritual path. Between every inhale and exhale, remain fully conscious of the divine gift of life. When inhaling, visualize drawing divine heavenly light (Nur) into the heart. When exhaling, expel heedlessness, stress, and internal agitation.`,
    },
    {
      icon: Moon,
      title: 'Sunnah Bedtime Protections',
      summary: 'During sleep, conscious defenses drop. Seal the soul with Wudu, Surah protections, and right-side rest.',
      body: `During sleep, the soul ascends and physical conscious defenses lower. The prophetic Sunnah teaches taking fresh Wudu, reciting Surah Al-Falaq (4x), Surah An-Nas (3x), Surah Al-Ikhlas (2x), blowing over the hands and wiping the body, and resting on the right side to guard the heart and soul through the night.`,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-2 px-2">
      {/* Hero Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-[#111827]/70 border border-white/[0.08] shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-950/40">
            <BookOpen className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#F9FAFB]">
              Spiritual Wisdom
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Core foundations of Muhasabah & spiritual vigilance
            </p>
          </div>
        </div>
      </div>

      {/* Discourses Stack */}
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 sm:p-5 bg-[#111827]/70 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-[#10B981] border border-emerald-500/25 mt-0.5">
                    <Icon className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F9FAFB] leading-snug">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                      {sec.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[#9CA3AF] p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-3.5 border-t border-white/[0.08] text-xs sm:text-sm text-[#F9FAFB] leading-relaxed whitespace-pre-line bg-[#0B1120]/60 p-4 rounded-xl">
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
