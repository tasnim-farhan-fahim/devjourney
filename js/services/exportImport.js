export class ExportImportService {
  static exportData(data) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `devjourney-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Export error:', e);
      return false;
    }
  }

  static validateImportData(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      return { valid: false, error: 'Uploaded file does not contain a valid JSON object.' };
    }
    if (!Array.isArray(jsonData.journal)) {
      return { valid: false, error: 'Invalid backup format: missing "journal" array.' };
    }
    if (!Array.isArray(jsonData.projects)) {
      return { valid: false, error: 'Invalid backup format: missing "projects" array.' };
    }
    if (!Array.isArray(jsonData.blockers)) {
      return { valid: false, error: 'Invalid backup format: missing "blockers" array.' };
    }
    return { valid: true };
  }
}
