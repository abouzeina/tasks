import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BookOpen, Smile, CheckCircle, Sparkles, Calendar } from 'lucide-react';

const MOODS = [
  { id: 'great', labelKey: 'moodGreat', emoji: '🚀' },
  { id: 'good', labelKey: 'moodGood', emoji: '😊' },
  { id: 'neutral', labelKey: 'moodNeutral', emoji: '😐' },
  { id: 'tired', labelKey: 'moodTired', emoji: '😴' },
  { id: 'stressed', labelKey: 'moodStressed', emoji: '🤯' }
];

export default function DailyJournal({ noteData, onSaveNote, currentDate, setCurrentDate }) {
  const { t } = useLanguage();

  const [mood, setMood] = useState('good');
  const [highlights, setHighlights] = useState('');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (noteData) {
      setMood(noteData.mood || 'good');
      setHighlights(noteData.highlights || '');
      setContent(noteData.content || '');
    }
  }, [noteData]);

  const handleSave = () => {
    onSaveNote(currentDate, { mood, highlights, content });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <section>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <BookOpen size={24} color="var(--accent-purple)" />
            {t.journalTitle}
          </h2>
          <p>{t.journalSubtitle}</p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            className="select-filter"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Mood Selector */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.95rem' }}>
            {t.howWasYourDay}
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {MOODS.map(m => {
              const isSelected = mood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-input)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>
                  <span style={{ fontWeight: isSelected ? '700' : '500' }}>{t[m.labelKey]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Wins & Highlights */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#f59e0b" />
            {t.highlightsTitle}
          </label>
          <input
            type="text"
            className="form-input"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            placeholder={t.highlightsPlaceholder}
          />
        </div>

        {/* Free Notes / Reflections */}
        <div className="form-group">
          <label className="form-label">{t.notesTitle}</label>
          <textarea
            className="form-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.notesPlaceholder}
            rows={6}
          />
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div>
            {isSaved && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.88rem', fontWeight: '600' }}>
                <CheckCircle size={16} />
                {t.savedAuto}
              </span>
            )}
          </div>
          <button className="btn-primary" onClick={handleSave}>
            {t.save}
          </button>
        </div>
      </div>
    </section>
  );
}
