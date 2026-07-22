import { StorageService } from '../services/storage.js';
import { ExportImportService } from '../services/exportImport.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { CONFIG } from '../config.js';

export function renderSettings(viewportEl, dataService) {
  const profile = dataService.getProfile();
  const currentTheme = StorageService.getThemePref();
  const currentColorTheme = StorageService.getColorThemePref();

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Application Settings</h1>
        <p>Manage your developer profile, visual theme preferences, and data backups.</p>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-xl);">
      <!-- 1. Personal Details Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-user" style="color: var(--accent-primary); margin-right: 6px;"></i>Personal Details
          </h3>
          <span class="badge badge-neutral">Profile</span>
        </div>

        <form id="profile-form">
          <div class="grid-2" style="gap: var(--space-md);">
            <div class="form-group">
              <label for="profile-name" class="form-label">Full Name</label>
              <input type="text" id="profile-name" class="form-control" value="${profile.name || ''}" placeholder="e.g. Tasnim Farhan Fahim" required />
            </div>

            <div class="form-group">
              <label for="profile-title" class="form-label">Professional Title / Role</label>
              <input type="text" id="profile-title" class="form-control" value="${profile.title || ''}" placeholder="e.g. Full-Stack Engineer" required />
            </div>
          </div>

          <div class="form-group">
            <label for="profile-bio" class="form-label">Short Bio / Description</label>
            <textarea id="profile-bio" class="form-control" placeholder="Brief summary of your learning focus or current stack...">${profile.bio || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary">
            <i class="fa-solid fa-floppy-disk"></i> Save Profile Details
          </button>
        </form>
      </div>

      <!-- 2. Appearance Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-palette" style="color: var(--accent-primary); margin-right: 6px;"></i>Appearance & Themes
          </h3>
          <span class="badge badge-neutral">Customization</span>
        </div>

        <div class="grid-2" style="gap: var(--space-lg);">
          <div class="form-group">
            <label for="settings-color-theme" class="form-label">Accent Color Theme</label>
            <select id="settings-color-theme" class="form-control">
              <option value="blue" ${currentColorTheme === 'blue' ? 'selected' : ''}>Blue (Default)</option>
              <option value="emerald" ${currentColorTheme === 'emerald' ? 'selected' : ''}>Emerald Green</option>
              <option value="purple" ${currentColorTheme === 'purple' ? 'selected' : ''}>Purple Indigo</option>
              <option value="orange" ${currentColorTheme === 'orange' ? 'selected' : ''}>Warm Orange</option>
              <option value="rose" ${currentColorTheme === 'rose' ? 'selected' : ''}>Crimson Rose</option>
              <option value="monochrome" ${currentColorTheme === 'monochrome' ? 'selected' : ''}>Slate Monochrome</option>
            </select>
          </div>

          <div class="form-group">
            <label for="settings-theme-mode" class="form-label">Theme Mode</label>
            <select id="settings-theme-mode" class="form-control">
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 Dark Mode</option>
              <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>☀️ Light Mode</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Data Management Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-database" style="color: var(--accent-primary); margin-right: 6px;"></i>Data Management & Backups
          </h3>
          <span class="badge badge-neutral">Portability</span>
        </div>

        <div class="grid-2" style="gap: var(--space-lg); align-items: start;">
          <div>
            <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 4px;">Export Application Data</h4>
            <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
              Download a complete JSON backup of your profile, roadmap goals, study logs, projects, and blockers.
            </p>
            <button id="btn-settings-export" class="btn btn-primary">
              <i class="fa-solid fa-download"></i> Export Data Backup
            </button>
          </div>

          <div>
            <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 4px;">Import Data Backup</h4>
            <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
              Restore your DevJourney data from a previously exported <code>devjourney-backup.json</code> file.
            </p>
            <div class="form-group">
              <input type="file" id="settings-import-file" accept=".json" class="form-control" />
            </div>
            <button id="btn-settings-import" class="btn btn-secondary">
              <i class="fa-solid fa-upload"></i> Restore from File
            </button>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border-color); margin: var(--space-lg) 0;" />

        <div>
          <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--status-danger); margin-bottom: 4px;">
            Reset Application Data
          </h4>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
            Permanently clear all custom local data and restore default seed data. This action cannot be undone.
          </p>
          <button id="btn-settings-reset" class="btn btn-danger">
            <i class="fa-solid fa-triangle-exclamation"></i> Reset All Data
          </button>
        </div>
      </div>

      <!-- 4. Application Info -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-circle-info" style="color: var(--accent-primary); margin-right: 6px;"></i>About DevJourney
          </h3>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
          <strong>DevJourney v${CONFIG.VERSION}</strong> — Personal Developer Operating System.<br />
          Built using vanilla HTML5, CSS3 Custom Properties, and ES6 JavaScript Modules. Deployable directly to GitHub Pages with zero build dependencies.
        </p>
      </div>
    </div>
  `;

  // Profile Form Handler
  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const title = document.getElementById('profile-title').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();

    dataService.updateProfile({ name, title, bio });
    Toast.success('Profile details saved!');
  });

  // Color Theme Selector Handler
  document.getElementById('settings-color-theme')?.addEventListener('change', (e) => {
    const selectedColor = e.target.value;
    document.documentElement.setAttribute('data-color-theme', selectedColor);
    StorageService.setColorThemePref(selectedColor);
    Toast.success(`Color theme updated to ${selectedColor.toUpperCase()}`);
  });

  // Theme Mode Selector Handler
  document.getElementById('settings-theme-mode')?.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    StorageService.setThemePref(selectedTheme);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.innerHTML = selectedTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
    Toast.success(`Theme mode updated to ${selectedTheme.toUpperCase()}`);
  });

  // Export Data Handler
  document.getElementById('btn-settings-export')?.addEventListener('click', () => {
    const success = ExportImportService.exportData(dataService.getState());
    if (success) {
      Toast.success('Backup file exported!');
    } else {
      Toast.error('Export failed.');
    }
  });

  // Import Data Handler
  document.getElementById('btn-settings-import')?.addEventListener('click', () => {
    const fileInput = document.getElementById('settings-import-file');
    const file = fileInput?.files?.[0];

    if (!file) {
      Toast.error('Please select a JSON backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const validation = ExportImportService.validateImportData(parsed);

        if (!validation.valid) {
          Toast.error(validation.error);
          return;
        }

        dataService.replaceState(parsed);
        Toast.success('Data imported successfully!');
        renderSettings(viewportEl, dataService);
      } catch (err) {
        Toast.error('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });

  // Reset Data Handler (Destructive Action with Confirmation)
  document.getElementById('btn-settings-reset')?.addEventListener('click', () => {
    const modal = Modal.open({
      title: 'Confirm Reset Application Data',
      bodyHTML: `
        <p style="color: var(--status-danger); font-weight: 600; margin-bottom: var(--space-xs);">
          ⚠️ WARNING: Destructive Action!
        </p>
        <p style="font-size: 0.875rem; color: var(--text-secondary);">
          Are you sure you want to reset DevJourney? All your current goals, study journal entries, projects, and blockers will be permanently erased and restored to default seed data.
        </p>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="modal-cancel-reset">Cancel</button>
        <button class="btn btn-danger" id="modal-confirm-reset">
          <i class="fa-solid fa-triangle-exclamation"></i> Yes, Reset Everything
        </button>
      `
    });

    document.getElementById('modal-cancel-reset')?.addEventListener('click', () => modal.close());

    document.getElementById('modal-confirm-reset')?.addEventListener('click', async () => {
      await dataService.resetData();
      Toast.info('Application data reset to default seed state.');
      modal.close();
      renderSettings(viewportEl, dataService);
    });
  });
}
