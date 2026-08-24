const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Overall Task stats
    const totalTasksRes = await db.queryOne('SELECT COUNT(*) as count FROM tasks');
    const completedTasksRes = await db.queryOne('SELECT COUNT(*) as count FROM tasks WHERE completed = 1');
    const totalTasks = totalTasksRes?.count || 0;
    const completedTasks = completedTasksRes?.count || 0;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Today's task stats
    const todayTotalRes = await db.queryOne('SELECT COUNT(*) as count FROM tasks WHERE due_date = ? OR (completed = 1 AND date(completed_at) = date(?))', [today, today]);
    const todayCompletedRes = await db.queryOne('SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND (due_date = ? OR date(completed_at) = date(?))', [today, today]);
    const todayTotal = todayTotalRes?.count || 0;
    const todayCompleted = todayCompletedRes?.count || 0;
    const todayRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // 3. Last 7 Days Completion Trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNameAr = d.toLocaleDateString('ar-EG', { weekday: 'short' });

      const completedCountRes = await db.queryOne(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE completed = 1 AND date(completed_at) = date(?)
      `, [dateStr]);

      const focusMinutesRes = await db.queryOne(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM pomodoro_sessions 
        WHERE mode = 'work' AND date(completed_at) = date(?)
      `, [dateStr]);

      const habitsCheckedRes = await db.queryOne(`
        SELECT COUNT(*) as count FROM habit_logs 
        WHERE completed = 1 AND date = ?
      `, [dateStr]);

      last7Days.push({
        date: dateStr,
        dayNameEn,
        dayNameAr,
        tasksCompleted: completedCountRes?.count || 0,
        focusMinutes: focusMinutesRes?.total || 0,
        habitsChecked: habitsCheckedRes?.count || 0
      });
    }

    // 4. Categories breakdown
    const categoryStats = await db.query(`
      SELECT c.id, c.name_ar, c.name_en, c.color, c.icon,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed_tasks
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.id
    `);

    // 5. Habits overview
    const totalHabitsRes = await db.queryOne('SELECT COUNT(*) as count FROM habits');
    const todayHabitsDoneRes = await db.queryOne('SELECT COUNT(*) as count FROM habit_logs WHERE completed = 1 AND date = ?', [today]);

    // 6. Pomodoro overview
    const todayPomoMinutesRes = await db.queryOne(`
      SELECT COALESCE(SUM(duration_minutes), 0) as total FROM pomodoro_sessions 
      WHERE mode = 'work' AND date(completed_at) = date(?)
    `, [today]);

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
        totalHabits: totalHabitsRes?.count || 0,
        todayHabitsDone: todayHabitsDoneRes?.count || 0,
        todayPomoMinutes: todayPomoMinutesRes?.total || 0
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
