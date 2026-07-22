import { setHeaderTitle } from './components/header.js';

export class Router {
  constructor(routes, dataService) {
    this.routes = routes;
    this.dataService = dataService;
    this.viewportEl = document.getElementById('app-viewport');
    
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  handleRoute() {
    let hash = window.location.hash.slice(1);
    if (!hash || hash === '/') {
      hash = '/dashboard';
    }

    const routeInfo = this.routes[hash] || this.routes['/dashboard'];

    if (routeInfo && this.viewportEl) {
      setHeaderTitle(routeInfo.title);
      routeInfo.render(this.viewportEl, this.dataService);
      this.updateActiveNavLinks(hash);
      window.scrollTo(0, 0);
    }
  }

  updateActiveNavLinks(currentHash) {
    document.querySelectorAll('.nav-item').forEach(link => {
      const href = link.getAttribute('href');
      const route = link.getAttribute('data-route');
      if (href === `#${currentHash}` || currentHash.includes(route)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
