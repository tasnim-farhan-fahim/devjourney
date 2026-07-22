import { DataService } from './services/data.js';
import { Router } from './router.js';
import { initHeader } from './components/header.js';
import { initSidebar } from './components/sidebar.js';
import { renderDashboard } from './views/dashboard.js';
import { renderGoals } from './views/goals.js';
import { renderJournal } from './views/journal.js';
import { renderProjects } from './views/projects.js';
import { renderBlockers } from './views/blockers.js';
import { renderMentor } from './views/mentor.js';
import { renderSettings } from './views/settings.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Data Layer
  const dataService = new DataService();
  await dataService.init();

  // Initialize Header and Sidebar Components
  initHeader();
  initSidebar(dataService);

  // Define App Route Mapping
  const routes = {
    '/dashboard': {
      title: 'Dashboard',
      render: renderDashboard
    },
    '/goals': {
      title: 'Goals & Learning Roadmap',
      render: renderGoals
    },
    '/journal': {
      title: 'Daily Study Journal',
      render: renderJournal
    },
    '/projects': {
      title: 'Development Projects',
      render: renderProjects
    },
    '/blockers': {
      title: 'Blocker & Problem Tracker',
      render: renderBlockers
    },
    '/mentor': {
      title: 'AI Mentor Context Generator',
      render: renderMentor
    },
    '/settings': {
      title: 'Application Settings',
      render: renderSettings
    }
  };

  // Initialize Hash Router
  const router = new Router(routes, dataService);
  router.init();
});
