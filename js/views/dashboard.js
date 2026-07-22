import { formatDate, escapeHTML } from '../utils/formatters.js';

export function renderDashboard(viewportEl, dataService) {
  const profile = dataService.getProfile();
  const stats = dataService.getStats();
  const recentJournal = dataService.getJournalEntries().slice(0, 3);
  const activeProjects = dataService.getActiveProjects();
  const completedProjects = dataService.getCompletedProjects();
  const roadmap = dataService.getDashboardRoadmap();

  viewportEl.innerHTML = `
    <!-- Welcome Header Banner -->
    <div class="welcome-banner">
      <div>
        <h1 class="welcome-title">Welcome back, ${escapeHTML(profile.name || 'Developer')} 👋</h1>
        <p class="welcome-subtitle">${escapeHTML(profile.title || 'Software Engineer')}</p>
      </div>
      <div class="flex-gap-sm">
        <a href="#/goals" class="btn btn-primary">
          <i class="fa-solid fa-bullseye"></i> <span>View Roadmap</span>
        </a>
        <a href="#/journal" class="btn btn-secondary">
          <i class="fa-solid fa-plus"></i> <span>Log Study</span>
        </a>
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
        <span class="stat-value">
          <i class="fa-solid fa-fire" style="color: var(--status-warning); font-size: 1.5rem; margin-right: 4px;"></i>${stats.currentStreak}d
        </span>
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

    <!-- Active Roadmap Goal Card -->
    ${roadmap && roadmap.activeGoal ? `
      <div class="card" style="margin-bottom: var(--space-lg);">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-bullseye" style="color: var(--accent-primary); margin-right: 6px;"></i>Current Roadmap Goal
          </h3>
          <a href="#/goals" class="btn btn-sm btn-secondary">Manage Roadmap</a>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
          <div class="flex-between">
            <span style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">
              ${escapeHTML(roadmap.activeGoal.title)}
            </span>
            <span class="badge badge-info">${roadmap.completedCount} / ${roadmap.totalCount} completed</span>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${roadmap.progressPct}%;"></div>
          </div>

          ${roadmap.nextSubGoal ? `
            <div style="font-size: 0.875rem; color: var(--text-secondary); background-color: var(--bg-surface-subtle); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); margin-top: var(--space-2xs);">
              🎯 <strong>Next Priority Sub-goal:</strong> ${escapeHTML(roadmap.nextSubGoal.title)}
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <div class="grid-2" style="margin-bottom: var(--space-lg);">
      <!-- Active Projects Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-diagram-project" style="color: var(--accent-primary); margin-right: 6px;"></i>Active Projects (${activeProjects.length})
          </h3>
          <a href="#/projects" class="btn btn-sm btn-secondary">View All</a>
        </div>

        ${activeProjects.length === 0 ? `
          <div class="empty-state">
            <p>No active projects currently in progress or planned.</p>
            <a href="#/projects" class="btn btn-sm btn-primary" style="margin-top: 10px;">
              <i class="fa-solid fa-plus"></i> Add a Project
            </a>
          </div>
        ` : `
          <div class="data-list">
            ${activeProjects.map(p => `
              <div class="list-item-card">
                <div class="list-item-header">
                  <span class="list-item-title">${escapeHTML(p.name)}</span>
                  <span class="badge ${p.status === 'in-progress' ? 'badge-warning' : 'badge-neutral'}">${p.status}</span>
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

      <!-- Completed Projects Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fa-solid fa-circle-check" style="color: var(--status-success); margin-right: 6px;"></i>Completed Projects (${completedProjects.length})
          </h3>
          <a href="#/projects" class="btn btn-sm btn-secondary">View All</a>
        </div>

        ${completedProjects.length === 0 ? `
          <div class="empty-state">
            <p>No completed projects yet. Finish active projects to showcase them here!</p>
          </div>
        ` : `
          <div class="data-list">
            ${completedProjects.map(p => `
              <div class="list-item-card" style="border-left: 3px solid var(--status-success);">
                <div class="list-item-header">
                  <span class="list-item-title">${escapeHTML(p.name)}</span>
                  <span class="badge badge-success">Completed</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary);">${escapeHTML(p.description)}</p>
                ${p.demoUrl ? `
                  <div style="margin-top: 4px;">
                    <a href="${escapeHTML(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" style="font-size: 0.75rem;">
                      <i class="fa-solid fa-globe"></i> Live Demo
                    </a>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>

    <!-- Recent Study Journal Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fa-solid fa-book" style="color: var(--accent-primary); margin-right: 6px;"></i>Recent Study Journal
        </h3>
        <a href="#/journal" class="btn btn-sm btn-secondary">View All</a>
      </div>
      
      ${recentJournal.length === 0 ? `
        <div class="empty-state">
          <p>No study sessions logged yet.</p>
          <a href="#/journal" class="btn btn-sm btn-primary" style="margin-top: 10px;">
            <i class="fa-solid fa-plus"></i> Log Your First Session
          </a>
        </div>
      ` : `
        <div class="data-list">
          ${recentJournal.map(entry => `
            <div class="list-item-card">
              <div class="list-item-header">
                <span class="badge badge-info">
                  <i class="fa-solid fa-calendar-day"></i> ${formatDate(entry.date)} (${entry.hours}h)
                </span>
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
  `;
}
