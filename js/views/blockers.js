import { formatDate, escapeHTML } from '../utils/formatters.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

export function renderBlockers(viewportEl, dataService) {
  const blockers = dataService.getBlockers();
  const openBlockers = blockers.filter(b => b.status === 'open');
  const resolvedBlockers = blockers.filter(b => b.status === 'resolved');

  viewportEl.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Blockers & Problem Tracker</h1>
        <p>Document technical roadblocks, root causes, and verified resolutions.</p>
      </div>
      <button id="btn-add-blocker" class="btn btn-danger">
        <i class="fa-solid fa-triangle-exclamation"></i> <span>Report Blocker</span>
      </button>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-xl);">
      <!-- Open Blockers Section -->
      <div>
        <h3 class="card-title" style="margin-bottom: var(--space-md); color: var(--status-danger);">
          <i class="fa-solid fa-circle-exclamation"></i> Open Roadblocks (${openBlockers.length})
        </h3>
        
        ${openBlockers.length === 0 ? `
          <div class="empty-state">
            <p>No open blockers! You are clear to code.</p>
          </div>
        ` : `
          <div class="data-list">
            ${openBlockers.map(b => `
              <div class="list-item-card" style="border-left: 4px solid var(--status-danger);">
                <div class="list-item-header">
                  <span class="list-item-title">${escapeHTML(b.title)}</span>
                  <div class="flex-gap-sm">
                    <span class="badge badge-danger">Open</span>
                    <button class="btn btn-sm btn-primary resolve-blocker-btn" data-id="${b.id}">
                      <i class="fa-solid fa-check"></i> Resolve
                    </button>
                    <button class="btn-icon delete-blocker-btn" data-id="${b.id}" title="Delete blocker" aria-label="Delete blocker">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <p style="font-size: 0.9375rem; color: var(--text-primary); margin-top: var(--space-xs);">
                  ${escapeHTML(b.description)}
                </p>

                ${b.whatWasTried ? `
                  <div style="background-color: var(--bg-surface-subtle); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); font-size: 0.8125rem; color: var(--text-secondary); margin-top: var(--space-xs);">
                    <strong>What was tried:</strong> ${escapeHTML(b.whatWasTried)}
                  </div>
                ` : ''}
                
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: var(--space-2xs);">
                  Reported on ${formatDate(b.createdAt)}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Resolved Blockers History -->
      <div>
        <h3 class="card-title" style="margin-bottom: var(--space-md); color: var(--status-success);">
          <i class="fa-solid fa-circle-check"></i> Resolved History (${resolvedBlockers.length})
        </h3>

        ${resolvedBlockers.length === 0 ? `
          <div class="empty-state">
            <p>No resolved blockers yet.</p>
          </div>
        ` : `
          <div class="data-list">
            ${resolvedBlockers.map(b => `
              <div class="list-item-card" style="border-left: 4px solid var(--status-success); opacity: 0.9;">
                <div class="list-item-header">
                  <span class="list-item-title" style="text-decoration: line-through; color: var(--text-secondary);">
                    ${escapeHTML(b.title)}
                  </span>
                  <div class="flex-gap-sm">
                    <span class="badge badge-success">Resolved</span>
                    <button class="btn-icon delete-blocker-btn" data-id="${b.id}" title="Delete blocker" aria-label="Delete blocker">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <p style="font-size: 0.875rem; color: var(--text-secondary);">
                  ${escapeHTML(b.description)}
                </p>

                <div style="background-color: var(--status-success-bg); border: 1px solid var(--status-success); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); font-size: 0.8125rem; color: var(--status-success); margin-top: var(--space-xs);">
                  <strong>Solution / Root Cause:</strong> ${escapeHTML(b.resolution)}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach Report Blocker button click
  document.getElementById('btn-add-blocker')?.addEventListener('click', () => {
    const modal = Modal.open({
      title: 'Report Technical Blocker',
      bodyHTML: `
        <form id="blocker-form">
          <div class="form-group">
            <label for="blocker-title" class="form-label">Blocker Title</label>
            <input type="text" id="blocker-title" class="form-control" placeholder="e.g. CORS error when fetching local API" required />
          </div>
          <div class="form-group">
            <label for="blocker-desc" class="form-label">Detailed Description of Problem</label>
            <textarea id="blocker-desc" class="form-control" placeholder="What unexpected behavior or error trace are you encountering?" required></textarea>
          </div>
          <div class="form-group">
            <label for="blocker-tried" class="form-label">What Have You Tried So Far?</label>
            <textarea id="blocker-tried" class="form-control" placeholder="List hypotheses, fixes, or documentation checked..."></textarea>
          </div>
        </form>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="modal-cancel-blocker">Cancel</button>
        <button class="btn btn-danger" id="modal-save-blocker">
          <i class="fa-solid fa-floppy-disk"></i> Save Blocker
        </button>
      `
    });

    document.getElementById('modal-cancel-blocker')?.addEventListener('click', () => modal.close());

    document.getElementById('modal-save-blocker')?.addEventListener('click', () => {
      const title = document.getElementById('blocker-title').value.trim();
      const description = document.getElementById('blocker-desc').value.trim();
      const whatWasTried = document.getElementById('blocker-tried').value.trim();

      if (!title || !description) {
        Toast.error('Please fill in both title and description.');
        return;
      }

      dataService.addBlocker({ title, description, whatWasTried });
      Toast.success('Blocker logged.');
      modal.close();
      renderBlockers(viewportEl, dataService);
    });
  });

  // Attach Resolve Blocker button clicks
  viewportEl.querySelectorAll('.resolve-blocker-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      
      const modal = Modal.open({
        title: 'Mark Blocker as Resolved',
        bodyHTML: `
          <div class="form-group">
            <label for="resolution-notes" class="form-label">Resolution / Root Cause Notes</label>
            <textarea id="resolution-notes" class="form-control" placeholder="How did you solve this? What was the fix or root cause?" required></textarea>
          </div>
        `,
        footerHTML: `
          <button class="btn btn-secondary" id="modal-cancel-resolve">Cancel</button>
          <button class="btn btn-primary" id="modal-save-resolve">
            <i class="fa-solid fa-check"></i> Mark Resolved
          </button>
        `
      });

      document.getElementById('modal-cancel-resolve')?.addEventListener('click', () => modal.close());

      document.getElementById('modal-save-resolve')?.addEventListener('click', () => {
        const resolution = document.getElementById('resolution-notes').value.trim();
        if (!resolution) {
          Toast.error('Please enter resolution notes.');
          return;
        }

        dataService.resolveBlocker(id, resolution);
        Toast.success('Blocker resolved!');
        modal.close();
        renderBlockers(viewportEl, dataService);
      });
    });
  });

  // Attach Delete blocker clicks
  viewportEl.querySelectorAll('.delete-blocker-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this blocker?')) {
        dataService.deleteBlocker(id);
        Toast.info('Blocker deleted.');
        renderBlockers(viewportEl, dataService);
      }
    });
  });
}
