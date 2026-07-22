import { StorageService } from '../services/storage.js';

export function initHeader() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  // Load and apply saved theme preference
  const savedTheme = StorageService.getThemePref();
  setTheme(savedTheme);

  themeBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    StorageService.setThemePref(newTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  // Mobile menu drawer toggle
  function toggleMobileNav() {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('active');
  }

  mobileToggle?.addEventListener('click', toggleMobileNav);
  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('active');
  });
}

export function setHeaderTitle(title) {
  const titleEl = document.getElementById('header-title');
  if (titleEl) {
    titleEl.textContent = title;
  }
}
