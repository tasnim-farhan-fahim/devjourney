import { StorageService } from '../services/storage.js';

export function initHeader() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const colorSelect = document.getElementById('color-theme-select');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  // 1. Load and apply saved Light/Dark theme preference
  const savedTheme = StorageService.getThemePref();
  setTheme(savedTheme);

  // 2. Load and apply saved Color theme preference
  const savedColorTheme = StorageService.getColorThemePref();
  setColorTheme(savedColorTheme);

  if (colorSelect) {
    colorSelect.value = savedColorTheme;
    colorSelect.addEventListener('change', (e) => {
      const selectedColor = e.target.value;
      setColorTheme(selectedColor);
      StorageService.setColorThemePref(selectedColor);
    });
  }

  themeBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    StorageService.setThemePref(newTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }
  }

  function setColorTheme(colorTheme) {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
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
