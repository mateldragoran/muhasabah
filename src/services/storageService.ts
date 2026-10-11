import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MuhasabaRecord, BedtimeProtectionLog, SupabaseConfig, GatewayType } from '../types/muhasabah';
import { createDefaultGatewayAudits, formatSimpleDate, getApproximateHijriDate } from '../data/defaultData';

const STORAGE_KEYS = {
  RECORDS: 'muhasaba_daily_records_v1',
  BEDTIME: 'muhasaba_bedtime_logs_v1',
  CONFIG: 'muhasaba_supabase_config_v1',
  ACTIVE_DATE: 'muhasaba_active_date_v1',
};

class StorageService {
  private supabase: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    isConnected: false,
  };

  constructor() {
    this.initSupabase();
  }

  private initSupabase() {
    // Check saved config in localStorage or environment variables
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    let url = '';
    let anonKey = '';

    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        url = parsed.url || '';
        anonKey = parsed.anonKey || '';
      } catch (e) {
        console.error('Failed to parse Supabase config', e);
      }
    }

    if (!url && typeof import.meta !== 'undefined' && import.meta.env) {
      url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
      anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
    }

    this.config.url = url;
    this.config.anonKey = anonKey;

    if (url && anonKey) {
      try {
        this.supabase = createClient(url, anonKey);
        this.config.isConnected = true;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.supabase = null;
        this.config.isConnected = false;
      }
    }
  }

  public getSupabaseConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public async setSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
    try {
      if (!url.trim() || !anonKey.trim()) {
        this.supabase = null;
        this.config = { url: '', anonKey: '', isConnected: false };
        localStorage.removeItem(STORAGE_KEYS.CONFIG);
        return true;
      }

      const client = createClient(url.trim(), anonKey.trim());
      // Test basic connection
      const { error } = await client.auth.getSession();
      if (error && !error.message.includes('Auth session missing')) {
        console.warn('Supabase test returned error:', error.message);
      }

      this.supabase = client;
      this.config = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
      };

      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
      return true;
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      return false;
    }
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.supabase;
  }

  // --- LOCAL CACHE OPERATIONS ---

  public getAllRecords(): Record<string, MuhasabaRecord> {
    return this.getAllLocalRecords();
  }

  private getAllLocalRecords(): Record<string, MuhasabaRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveAllLocalRecords(records: Record<string, MuhasabaRecord>) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to write local records', e);
    }
  }

  private getAllLocalBedtimeLogs(): Record<string, BedtimeProtectionLog> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BEDTIME);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveAllLocalBedtimeLogs(logs: Record<string, BedtimeProtectionLog>) {
    try {
      localStorage.setItem(STORAGE_KEYS.BEDTIME, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to write local bedtime logs', e);
    }
  }

  // --- RECORD LIFECYCLE ---

  public getRecordByDate(dateStr: string): MuhasabaRecord {
    const all = this.getAllLocalRecords();
    if (all[dateStr]) {
      return all[dateStr];
    }

    // Default template for a new day
    const newRecord: MuhasabaRecord = {
      id: `record_${dateStr}_${Date.now()}`,
      date: dateStr,
      hijriDate: getApproximateHijriDate(new Date(dateStr)),
      gateways: createDefaultGatewayAudits(),
      transactions: [],
      netEnergy: 0,
      balanceStatus: 'balanced',
      istighfarCount: 0,
      istighfarTarget: 100,
      breathRounds: 0,
      reflectionNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all[dateStr] = newRecord;
    this.saveAllLocalRecords(all);
    return newRecord;
  }

  public async saveRecord(record: MuhasabaRecord): Promise<void> {
    // 1. Calculate net energy and balance status accurately
    let net = 0;
    for (const tx of record.transactions) {
      net += tx.points;
    }
    record.netEnergy = net;
    record.balanceStatus = net > 0 ? 'surplus' : net < 0 ? 'deficit' : 'balanced';
    record.updatedAt = new Date().toISOString();

    // 2. Save locally immediately
    const all = this.getAllLocalRecords();
    all[record.date] = record;
    this.saveAllLocalRecords(all);

    // 3. Sync to Supabase if connected
    if (this.supabase) {
      try {
        const { data: { session } } = await this.supabase.auth.getSession();
        const userId = session?.user?.id;

        const { error } = await this.supabase.from('daily_logs').upsert({
          user_id: userId,
          log_date: record.date,
          net_energy: record.netEnergy,
          balance_type: record.balanceStatus,
          istighfar_count: record.istighfarCount,
          summary_note: record.reflectionNote,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,log_date' });

        if (error) {
          console.warn('Supabase sync notice:', error.message);
        }
      } catch (err) {
        console.warn('Background Supabase sync error:', err);
      }
    }
  }

  // --- BEDTIME LOG LIFECYCLE ---

  public getBedtimeLogByDate(dateStr: string): BedtimeProtectionLog {
    const all = this.getAllLocalBedtimeLogs();
    if (all[dateStr]) {
      return all[dateStr];
    }

    const newLog: BedtimeProtectionLog = {
      id: `bedtime_${dateStr}_${Date.now()}`,
      date: dateStr,
      wuduDone: false,
      salatulWuduDone: false,
      falaqCount: 0,
      nasCount: 0,
      ikhlasCount: 0,
      rightSidePosture: false,
      headCovered: false,
      wipedBody: false,
    };

    all[dateStr] = newLog;
    this.saveAllLocalBedtimeLogs(all);
    return newLog;
  }

  public async saveBedtimeLog(log: BedtimeProtectionLog): Promise<void> {
    const all = this.getAllLocalBedtimeLogs();
    all[log.date] = log;
    this.saveAllLocalBedtimeLogs(all);

    if (this.supabase) {
      try {
        const { data: { session } } = await this.supabase.auth.getSession();
        const userId = session?.user?.id;

        const { error } = await this.supabase.from('bedtime_checks').upsert({
          user_id: userId,
          log_date: log.date,
          wudu_done: log.wuduDone,
          salatul_wudu_done: log.salatulWuduDone,
          falaq_count: log.falaqCount,
          nas_count: log.nasCount,
          ikhlas_count: log.ikhlasCount,
          right_side_posture: log.rightSidePosture,
          head_covered: log.headCovered,
          completed_at: log.completedAt,
        }, { onConflict: 'user_id,log_date' });

        if (error) {
          console.warn('Supabase bedtime sync notice:', error.message);
        }
      } catch (err) {
        console.warn('Background Supabase sync error:', err);
      }
    }
  }

  // --- HISTORY & STATS ---

  public getRecentRecords(limit = 30): MuhasabaRecord[] {
    const all = this.getAllLocalRecords();
    return Object.values(all)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  public getGatewayInsights(): { gateway: GatewayType; compromisedCount: number; topEnemy: string }[] {
    const records = this.getRecentRecords(14);
    const gateways: GatewayType[] = ['ears', 'eyes', 'tongue', 'heart', 'body'];

    return gateways.map((gw) => {
      let compromisedCount = 0;
      const enemyCount: Record<string, number> = {};

      for (const rec of records) {
        const audit = rec.gateways?.[gw];
        if (audit && (audit.state === 'compromised' || audit.state === 'minor_lapse')) {
          compromisedCount++;
          if (audit.enemy && audit.enemy !== 'none') {
            enemyCount[audit.enemy] = (enemyCount[audit.enemy] || 0) + 1;
          }
        }
      }

      let topEnemy = 'None';
      let maxE = 0;
      for (const [e, count] of Object.entries(enemyCount)) {
        if (count > maxE) {
          maxE = count;
          topEnemy = e.toUpperCase();
        }
      }

      return {
        gateway: gw,
        compromisedCount,
        topEnemy,
      };
    });
  }

  // --- BACKUP & PRIVACY ---

  public exportBackupJson(): string {
    const records = this.getAllLocalRecords();
    const bedtime = this.getAllLocalBedtimeLogs();
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      records,
      bedtime,
    };
    return JSON.stringify(payload, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.records) {
        this.saveAllLocalRecords(data.records);
      }
      if (data.bedtime) {
        this.saveAllLocalBedtimeLogs(data.bedtime);
      }
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  }

  public compute14DayInsights(): { gateway: GatewayType; compromisedCount: number; topEnemy: string }[] {
    return this.getGatewayInsights();
  }

  public exportAllData(): string {
    return this.exportBackupJson();
  }

  public importData(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const ok = this.importBackupJson(jsonString);
      if (ok) {
        const count = Object.keys(this.getAllLocalRecords()).length;
        return { success: true, count };
      }
      return { success: false, error: 'Invalid backup format' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Parse error' };
    }
  }

  public clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.BEDTIME);
  }
}

export const storage = new StorageService();
