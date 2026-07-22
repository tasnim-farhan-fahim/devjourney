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

  async resetData() {
    this.state = await StorageService.resetData();
    this.saveState();
  }

  // Profile Methods
  getProfile() {
    return this.state?.profile || { name: 'Developer', title: 'Software Engineer', bio: '' };
  }

  updateProfile({ name, title, bio }) {
    this.state.profile = {
      name: name || '',
      title: title || '',
      bio: bio || ''
    };
    this.saveState();
  }

  // Dashboard Metrics & Statistics
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

  // Goals & Roadmap Methods
  getGoals() {
    return this.state?.goals || [];
  }

  addGoal({ title, description }) {
    const newGoal = {
      id: 'goal-' + Date.now(),
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      subGoals: []
    };
    this.state.goals.unshift(newGoal);
    this.saveState();
    return newGoal;
  }

  addSubGoal(parentGoalId, { title, description }) {
    const parentGoal = this.state.goals.find(g => g.id === parentGoalId);
    if (parentGoal) {
      const newSubGoal = {
        id: 'sg-' + Date.now(),
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      parentGoal.subGoals.push(newSubGoal);
      this.saveState();
      return newSubGoal;
    }
    return null;
  }

  toggleGoalCompletion(goalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
      goal.completedAt = goal.completed ? new Date().toISOString() : null;
      // Mark all sub-goals to match parent
      if (goal.subGoals) {
        goal.subGoals.forEach(sg => {
          sg.completed = goal.completed;
          sg.completedAt = goal.completed ? new Date().toISOString() : null;
        });
      }
      this.saveState();
    }
  }

  toggleSubGoalCompletion(goalId, subGoalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (goal) {
      const subGoal = goal.subGoals.find(sg => sg.id === subGoalId);
      if (subGoal) {
        subGoal.completed = !subGoal.completed;
        subGoal.completedAt = subGoal.completed ? new Date().toISOString() : null;
        
        // Auto update parent completion if all subgoals are completed
        const allCompleted = goal.subGoals.length > 0 && goal.subGoals.every(sg => sg.completed);
        goal.completed = allCompleted;
        goal.completedAt = allCompleted ? new Date().toISOString() : null;

        this.saveState();
      }
    }
  }

  deleteGoal(goalId) {
    this.state.goals = this.state.goals.filter(g => g.id !== goalId);
    this.saveState();
  }

  deleteSubGoal(goalId, subGoalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (goal) {
      goal.subGoals = goal.subGoals.filter(sg => sg.id !== subGoalId);
      this.saveState();
    }
  }

  getDashboardRoadmap() {
    const goals = this.getGoals();
    if (goals.length === 0) return null;

    // Find first active (incomplete) goal, or fallback to first
    const activeGoal = goals.find(g => !g.completed) || goals[0];
    const subGoals = activeGoal.subGoals || [];
    const completedCount = subGoals.filter(sg => sg.completed).length;
    const totalCount = subGoals.length;
    const nextSubGoal = subGoals.find(sg => !sg.completed) || null;

    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (activeGoal.completed ? 100 : 0);

    return {
      activeGoal,
      completedCount,
      totalCount,
      progressPct,
      nextSubGoal
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
      goalId: entry.goalId || null,
      subGoalId: entry.subGoalId || null,
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

  getActiveProjects() {
    return (this.state?.projects || []).filter(p => p.status === 'in-progress' || p.status === 'planned');
  }

  getCompletedProjects() {
    return (this.state?.projects || []).filter(p => p.status === 'completed');
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

  updateProject(id, updatedFields) {
    const project = this.state.projects.find(p => p.id === id);
    if (project) {
      if (updatedFields.name !== undefined) project.name = updatedFields.name;
      if (updatedFields.description !== undefined) project.description = updatedFields.description;
      if (updatedFields.status !== undefined) project.status = updatedFields.status;
      if (updatedFields.progress !== undefined) {
        project.progress = Math.min(100, Math.max(0, parseInt(updatedFields.progress, 10) || 0));
      }
      if (updatedFields.repoUrl !== undefined) project.repoUrl = updatedFields.repoUrl;
      if (updatedFields.demoUrl !== undefined) project.demoUrl = updatedFields.demoUrl;
      project.updatedAt = new Date().toISOString();

      this.saveState();
      return project;
    }
    return null;
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
    const profile = this.getProfile();
    const journal = this.getJournalEntries().slice(0, 5);
    const projects = this.getProjects();
    const openBlockers = this.getBlockers().filter(b => b.status === 'open');
    const roadmap = this.getDashboardRoadmap();
    const stats = this.getStats();

    let text = `=== DEVJOURNEY MENTOR CONTEXT ===\n`;
    text += `Date: ${new Date().toISOString().split('T')[0]}\n`;
    text += `Developer: ${profile.name || 'Developer'} (${profile.title || 'Software Engineer'})\n\n`;

    text += `## PROGRESS SUMMARY\n`;
    text += `- Total Study Hours Logged: ${stats.totalHours} hrs\n`;
    text += `- Active Projects: ${stats.activeProjects}\n`;
    text += `- Open Technical Blockers: ${stats.openBlockers}\n`;
    text += `- Current Study Streak: ${stats.currentStreak} day(s)\n\n`;

    if (roadmap && roadmap.activeGoal) {
      text += `## CURRENT ROADMAP GOAL\n`;
      text += `- Goal: ${roadmap.activeGoal.title}\n`;
      text += `- Progress: ${roadmap.completedCount} / ${roadmap.totalCount} sub-goals completed (${roadmap.progressPct}%)\n`;
      if (roadmap.nextSubGoal) {
        text += `- Next Priority Sub-goal: ${roadmap.nextSubGoal.title}\n`;
      }
      text += `\n`;
    }

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
