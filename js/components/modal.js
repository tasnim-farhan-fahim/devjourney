export class Modal {
  static open({ title, bodyHTML, footerHTML = '' }) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-overlay active" id="current-modal-overlay">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title-heading">
          <div class="modal-header">
            <h3 id="modal-title-heading" class="modal-title">${title}</h3>
            <button id="modal-close-btn" class="btn-icon" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            ${bodyHTML}
          </div>
          ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        </div>
      </div>
    `;

    const overlay = document.getElementById('current-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    const closeHandler = () => {
      container.innerHTML = '';
      document.removeEventListener('keydown', keyHandler);
    };

    const keyHandler = (e) => {
      if (e.key === 'Escape') closeHandler();
    };

    closeBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeHandler();
    });
    document.addEventListener('keydown', keyHandler);

    return {
      close: closeHandler,
      element: overlay
    };
  }

  static close() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }
}
