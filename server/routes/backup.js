const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/backup/export (Export all data as JSON)
router.get('/export', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    const subtasks = db.prepare('SELECT * FROM subtasks').all();
    const habits = db.prepare('SELECT * FROM habits').all();
    const habit_logs = db.prepare('SELECT * FROM habit_logs').all();
    const pomodoro_sessions = db.prepare('SELECT * FROM pomodoro_sessions').all();
    const daily_notes = db.prepare('SELECT * FROM daily_notes').all();
    const categories = db.prepare('SELECT * FROM categories').all();

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
router.post('/import', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Invalid backup format' });
    }

    const importTransaction = db.transaction(() => {
      // Import categories
      if (Array.isArray(data.categories)) {
        const insertCat = db.prepare(`
          INSERT OR REPLACE INTO categories (id, name_ar, name_en, color, icon)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const c of data.categories) {
          insertCat.run(c.id, c.name_ar, c.name_en, c.color, c.icon);
        }
      }

      // Import tasks
      if (Array.isArray(data.tasks)) {
        const insertTask = db.prepare(`
          INSERT OR REPLACE INTO tasks (id, title, description, category_id, priority, due_date, due_time, completed, completed_at, recurring, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const t of data.tasks) {
          insertTask.run(
            t.id, t.title, t.description, t.category_id, t.priority,
            t.due_date, t.due_time, t.completed, t.completed_at,
            t.recurring, t.order_index, t.created_at, t.updated_at
          );
        }
      }

      // Import subtasks
      if (Array.isArray(data.subtasks)) {
        const insertSub = db.prepare(`
          INSERT OR REPLACE INTO subtasks (id, task_id, title, completed, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const s of data.subtasks) {
          insertSub.run(s.id, s.task_id, s.title, s.completed, s.created_at);
        }
      }

      // Import habits
      if (Array.isArray(data.habits)) {
        const insertHabit = db.prepare(`
          INSERT OR REPLACE INTO habits (id, name_ar, name_en, category_id, frequency, color, icon, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const h of data.habits) {
          insertHabit.run(h.id, h.name_ar, h.name_en, h.category_id, h.frequency || 'daily', h.color, h.icon, h.created_at);
        }
      }

      // Import habit logs
      if (Array.isArray(data.habit_logs)) {
        const insertLog = db.prepare(`
          INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const l of data.habit_logs) {
          insertLog.run(l.id, l.habit_id, l.date, l.completed, l.notes || '', l.created_at);
        }
      }

      // Import pomodoro sessions
      if (Array.isArray(data.pomodoro_sessions)) {
        const insertPomo = db.prepare(`
          INSERT OR REPLACE INTO pomodoro_sessions (id, task_id, mode, duration_minutes, completed_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const p of data.pomodoro_sessions) {
          insertPomo.run(p.id, p.task_id, p.mode, p.duration_minutes, p.completed_at);
        }
      }

      // Import daily notes
      if (Array.isArray(data.daily_notes)) {
        const insertNote = db.prepare(`
          INSERT OR REPLACE INTO daily_notes (date, mood, content, highlights, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const n of data.daily_notes) {
          insertNote.run(n.date, n.mood, n.content, n.highlights || '', n.updated_at);
        }
      }
    });

    importTransaction();

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
