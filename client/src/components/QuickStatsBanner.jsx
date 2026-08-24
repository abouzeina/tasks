import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle2, Clock, Flame, Target } from 'lucide-react';

export default function QuickStatsBanner({ stats }) {
  const { t } = useLanguage();

  if (!stats) return null;

  const {
    todayTotal = 0,
    todayCompleted = 0,
    todayRate = 0,
    pendingTasks = 0,
    totalHabits = 0,
    todayHabitsDone = 0,
    todayPomoMinutes = 0
  } = stats;

  return (
    <section className="stats-banner">
      {/* 1. Completion Rate */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <Target size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{todayRate}%</span>
          <span className="stat-label">{t.completionRate} ({todayCompleted}/{todayTotal || 0})</span>
        </div>
      </div>

      {/* 2. Pending Tasks */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{pendingTasks}</span>
          <span className="stat-label">{t.pending}</span>
        </div>
      </div>

      {/* 3. Habits Checked Today */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <Flame size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{todayHabitsDone} / {totalHabits}</span>
          <span className="stat-label">{t.habitsToday}</span>
        </div>
      </div>

      {/* 4. Focus Time Today */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
          <Clock size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{todayPomoMinutes} <small style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t.minutes}</small></span>
          <span className="stat-label">{t.focusMinutesToday}</span>
        </div>
      </div>
    </section>
  );
}
