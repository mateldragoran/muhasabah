/**
 * Types for Muhasabah (Sufi Night Accounting & Energy Ledger)
 * Based on the teachings of Shaykh Nurjan Mirahmadi (Q)
 */

export type GatewayType = 'ears' | 'eyes' | 'tongue' | 'heart' | 'body';

export type VigilanceState = 'vigilant' | 'minor_lapse' | 'compromised' | 'rectified';

export type EnemyTag = 'none' | 'nafs' | 'hawa' | 'dunya' | 'shaytan';

export interface GatewayAudit {
  gateway: GatewayType;
  state: VigilanceState;
  enemy: EnemyTag;
  note: string;
}

export interface EnergyTransaction {
  id: string;
  type: 'credit' | 'debit';
  label: string;
  points: number;
  category?: string;
  isCustom?: boolean;
}

export type BalanceStatus = 'surplus' | 'balanced' | 'deficit';

export interface MuhasabaRecord {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  hijriDate?: string;
  gateways: Record<GatewayType, GatewayAudit>;
  transactions: EnergyTransaction[];
  netEnergy: number;
  balanceStatus: BalanceStatus;
  istighfarCount: number;
  istighfarTarget: number;
  breathRounds: number;
  reflectionNote: string;
  isCompleted?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BedtimeProtectionLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  wuduDone: boolean;
  salatulWuduDone: boolean;
  falaqCount: number; // Target: 4
  nasCount: number;   // Target: 3
  ikhlasCount: number;// Target: 2
  rightSidePosture: boolean;
  headCovered: boolean;
  wipedBody: boolean;
  completedAt?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  userEmail?: string;
  userId?: string;
}
