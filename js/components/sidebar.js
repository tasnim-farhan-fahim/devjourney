export function initSidebar(dataService) {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const brandLink = document.getElementById('brand-home-link');

  // Close mobile drawer when clicking any navigation link or brand link
  sidebar?.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop?.classList.remove('active');
    });
  });

  brandLink?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('active');
  });
}
