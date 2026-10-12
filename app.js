/**
 * TaskPulse — Modern To-Do List Application
 * Pure Vanilla JavaScript implementation with LocalStorage, Audio effects, and Confetti engine
 */

(function () {
  'use strict';

  // ==========================================
  // 1. Audio Engine (Web Audio API)
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('taskpulse_sound') !== 'false';
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('taskpulse_sound', this.enabled);
      return this.enabled;
    }

    playAdd() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    }

    playComplete() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Two-note ascending sparkling chime
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + index * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.14, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    }

    playDelete() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  // ==========================================
  // 2. Confetti Particle System
  // ==========================================
  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animationFrame = null;
      this.colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

      if (this.canvas) {
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x, y, count = 60) {
      if (!this.ctx) return;
      const originX = x || window.innerWidth / 2;
      const originY = y || window.innerHeight / 3;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: Math.random() * 7 + 4,
          tilt: Math.random() * 10,
          tiltAngleIncremental: Math.random() * 0.08 + 0.04,
          tiltAngle: 0,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012
        });
      }

      if (!this.animationFrame) {
        this.render();
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.alpha -= p.decay;
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        if (p.alpha <= 0 || p.y > this.canvas.height) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.translate(p.x, p.y);
        this.ctx.fillRect(-p.size / 2, -p.size / 2 + p.tilt, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(() => this.render());
      } else {
        this.animationFrame = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // ==========================================
  // 3. State & Defaults
  // ==========================================
  const soundEngine = new SoundEngine();
  const confettiEngine = new ConfettiEngine('confetti-canvas');

  const STORAGE_KEY = 'taskpulse_tasks_v2';
  const THEME_KEY = 'taskpulse_theme';

  const defaultSampleTasks = [
    {
      id: 'demo-1',
      title: 'Review project architecture & design system',
      category: 'work',
      priority: 'high',
      dueDate: getRelativeDate(0), // Today
      completed: false,
      pinned: true,
      createdAt: Date.now() - 3600000,
      completedAt: null
    },
    {
      id: 'demo-2',
      title: 'Complete 30-minute cardio or evening stretch',
      category: 'health',
      priority: 'medium',
      dueDate: getRelativeDate(0), // Today
      completed: true,
      pinned: false,
      createdAt: Date.now() - 7200000,
      completedAt: Date.now() - 1800000
    },
    {
      id: 'demo-3',
      title: 'Read chapter 4 of Clean Code principles',
      category: 'study',
      priority: 'low',
      dueDate: getRelativeDate(1), // Tomorrow
      completed: false,
      pinned: false,
      createdAt: Date.now() - 10800000,
      completedAt: null
    },
    {
      id: 'demo-4',
      title: 'Pick up weekly fresh groceries and fruits',
      category: 'shopping',
      priority: 'medium',
      dueDate: getRelativeDate(2),
      completed: false,
      pinned: false,
      createdAt: Date.now() - 14400000,
      completedAt: null
    }
  ];

  let tasks = [];
  let currentFilter = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let sortBy = 'newest';
  let lastDeletedTask = null;
  let undoTimeout = null;

  // Category metadata helpers
  const categoryMeta = {
    work: { label: 'Work', emoji: '💼' },
    personal: { label: 'Personal', emoji: '🏠' },
    study: { label: 'Study', emoji: '📚' },
    health: { label: 'Health', emoji: '💪' },
    finance: { label: 'Finance', emoji: '💰' },
    shopping: { label: 'Shopping', emoji: '🛒' }
  };

  // Helper date utility
  function getRelativeDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ==========================================
  // 4. Initialization
  // ==========================================
  function init() {
    loadTheme();
    loadTasks();
    setupDateAndGreeting();
    updateSoundUI();
    bindEvents();
    render();
  }

  // Theme Management
  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeToggleUI(next);
    soundEngine.playClick();
  }

  function updateThemeToggleUI(theme) {
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    if (!moonIcon || !sunIcon) return;

    if (theme === 'dark') {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
    } else {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    }
  }

  function updateSoundUI() {
    const onIcon = document.querySelector('.sound-on-icon');
    const offIcon = document.querySelector('.sound-off-icon');
    if (!onIcon || !offIcon) return;

    if (soundEngine.enabled) {
      onIcon.classList.remove('hidden');
      offIcon.classList.add('hidden');
    } else {
      onIcon.classList.add('hidden');
      offIcon.classList.remove('hidden');
    }
  }

  // Live Date and Dynamic Greeting
  function setupDateAndGreeting() {
    const now = new Date();
    const dateText = document.getElementById('date-text');
    const greetingText = document.getElementById('greeting-text');

    if (dateText) {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      dateText.textContent = now.toLocaleDateString(undefined, options);
    }

    if (greetingText) {
      const hour = now.getHours();
      let greeting = 'Good morning';
      if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
      else if (hour >= 17) greeting = 'Good evening';
      greetingText.textContent = `${greeting}! Let's make today productive.`;
    }
  }

  // Task Storage
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tasks = JSON.parse(stored);
      } else {
        tasks = defaultSampleTasks;
        saveTasks();
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
      tasks = defaultSampleTasks;
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }

  // ==========================================
  // 5. Task Operations
  // ==========================================
  function addTask(title, category, priority, dueDate) {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: trimmed,
      category: category || 'personal',
      priority: priority || 'low',
      dueDate: dueDate || '',
      completed: false,
      pinned: false,
      createdAt: Date.now(),
      completedAt: null
    };

    tasks.unshift(newTask);
    saveTasks();
    render();
    soundEngine.playAdd();
    showToast('Task added successfully!');
  }

  function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;

    saveTasks();
    render();

    if (task.completed) {
      soundEngine.playComplete();
      // Burst confetti if it was high priority or if all tasks are complete
      const totalPending = tasks.filter(t => !t.completed).length;
      if (task.priority === 'high' || totalPending === 0) {
        confettiEngine.burst();
      }
    } else {
      soundEngine.playClick();
    }
  }

  function togglePinTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.pinned = !task.pinned;
    saveTasks();
    render();
    soundEngine.playClick();
    showToast(task.pinned ? 'Task pinned to top ⭐' : 'Task unpinned');
  }

  function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    // Find DOM element to animate removal first
    const itemEl = document.querySelector(`[data-task-id="${id}"]`);
    if (itemEl) {
      itemEl.classList.add('removing');
    }

    setTimeout(() => {
      lastDeletedTask = { task: tasks[index], index };
      tasks.splice(index, 1);
      saveTasks();
      render();
      soundEngine.playDelete();

      showToast('Task deleted', () => {
        undoDeleteTask();
      }, 'Undo');
    }, 240);
  }

  function undoDeleteTask() {
    if (!lastDeletedTask) return;
    tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
    saveTasks();
    lastDeletedTask = null;
    render();
    soundEngine.playAdd();
    showToast('Task restored!');
  }

  function updateTask(id, updatedFields) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    Object.assign(task, updatedFields);
    saveTasks();
    render();
    soundEngine.playClick();
    showToast('Task updated successfully!');
  }

  function markAllDone() {
    if (tasks.length === 0) return;
    let changed = false;
    tasks.forEach(t => {
      if (!t.completed) {
        t.completed = true;
        t.completedAt = Date.now();
        changed = true;
      }
    });

    if (changed) {
      saveTasks();
      render();
      soundEngine.playComplete();
      confettiEngine.burst();
      showToast('All tasks marked as completed!');
    }
  }

  function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.');
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
    soundEngine.playDelete();
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}.`);
  }

  function resetSampleTasks() {
    tasks = JSON.parse(JSON.stringify(defaultSampleTasks));
    saveTasks();
    render();
    soundEngine.playAdd();
    showToast('Sample tasks reset.');
  }

  // ==========================================
  // 6. Filtering & Sorting
  // ==========================================
  function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // Filter by Tab (Status)
    if (currentFilter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      result = result.filter(t => t.completed);
    } else if (currentFilter === 'starred') {
      result = result.filter(t => t.pinned);
    }

    // Filter by Category
    if (currentCategory !== 'all') {
      result = result.filter(t => t.category === currentCategory);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }

    // Sorting
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      // Pinned tasks always stay at the top (unless completed tab is viewed)
      if (a.pinned !== b.pinned && currentFilter !== 'completed') {
        return a.pinned ? -1 : 1;
      }

      if (sortBy === 'priority') {
        const weightDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (weightDiff !== 0) return weightDiff;
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }

      // Default: Newest first
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }

  // ==========================================
  // 7. Render UI
  // ==========================================
  function render() {
    renderStats();
    renderBadges();
    renderTaskList();
  }

  function renderStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;
    
    const todayStr = getRelativeDate(0);
    const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update Counters
    const statCompletedEl = document.getElementById('stat-completed-count');
    const statTotalEl = document.getElementById('stat-total-count');
    const miniPendingEl = document.getElementById('mini-pending-count');
    const miniOverdueEl = document.getElementById('mini-overdue-count');
    const miniHighEl = document.getElementById('mini-high-count');
    const progressTextEl = document.getElementById('progress-percentage-text');
    const progressCircle = document.getElementById('progress-circle');
    const motivationalBanner = document.getElementById('motivational-banner');

    if (statCompletedEl) statCompletedEl.textContent = completed;
    if (statTotalEl) statTotalEl.textContent = total;
    if (miniPendingEl) miniPendingEl.textContent = pending;
    if (miniOverdueEl) miniOverdueEl.textContent = overdue;
    if (miniHighEl) miniHighEl.textContent = highPriority;
    if (progressTextEl) progressTextEl.textContent = `${percentage}%`;

    // Circular Progress Ring calculation
    if (progressCircle) {
      const radius = progressCircle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius; // ~276.46
      const offset = circumference - (percentage / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }

    // Motivational Quote
    if (motivationalBanner) {
      if (total === 0) {
        motivationalBanner.textContent = "Your canvas is clean! Add a task to begin.";
      } else if (percentage === 100) {
        motivationalBanner.textContent = "🎉 Outstanding! All tasks completed for today!";
      } else if (percentage >= 70) {
        motivationalBanner.textContent = "Almost there! Finish strong today 💪";
      } else if (percentage >= 30) {
        motivationalBanner.textContent = "Solid momentum! Keep checking items off.";
      } else {
        motivationalBanner.textContent = "Every small step counts towards your goals.";
      }
    }
  }

  function renderBadges() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const starred = tasks.filter(t => t.pinned).length;

    const badgeAll = document.getElementById('badge-all');
    const badgeActive = document.getElementById('badge-active');
    const badgeCompleted = document.getElementById('badge-completed');
    const badgeStarred = document.getElementById('badge-starred');

    if (badgeAll) badgeAll.textContent = total;
    if (badgeActive) badgeActive.textContent = active;
    if (badgeCompleted) badgeCompleted.textContent = completed;
    if (badgeStarred) badgeStarred.textContent = starred;
  }

  function renderTaskList() {
    const taskListEl = document.getElementById('task-list');
    const emptyStateEl = document.getElementById('empty-state');
    const emptyTitleEl = document.getElementById('empty-title');
    const emptyDescEl = document.getElementById('empty-description');

    if (!taskListEl) return;

    const filtered = getFilteredAndSortedTasks();

    if (filtered.length === 0) {
      taskListEl.innerHTML = '';
      if (emptyStateEl) {
        emptyStateEl.classList.remove('hidden');
        if (searchQuery.trim()) {
          emptyTitleEl.textContent = 'No matching tasks';
          emptyDescEl.textContent = `No tasks found matching "${searchQuery}". Try a different keyword.`;
        } else if (currentFilter === 'completed') {
          emptyTitleEl.textContent = 'No completed tasks yet';
          emptyDescEl.textContent = 'Check off tasks from your Active list to see them here.';
        } else if (currentFilter === 'starred') {
          emptyTitleEl.textContent = 'No starred tasks';
          emptyDescEl.textContent = 'Click the star icon ⭐ on any task to keep it highlighted here.';
        } else {
          emptyTitleEl.textContent = 'All caught up!';
          emptyDescEl.textContent = 'You have no tasks pending in this view. Enjoy your day!';
        }
      }
      return;
    }

    if (emptyStateEl) emptyStateEl.classList.add('hidden');

    const todayStr = getRelativeDate(0);
    const tomorrowStr = getRelativeDate(1);

    taskListEl.innerHTML = filtered.map(task => {
      // Due Date text & status
      let dueHtml = '';
      if (task.dueDate) {
        let dueLabel = task.dueDate;
        let dueClass = '';

        if (task.dueDate < todayStr && !task.completed) {
          dueLabel = `Overdue (${task.dueDate})`;
          dueClass = 'overdue';
        } else if (task.dueDate === todayStr) {
          dueLabel = 'Today';
          dueClass = 'today';
        } else if (task.dueDate === tomorrowStr) {
          dueLabel = 'Tomorrow';
        }

        dueHtml = `
          <span class="badge due-badge ${dueClass}" title="Due date">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${escapeHtml(dueLabel)}
          </span>
        `;
      }

      // Category formatting
      const catInfo = categoryMeta[task.category] || { label: task.category, emoji: '🏷️' };
      const catBadge = `
        <span class="badge category-badge">
          ${catInfo.emoji} ${catInfo.label}
        </span>
      `;

      // Priority formatting
      const prioCapitalized = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      const prioBadge = `
        <span class="badge priority-badge ${task.priority}">
          ● ${prioCapitalized}
        </span>
      `;

      return `
        <li class="task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}" data-task-id="${task.id}">
          <div class="task-left">
            <button class="task-star-btn ${task.pinned ? 'active' : ''}" data-action="pin" title="${task.pinned ? 'Unstar task' : 'Star task'}" aria-label="Star task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${task.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>

            <label class="custom-checkbox" title="${task.completed ? 'Mark uncompleted' : 'Mark completed'}">
              <input type="checkbox" data-action="toggle" ${task.completed ? 'checked' : ''} aria-label="Toggle task completion">
              <div class="checkbox-visual">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </label>

            <div class="task-content">
              <span class="task-title">${escapeHtml(task.title)}</span>
              <div class="task-meta">
                ${catBadge}
                ${prioBadge}
                ${dueHtml}
              </div>
            </div>
          </div>

          <div class="task-actions">
            <button class="action-btn edit-btn" data-action="edit" title="Edit task" aria-label="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" data-action="delete" title="Delete task" aria-label="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </li>
      `;
    }).join('');
  }

  // Safe HTML Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 8. Toast Notifications
  // ==========================================
  function showToast(message, actionCallback = null, actionText = 'Action') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    if (undoTimeout) {
      clearTimeout(undoTimeout);
      undoTimeout = null;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    if (actionCallback) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = actionText;
      actionBtn.addEventListener('click', () => {
        actionCallback();
        removeToast(toast);
      });
      toast.appendChild(actionBtn);
    }

    container.appendChild(toast);

    undoTimeout = setTimeout(() => {
      removeToast(toast);
    }, 4500);
  }

  function removeToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }

  // ==========================================
  // 9. Edit Modal Dialog
  // ==========================================
  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-task-form');
  const editIdInput = document.getElementById('edit-task-id');
  const editTitleInput = document.getElementById('edit-task-title');
  const editCategoryInput = document.getElementById('edit-task-category');
  const editPriorityInput = document.getElementById('edit-task-priority');
  const editDateInput = document.getElementById('edit-task-date');

  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editIdInput.value = task.id;
    editTitleInput.value = task.title;
    editCategoryInput.value = task.category;
    editPriorityInput.value = task.priority;
    editDateInput.value = task.dueDate || '';

    editModal.classList.remove('hidden');
    editTitleInput.focus();
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
  }

  // ==========================================
  // 10. Import & Export Functions
  // ==========================================
  function exportTasksJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `taskpulse_backup_${getRelativeDate(0)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Tasks exported to JSON file!');
  }

  function importTasksJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          tasks = parsed;
          saveTasks();
          render();
          soundEngine.playAdd();
          showToast(`Successfully imported ${parsed.length} tasks!`);
        } else {
          alert('Invalid file format. Expected an array of tasks.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // ==========================================
  // 11. Event Listeners & Binding
  // ==========================================
  function bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEngine.toggle();
        updateSoundUI();
        if (soundEngine.enabled) soundEngine.playClick();
      });
    }

    // Quick Date Buttons inside Form
    const btnQuickToday = document.getElementById('btn-quick-today');
    const btnQuickTomorrow = document.getElementById('btn-quick-tomorrow');
    const dateInput = document.getElementById('task-due-date');

    if (btnQuickToday && dateInput) {
      btnQuickToday.addEventListener('click', () => {
        dateInput.value = getRelativeDate(0);
        soundEngine.playClick();
      });
    }

    if (btnQuickTomorrow && dateInput) {
      btnQuickTomorrow.addEventListener('click', () => {
        dateInput.value = getRelativeDate(1);
        soundEngine.playClick();
      });
    }

    // Add Task Form submission
    const addForm = document.getElementById('add-task-form');
    const titleInput = document.getElementById('task-title-input');
    const categorySelect = document.getElementById('task-category-select');

    if (addForm) {
      addForm.addEventListener('submit', e => {
        e.preventDefault();
        const priorityEl = document.querySelector('input[name="priority"]:checked');
        const priority = priorityEl ? priorityEl.value : 'low';
        
        addTask(
          titleInput.value,
          categorySelect.value,
          priority,
          dateInput.value
        );

        titleInput.value = '';
        dateInput.value = '';
        titleInput.focus();
      });
    }

    // Task Item click delegation
    const taskListEl = document.getElementById('task-list');
    if (taskListEl) {
      taskListEl.addEventListener('click', e => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const taskId = item.getAttribute('data-task-id');

        // Pin button
        const pinBtn = e.target.closest('[data-action="pin"]');
        if (pinBtn) {
          e.stopPropagation();
          togglePinTask(taskId);
          return;
        }

        // Checkbox toggle
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox) {
          toggleTaskCompletion(taskId);
          return;
        }

        // Edit button
        const editBtn = e.target.closest('[data-action="edit"]');
        if (editBtn) {
          e.stopPropagation();
          openEditModal(taskId);
          return;
        }

        // Delete button
        const deleteBtn = e.target.closest('[data-action="delete"]');
        if (deleteBtn) {
          e.stopPropagation();
          deleteTask(taskId);
          return;
        }
      });
    }

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter');
        soundEngine.playClick();
        render();
      });
    });

    // Category Filter Dropdown
    const filterCatSelect = document.getElementById('filter-category-select');
    if (filterCatSelect) {
      filterCatSelect.addEventListener('change', e => {
        currentCategory = e.target.value;
        soundEngine.playClick();
        render();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        sortBy = e.target.value;
        soundEngine.playClick();
        render();
      });
    }

    // Search Input
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          if (searchQuery.length > 0) {
            clearSearchBtn.classList.remove('hidden');
          } else {
            clearSearchBtn.classList.add('hidden');
          }
        }
        render();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        searchInput.focus();
        soundEngine.playClick();
        render();
      });
    }

    // Empty Action Button
    const emptyActionBtn = document.getElementById('empty-action-btn');
    if (emptyActionBtn) {
      emptyActionBtn.addEventListener('click', () => {
        if (titleInput) {
          titleInput.focus();
          titleInput.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Extra Options Menu Dropdown
    const extraMenuBtn = document.getElementById('extra-menu-btn');
    const extraMenuDropdown = document.getElementById('extra-menu-dropdown');

    if (extraMenuBtn && extraMenuDropdown) {
      extraMenuBtn.addEventListener('click', e => {
        e.stopPropagation();
        extraMenuDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', e => {
        if (!extraMenuDropdown.contains(e.target) && e.target !== extraMenuBtn) {
          extraMenuDropdown.classList.add('hidden');
        }
      });
    }

    // Menu Item Actions
    const btnMarkAll = document.getElementById('btn-mark-all-done');
    if (btnMarkAll) {
      btnMarkAll.addEventListener('click', () => {
        extraMenuDropdown.classList.add('hidden');
        markAllDone();
      });
    }

    const btnClearCompleted = document.getElementById('btn-clear-completed');
    if (btnClearCompleted) {
      btnClearCompleted.addEventListener('click', () => {
        extraMenuDropdown.classList.add('hidden');
        clearCompleted();
      });
    }

    const btnExport = document.getElementById('btn-export-tasks');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        extraMenuDropdown.classList.add('hidden');
        exportTasksJSON();
      });
    }

    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const importFileInput = document.getElementById('import-file-input');
    if (btnImportTrigger && importFileInput) {
      btnImportTrigger.addEventListener('click', () => {
        extraMenuDropdown.classList.add('hidden');
        importFileInput.click();
      });

      importFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          importTasksJSON(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    const btnResetDemo = document.getElementById('btn-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        extraMenuDropdown.classList.add('hidden');
        if (confirm('Reset tasks to default sample set?')) {
          resetSampleTasks();
        }
      });
    }

    // Edit Modal Form
    if (editForm) {
      editForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = editIdInput.value;
        updateTask(id, {
          title: editTitleInput.value.trim(),
          category: editCategoryInput.value,
          priority: editPriorityInput.value,
          dueDate: editDateInput.value
        });
        closeEditModal();
      });
    }

    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEditModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeEditModal);

    if (editModal) {
      editModal.addEventListener('click', e => {
        if (e.target === editModal) closeEditModal();
      });
    }

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', e => {
      // Escape closes modal and search
      if (e.key === 'Escape') {
        if (editModal && !editModal.classList.contains('hidden')) {
          closeEditModal();
        }
        if (extraMenuDropdown && !extraMenuDropdown.classList.contains('hidden')) {
          extraMenuDropdown.classList.add('hidden');
        }
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = '';
          searchQuery = '';
          if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
          searchInput.blur();
          render();
        }
      }

      // '/' focuses search if not inside an input
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
