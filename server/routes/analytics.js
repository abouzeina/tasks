const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/analytics/overview
router.get('/overview', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Overall Task stats
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const completedTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 1').get().count;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Today's task stats
    const todayTotal = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE due_date = ? OR (completed = 1 AND date(completed_at) = date(?))').get(today, today).count;
    const todayCompleted = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND (due_date = ? OR date(completed_at) = date(?))').get(today, today).count;
    const todayRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // 3. Last 7 Days Completion Trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNameAr = d.toLocaleDateString('ar-EG', { weekday: 'short' });

      const completedCount = db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE completed = 1 AND date(completed_at) = date(?)
      `).get(dateStr).count;

      const focusMinutes = db.prepare(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM pomodoro_sessions 
        WHERE mode = 'work' AND date(completed_at) = date(?)
      `).get(dateStr).total;

      const habitsChecked = db.prepare(`
        SELECT COUNT(*) as count FROM habit_logs 
        WHERE completed = 1 AND date = ?
      `).get(dateStr).count;

      last7Days.push({
        date: dateStr,
        dayNameEn,
        dayNameAr,
        tasksCompleted: completedCount,
        focusMinutes,
        habitsChecked
      });
    }

    // 4. Categories breakdown
    const categoryStats = db.prepare(`
      SELECT c.id, c.name_ar, c.name_en, c.color, c.icon,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed_tasks
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.id
    `).all();

    // 5. Habits overview
    const totalHabits = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
    const todayHabitsDone = db.prepare('SELECT COUNT(*) as count FROM habit_logs WHERE completed = 1 AND date = ?').get(today).count;

    // 6. Pomodoro overview
    const todayPomoMinutes = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as total FROM pomodoro_sessions 
      WHERE mode = 'work' AND date(completed_at) = date(?)
    `).get(today).total;

    res.json({
      success: true,
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        todayTotal,
        todayCompleted,
        todayRate,
        totalHabits,
        todayHabitsDone,
        todayPomoMinutes
      },
      last7Days,
      categoryStats
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
