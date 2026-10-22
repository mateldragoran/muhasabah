import { GatewayType, EnergyTransaction, GatewayAudit, LedgerOption } from '../types/muhasabah';
import { getRegionalDateInfo } from '../services/calendarService';

export interface GatewayInfo {
  id: GatewayType;
  title: string;
  subTitle: string;
  spiritualTitle: string;
  description: string;
  question: string;
  teachingNote: string;
}

export const GATEWAY_METADATA: Record<GatewayType, GatewayInfo> = {
  ears: {
    id: 'ears',
    title: 'The Ears',
    subTitle: 'Door to the Soul',
    spiritualTitle: 'Bab al-Ruh',
    description: 'What enters the ears directly shapes the state of the heart. The ego acts as a negative translator.',
    question: 'Did you guard against backbiting, rumors, and agitation, or feed the ears divine remembrance and guidance?',
    teachingNote: 'Shaykh Nurjan teaches: If the ears do not open and remain protected, the heart cannot open.'
  },
  eyes: {
    id: 'eyes',
    title: 'The Eyes',
    subTitle: 'Veil of the Heart',
    spiritualTitle: 'Nazar bar Qadam',
    description: 'Watching one\'s steps. Closing physical vision allows the inner spiritual vision of the heart to awaken.',
    question: 'Did you protect the gaze from envy, vanity, lower desires, and mindless digital scrolling?',
    teachingNote: 'Shaykh Nurjan teaches: Looking at what is forbidden drains the spiritual light of the heart like a puncture.'
  },
  tongue: {
    id: 'tongue',
    title: 'The Tongue',
    subTitle: 'Sword of Fire or Light',
    spiritualTitle: 'Hifz al-Lisan',
    description: 'The tongue can either distribute fragrant blessings or shoot arrows of fire that incinerate good deeds.',
    question: 'Did you employ speech for Salawat, truth, and kindness, or slip into complaints, sharp retorts, and arguments?',
    teachingNote: 'Shaykh Nurjan teaches: Defending the ego through arguing burns your energy. Silence preserves divine light.'
  },
  heart: {
    id: 'heart',
    title: 'The Heart',
    subTitle: 'Throne of Divine Light',
    spiritualTitle: 'Arsh al-Rahman',
    description: 'The locus of divine connection and contemplation. The center from which all six spiritual powers emerge.',
    question: 'Was the heart tranquil in remembrance, or weighed down by anger, jealousy, arrogance, and anxieties of the world?',
    teachingNote: 'Shaykh Nurjan teaches: The 3 locks of Shaytan are upon the ears, eyes, and heart. Purify the heart through conscious breath.'
  },
  body: {
    id: 'body',
    title: 'The Body & Limbs',
    subTitle: 'Temple of Service',
    spiritualTitle: 'Al-Jawaarih',
    description: 'Mindful consumption in the stomach and directing hands and feet in service (Khidmah) rather than heedlessness.',
    question: 'Did you consume pure, mindful nourishment and direct your body in prayers and service?',
    teachingNote: 'Shaykh Nurjan teaches: Unlawful or heedless food burdens the soul with darkness and lethargy for worship.'
  }
};

export const ENEMY_METADATA = {
  nafs: {
    name: 'Nafs (The Ego)',
    tag: 'nafs',
    desc: 'Self-justification, pride, wanting to be right, defending one\'s image.'
  },
  hawa: {
    name: 'Hawa (Vain Desires)',
    tag: 'hawa',
    desc: 'Craving instant gratification, bodily impulses, comfort-seeking.'
  },
  dunya: {
    name: 'Dunya (Material World)',
    tag: 'dunya',
    desc: 'Obsession with wealth, career anxieties, consumerism, comparison.'
  },
  shaytan: {
    name: 'Shaytan (Spiritual Whispers)',
    tag: 'shaytan',
    desc: 'Waswasa (whispers of despair, suspicion, fear of poverty, division).'
  }
};

export const DEFAULT_CREDITS: Omit<EnergyTransaction, 'id'>[] = [
  { type: 'credit', label: '5 Daily Prayers on Time', points: 25, category: 'Worship' },
  { type: 'credit', label: 'Sadaqah (Charity) Given', points: 50, category: 'Charity' }, // 10x hasanat multiplier
  { type: 'credit', label: 'Daily Awrad / Muraqabah', points: 30, category: 'Remembrance' },
  { type: 'credit', label: '100+ Salawat upon the Prophet ﷺ', points: 30, category: 'Praise' },
  { type: 'credit', label: 'Controlled Anger when Provoked', points: 40, category: 'Struggle (Jihad al-Nafs)' },
  { type: 'credit', label: 'Hush dar Dam (Conscious Breathing)', points: 15, category: 'Presence' },
  { type: 'credit', label: 'Khidmah (Serving Others / Family)', points: 35, category: 'Service' },
  { type: 'credit', label: 'Silent Patience under Trial (Sabr)', points: 30, category: 'Character' }
];

export const DEFAULT_DEBITS: Omit<EnergyTransaction, 'id'>[] = [
  { type: 'debit', label: 'Outburst of Anger or Yelling', points: -50, category: 'Fire' },
  { type: 'debit', label: 'Arguing to Defend the Ego', points: -35, category: 'Nafs' },
  { type: 'debit', label: 'Listening to or Sharing Gossip', points: -30, category: 'Ears/Tongue' },
  { type: 'debit', label: 'Mindless Social Media / Eye Voyeurism', points: -25, category: 'Eyes' },
  { type: 'debit', label: 'Complaining & Ingratitude', points: -20, category: 'Tongue' },
  { type: 'debit', label: 'Delayed Prayer due to Procrastination', points: -40, category: 'Neglect' },
  { type: 'debit', label: 'Overeating / Consuming Heedlessly', points: -15, category: 'Stomach' }
];

export const INITIAL_LEDGER_OPTIONS: LedgerOption[] = [
  ...DEFAULT_CREDITS.map((c, idx) => ({
    id: `default_credit_${idx + 1}`,
    type: 'credit' as const,
    label: c.label,
    points: c.points,
    category: c.category,
    isDefault: true,
    sortOrder: idx + 1,
  })),
  ...DEFAULT_DEBITS.map((d, idx) => ({
    id: `default_debit_${idx + 1}`,
    type: 'debit' as const,
    label: d.label,
    points: d.points,
    category: d.category,
    isDefault: true,
    sortOrder: DEFAULT_CREDITS.length + idx + 1,
  })),
];

export const SURAH_PROTECTIONS = [
  {
    title: 'Surah Al-Falaq',
    arabic: 'سُورَةُ الْفَلَقِ',
    transliteration: 'Qul a\'udhu bi Rabbil-falaq...',
    countTarget: 4,
    guidance: 'Recite 4 times while holding intention to dispel spiritual attacks, darkness, and envy of the night.'
  },
  {
    title: 'Surah An-Nas',
    arabic: 'سُورَةُ النَّاسِ',
    transliteration: 'Qul a\'udhu bi Rabbin-nas...',
    countTarget: 3,
    guidance: 'Recite 3 times to guard against internal whispers (waswasa) from jinn and men.'
  },
  {
    title: 'Surah Al-Ikhlas',
    arabic: 'سُورَةُ الْإِخْلَاصِ',
    transliteration: 'Qul Huwallahu Ahad...',
    countTarget: 2,
    guidance: 'Recite 2 times for pure Divine Unity, cleansing the soul with divine light.'
  }
];

export function createDefaultGatewayAudits(): Record<GatewayType, GatewayAudit> {
  return {
    ears: { gateway: 'ears', state: 'vigilant', states: ['vigilant'], enemy: 'none', enemies: [], selectedActions: [], note: '' },
    eyes: { gateway: 'eyes', state: 'vigilant', states: ['vigilant'], enemy: 'none', enemies: [], selectedActions: [], note: '' },
    tongue: { gateway: 'tongue', state: 'vigilant', states: ['vigilant'], enemy: 'none', enemies: [], selectedActions: [], note: '' },
    heart: { gateway: 'heart', state: 'vigilant', states: ['vigilant'], enemy: 'none', enemies: [], selectedActions: [], note: '' },
    body: { gateway: 'body', state: 'vigilant', states: ['vigilant'], enemy: 'none', enemies: [], selectedActions: [], note: '' }
  };
}

export function formatSimpleDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getApproximateHijriDate(date: Date = new Date()): string {
  try {
    return getRegionalDateInfo(date).hijriFormatted;
  } catch {
    return '1448 AH';
  }
}
