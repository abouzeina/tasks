const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// GET /api/categories (returns all tracks with stats)
router.get('/', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories');

    const tasksStats = await db.query(`
      SELECT 
        category_id,
        COUNT(id) as total_tasks,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_tasks
      FROM tasks
      WHERE category_id IS NOT NULL
      GROUP BY category_id
    `);
    const tasksStatMap = {};
    for (const ts of tasksStats) {
      tasksStatMap[ts.category_id] = ts;
    }

    const habitsStats = await db.query(`
      SELECT category_id, COUNT(id) as total_habits
      FROM habits
      WHERE category_id IS NOT NULL
      GROUP BY category_id
    `);
    const habitsStatMap = {};
    for (const hs of habitsStats) {
      habitsStatMap[hs.category_id] = hs;
    }

    const enrichedCategories = categories.map(cat => {
      const taskStat = tasksStatMap[cat.id] || {};
      const habitStat = habitsStatMap[cat.id] || {};

      const totalTasks = taskStat.total_tasks || 0;
      const completedTasks = taskStat.completed_tasks || 0;
      const totalHabits = habitStat.total_habits || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...cat,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalHabits,
        completionRate
      };
    });

    res.json({ success: true, categories: enrichedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/categories (create new track)
router.post('/', async (req, res) => {
  try {
    const { name_ar, name_en, color = '#3b82f6', icon = 'Layers' } = req.body;
    if (!name_ar && !name_en) {
      return res.status(400).json({ success: false, error: 'Track name is required' });
    }

    const id = 'track-' + crypto.randomUUID().slice(0, 8);
    const finalNameAr = name_ar ? name_ar.trim() : name_en.trim();
    const finalNameEn = name_en ? name_en.trim() : name_ar.trim();

    await db.execute(`
      INSERT INTO categories (id, name_ar, name_en, color, icon)
      VALUES (?, ?, ?, ?, ?)
    `, [id, finalNameAr, finalNameEn, color, icon]);

    const created = await db.queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({
      success: true,
      category: {
        ...created,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalHabits: 0,
        completionRate: 0
      }
    });
  } catch (error) {
    console.error('Error creating track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/categories/:id (update track)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, color, icon } = req.body;

    const existing = await db.queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }

    await db.execute(`
      UPDATE categories
      SET name_ar = COALESCE(?, name_ar),
          name_en = COALESCE(?, name_en),
          color = COALESCE(?, color),
          icon = COALESCE(?, icon)
      WHERE id = ?
    `, [
      name_ar !== undefined ? name_ar.trim() : null,
      name_en !== undefined ? name_en.trim() : null,
      color || null,
      icon || null,
      id
    ]);

    const updated = await db.queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ success: true, category: updated });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE tasks SET category_id = NULL WHERE category_id = ?', [id]);
    await db.execute('UPDATE habits SET category_id = NULL WHERE category_id = ?', [id]);
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
