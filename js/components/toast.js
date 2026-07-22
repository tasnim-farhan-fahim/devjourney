export class Toast {
  static show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-icon';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '2px 6px';
    closeBtn.style.fontSize = '1.1rem';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.textContent = '×';

    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    toast.appendChild(textSpan);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error'); }
  static info(msg) { this.show(msg, 'info'); }
}
