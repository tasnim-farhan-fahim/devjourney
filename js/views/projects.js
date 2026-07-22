import { escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';

export function renderProjects(viewportEl, dataService) {
  const projects = dataService.getProjects();

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Development Projects</h1>
        <p>Track applications, side projects, and open-source contributions.</p>
      </div>
      <button id="btn-add-project" class="btn btn-primary">➕ New Project</button>
    </div>

    ${projects.length === 0 ? `
      <div class="empty-state">
        <p>No projects tracked yet. Click "New Project" to add your first project.</p>
      </div>
    ` : `
      <div class="grid-2">
        ${projects.map(p => `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="card-header">
                <span class="card-title">${escapeHTML(p.name)}</span>
                <div class="flex-gap-sm">
                  <span class="badge ${getStatusBadgeClass(p.status)}">${p.status}</span>
                  <button class="btn-icon delete-project-btn" data-id="${p.id}" title="Delete project" aria-label="Delete project">
                    🗑️
                  </button>
                </div>
              </div>

              <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
                ${escapeHTML(p.description || 'No description provided.')}
              </p>
            </div>

            <div>
              <div class="flex-between" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 4px;">
                <span>Progress</span>
                <span>${p.progress}%</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${p.progress}%;"></div>
              </div>

              <div class="flex-gap-sm" style="margin-top: var(--space-md);">
                ${p.repoUrl ? `
                  <a href="${escapeHTML(p.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
                    🔗 Repository
                  </a>
                ` : ''}
                ${p.demoUrl ? `
                  <a href="${escapeHTML(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                    🌐 Live Demo
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}

    <!-- Add Project Modal Form Template -->
    <div id="project-form-container" style="display: none;">
      <form id="project-form">
        <div class="form-group">
          <label for="project-name" class="form-label">Project Name</label>
          <input type="text" id="project-name" class="form-control" placeholder="e.g. DevJourney" required />
        </div>

        <div class="form-group">
          <label for="project-desc" class="form-label">Description</label>
          <textarea id="project-desc" class="form-control" placeholder="What does this project do?" required></textarea>
        </div>

        <div class="grid-2" style="gap: var(--space-md);">
          <div class="form-group">
            <label for="project-status" class="form-label">Status</label>
            <select id="project-status" class="form-control">
              <option value="planned">Planned</option>
              <option value="in-progress" selected>In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="form-group">
            <label for="project-progress" class="form-label">Progress (%)</label>
            <input type="number" id="project-progress" class="form-control" min="0" max="100" value="25" required />
          </div>
        </div>

        <div class="form-group">
          <label for="project-repo" class="form-label">Repository URL (optional)</label>
          <input type="url" id="project-repo" class="form-control" placeholder="https://github.com/..." />
        </div>

        <div class="form-group">
          <label for="project-demo" class="form-label">Live Demo URL (optional)</label>
          <input type="url" id="project-demo" class="form-control" placeholder="https://..." />
        </div>
      </form>
    </div>
  `;

  // Attach New Project button modal trigger
  document.getElementById('btn-add-project')?.addEventListener('click', () => {
    const formHTML = document.getElementById('project-form-container').innerHTML;
    
    // Custom modal invocation
    const container = document.getElementById('modal-container');
    container.innerHTML = `
      <div class="modal-overlay active" id="project-modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Create New Project</h3>
            <button id="project-modal-close" class="btn-icon">&times;</button>
          </div>
          <div class="modal-body">${formHTML}</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="project-modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="project-modal-save">Save Project</button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => container.innerHTML = '';
    document.getElementById('project-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('project-modal-cancel')?.addEventListener('click', closeModal);

    document.getElementById('project-modal-save')?.addEventListener('click', () => {
      const modalEl = container.querySelector('.modal-content');
      const name = modalEl.querySelector('#project-name').value.trim();
      const description = modalEl.querySelector('#project-desc').value.trim();
      const status = modalEl.querySelector('#project-status').value;
      const progress = modalEl.querySelector('#project-progress').value;
      const repoUrl = modalEl.querySelector('#project-repo').value.trim();
      const demoUrl = modalEl.querySelector('#project-demo').value.trim();

      if (!name) {
        Toast.error('Please provide a project name.');
        return;
      }

      dataService.addProject({ name, description, status, progress, repoUrl, demoUrl });
      Toast.success('Project added successfully!');
      closeModal();
      renderProjects(viewportEl, dataService);
    });
  });

  // Attach Delete listeners
  viewportEl.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this project?')) {
        dataService.deleteProject(id);
        Toast.info('Project deleted.');
        renderProjects(viewportEl, dataService);
      }
    });
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'in-progress': return 'badge-warning';
    default: return 'badge-neutral';
  }
}
