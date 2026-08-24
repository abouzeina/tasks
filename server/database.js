const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const localDbPath = path.join(__dirname, 'tasks.db');
let dbPath = localDbPath;

if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'tasks.db');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(localDbPath)) {
    try {
      fs.copyFileSync(localDbPath, tmpDbPath);
    } catch (e) {
      console.error('Could not copy initial database to /tmp', e);
    }
  }
  dbPath = tmpDbPath;
}

const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  // 1. Categories / Tracks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);

  // 2. Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
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
    );
  `);

  // 3. Subtasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // 4. Habits Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      category_id TEXT DEFAULT 'health',
      frequency TEXT DEFAULT 'daily',
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT 'Zap',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // 5. Habit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      completed INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  // 6. Pomodoro Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      mode TEXT CHECK(mode IN ('work', 'short_break', 'long_break')) DEFAULT 'work',
      duration_minutes INTEGER NOT NULL,
      completed_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );
  `);

  // 7. Daily Notes / Journal
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_notes (
      date TEXT PRIMARY KEY, -- YYYY-MM-DD
      mood TEXT DEFAULT 'good',
      content TEXT DEFAULT '',
      highlights TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // 8. User Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default tracks/categories if empty or ensure requested default tracks exist
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name_ar, name_en, color, icon) VALUES (?, ?, ?, ?, ?)
  `);

  const defaultCategories = [
    ['work', 'مسار العمل والمشاريع', 'Work & Projects', '#3b82f6', 'Briefcase'],
    ['languages', 'مسار تعلم اللغات', 'Languages Learning', '#06b6d4', 'Globe'],
    ['self_dev', 'مسار تطوير الذات والمهارات', 'Self Development', '#ec4899', 'Sparkles'],
    ['religious', 'المسار الديني والروحاني', 'Spiritual & Religious', '#10b981', 'Moon'],
    ['study', 'مسار الدراسة والتعليم', 'Study & Academia', '#8b5cf6', 'BookOpen'],
    ['health', 'مسار الصحة والرياضة', 'Health & Fitness', '#ef4444', 'HeartPulse'],
    ['finance', 'مسار المالية والأهداف', 'Finance & Goals', '#f59e0b', 'DollarSign']
  ];

  for (const cat of defaultCategories) {
    insertCategory.run(...cat);
  }

  // Seed sample habits if empty
  const countHabits = db.prepare('SELECT COUNT(*) as count FROM habits').get();
  if (countHabits.count === 0) {
    const insertHabit = db.prepare(`
      INSERT INTO habits (id, name_ar, name_en, category_id, color, icon) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const defaultHabits = [
      ['habit-1', 'ورد القرآن الكريم والأذكار', 'Daily Quran & Adhkar', 'religious', '#10b981', 'Moon'],
      ['habit-2', 'ممارسة اللغة 15 دقيقة (Duolingo/Speaking)', '15m Language Practice', 'languages', '#06b6d4', 'Globe'],
      ['habit-3', 'قراءة 20 دقيقة في كتاب للتطوير', 'Read 20m in Self-Dev Book', 'self_dev', '#ec4899', 'BookOpen'],
      ['habit-4', 'شرب 2 لتر ماء ورياضة خفيفة', 'Drink 2L Water & Workout', 'health', '#ef4444', 'Activity']
    ];

    for (const h of defaultHabits) {
      insertHabit.run(...h);
    }
  }

  // Seed initial tasks if empty
  const countTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  if (countTasks.count === 0) {
    const today = new Date().toISOString().split('T')[0];
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, category_id, priority, due_date, completed, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run(
      'task-welcome-1',
      'مرحباً بك في نظام المسارات اليومي! 🎉',
      'يمكنك الآن تنظيم حياتك في مسارات مخصصة (شغل، لغات، تطوير ذات، ديني، إلخ) وإضافة مساراتك الخاصة بسهولة.',
      'work',
      'high',
      today,
      0,
      1
    );

    insertTask.run(
      'task-welcome-2',
      'حفظ 5 كلمات إنجليزية جديدة وتطبيقها',
      'خصص 15 دقيقة لتعلم ومراجعة الكلمات الجديدة في مسار اللغات.',
      'languages',
      'medium',
      today,
      0,
      2
    );

    insertTask.run(
      'task-welcome-3',
      'قراءة صفحتين من القرآن الكريم مع التدبر',
      'جلسة روحانية هادئة لترتيب الأولويات.',
      'religious',
      'high',
      today,
      0,
      3
    );
  }
}

initDatabase();

module.exports = db;
