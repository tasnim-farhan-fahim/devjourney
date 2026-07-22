import { formatDate, escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';

export function renderJournal(viewportEl, dataService) {
  const entries = dataService.getJournalEntries();
  const todayStr = new Date().toISOString().split('T')[0];

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Daily Study Journal</h1>
        <p>Record your study sessions, topics covered, and key takeaways.</p>
      </div>
    </div>

    <div class="grid-2" style="align-items: start;">
      <!-- Journal Entry Form -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: var(--space-md);">📝 Log New Study Session</h3>
        <form id="journal-form">
          <div class="form-group">
            <label for="journal-date" class="form-label">Date</label>
            <input type="date" id="journal-date" class="form-control" value="${todayStr}" required />
          </div>

          <div class="form-group">
            <label for="journal-hours" class="form-label">Hours Studied</label>
            <input type="number" id="journal-hours" class="form-control" min="0.1" max="24" step="0.5" placeholder="e.g. 2.5" required />
          </div>

          <div class="form-group">
            <label for="journal-summary" class="form-label">Study Summary & Key Takeaways</label>
            <textarea id="journal-summary" class="form-control" placeholder="What did you learn today? What problems did you solve?" required></textarea>
          </div>

          <div class="form-group">
            <label for="journal-tags" class="form-label">Tags (comma-separated)</label>
            <input type="text" id="journal-tags" class="form-control" placeholder="e.g. javascript, css, algorithms" />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">
            💾 Save Journal Entry
          </button>
        </form>
      </div>

      <!-- Journal Entry History List -->
      <div>
        <h3 class="card-title" style="margin-bottom: var(--space-md);">📚 Previous Entries (${entries.length})</h3>
        
        ${entries.length === 0 ? `
          <div class="empty-state">
            <p>No journal entries found. Log your first study session to get started!</p>
          </div>
        ` : `
          <div class="data-list">
            ${entries.map(entry => `
              <div class="list-item-card" id="entry-${entry.id}">
                <div class="list-item-header">
                  <div class="flex-gap-sm">
                    <span class="badge badge-info">${formatDate(entry.date)}</span>
                    <span class="badge badge-neutral">⏱️ ${entry.hours} hrs</span>
                  </div>
                  <button class="btn-icon delete-journal-btn" data-id="${entry.id}" title="Delete entry" aria-label="Delete entry">
                    🗑️
                  </button>
                </div>
                
                <p style="font-size: 0.9375rem; white-space: pre-wrap; color: var(--text-primary); margin: var(--space-xs) 0;">
                  ${escapeHTML(entry.summary)}
                </p>

                ${(entry.tags && entry.tags.length > 0) ? `
                  <div class="tag-list">
                    ${entry.tags.map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach Form Submit Handler
  const form = document.getElementById('journal-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('journal-date').value;
    const hours = document.getElementById('journal-hours').value;
    const summary = document.getElementById('journal-summary').value;
    const tags = document.getElementById('journal-tags').value;

    dataService.addJournalEntry({ date, hours, summary, tags });
    Toast.success('Journal entry saved!');
    renderJournal(viewportEl, dataService);
  });

  // Attach Delete Button Listeners
  viewportEl.querySelectorAll('.delete-journal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this journal entry?')) {
        dataService.deleteJournalEntry(id);
        Toast.info('Journal entry deleted.');
        renderJournal(viewportEl, dataService);
      }
    });
  });
}
