const db = require('./database');

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://tasks-abouzeina.aws-eu-west-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_DATABASE_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc1NjI5MTQsImlkIjoiMDFhMDMzMGMtY2YwMS03MTViLWJhYTAtNWY4MjQ4YmU0ZDk5Iiwia2lkIjoid3RrY2NDT1FYNU5qS1BmakxpTjlEOTRxeXduaXpIWW85MWtNa2xGSlM0ZyIsInJpZCI6IjVjMWVmYWEzLThlNGQtNGUwOC1hN2I1LTBlNmExNGI5MWM5NiJ9.CRiq1Pw_QbYSSsdrWB9eTdO6AUrJaBYrl9-4dOS9rIkgxYkv38gyk0stqjQ_VLh3ZcyP8FAVjTV0RkJGcztXDA';

const httpUrl = TURSO_URL.replace('libsql://', 'https://') + '/v2/pipeline';

async function executeTurso(statements) {
  const requests = statements.map(s => {
    if (typeof s === 'string') return { type: 'execute', stmt: { sql: s } };
    return {
      type: 'execute',
      stmt: {
        sql: s.sql,
        args: (s.args || []).map(a => {
          if (a === null || a === undefined) return { type: 'null' };
          if (typeof a === 'number') return { type: 'integer', value: a.toString() };
          return { type: 'text', value: a.toString() };
        })
      }
    };
  });

  const res = await fetch(httpUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TURSO_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });
  
  const result = await res.json();
  if (result.results) {
    for (const r of result.results) {
      if (r.type === 'error') {
        console.error('Turso error:', r.error);
      }
    }
  }
  return result;
}

async function migrate() {
  console.log('Creating tables on Turso...');
  await executeTurso([
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category_id TEXT DEFAULT 'work',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      due_date TEXT,
      due_time TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      recurring TEXT CHECK(recurring IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
      order_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      category_id TEXT DEFAULT 'health',
      frequency TEXT DEFAULT 'daily',
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT 'Zap',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      mode TEXT CHECK(mode IN ('work', 'short_break', 'long_break')) DEFAULT 'work',
      duration_minutes INTEGER NOT NULL,
      completed_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS daily_notes (
      date TEXT PRIMARY KEY,
      mood TEXT DEFAULT 'good',
      content TEXT DEFAULT '',
      highlights TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`
  ]);

  console.log('✅ Turso schema created successfully!');

  // Migrate categories
  const categories = db.prepare('SELECT * FROM categories').all();
  if (categories.length > 0) {
    const catStmts = categories.map(c => ({
      sql: 'INSERT OR REPLACE INTO categories (id, name_ar, name_en, color, icon) VALUES (?, ?, ?, ?, ?)',
      args: [c.id, c.name_ar, c.name_en, c.color, c.icon]
    }));
    await executeTurso(catStmts);
    console.log(`✅ Migrated ${categories.length} categories.`);
  }

  // Migrate tasks
  const tasks = db.prepare('SELECT * FROM tasks').all();
  if (tasks.length > 0) {
    const taskStmts = tasks.map(t => ({
      sql: 'INSERT OR REPLACE INTO tasks (id, title, description, category_id, priority, due_date, due_time, completed, completed_at, recurring, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [t.id, t.title, t.description, t.category_id, t.priority, t.due_date, t.due_time, t.completed, t.completed_at, t.recurring, t.order_index, t.created_at, t.updated_at]
    }));
    await executeTurso(taskStmts);
    console.log(`✅ Migrated ${tasks.length} tasks.`);
  }

  // Migrate subtasks
  const subtasks = db.prepare('SELECT * FROM subtasks').all();
  if (subtasks.length > 0) {
    const subStmts = subtasks.map(s => ({
      sql: 'INSERT OR REPLACE INTO subtasks (id, task_id, title, completed, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [s.id, s.task_id, s.title, s.completed, s.created_at]
    }));
    await executeTurso(subStmts);
    console.log(`✅ Migrated ${subtasks.length} subtasks.`);
  }

  // Migrate habits
  const habits = db.prepare('SELECT * FROM habits').all();
  if (habits.length > 0) {
    const habitStmts = habits.map(h => ({
      sql: 'INSERT OR REPLACE INTO habits (id, name_ar, name_en, category_id, frequency, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [h.id, h.name_ar, h.name_en, h.category_id, h.frequency, h.color, h.icon, h.created_at]
    }));
    await executeTurso(habitStmts);
    console.log(`✅ Migrated ${habits.length} habits.`);
  }

  // Migrate habit logs
  const habit_logs = db.prepare('SELECT * FROM habit_logs').all();
  if (habit_logs.length > 0) {
    const logStmts = habit_logs.map(l => ({
      sql: 'INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [l.id, l.habit_id, l.date, l.completed, l.notes, l.created_at]
    }));
    await executeTurso(logStmts);
    console.log(`✅ Migrated ${habit_logs.length} habit logs.`);
  }

  console.log('🎉 ALL DATA FULLY MIGRATED TO TURSO CLOUD DATABASE!');
}

migrate().catch(console.error);
