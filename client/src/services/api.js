const BASE_URL = '/api';

export const api = {
  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/tasks?${query}`);
    return res.json();
  },

  async createTask(taskData) {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },

  async toggleTask(id) {
    const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async updateTask(id, taskData) {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async toggleSubtask(taskId, subtaskId) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Habits
  async getHabits(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/habits?${query}`);
    return res.json();
  },

  async createHabit(habitData) {
    const res = await fetch(`${BASE_URL}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habitData)
    });
    return res.json();
  },

  async toggleHabit(habitId, date) {
    const res = await fetch(`${BASE_URL}/habits/${habitId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    return res.json();
  },

  async deleteHabit(id) {
    const res = await fetch(`${BASE_URL}/habits/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Pomodoro
  async getPomodoroStats() {
    const res = await fetch(`${BASE_URL}/pomodoro/stats`);
    return res.json();
  },

  async recordPomodoroSession(sessionData) {
    const res = await fetch(`${BASE_URL}/pomodoro/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    return res.json();
  },

  // Daily Journal / Notes
  async getDailyNote(date) {
    const res = await fetch(`${BASE_URL}/notes/${date}`);
    return res.json();
  },

  async saveDailyNote(date, noteData) {
    const res = await fetch(`${BASE_URL}/notes/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    return res.json();
  },

  // Categories / Tracks
  async getCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  async updateCategory(id, categoryData) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Backup
  async exportBackup() {
    const res = await fetch(`${BASE_URL}/backup/export`);
    return res.json();
  },

  async importBackup(data) {
    const res = await fetch(`${BASE_URL}/backup/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    return res.json();
  }
};
