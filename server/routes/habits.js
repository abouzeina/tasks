const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Helper to compute consecutive streak ending on today or yesterday
function calculateStreak(habitId) {
  const logs = db.prepare(`
    SELECT date FROM habit_logs 
    WHERE habit_id = ? AND completed = 1 
    ORDER BY date DESC
  `).all(habitId);

  if (!logs || logs.length === 0) return { currentStreak: 0, totalCompleted: 0 };

  const logDates = new Set(logs.map(l => l.date));
  let streak = 0;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = new Date(logDates.has(todayStr) ? today : (logDates.has(yesterdayStr) ? yesterday : null));
  
  if (checkDate) {
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (logDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak: streak,
    totalCompleted: logs.length
  };
}

// GET /api/habits (with recent 7 days or custom range)
router.get('/', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const habits = db.prepare(`
      SELECT h.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      ORDER BY h.created_at ASC
    `).all();

    const getLogs = db.prepare(`
      SELECT date, completed FROM habit_logs
      WHERE habit_id = ? ${startDate && endDate ? 'AND date BETWEEN ? AND ?' : ''}
    `);

    const result = habits.map(habit => {
      const logs = (startDate && endDate)
        ? getLogs.all(habit.id, startDate, endDate)
        : db.prepare('SELECT date, completed FROM habit_logs WHERE habit_id = ?').all(habit.id);

      const logsMap = {};
      logs.forEach(l => {
        logsMap[l.date] = Boolean(l.completed);
      });

      const { currentStreak, totalCompleted } = calculateStreak(habit.id);

      return {
        ...habit,
        logsMap,
        currentStreak,
        totalCompleted
      };
    });

    res.json({ success: true, habits: result });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/habits (create habit)
router.post('/', (req, res) => {
  try {
    const { name_ar, name_en, category_id = 'health', color = '#3b82f6', icon = 'Zap' } = req.body;
    if (!name_ar && !name_en) {
      return res.status(400).json({ success: false, error: 'Habit name is required' });
    }

    const habitId = 'habit-' + crypto.randomUUID();
    const finalNameAr = name_ar || name_en;
    const finalNameEn = name_en || name_ar;

    db.prepare(`
      INSERT INTO habits (id, name_ar, name_en, category_id, color, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(habitId, finalNameAr, finalNameEn, category_id, color, icon);

    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
    res.status(201).json({
      success: true,
      habit: {
        ...habit,
        logsMap: {},
        currentStreak: 0,
        totalCompleted: 0
      }
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/habits/:id/toggle (toggle date check-in)
router.post('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const existing = db.prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?').get(id, date);

    let completed = true;
    if (existing) {
      if (existing.completed) {
        db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?').run(id, date);
        completed = false;
      } else {
        db.prepare('UPDATE habit_logs SET completed = 1 WHERE habit_id = ? AND date = ?').run(id, date);
        completed = true;
      }
    } else {
      const logId = 'log-' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO habit_logs (id, habit_id, date, completed)
        VALUES (?, ?, ?, 1)
      `).run(logId, id, date);
      completed = true;
    }

    const { currentStreak, totalCompleted } = calculateStreak(id);

    res.json({
      success: true,
      habitId: id,
      date,
      completed,
      currentStreak,
      totalCompleted
    });
  } catch (error) {
    console.error('Error toggling habit log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM habits WHERE id = ?').run(id);
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
