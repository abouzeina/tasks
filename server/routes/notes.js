const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/notes/:date (fetch daily note/journal)
router.get('/:date', (req, res) => {
  try {
    const { date } = req.params;
    const note = db.prepare('SELECT * FROM daily_notes WHERE date = ?').get(date);
    res.json({
      success: true,
      note: note || { date, mood: 'good', content: '', highlights: '' }
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notes/:date (upsert daily note/journal)
router.post('/:date', (req, res) => {
  try {
    const { date } = req.params;
    const { mood = 'good', content = '', highlights = '' } = req.body;

    db.prepare(`
      INSERT INTO daily_notes (date, mood, content, highlights, updated_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
      ON CONFLICT(date) DO UPDATE SET
        mood = excluded.mood,
        content = excluded.content,
        highlights = excluded.highlights,
        updated_at = datetime('now', 'localtime')
    `).run(date, mood, content, highlights);

    const saved = db.prepare('SELECT * FROM daily_notes WHERE date = ?').get(date);
    res.json({ success: true, note: saved });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
