import { CONFIG } from '../config.js';

export class StorageService {
  static async init() {
    let data = this.load();
    if (!data) {
      data = await this.fetchSeedData();
      if (data) {
        this.save(data);
      }
    }
    return data;
  }

  static load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      // Validate minimum structural requirements
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.journal) || !Array.isArray(parsed.projects)) {
        console.warn('LocalStorage data is malformed. Re-initializing from seed data.');
        return null;
      }
      return parsed;
    } catch (e) {
      console.error('Error reading localStorage data:', e);
      return null;
    }
  }

  static save(data) {
    try {
      if (data && typeof data === 'object') {
        data.meta = data.meta || {};
        data.meta.lastUpdated = new Date().toISOString();
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        return true;
      }
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
    return false;
  }

  static async fetchSeedData() {
    try {
      const response = await fetch(CONFIG.SEED_DATA_PATH);
      if (!response.ok) throw new Error(`Seed fetch failed with status ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch seed data:', e);
      return {
        meta: { version: 1, lastUpdated: new Date().toISOString() },
        profile: { name: "Developer", title: "Software Engineer" },
        journal: [],
        projects: [],
        blockers: []
      };
    }
  }

  static getThemePref() {
    return localStorage.getItem(CONFIG.THEME_KEY) || CONFIG.DEFAULT_THEME;
  }

  static setThemePref(theme) {
    localStorage.setItem(CONFIG.THEME_KEY, theme);
  }
}
