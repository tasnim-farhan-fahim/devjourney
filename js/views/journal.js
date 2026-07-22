import { formatDate, escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';

export function renderJournal(viewportEl, dataService) {
  const entries = dataService.getJournalEntries();
  const goals = dataService.getGoals();
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
        <h3 class="card-title" style="margin-bottom: var(--space-md);">
          <i class="fa-solid fa-pen-to-square" style="color: var(--accent-primary); margin-right: 6px;"></i>Log New Study Session
        </h3>
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
            <label for="journal-goal-select" class="form-label">Link to Roadmap Goal (optional)</label>
            <select id="journal-goal-select" class="form-control">
              <option value="">-- Select Goal / Sub-Goal (Optional) --</option>
              ${goals.map(g => `
                <option value="goal:${g.id}">🎯 Goal: ${escapeHTML(g.title)}</option>
                ${(g.subGoals || []).map(sg => `
                  <option value="subgoal:${g.id}:${sg.id}">&nbsp;&nbsp;&nbsp;&nbsp;↳ Sub-goal: ${escapeHTML(sg.title)}</option>
                `).join('')}
              `).join('')}
            </select>
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
            <i class="fa-solid fa-floppy-disk"></i> Save Journal Entry
          </button>
        </form>
      </div>

      <!-- Journal Entry History List -->
      <div>
        <h3 class="card-title" style="margin-bottom: var(--space-md);">
          <i class="fa-solid fa-book-bookmark" style="color: var(--accent-primary); margin-right: 6px;"></i>Previous Entries (${entries.length})
        </h3>
        
        ${entries.length === 0 ? `
          <div class="empty-state">
            <p>No journal entries found. Log your first study session to get started!</p>
          </div>
        ` : `
          <div class="data-list">
            ${entries.map(entry => {
              const linkedGoalLabel = getLinkedGoalName(entry, goals);

              return `
                <div class="list-item-card" id="entry-${entry.id}">
                  <div class="list-item-header">
                    <div class="flex-gap-sm" style="flex-wrap: wrap;">
                      <span class="badge badge-info">${formatDate(entry.date)}</span>
                      <span class="badge badge-neutral">
                        <i class="fa-solid fa-stopwatch"></i> ${entry.hours} hrs
                      </span>
                      ${linkedGoalLabel ? `
                        <span class="badge badge-warning">
                          <i class="fa-solid fa-bullseye"></i> ${escapeHTML(linkedGoalLabel)}
                        </span>
                      ` : ''}
                    </div>
                    <button class="btn-icon delete-journal-btn" data-id="${entry.id}" title="Delete entry" aria-label="Delete journal entry">
                      <i class="fa-solid fa-trash-can"></i>
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
              `;
            }).join('')}
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
    const goalVal = document.getElementById('journal-goal-select').value;

    let goalId = null;
    let subGoalId = null;

    if (goalVal.startsWith('goal:')) {
      goalId = goalVal.replace('goal:', '');
    } else if (goalVal.startsWith('subgoal:')) {
      const parts = goalVal.split(':');
      goalId = parts[1];
      subGoalId = parts[2];
    }

    dataService.addJournalEntry({ date, hours, summary, tags, goalId, subGoalId });
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

function getLinkedGoalName(entry, goals) {
  if (!entry.goalId) return null;
  const goal = goals.find(g => g.id === entry.goalId);
  if (!goal) return null;

  if (entry.subGoalId && goal.subGoals) {
    const subGoal = goal.subGoals.find(sg => sg.id === entry.subGoalId);
    if (subGoal) return `${goal.title} → ${subGoal.title}`;
  }

  return goal.title;
}
