import { escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

export function renderProjects(viewportEl, dataService) {
  const projects = dataService.getProjects();

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Development Projects</h1>
        <p>Track applications, side projects, and open-source contributions.</p>
      </div>
      <button id="btn-add-project" class="btn btn-primary">
        <i class="fa-solid fa-plus"></i> <span>New Project</span>
      </button>
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
                  <button class="btn-icon edit-project-btn" data-id="${p.id}" title="Edit project" aria-label="Edit project">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn-icon delete-project-btn" data-id="${p.id}" title="Delete project" aria-label="Delete project">
                    <i class="fa-solid fa-trash-can"></i>
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
                    <i class="fa-solid fa-code-branch"></i> Repository
                  </a>
                ` : ''}
                ${p.demoUrl ? `
                  <a href="${escapeHTML(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  // Attach New Project button click
  document.getElementById('btn-add-project')?.addEventListener('click', () => {
    openProjectModal({
      title: 'Create New Project',
      project: null,
      dataService,
      onSave: () => renderProjects(viewportEl, dataService)
    });
  });

  // Attach Edit button listeners
  viewportEl.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const project = projects.find(p => p.id === id);
      if (project) {
        openProjectModal({
          title: 'Edit Project',
          project,
          dataService,
          onSave: () => renderProjects(viewportEl, dataService)
        });
      }
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

function openProjectModal({ title, project, dataService, onSave }) {
  const isEdit = Boolean(project);
  const p = project || {
    name: '',
    description: '',
    status: 'in-progress',
    progress: 0,
    repoUrl: '',
    demoUrl: ''
  };

  const bodyHTML = `
    <form id="project-modal-form">
      <div class="form-group">
        <label for="modal-project-name" class="form-label">Project Name</label>
        <input type="text" id="modal-project-name" class="form-control" value="${escapeHTML(p.name)}" placeholder="e.g. DevJourney" required />
      </div>

      <div class="form-group">
        <label for="modal-project-desc" class="form-label">Description</label>
        <textarea id="modal-project-desc" class="form-control" placeholder="What does this project do?" required>${escapeHTML(p.description)}</textarea>
      </div>

      <div class="grid-2" style="gap: var(--space-md);">
        <div class="form-group">
          <label for="modal-project-status" class="form-label">Status</label>
          <select id="modal-project-status" class="form-control">
            <option value="planned" ${p.status === 'planned' ? 'selected' : ''}>Planned</option>
            <option value="in-progress" ${p.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${p.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <div class="form-group">
          <label for="modal-project-progress" class="form-label">Progress (%)</label>
          <input type="number" id="modal-project-progress" class="form-control" min="0" max="100" value="${p.progress}" required />
        </div>
      </div>

      <div class="form-group">
        <label for="modal-project-repo" class="form-label">Repository URL (optional)</label>
        <input type="url" id="modal-project-repo" class="form-control" value="${escapeHTML(p.repoUrl)}" placeholder="https://github.com/..." />
      </div>

      <div class="form-group">
        <label for="modal-project-demo" class="form-label">Live Demo URL (optional)</label>
        <input type="url" id="modal-project-demo" class="form-control" value="${escapeHTML(p.demoUrl)}" placeholder="https://..." />
      </div>
    </form>
  `;

  const modal = Modal.open({
    title,
    bodyHTML,
    footerHTML: `
      <button class="btn btn-secondary" id="modal-project-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-project-save">
        <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Save Changes' : 'Create Project'}
      </button>
    `
  });

  document.getElementById('modal-project-cancel')?.addEventListener('click', () => modal.close());

  document.getElementById('modal-project-save')?.addEventListener('click', () => {
    const name = document.getElementById('modal-project-name').value.trim();
    const description = document.getElementById('modal-project-desc').value.trim();
    const status = document.getElementById('modal-project-status').value;
    const progressRaw = document.getElementById('modal-project-progress').value;
    const repoUrl = document.getElementById('modal-project-repo').value.trim();
    const demoUrl = document.getElementById('modal-project-demo').value.trim();

    if (!name) {
      Toast.error('Please enter a project name.');
      return;
    }

    const progressVal = parseInt(progressRaw, 10);
    if (isNaN(progressVal) || progressVal < 0 || progressVal > 100) {
      Toast.error('Progress must be a numeric value between 0 and 100.');
      return;
    }

    if (isEdit) {
      dataService.updateProject(p.id, {
        name,
        description,
        status,
        progress: progressVal,
        repoUrl,
        demoUrl
      });
      Toast.success('Project updated successfully!');
    } else {
      dataService.addProject({
        name,
        description,
        status,
        progress: progressVal,
        repoUrl,
        demoUrl
      });
      Toast.success('Project created successfully!');
    }

    modal.close();
    onSave();
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'in-progress': return 'badge-warning';
    default: return 'badge-neutral';
  }
}
