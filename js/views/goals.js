import { escapeHTML, formatDate } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

// Store collapsed state in memory for active view session
const collapsedGoals = new Set();

export function renderGoals(viewportEl, dataService) {
  const goals = dataService.getGoals();

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Goals & Learning Roadmap</h1>
        <p>Define your development roadmap, track sub-goals, and follow your learning progress.</p>
      </div>
      <button id="btn-add-goal" class="btn btn-primary">
        <i class="fa-solid fa-plus"></i> <span>New Goal</span>
      </button>
    </div>

    ${goals.length === 0 ? `
      <div class="empty-state">
        <p>No roadmap goals defined yet. Click "New Goal" to add your primary learning objective!</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        ${goals.map(g => {
          const isCollapsed = collapsedGoals.has(g.id);
          const subGoals = g.subGoals || [];
          const completedCount = subGoals.filter(sg => sg.completed).length;
          const totalCount = subGoals.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (g.completed ? 100 : 0);

          return `
            <div class="goal-card" id="goal-card-${g.id}">
              <div class="goal-card-header">
                <div class="goal-title-group">
                  <button class="goal-toggle-btn" data-id="${g.id}" aria-label="Toggle goal section">
                    <i class="fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'}"></i>
                  </button>

                  <button class="subgoal-checkbox-btn ${g.completed ? 'checked' : ''} toggle-parent-btn" data-id="${g.id}" title="${g.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <i class="fa-solid ${g.completed ? 'fa-square-check' : 'fa-square'}"></i>
                  </button>

                  <div>
                    <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
                      <span class="goal-title ${g.completed ? 'completed' : ''}">${escapeHTML(g.title)}</span>
                      <span class="badge ${g.completed ? 'badge-success' : 'badge-info'}">
                        ${totalCount > 0 ? `${completedCount}/${totalCount} completed (${pct}%)` : (g.completed ? 'Completed' : 'In Progress')}
                      </span>
                    </div>
                    ${g.description ? `<p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px;">${escapeHTML(g.description)}</p>` : ''}
                  </div>
                </div>

                <div class="flex-gap-sm">
                  <button class="btn btn-sm btn-secondary add-subgoal-btn" data-id="${g.id}" title="Add Sub-goal">
                    <i class="fa-solid fa-plus"></i> Sub-goal
                  </button>
                  <button class="btn-icon delete-goal-btn" data-id="${g.id}" title="Delete Goal" aria-label="Delete Goal">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <!-- Sub-goals Tree List -->
              ${!isCollapsed ? `
                ${subGoals.length === 0 ? `
                  <div style="margin-left: var(--space-xl); font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">
                    No sub-goals added yet. Click "+ Sub-goal" to break this goal down.
                  </div>
                ` : `
                  <div class="subgoal-list">
                    ${subGoals.map(sg => `
                      <div class="subgoal-item">
                        <button class="subgoal-checkbox-btn ${sg.completed ? 'checked' : ''} toggle-subgoal-btn" data-goal-id="${g.id}" data-subgoal-id="${sg.id}" title="${sg.completed ? 'Mark incomplete' : 'Mark complete'}">
                          <i class="fa-solid ${sg.completed ? 'fa-square-check' : 'fa-square'}"></i>
                        </button>
                        
                        <div style="flex: 1;">
                          <span class="subgoal-text ${sg.completed ? 'completed' : ''}">
                            ${escapeHTML(sg.title)}
                          </span>
                          ${sg.description ? `<span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${escapeHTML(sg.description)}</span>` : ''}
                        </div>

                        ${sg.completedAt ? `
                          <span class="badge badge-neutral" style="font-size: 0.6875rem;">
                            ✓ ${formatDate(sg.completedAt)}
                          </span>
                        ` : ''}

                        <button class="btn-icon delete-subgoal-btn" data-goal-id="${g.id}" data-subgoal-id="${sg.id}" title="Delete sub-goal" aria-label="Delete sub-goal">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  // Attach Add Parent Goal Handler
  document.getElementById('btn-add-goal')?.addEventListener('click', () => {
    const modal = Modal.open({
      title: 'Create Roadmap Goal',
      bodyHTML: `
        <form id="goal-form">
          <div class="form-group">
            <label for="goal-title" class="form-label">Goal Title</label>
            <input type="text" id="goal-title" class="form-control" placeholder="e.g. Become a Full-Stack Developer" required />
          </div>
          <div class="form-group">
            <label for="goal-desc" class="form-label">Description (optional)</label>
            <textarea id="goal-desc" class="form-control" placeholder="What will achieving this goal enable you to do?"></textarea>
          </div>
        </form>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="modal-goal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-goal-save">
          <i class="fa-solid fa-floppy-disk"></i> Save Goal
        </button>
      `
    });

    document.getElementById('modal-goal-cancel')?.addEventListener('click', () => modal.close());

    document.getElementById('modal-goal-save')?.addEventListener('click', () => {
      const titleInput = document.getElementById('goal-title');
      const descInput = document.getElementById('goal-desc');

      const title = titleInput?.value.trim() || '';
      const description = descInput?.value.trim() || '';

      if (!title) {
        Toast.error('Please enter a goal title.');
        return;
      }

      dataService.addGoal({ title, description });
      Toast.success('Goal created!');
      modal.close();
      renderGoals(viewportEl, dataService);
    });
  });

  // Attach Add Sub-Goal Handlers
  viewportEl.querySelectorAll('.add-subgoal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentGoalId = e.currentTarget.getAttribute('data-id');

      const modal = Modal.open({
        title: 'Add Sub-Goal',
        bodyHTML: `
          <form id="subgoal-form">
            <div class="form-group">
              <label for="subgoal-title" class="form-label">Sub-Goal Title</label>
              <input type="text" id="subgoal-title" class="form-control" placeholder="e.g. Learn Async Programming in Python" required />
            </div>
            <div class="form-group">
              <label for="subgoal-desc" class="form-label">Description (optional)</label>
              <textarea id="subgoal-desc" class="form-control" placeholder="Key topics or milestones..."></textarea>
            </div>
          </form>
        `,
        footerHTML: `
          <button class="btn btn-secondary" id="modal-subgoal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-subgoal-save">
            <i class="fa-solid fa-plus"></i> Add Sub-Goal
          </button>
        `
      });

      document.getElementById('modal-subgoal-cancel')?.addEventListener('click', () => modal.close());

      document.getElementById('modal-subgoal-save')?.addEventListener('click', () => {
        const titleInput = document.getElementById('subgoal-title');
        const descInput = document.getElementById('subgoal-desc');

        const title = titleInput?.value.trim() || '';
        const description = descInput?.value.trim() || '';

        if (!title) {
          Toast.error('Please enter a sub-goal title.');
          return;
        }

        dataService.addSubGoal(parentGoalId, { title, description });
        Toast.success('Sub-goal added!');
        modal.close();
        renderGoals(viewportEl, dataService);
      });
    });
  });

  // Collapse / Expand toggle
  viewportEl.querySelectorAll('.goal-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      if (collapsedGoals.has(id)) {
        collapsedGoals.delete(id);
      } else {
        collapsedGoals.add(id);
      }
      renderGoals(viewportEl, dataService);
    });
  });

  // Parent Goal Checkbox Toggle
  viewportEl.querySelectorAll('.toggle-parent-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      dataService.toggleGoalCompletion(id);
      renderGoals(viewportEl, dataService);
    });
  });

  // Sub-Goal Checkbox Toggle
  viewportEl.querySelectorAll('.toggle-subgoal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const goalId = e.currentTarget.getAttribute('data-goal-id');
      const subGoalId = e.currentTarget.getAttribute('data-subgoal-id');
      dataService.toggleSubGoalCompletion(goalId, subGoalId);
      renderGoals(viewportEl, dataService);
    });
  });

  // Delete Parent Goal
  viewportEl.querySelectorAll('.delete-goal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this goal and all its sub-goals?')) {
        dataService.deleteGoal(id);
        Toast.info('Goal deleted.');
        renderGoals(viewportEl, dataService);
      }
    });
  });

  // Delete Sub-Goal
  viewportEl.querySelectorAll('.delete-subgoal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const goalId = e.currentTarget.getAttribute('data-goal-id');
      const subGoalId = e.currentTarget.getAttribute('data-subgoal-id');
      dataService.deleteSubGoal(goalId, subGoalId);
      renderGoals(viewportEl, dataService);
    });
  });
}