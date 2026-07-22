import { Modal } from './modal.js';
import { Toast } from './toast.js';
import { ExportImportService } from '../services/exportImport.js';

export function initSidebar(dataService) {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  // Close mobile drawer when clicking navigation links
  sidebar?.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop?.classList.remove('active');
    });
  });

  // Backup & Restore button
  const backupBtn = document.getElementById('btn-export-import');
  backupBtn?.addEventListener('click', () => {
    openBackupRestoreModal(dataService);
  });
}

function openBackupRestoreModal(dataService) {
  const bodyHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div>
        <h4 style="font-weight: 600; margin-bottom: 4px;">Export Application Data</h4>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
          Download a JSON backup file containing your study logs, projects, and blockers.
        </p>
        <button id="btn-export-json" class="btn btn-primary">
          📥 Download JSON Backup
        </button>
      </div>

      <hr style="border: none; border-top: 1px solid var(--border-color); margin: var(--space-xs) 0;" />

      <div>
        <h4 style="font-weight: 600; margin-bottom: 4px;">Import Data Backup</h4>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
          Select a previously exported <code>devjourney-backup.json</code> file to restore your data.
        </p>
        <div class="form-group">
          <input type="file" id="import-json-file" accept=".json" class="form-control" />
        </div>
        <button id="btn-import-json" class="btn btn-secondary">
          📤 Upload & Restore
        </button>
      </div>
    </div>
  `;

  const modal = Modal.open({
    title: 'Backup & Restore Data',
    bodyHTML,
    footerHTML: `<button class="btn btn-secondary" id="modal-close-cancel">Close</button>`
  });

  document.getElementById('modal-close-cancel')?.addEventListener('click', () => {
    modal.close();
  });

  // Export JSON click
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const success = ExportImportService.exportData(dataService.getState());
    if (success) {
      Toast.success('Backup file exported successfully!');
    } else {
      Toast.error('Failed to export backup data.');
    }
  });

  // Import JSON click
  document.getElementById('btn-import-json')?.addEventListener('click', () => {
    const fileInput = document.getElementById('import-json-file');
    const file = fileInput?.files?.[0];

    if (!file) {
      Toast.error('Please select a JSON file to import.');
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
        modal.close();
      } catch (err) {
        Toast.error('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });
}
