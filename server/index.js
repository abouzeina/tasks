const express = require('express');
const cors = require('cors');
const path = require('path');

const tasksRouter = require('./routes/tasks');
const habitsRouter = require('./routes/habits');
const pomodoroRouter = require('./routes/pomodoro');
const analyticsRouter = require('./routes/analytics');
const notesRouter = require('./routes/notes');
const categoriesRouter = require('./routes/categories');
const backupRouter = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/backup', backupRouter);

// Serve static assets from frontend build
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// For SPA routing, send index.html for any non-API route
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('API Server is running.');
    }
  });
});

if (!process.env.VERCEL) {
  // Start Server
  app.listen(PORT, () => {
    console.log(`🚀 Tasks Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
