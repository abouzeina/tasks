import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BarChart3, TrendingUp, CheckCircle, PieChart, Clock, Flame } from 'lucide-react';

export default function AnalyticsView({ analyticsData }) {
  const { t, lang } = useLanguage();

  if (!analyticsData) return null;

  const { summary = {}, last7Days = [], categoryStats = [] } = analyticsData;

  const maxCompletedInWeek = Math.max(...last7Days.map(d => d.tasksCompleted), 5);

  return (
    <section>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <BarChart3 size={24} color="var(--primary)" />
            {t.analyticsTitle}
          </h2>
          <p>{t.analyticsSubtitle}</p>
        </div>
      </div>

      {/* Grid Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* 7-Day Activity Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" />
            {t.last7DaysActivity}
          </h3>

          {/* Bar Chart Container */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', gap: '0.5rem' }}>
            {last7Days.map(day => {
              const heightPercent = Math.max((day.tasksCompleted / maxCompletedInWeek) * 100, 8);
              return (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {day.tasksCompleted}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, var(--primary) 0%, #8b5cf6 100%)',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.4s ease',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                    title={`${day.date}: ${day.tasksCompleted} tasks, ${day.focusMinutes} focus mins`}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.25rem' }}>
                    {lang === 'ar' ? day.dayNameAr : day.dayNameEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="#8b5cf6" />
            {t.categoryDistribution}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryStats.map(cat => {
              const total = cat.total_tasks || 0;
              const completed = cat.completed_tasks || 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              const catName = lang === 'ar' ? cat.name_ar : cat.name_en;

              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color || '#3b82f6' }} />
                      {catName}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {completed}/{total} ({percent}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: cat.color || '#3b82f6',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
