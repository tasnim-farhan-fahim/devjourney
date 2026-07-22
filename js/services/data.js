import { StorageService } from './storage.js';
import { eventBus } from '../utils/eventBus.js';
import { calculateStreak } from '../utils/formatters.js';

export class DataService {
  constructor() {
    this.state = null;
  }

  async init() {
    this.state = await StorageService.init();
  }

  getState() {
    return this.state;
  }

  saveState() {
    StorageService.save(this.state);
    eventBus.emit('dataChanged', this.state);
  }

  replaceState(newState) {
    this.state = newState;
    this.saveState();
  }

  getStats() {
    const journal = this.state?.journal || [];
    const projects = this.state?.projects || [];
    const blockers = this.state?.blockers || [];

    const totalHours = journal.reduce((sum, item) => sum + (parseFloat(item.hours) || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'planned').length;
    const openBlockers = blockers.filter(b => b.status === 'open').length;
    const streak = calculateStreak(journal);

    return {
      totalHours: Number(totalHours.toFixed(1)),
      activeProjects,
      openBlockers,
      currentStreak: streak,
      journalCount: journal.length
    };
  }

  // Journal Methods
  getJournalEntries() {
    return [...(this.state?.journal || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addJournalEntry(entry) {
    const newEntry = {
      id: 'j-' + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      summary: entry.summary,
      hours: parseFloat(entry.hours) || 0,
      tags: Array.isArray(entry.tags) 
        ? entry.tags 
        : (entry.tags ? entry.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []),
      createdAt: new Date().toISOString()
    };
    this.state.journal.unshift(newEntry);
    this.saveState();
    return newEntry;
  }

  deleteJournalEntry(id) {
    this.state.journal = this.state.journal.filter(item => item.id !== id);
    this.saveState();
  }

  // Projects Methods
  getProjects() {
    return this.state?.projects || [];
  }

  addProject(project) {
    const newProject = {
      id: 'p-' + Date.now(),
      name: project.name,
      description: project.description || '',
      status: project.status || 'planned',
      progress: Math.min(100, Math.max(0, parseInt(project.progress, 10) || 0)),
      repoUrl: project.repoUrl || '',
      demoUrl: project.demoUrl || '',
      createdAt: new Date().toISOString()
    };
    this.state.projects.unshift(newProject);
    this.saveState();
    return newProject;
  }

  deleteProject(id) {
    this.state.projects = this.state.projects.filter(item => item.id !== id);
    this.saveState();
  }

  // Blockers Methods
  getBlockers() {
    return this.state?.blockers || [];
  }

  addBlocker(blocker) {
    const newBlocker = {
      id: 'b-' + Date.now(),
      title: blocker.title,
      description: blocker.description || '',
      whatWasTried: blocker.whatWasTried || '',
      status: 'open',
      resolution: '',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };
    this.state.blockers.unshift(newBlocker);
    this.saveState();
    return newBlocker;
  }

  resolveBlocker(id, resolutionNotes) {
    const blocker = this.state.blockers.find(b => b.id === id);
    if (blocker) {
      blocker.status = 'resolved';
      blocker.resolution = resolutionNotes || 'Resolved';
      blocker.resolvedAt = new Date().toISOString();
      this.saveState();
    }
  }

  deleteBlocker(id) {
    this.state.blockers = this.state.blockers.filter(item => item.id !== id);
    this.saveState();
  }

  // AI Mentor Context Generator
  generateMentorContext() {
    const journal = this.getJournalEntries().slice(0, 5);
    const projects = this.getProjects();
    const openBlockers = this.getBlockers().filter(b => b.status === 'open');
    const stats = this.getStats();

    let text = `=== DEVJOURNEY MENTOR CONTEXT ===\n`;
    text += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
    text += `## PROGRESS SUMMARY\n`;
    text += `- Total Study Hours Logged: ${stats.totalHours} hrs\n`;
    text += `- Active Projects: ${stats.activeProjects}\n`;
    text += `- Open Technical Blockers: ${stats.openBlockers}\n`;
    text += `- Current Study Streak: ${stats.currentStreak} day(s)\n\n`;

    text += `## RECENT STUDY LOGS (Last 5 Entries)\n`;
    if (journal.length === 0) {
      text += `No recent journal entries.\n`;
    } else {
      journal.forEach(j => {
        text += `- [${j.date}] (${j.hours}h) ${j.summary}${j.tags?.length ? ' (Tags: ' + j.tags.join(', ') + ')' : ''}\n`;
      });
    }
    text += `\n`;

    text += `## CURRENT PROJECTS\n`;
    if (projects.length === 0) {
      text += `No projects logged.\n`;
    } else {
      projects.forEach(p => {
        text += `- ${p.name} [Status: ${p.status.toUpperCase()} | Progress: ${p.progress}%]: ${p.description}\n`;
      });
    }
    text += `\n`;

    text += `## OPEN BLOCKERS & PROBLEMS\n`;
    if (openBlockers.length === 0) {
      text += `No active technical blockers.\n`;
    } else {
      openBlockers.forEach(b => {
        text += `- ${b.title}: ${b.description}\n  What was tried: ${b.whatWasTried || 'None specified'}\n`;
      });
    }
    text += `\n==================================`;

    return text;
  }
}
