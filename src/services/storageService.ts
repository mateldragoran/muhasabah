import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import {
  MuhasabaRecord,
  BedtimeProtectionLog,
  SupabaseConfig,
  GatewayType,
  LedgerOption,
} from '../types/muhasabah';
import {
  createDefaultGatewayAudits,
  formatSimpleDate,
  getApproximateHijriDate,
  INITIAL_LEDGER_OPTIONS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  RECORDS: 'muhasaba_daily_records_v1',
  BEDTIME: 'muhasaba_bedtime_logs_v1',
  CONFIG: 'muhasaba_supabase_config_v1',
  ACTIVE_DATE: 'muhasaba_active_date_v1',
  LEDGER_OPTIONS: 'muhasaba_user_ledger_options_v1',
};

class StorageService {
  private supabase: SupabaseClient = supabase;
  private listeners: (() => void)[] = [];
  private config: SupabaseConfig = {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || 'https://fzzsnxlhqjixiigdccbx.supabase.co',
    anonKey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_Ki42PI26lQg-oliQIZi0HQ_wQBjDSkF',
    isConnected: true,
  };

  constructor() {
    // Initial sync with cloud if active session exists
    this.syncWithCloud();
  }

  /**
   * Subscribe to storage updates (e.g. when cloud sync completes or records change)
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.warn('Storage listener notice:', err);
      }
    });
  }

  public getSupabaseConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public async setSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
    try {
      this.config = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: Boolean(url && anonKey),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
      await this.syncWithCloud();
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error('Error updating Supabase config:', err);
      return false;
    }
  }

  public getSupabaseClient(): SupabaseClient {
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

  // --- CLOUD SYNCHRONIZATION (BI-DIRECTIONAL & REACTIVE) ---

  /**
   * Reconciles local cache with remote Supabase database:
   * 1. Pushes any unsynced local records up to the user's account
   * 2. Fetches all remote records and merges them into the local cache
   * 3. Notifies subscribers so the UI updates instantly
   */
  public async syncWithCloud(): Promise<{ success: boolean; syncedCount?: number; error?: string }> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated with Supabase' };
      }

      const userId = session.user.id;
      const localRecords = this.getAllLocalRecords();
      const localBedtime = this.getAllLocalBedtimeLogs();

      // 1. Push unsynced local daily records to remote Supabase
      const recordEntries = Object.values(localRecords);
      for (const rec of recordEntries) {
        try {
          await this.supabase.from('daily_logs').upsert({
            user_id: userId,
            date: rec.date,
            hijri_date: rec.hijriDate || null,
            gateways: rec.gateways,
            prophetic_connection: rec.propheticConnection || null,
            prophetic_connection_note: rec.propheticConnectionNote || '',
            transactions: rec.transactions,
            net_energy: rec.netEnergy,
            balance_status: rec.balanceStatus,
            istighfar_count: rec.istighfarCount,
            istighfar_target: rec.istighfarTarget,
            breath_rounds: rec.breathRounds,
            reflection_note: rec.reflectionNote || '',
            is_completed: Boolean(rec.isCompleted),
            completed_at: rec.completedAt || null,
          }, { onConflict: 'user_id,date' });
        } catch (e) {
          console.warn('Sync record upload notice:', e);
        }
      }

      // 2. Push unsynced local bedtime logs to remote Supabase
      const bedtimeEntries = Object.values(localBedtime);
      for (const b of bedtimeEntries) {
        try {
          await this.supabase.from('bedtime_checks').upsert({
            user_id: userId,
            date: b.date,
            wudu_done: Boolean(b.wuduDone),
            salatul_wudu_done: Boolean(b.salatulWuduDone),
            falaq_count: b.falaqCount || 0,
            nas_count: b.nasCount || 0,
            ikhlas_count: b.ikhlasCount || 0,
            right_side_posture: Boolean(b.rightSidePosture),
            head_covered: Boolean(b.headCovered),
            wiped_body: Boolean(b.wipedBody),
            completed_at: b.completedAt || null,
          }, { onConflict: 'user_id,date' });
        } catch (e) {
          console.warn('Sync bedtime upload notice:', e);
        }
      }

      // 3. Fetch remote daily_logs
      const { data: remoteLogs, error: logsError } = await this.supabase
        .from('daily_logs')
        .select('*')
        .order('date', { ascending: false });

      if (logsError) {
        console.warn('Failed to fetch remote daily_logs:', logsError.message);
      } else if (remoteLogs) {
        for (const row of remoteLogs) {
          const formattedDate = typeof row.date === 'string' ? row.date.split('T')[0] : row.date;
          const remoteRecord: MuhasabaRecord = {
            id: row.id,
            userId: row.user_id,
            date: formattedDate,
            hijriDate: row.hijri_date || getApproximateHijriDate(new Date(formattedDate)),
            gateways: row.gateways || createDefaultGatewayAudits(),
            propheticConnection: row.prophetic_connection || row.gateways?._prophetic?.state || null,
            propheticConnectionNote: row.prophetic_connection_note || row.gateways?._prophetic?.note || '',
            transactions: row.transactions || [],
            netEnergy: row.net_energy || 0,
            balanceStatus: row.balance_status || 'balanced',
            istighfarCount: row.istighfar_count || 0,
            istighfarTarget: row.istighfar_target || 100,
            breathRounds: row.breath_rounds || 0,
            reflectionNote: row.reflection_note || '',
            isCompleted: row.is_completed || false,
            completedAt: row.completed_at || undefined,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          };

          const localExisting = localRecords[formattedDate];
          if (!localExisting || new Date(remoteRecord.updatedAt) >= new Date(localExisting.updatedAt)) {
            localRecords[formattedDate] = remoteRecord;
          }
        }
        this.saveAllLocalRecords(localRecords);
      }

      // 4. Fetch remote bedtime_checks
      const { data: remoteBedtime, error: bedtimeError } = await this.supabase
        .from('bedtime_checks')
        .select('*')
        .order('date', { ascending: false });

      if (bedtimeError) {
        console.warn('Failed to fetch remote bedtime_checks:', bedtimeError.message);
      } else if (remoteBedtime) {
        for (const row of remoteBedtime) {
          const formattedDate = typeof row.date === 'string' ? row.date.split('T')[0] : row.date;
          const remoteLog: BedtimeProtectionLog = {
            id: row.id,
            userId: row.user_id,
            date: formattedDate,
            wuduDone: Boolean(row.wudu_done),
            salatulWuduDone: Boolean(row.salatul_wudu_done),
            falaqCount: row.falaq_count || 0,
            nasCount: row.nas_count || 0,
            ikhlasCount: row.ikhlas_count || 0,
            rightSidePosture: Boolean(row.right_side_posture),
            headCovered: Boolean(row.head_covered),
            wipedBody: Boolean(row.wiped_body),
            completedAt: row.completed_at || undefined,
          };
          localBedtime[formattedDate] = remoteLog;
        }
        this.saveAllLocalBedtimeLogs(localBedtime);
      }

      // 5. Fetch remote user_ledger_items
      try {
        const { data: remoteItems, error: itemsError } = await this.supabase
          .from('user_ledger_items')
          .select('*')
          .order('sort_order', { ascending: true });

        if (itemsError) {
          console.warn('user_ledger_items sync notice:', itemsError.message);
        } else if (remoteItems && remoteItems.length > 0) {
          const mapped: LedgerOption[] = remoteItems.map((row) => ({
            id: row.id,
            type: row.type as 'credit' | 'debit',
            label: row.label,
            points: row.points,
            category: row.category,
            isDefault: Boolean(row.is_default),
            sortOrder: row.sort_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          this.saveAllLocalLedgerOptions(mapped);
        } else {
          // If remote table has 0 items for this user, seed it with current local options
          const localOptions = this.getUserLedgerOptions();
          const rows = localOptions.map((opt, idx) => ({
            id: opt.id,
            user_id: userId,
            type: opt.type,
            label: opt.label,
            points: opt.points,
            category: opt.category,
            is_default: Boolean(opt.isDefault),
            sort_order: opt.sortOrder || idx + 1,
          }));
          if (rows.length > 0) {
            await this.supabase.from('user_ledger_items').upsert(rows, { onConflict: 'user_id,type,label' });
          }
        }
      } catch (itemsErr) {
        console.warn('Sync ledger items upload notice:', itemsErr);
      }

      // 6. Notify all UI subscribers that new data has arrived!
      this.notifyListeners();

      return { success: true, syncedCount: (remoteLogs?.length || 0) };
    } catch (err: any) {
      console.warn('Cloud sync error:', err);
      return { success: false, error: err.message };
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
      propheticConnection: null,
      propheticConnectionNote: '',
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

    // 2. Save locally immediately (offline-first zero latency)
    const all = this.getAllLocalRecords();
    all[record.date] = record;
    this.saveAllLocalRecords(all);
    this.notifyListeners();

    // 3. Sync to Supabase in background if user is authenticated
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { error } = await this.supabase.from('daily_logs').upsert({
          user_id: userId,
          date: record.date,
          hijri_date: record.hijriDate || null,
          gateways: record.gateways,
          prophetic_connection: record.propheticConnection || null,
          prophetic_connection_note: record.propheticConnectionNote || '',
          transactions: record.transactions,
          net_energy: record.netEnergy,
          balance_status: record.balanceStatus,
          istighfar_count: record.istighfarCount,
          istighfar_target: record.istighfarTarget,
          breath_rounds: record.breathRounds,
          reflection_note: record.reflectionNote || '',
          is_completed: Boolean(record.isCompleted),
          completed_at: record.completedAt || null,
        }, { onConflict: 'user_id,date' });

        if (error) {
          console.warn('Supabase daily_logs sync notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('Background Supabase sync error:', err);
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
    this.notifyListeners();

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { error } = await this.supabase.from('bedtime_checks').upsert({
          user_id: userId,
          date: log.date,
          wudu_done: Boolean(log.wuduDone),
          salatul_wudu_done: Boolean(log.salatulWuduDone),
          falaq_count: log.falaqCount || 0,
          nas_count: log.nasCount || 0,
          ikhlas_count: log.ikhlasCount || 0,
          right_side_posture: Boolean(log.rightSidePosture),
          head_covered: Boolean(log.headCovered),
          wiped_body: Boolean(log.wipedBody),
          completed_at: log.completedAt || null,
        }, { onConflict: 'user_id,date' });

        if (error) {
          console.warn('Supabase bedtime_checks sync notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('Background Supabase sync error:', err);
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
      this.notifyListeners();
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
        this.notifyListeners();
        return { success: true, count };
      }
      return { success: false, error: 'Invalid backup format' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Parse error' };
    }
  }

  // --- USER LEDGER OPTIONS (PERMANENT & CUSTOMIZABLE) ---

  public getUserLedgerOptions(): LedgerOption[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEDGER_OPTIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read local ledger options', e);
    }
    // Seed defaults if no options exist in local storage yet
    this.saveAllLocalLedgerOptions(INITIAL_LEDGER_OPTIONS);
    return INITIAL_LEDGER_OPTIONS;
  }

  private saveAllLocalLedgerOptions(options: LedgerOption[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEDGER_OPTIONS, JSON.stringify(options));
    } catch (e) {
      console.error('Failed to write local ledger options', e);
    }
  }

  public async addLedgerOption(option: Omit<LedgerOption, 'id'>): Promise<LedgerOption> {
    const current = this.getUserLedgerOptions();
    const newId = `custom_opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOption: LedgerOption = {
      id: newId,
      type: option.type,
      label: option.label.trim(),
      points: option.type === 'debit' ? -Math.abs(option.points) : Math.abs(option.points),
      category: option.category?.trim() || (option.type === 'credit' ? 'Remembrance' : 'Ego'),
      isDefault: false,
      sortOrder: current.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...current, newOption];
    this.saveAllLocalLedgerOptions(updated);
    this.notifyListeners();

    // Sync to Supabase in background if user is authenticated
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await this.supabase.from('user_ledger_items').insert({
          id: newOption.id,
          user_id: userId,
          type: newOption.type,
          label: newOption.label,
          points: newOption.points,
          category: newOption.category,
          is_default: false,
          sort_order: newOption.sortOrder,
        });
      }
    } catch (err) {
      console.warn('Failed to insert custom ledger option into Supabase:', err);
    }

    return newOption;
  }

  public async deleteLedgerOption(id: string): Promise<void> {
    const current = this.getUserLedgerOptions();
    const updated = current.filter((opt) => opt.id !== id);
    this.saveAllLocalLedgerOptions(updated);
    this.notifyListeners();

    // Sync deletion to Supabase if authenticated
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await this.supabase.from('user_ledger_items').delete().eq('id', id).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Failed to delete ledger option from Supabase:', err);
    }
  }

  public async resetLedgerOptionsToDefault(): Promise<LedgerOption[]> {
    const current = this.getUserLedgerOptions();
    // Keep user's custom additions, restore any deleted standard Sunnah items
    const customOnly = current.filter((opt) => !opt.isDefault);
    const restored: LedgerOption[] = [...INITIAL_LEDGER_OPTIONS, ...customOnly];
    this.saveAllLocalLedgerOptions(restored);
    this.notifyListeners();

    // Sync reset to Supabase if authenticated
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await this.supabase.from('user_ledger_items').delete().eq('user_id', userId);
        const rows = restored.map((opt, idx) => ({
          id: opt.id,
          user_id: userId,
          type: opt.type,
          label: opt.label,
          points: opt.points,
          category: opt.category,
          is_default: Boolean(opt.isDefault),
          sort_order: idx + 1,
        }));
        await this.supabase.from('user_ledger_items').insert(rows);
      }
    } catch (err) {
      console.warn('Failed to reset default items in Supabase:', err);
    }

    return restored;
  }

  /**
   * Clears cached user data on sign out to prevent cross-account pollution
   */
  public clearUserCache() {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.BEDTIME);
    localStorage.removeItem(STORAGE_KEYS.LEDGER_OPTIONS);
    this.notifyListeners();
  }

  public clearAllData() {
    this.clearUserCache();
  }
}

export const storage = new StorageService();
