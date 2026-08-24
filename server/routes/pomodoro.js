const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// GET /api/pomodoro/stats (today & total focus minutes)
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's focus
    const todayStats = await db.queryOne(`
      SELECT COUNT(*) as sessionCount, COALESCE(SUM(duration_minutes), 0) as totalMinutes
      FROM pomodoro_sessions
      WHERE mode = 'work' AND date(completed_at) = date(?)
    `, [today]);

    // Total focus all time
    const totalStats = await db.queryOne(`
      SELECT COUNT(*) as sessionCount, COALESCE(SUM(duration_minutes), 0) as totalMinutes
      FROM pomodoro_sessions
      WHERE mode = 'work'
    `);

    // Recent 10 sessions
    const recentSessions = await db.query(`
      SELECT p.*, t.title as task_title
      FROM pomodoro_sessions p
      LEFT JOIN tasks t ON p.task_id = t.id
      ORDER BY p.completed_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      today: {
        sessions: todayStats?.sessionCount || 0,
        minutes: todayStats?.totalMinutes || 0
      },
      allTime: {
        sessions: totalStats?.sessionCount || 0,
        minutes: totalStats?.totalMinutes || 0
      },
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pomodoro/session (log completed session)
router.post('/session', async (req, res) => {
  try {
    const { task_id = null, mode = 'work', duration_minutes = 25 } = req.body;
    const sessionId = 'pomo-' + crypto.randomUUID();

    await db.execute(`
      INSERT INTO pomodoro_sessions (id, task_id, mode, duration_minutes)
      VALUES (?, ?, ?, ?)
    `, [sessionId, task_id, mode, duration_minutes]);

    res.status(201).json({ success: true, sessionId, message: 'Pomodoro session recorded' });
  } catch (error) {
    console.error('Error recording pomodoro session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
