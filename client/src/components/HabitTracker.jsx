import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  X, 
  Activity, 
  Droplets, 
  BookOpen, 
  CheckSquare, 
  Zap,
  Globe,
  Moon,
  HeartPulse,
  DollarSign,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ICON_MAP = {
  Zap,
  Droplets,
  BookOpen,
  Activity,
  CheckSquare,
  Globe,
  Moon,
  HeartPulse,
  DollarSign,
  Compass,
  Sparkles
};

export default function HabitTracker({ habits, onCreateHabit, onToggleHabit, onDeleteHabit, categories = [] }) {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'religious');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('Moon');

  // Compute the last 7 days starting from 6 days ago up to today
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
    const isToday = i === 0;
    last7Days.push({ dateStr, dayName, isToday });
  }

  const handleToggle = (habitId, dateStr, isToday) => {
    onToggleHabit(habitId, dateStr);
    if (isToday) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.75 },
        colors: [color, '#f59e0b', '#10b981']
      });
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!nameAr.trim() && !nameEn.trim()) return;

    onCreateHabit({
      name_ar: nameAr.trim() || nameEn.trim(),
      name_en: nameEn.trim() || nameAr.trim(),
      category_id: categoryId,
      color,
      icon
    });

    setNameAr('');
    setNameEn('');
    setColor('#10b981');
    setIcon('Moon');
    setIsModalOpen(false);
  };

  const colorPresets = ['#3b82f6', '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

  return (
    <section>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <Flame size={24} color="#f59e0b" />
            {t.habitsTitle}
          </h2>
          <p>{t.habitsSubtitle}</p>
        </div>

        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>{t.addNewHabit}</span>
        </button>
      </div>

      {/* Habits Grid */}
      {habits.length > 0 ? (
        <div className="habits-grid">
          {habits.map(habit => {
            const habitName = lang === 'ar' ? (habit.name_ar || habit.name_en) : (habit.name_en || habit.name_ar);
            const IconComp = ICON_MAP[habit.icon] || Zap;

            return (
              <div key={habit.id} className="glass-card habit-card">
                {/* Habit Header */}
                <div className="habit-header">
                  <div className="habit-title-box">
                    <div className="habit-icon" style={{ background: habit.color || '#3b82f6' }}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {habitName}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {habit.category_name_ar ? (lang === 'ar' ? habit.category_name_ar : habit.category_name_en) : ''} • {t.totalDone}: {habit.totalCompleted || 0}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Streak Badge */}
                    <div className="habit-streak-badge">
                      <Flame size={14} fill="#fbbf24" />
                      <span>{habit.currentStreak || 0} {t.days}</span>
                    </div>

                    {/* Delete */}
                    <button 
                      className="icon-btn" 
                      onClick={() => onDeleteHabit(habit.id)}
                      title={t.delete}
                      style={{ width: 32, height: 32, color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 7-Day History Bubbles */}
                <div className="habit-week-circles">
                  {last7Days.map(day => {
                    const isDone = Boolean(habit.logsMap && habit.logsMap[day.dateStr]);
                    return (
                      <div
                        key={day.dateStr}
                        className="day-bubble"
                        onClick={() => handleToggle(habit.id, day.dateStr, day.isToday)}
                        title={`${day.dateStr} ${isDone ? '✓' : ''}`}
                      >
                        <span className="day-name" style={{ color: day.isToday ? 'var(--primary)' : undefined, fontWeight: day.isToday ? '800' : undefined }}>
                          {day.dayName}
                        </span>
                        <div
                          className={`day-circle ${isDone ? 'active' : ''}`}
                          style={{
                            backgroundColor: isDone ? (habit.color || '#3b82f6') : 'transparent',
                            borderColor: isDone ? (habit.color || '#3b82f6') : undefined
                          }}
                        >
                          {isDone && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-icon">
            <Flame size={28} color="#f59e0b" />
          </div>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {t.noHabits}
          </p>
        </div>
      )}

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{t.addNewHabit}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">{t.habitNameAr}</label>
                <input
                  type="text"
                  className="form-input"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: ورد القرآن، ممارسة الإنجليزية، قراءة كتاب..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.habitNameEn}</label>
                <input
                  type="text"
                  className="form-input"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. Daily Quran, English Practice, Read Book..."
                />
              </div>

              {/* Track Selection */}
              <div className="form-group">
                <label className="form-label">{t.category}</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {lang === 'ar' ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Selector */}
              <div className="form-group">
                <label className="form-label">{t.selectColor}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colorPresets.map(c => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: color === c ? '3px solid #fff' : '2px solid transparent',
                        transform: color === c ? 'scale(1.15)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {color === c && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
