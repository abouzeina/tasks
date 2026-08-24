const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// GET /api/tasks (filter by date, status, category, priority, search)
router.get('/', (req, res) => {
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

    const tasks = db.prepare(query).all(...params);

    // Fetch subtasks for each task
    const getSubtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC');
    const enrichedTasks = tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed),
      subtasks: getSubtasks.all(task.id).map(s => ({ ...s, completed: Boolean(s.completed) }))
    }));

    res.json({ success: true, tasks: enrichedTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks (create task)
router.post('/', (req, res) => {
  try {
    const { title, description = '', category_id = 'personal', priority = 'medium', due_date, due_time, recurring = 'none', subtasks = [] } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const taskId = 'task-' + crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    const finalDueDate = due_date || today;

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, category_id, priority, due_date, due_time, recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run(taskId, title.trim(), description.trim(), category_id, priority, finalDueDate, due_time || null, recurring);

    // Insert subtasks if provided
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const insertSubtask = db.prepare(`
        INSERT INTO subtasks (id, task_id, title, completed)
        VALUES (?, ?, ?, ?)
      `);
      for (const sub of subtasks) {
        if (sub.title && sub.title.trim()) {
          insertSubtask.run('sub-' + crypto.randomUUID(), taskId, sub.title.trim(), sub.completed ? 1 : 0);
        }
      }
    }

    const createdTask = db.prepare(`
      SELECT t.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(taskId);

    const getSubtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC');
    createdTask.completed = Boolean(createdTask.completed);
    createdTask.subtasks = getSubtasks.all(taskId).map(s => ({ ...s, completed: Boolean(s.completed) }));

    res.status(201).json({ success: true, task: createdTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle (toggle task completion)
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newCompleted = task.completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE tasks 
      SET completed = ?, completed_at = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(newCompleted, completedAt, id);

    res.json({ success: true, id, completed: Boolean(newCompleted), completed_at: completedAt });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tasks/:id (update task)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, priority, due_date, due_time, recurring, subtasks } = req.body;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    db.prepare(`
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
    `).run(
      title !== undefined ? title.trim() : null,
      description !== undefined ? description.trim() : null,
      category_id || null,
      priority || null,
      due_date || null,
      due_time || null,
      recurring || null,
      id
    );

    // Update subtasks if provided
    if (Array.isArray(subtasks)) {
      db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(id);
      const insertSubtask = db.prepare(`
        INSERT INTO subtasks (id, task_id, title, completed)
        VALUES (?, ?, ?, ?)
      `);
      for (const sub of subtasks) {
        if (sub.title && sub.title.trim()) {
          insertSubtask.run(sub.id || 'sub-' + crypto.randomUUID(), id, sub.title.trim(), sub.completed ? 1 : 0);
        }
      }
    }

    const updatedTask = db.prepare(`
      SELECT t.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.color as category_color, c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(id);

    const getSubtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC');
    updatedTask.completed = Boolean(updatedTask.completed);
    updatedTask.subtasks = getSubtasks.all(id).map(s => ({ ...s, completed: Boolean(s.completed) }));

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:taskId/subtasks/:subtaskId/toggle
router.patch('/:taskId/subtasks/:subtaskId/toggle', (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const sub = db.prepare('SELECT * FROM subtasks WHERE id = ? AND task_id = ?').get(subtaskId, taskId);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Subtask not found' });
    }

    const newCompleted = sub.completed ? 0 : 1;
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(newCompleted, subtaskId);

    res.json({ success: true, subtaskId, completed: Boolean(newCompleted) });
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
