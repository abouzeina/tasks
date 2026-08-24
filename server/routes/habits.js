const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Helper to compute consecutive streak ending on today or yesterday
function calculateStreakFromLogs(logs) {
  if (!logs || logs.length === 0) return { currentStreak: 0, totalCompleted: 0 };

  const completedLogs = logs.filter(l => Boolean(l.completed));
  const logDates = new Set(completedLogs.map(l => l.date));
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
    totalCompleted: completedLogs.length
  };
}

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const habits = await db.query(`
      SELECT h.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      ORDER BY h.created_at ASC
    `);

    let logQuery = 'SELECT * FROM habit_logs';
    const logParams = [];
    if (startDate && endDate) {
      logQuery += ' WHERE date BETWEEN ? AND ?';
      logParams.push(startDate, endDate);
    }
    const allLogs = await db.query(logQuery, logParams);

    const habitLogsMap = {};
    for (const l of allLogs) {
      if (!habitLogsMap[l.habit_id]) habitLogsMap[l.habit_id] = [];
      habitLogsMap[l.habit_id].push(l);
    }

    const result = habits.map(habit => {
      const logs = habitLogsMap[habit.id] || [];
      const logsMap = {};
      logs.forEach(l => {
        logsMap[l.date] = Boolean(l.completed);
      });

      const { currentStreak, totalCompleted } = calculateStreakFromLogs(logs);

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
router.post('/', async (req, res) => {
  try {
    const { name_ar, name_en, category_id = 'health', color = '#3b82f6', icon = 'Zap' } = req.body;
    if (!name_ar && !name_en) {
      return res.status(400).json({ success: false, error: 'Habit name is required' });
    }

    const habitId = 'habit-' + crypto.randomUUID();
    const finalNameAr = name_ar || name_en;
    const finalNameEn = name_en || name_ar;

    await db.execute(`
      INSERT INTO habits (id, name_ar, name_en, category_id, color, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [habitId, finalNameAr, finalNameEn, category_id, color, icon]);

    const habit = await db.queryOne('SELECT * FROM habits WHERE id = ?', [habitId]);
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
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const existing = await db.queryOne('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?', [id, date]);

    let completed = true;
    if (existing) {
      if (existing.completed) {
        await db.execute('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', [id, date]);
        completed = false;
      } else {
        await db.execute('UPDATE habit_logs SET completed = 1 WHERE habit_id = ? AND date = ?', [id, date]);
        completed = true;
      }
    } else {
      const logId = 'log-' + crypto.randomUUID();
      await db.execute(`
        INSERT INTO habit_logs (id, habit_id, date, completed)
        VALUES (?, ?, ?, 1)
      `, [logId, id, date]);
      completed = true;
    }

    const allLogs = await db.query('SELECT * FROM habit_logs WHERE habit_id = ?', [id]);
    const { currentStreak, totalCompleted } = calculateStreakFromLogs(allLogs);

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
    await db.execute('DELETE FROM habits WHERE id = ?', [id]);
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
