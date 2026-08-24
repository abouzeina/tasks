const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/backup/export (Export all data as JSON)
router.get('/export', async (req, res) => {
  try {
    const tasks = await db.query('SELECT * FROM tasks');
    const subtasks = await db.query('SELECT * FROM subtasks');
    const habits = await db.query('SELECT * FROM habits');
    const habit_logs = await db.query('SELECT * FROM habit_logs');
    const pomodoro_sessions = await db.query('SELECT * FROM pomodoro_sessions');
    const daily_notes = await db.query('SELECT * FROM daily_notes');
    const categories = await db.query('SELECT * FROM categories');

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        categories,
        tasks,
        subtasks,
        habits,
        habit_logs,
        pomodoro_sessions,
        daily_notes
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tasks-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/backup/import (Import data from JSON payload)
router.post('/import', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Invalid backup format' });
    }

    const statements = [];

    // Import categories
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        statements.push({
          sql: `INSERT OR REPLACE INTO categories (id, name_ar, name_en, color, icon) VALUES (?, ?, ?, ?, ?)`,
          args: [c.id, c.name_ar, c.name_en, c.color, c.icon]
        });
      }
    }

    // Import tasks
    if (Array.isArray(data.tasks)) {
      for (const t of data.tasks) {
        statements.push({
          sql: `INSERT OR REPLACE INTO tasks (id, title, description, category_id, priority, due_date, due_time, completed, completed_at, recurring, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            t.id, t.title, t.description, t.category_id, t.priority,
            t.due_date, t.due_time, t.completed ? 1 : 0, t.completed_at,
            t.recurring, t.order_index, t.created_at, t.updated_at
          ]
        });
      }
    }

    // Import subtasks
    if (Array.isArray(data.subtasks)) {
      for (const s of data.subtasks) {
        statements.push({
          sql: `INSERT OR REPLACE INTO subtasks (id, task_id, title, completed, created_at) VALUES (?, ?, ?, ?, ?)`,
          args: [s.id, s.task_id, s.title, s.completed ? 1 : 0, s.created_at]
        });
      }
    }

    // Import habits
    if (Array.isArray(data.habits)) {
      for (const h of data.habits) {
        statements.push({
          sql: `INSERT OR REPLACE INTO habits (id, name_ar, name_en, category_id, frequency, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [h.id, h.name_ar, h.name_en, h.category_id, h.frequency || 'daily', h.color, h.icon, h.created_at]
        });
      }
    }

    // Import habit logs
    if (Array.isArray(data.habit_logs)) {
      for (const l of data.habit_logs) {
        statements.push({
          sql: `INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [l.id, l.habit_id, l.date, l.completed ? 1 : 0, l.notes || '', l.created_at]
        });
      }
    }

    // Import pomodoro sessions
    if (Array.isArray(data.pomodoro_sessions)) {
      for (const p of data.pomodoro_sessions) {
        statements.push({
          sql: `INSERT OR REPLACE INTO pomodoro_sessions (id, task_id, mode, duration_minutes, completed_at) VALUES (?, ?, ?, ?, ?)`,
          args: [p.id, p.task_id, p.mode, p.duration_minutes, p.completed_at]
        });
      }
    }

    // Import daily notes
    if (Array.isArray(data.daily_notes)) {
      for (const n of data.daily_notes) {
        statements.push({
          sql: `INSERT OR REPLACE INTO daily_notes (date, mood, content, highlights, updated_at) VALUES (?, ?, ?, ?, ?)`,
          args: [n.date, n.mood, n.content, n.highlights || '', n.updated_at]
        });
      }
    }

    if (statements.length > 0) {
      await db.batch(statements);
    }

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
