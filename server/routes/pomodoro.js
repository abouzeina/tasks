const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// GET /api/pomodoro/stats (today & total focus minutes)
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's focus
    const todayStats = db.prepare(`
      SELECT COUNT(*) as sessionCount, COALESCE(SUM(duration_minutes), 0) as totalMinutes
      FROM pomodoro_sessions
      WHERE mode = 'work' AND date(completed_at) = date(?)
    `).get(today);

    // Total focus all time
    const totalStats = db.prepare(`
      SELECT COUNT(*) as sessionCount, COALESCE(SUM(duration_minutes), 0) as totalMinutes
      FROM pomodoro_sessions
      WHERE mode = 'work'
    `).get();

    // Recent 10 sessions
    const recentSessions = db.prepare(`
      SELECT p.*, t.title as task_title
      FROM pomodoro_sessions p
      LEFT JOIN tasks t ON p.task_id = t.id
      ORDER BY p.completed_at DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      today: {
        sessions: todayStats.sessionCount || 0,
        minutes: todayStats.totalMinutes || 0
      },
      allTime: {
        sessions: totalStats.sessionCount || 0,
        minutes: totalStats.totalMinutes || 0
      },
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pomodoro/session (log completed session)
router.post('/session', (req, res) => {
  try {
    const { task_id = null, mode = 'work', duration_minutes = 25 } = req.body;
    const sessionId = 'pomo-' + crypto.randomUUID();

    db.prepare(`
      INSERT INTO pomodoro_sessions (id, task_id, mode, duration_minutes)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, task_id, mode, duration_minutes);

    res.status(201).json({ success: true, sessionId, message: 'Pomodoro session recorded' });
  } catch (error) {
    console.error('Error recording pomodoro session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
