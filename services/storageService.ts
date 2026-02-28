
import localforage from 'localforage';
import { DailyEntry, TimeEntry, AppConfig } from '../types';

// Configuração do localforage
localforage.config({
  name: 'RotaFinanceira',
  storeName: 'app_data',
  description: 'Armazenamento persistente para o RotaFinanceira'
});

const KEYS = {
  ENTRIES: 'rota_financeira_data',
  TIME_ENTRIES: 'rota_financeira_time',
  CONFIG: 'rota_financeira_config',
  MIGRATED: 'rota_financeira_migrated_v2'
};

export const storageService = {
  /**
   * Migra dados do localStorage para o IndexedDB se necessário
   */
  async migrateFromLocalStorage() {
    const isMigrated = await localforage.getItem(KEYS.MIGRATED);
    if (isMigrated) return;

    console.log('Iniciando migração de dados do localStorage para IndexedDB...');

    const savedEntries = localStorage.getItem(KEYS.ENTRIES);
    const savedTimeEntries = localStorage.getItem(KEYS.TIME_ENTRIES);
    const savedConfig = localStorage.getItem(KEYS.CONFIG);

    if (savedEntries) {
      await localforage.setItem(KEYS.ENTRIES, JSON.parse(savedEntries));
    }
    if (savedTimeEntries) {
      await localforage.setItem(KEYS.TIME_ENTRIES, JSON.parse(savedTimeEntries));
    }
    if (savedConfig) {
      await localforage.setItem(KEYS.CONFIG, JSON.parse(savedConfig));
    }

    await localforage.setItem(KEYS.MIGRATED, true);
    console.log('Migração concluída com sucesso!');
  },

  async getEntries(): Promise<DailyEntry[]> {
    const data = await localforage.getItem<DailyEntry[]>(KEYS.ENTRIES);
    return data || [];
  },

  async saveEntries(entries: DailyEntry[]) {
    await localforage.setItem(KEYS.ENTRIES, entries);
  },

  async getTimeEntries(): Promise<TimeEntry[]> {
    const data = await localforage.getItem<TimeEntry[]>(KEYS.TIME_ENTRIES);
    return data || [];
  },

  async saveTimeEntries(timeEntries: TimeEntry[]) {
    await localforage.setItem(KEYS.TIME_ENTRIES, timeEntries);
  },

  async getConfig(): Promise<AppConfig | null> {
    return await localforage.getItem<AppConfig>(KEYS.CONFIG);
  },

  async saveConfig(config: AppConfig) {
    await localforage.setItem(KEYS.CONFIG, config);
  },

  async clearAll() {
    await localforage.clear();
    localStorage.removeItem(KEYS.ENTRIES);
    localStorage.removeItem(KEYS.TIME_ENTRIES);
    localStorage.removeItem(KEYS.CONFIG);
  }
};
