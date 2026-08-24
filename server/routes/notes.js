const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notes/:date (fetch daily note/journal)
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const note = await db.queryOne('SELECT * FROM daily_notes WHERE date = ?', [date]);
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
router.post('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { mood = 'good', content = '', highlights = '' } = req.body;

    await db.execute(`
      INSERT INTO daily_notes (date, mood, content, highlights, updated_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
      ON CONFLICT(date) DO UPDATE SET
        mood = excluded.mood,
        content = excluded.content,
        highlights = excluded.highlights,
        updated_at = datetime('now', 'localtime')
    `, [date, mood, content, highlights]);

    const saved = await db.queryOne('SELECT * FROM daily_notes WHERE date = ?', [date]);
    res.json({ success: true, note: saved });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
