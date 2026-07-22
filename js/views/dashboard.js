import { formatDate, escapeHTML } from '../utils/formatters.js';

export function renderDashboard(viewportEl, dataService) {
  const stats = dataService.getStats();
  const recentJournal = dataService.getJournalEntries().slice(0, 3);
  const projects = dataService.getProjects().slice(0, 3);
  const blockers = dataService.getBlockers().filter(b => b.status === 'open').slice(0, 3);

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Dashboard</h1>
        <p>Overview of your developer activity, learning streak, and project status.</p>
      </div>
      <div class="flex-gap-sm">
        <a href="#/journal" class="btn btn-primary">➕ Log Study</a>
        <a href="#/blockers" class="btn btn-secondary">🚨 Add Blocker</a>
      </div>
    </div>

    <!-- Key Metrics Stat Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">Total Study Hours</span>
        <span class="stat-value">${stats.totalHours}h</span>
        <span class="stat-subtext">Across ${stats.journalCount} logged sessions</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Study Streak</span>
        <span class="stat-value">🔥 ${stats.currentStreak}d</span>
        <span class="stat-subtext">${stats.currentStreak > 0 ? 'Consecutive days active' : 'Log study to start streak'}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Active Projects</span>
        <span class="stat-value">${stats.activeProjects}</span>
        <span class="stat-subtext">In-progress & planned</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Open Blockers</span>
        <span class="stat-value" style="color: ${stats.openBlockers > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
          ${stats.openBlockers}
        </span>
        <span class="stat-subtext">${stats.openBlockers > 0 ? 'Requires attention' : 'All problems resolved!'}</span>
      </div>
    </div>

    <div class="grid-2">
      <!-- Recent Journal Entries -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📓 Recent Study Journal</h3>
          <a href="#/journal" class="btn btn-sm btn-secondary">View All</a>
        </div>
        
        ${recentJournal.length === 0 ? `
          <div class="empty-state">
            <p>No study sessions logged yet.</p>
            <a href="#/journal" class="btn btn-sm btn-primary" style="margin-top: 10px;">Log Your First Session</a>
          </div>
        ` : `
          <div class="data-list">
            ${recentJournal.map(entry => `
              <div class="list-item-card">
                <div class="list-item-header">
                  <span class="badge badge-info">${formatDate(entry.date)} (${entry.hours}h)</span>
                  <div class="tag-list">
                    ${(entry.tags || []).map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('')}
                  </div>
                </div>
                <p style="font-size: 0.9375rem; margin-top: 4px;">${escapeHTML(entry.summary)}</p>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Active Projects Summary -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🚀 Active Projects</h3>
          <a href="#/projects" class="btn btn-sm btn-secondary">View All</a>
        </div>

        ${projects.length === 0 ? `
          <div class="empty-state">
            <p>No projects tracked yet.</p>
            <a href="#/projects" class="btn btn-sm btn-primary" style="margin-top: 10px;">Add a Project</a>
          </div>
        ` : `
          <div class="data-list">
            ${projects.map(p => `
              <div class="list-item-card">
                <div class="list-item-header">
                  <span class="list-item-title">${escapeHTML(p.name)}</span>
                  <span class="badge ${p.status === 'completed' ? 'badge-success' : 'badge-warning'}">${p.status}</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary);">${escapeHTML(p.description)}</p>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: ${p.progress}%;"></div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${p.progress}% Complete</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
