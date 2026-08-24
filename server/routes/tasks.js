const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// GET /api/tasks (filter by date, status, category, priority, search)
router.get('/', async (req, res) => {
  try {
    const { date, status, category, priority, search } = req.query;
    
    let query = `
      SELECT t.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by date ONLY if date is provided and not 'all'
    if (date && date !== 'all' && date.trim() !== '') {
      query += ` AND (t.due_date = ? OR (t.completed = 0 AND t.due_date <= ?))`;
      params.push(date, date);
    }

    if (status === 'completed') {
      query += ` AND t.completed = 1`;
    } else if (status === 'pending') {
      query += ` AND t.completed = 0`;
    }

    if (category && category !== 'all') {
      query += ` AND t.category_id = ?`;
      params.push(category);
    }

    if (priority && priority !== 'all') {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.completed ASC, 
      t.order_index ASC,
      t.due_date ASC,
      t.created_at ASC`;

    const tasks = await db.query(query, params);

    // Fetch all subtasks in parallel
    const allSubtasks = await db.query('SELECT * FROM subtasks ORDER BY created_at ASC');
    const subtaskMap = {};
    for (const sub of allSubtasks) {
      if (!subtaskMap[sub.task_id]) subtaskMap[sub.task_id] = [];
      subtaskMap[sub.task_id].push({ ...sub, completed: Boolean(sub.completed) });
    }

    const enrichedTasks = tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed),
      subtasks: subtaskMap[task.id] || []
    }));

    res.json({ success: true, tasks: enrichedTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks (create task)
router.post('/', async (req, res) => {
  try {
    const { title, description = '', category_id = 'personal', priority = 'medium', due_date, due_time, recurring = 'none', subtasks = [] } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const taskId = 'task-' + crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    const finalDueDate = due_date || today;

    await db.execute(`
      INSERT INTO tasks (id, title, description, category_id, priority, due_date, due_time, recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [taskId, title.trim(), description.trim(), category_id, priority, finalDueDate, due_time || null, recurring]);

    // Insert subtasks if provided
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      for (const sub of subtasks) {
        if (sub.title && sub.title.trim()) {
          await db.execute(`
            INSERT INTO subtasks (id, task_id, title, completed)
            VALUES (?, ?, ?, ?)
          `, ['sub-' + crypto.randomUUID(), taskId, sub.title.trim(), sub.completed ? 1 : 0]);
        }
      }
    }

    const createdTask = await db.queryOne(`
      SELECT t.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [taskId]);

    const taskSubs = await db.query('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC', [taskId]);
    createdTask.completed = Boolean(createdTask.completed);
    createdTask.subtasks = taskSubs.map(s => ({ ...s, completed: Boolean(s.completed) }));

    res.status(201).json({ success: true, task: createdTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle (toggle task completion)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newCompleted = task.completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    await db.execute(`
      UPDATE tasks 
      SET completed = ?, completed_at = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [newCompleted, completedAt, id]);

    res.json({ success: true, id, completed: Boolean(newCompleted), completed_at: completedAt });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tasks/:id (update task)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, priority, due_date, due_time, recurring, subtasks } = req.body;

    const task = await db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await db.execute(`
      UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category_id = COALESCE(?, category_id),
          priority = COALESCE(?, priority),
          due_date = COALESCE(?, due_date),
          due_time = COALESCE(?, due_time),
          recurring = COALESCE(?, recurring),
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      title !== undefined ? title.trim() : null,
      description !== undefined ? description.trim() : null,
      category_id || null,
      priority || null,
      due_date || null,
      due_time || null,
      recurring || null,
      id
    ]);

    // Update subtasks if provided
    if (Array.isArray(subtasks)) {
      await db.execute('DELETE FROM subtasks WHERE task_id = ?', [id]);
      for (const sub of subtasks) {
        if (sub.title && sub.title.trim()) {
          await db.execute(`
            INSERT INTO subtasks (id, task_id, title, completed)
            VALUES (?, ?, ?, ?)
          `, [sub.id || 'sub-' + crypto.randomUUID(), id, sub.title.trim(), sub.completed ? 1 : 0]);
        }
      }
    }

    const updatedTask = await db.queryOne(`
      SELECT t.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);

    const taskSubs = await db.query('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC', [id]);
    updatedTask.completed = Boolean(updatedTask.completed);
    updatedTask.subtasks = taskSubs.map(s => ({ ...s, completed: Boolean(s.completed) }));

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM subtasks WHERE task_id = ?', [id]);
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:taskId/subtasks/:subtaskId/toggle
router.patch('/:taskId/subtasks/:subtaskId/toggle', async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const sub = await db.queryOne('SELECT * FROM subtasks WHERE id = ? AND task_id = ?', [subtaskId, taskId]);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Subtask not found' });
    }

    const newCompleted = sub.completed ? 0 : 1;
    await db.execute('UPDATE subtasks SET completed = ? WHERE id = ?', [newCompleted, subtaskId]);

    res.json({ success: true, subtaskId, completed: Boolean(newCompleted) });
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
