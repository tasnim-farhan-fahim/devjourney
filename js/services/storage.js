import { CONFIG } from '../config.js';

export class StorageService {
  static async init() {
    let data = this.load();
    if (!data) {
      data = await this.fetchSeedData();
      if (data) {
        this.save(data);
      }
    } else {
      // Migrate or sanitize schema v1 -> v2
      data = this.migrateSchemaIfNeeded(data);
    }
    return data;
  }

  static load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
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
        data.meta.version = 2;
        data.meta.lastUpdated = new Date().toISOString();
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        return true;
      }
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
    return false;
  }

  static migrateSchemaIfNeeded(data) {
    let modified = false;

    // Ensure Profile object exists
    if (!data.profile || typeof data.profile !== 'object') {
      data.profile = {
        name: "Tasnim Farhan Fahim",
        title: "Software Engineer in Training",
        bio: "Building DevJourney and mastering full-stack web development."
      };
      modified = true;
    }

    // Ensure Goals array exists
    if (!Array.isArray(data.goals)) {
      data.goals = [
        {
          id: "goal-1",
          title: "Become a Full-Stack Developer",
          description: "Master modern frontend, backend API design, database modeling, and dev tools.",
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          subGoals: [
            {
              id: "sg-1-1",
              title: "Vanilla JavaScript ES6 Modules",
              description: "Understand DOM manipulation, custom events, and module imports.",
              completed: true,
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            },
            {
              id: "sg-1-2",
              title: "HTML5 & CSS3 Design System",
              description: "Custom variables, flexbox/grid layout, and dark/light themes.",
              completed: true,
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            },
            {
              id: "sg-1-3",
              title: "Single-Page App Hash Routing",
              description: "Build lightweight hash router for GitHub Pages static hosting.",
              completed: true,
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            },
            {
              id: "sg-1-4",
              title: "Backend API Integration with Node.js / Python",
              description: "Build RESTful APIs and handle asynchronous data streams.",
              completed: false,
              createdAt: new Date().toISOString(),
              completedAt: null
            }
          ]
        }
      ];
      modified = true;
    }

    if (modified || data.meta?.version !== 2) {
      data.meta = data.meta || {};
      data.meta.version = 2;
      this.save(data);
    }

    return data;
  }

  static async fetchSeedData() {
    try {
      const response = await fetch(CONFIG.SEED_DATA_PATH);
      if (!response.ok) throw new Error(`Seed fetch failed with status ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch seed data:', e);
      return {
        meta: { version: 2, lastUpdated: new Date().toISOString() },
        profile: { name: "Developer", title: "Software Engineer", bio: "" },
        goals: [],
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

  static getColorThemePref() {
    return localStorage.getItem(CONFIG.COLOR_THEME_KEY) || CONFIG.DEFAULT_COLOR_THEME;
  }

  static setColorThemePref(colorTheme) {
    localStorage.setItem(CONFIG.COLOR_THEME_KEY, colorTheme);
  }

  static async resetData() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    return await this.init();
  }
}
