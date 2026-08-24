import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Flame, 
  Briefcase, 
  Globe, 
  Sparkles, 
  Moon, 
  BookOpen, 
  HeartPulse, 
  DollarSign, 
  Compass, 
  Code, 
  Music, 
  Trophy, 
  Star, 
  X, 
  Check, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Briefcase', icon: Briefcase, label: 'Work / عمل' },
  { id: 'Globe', icon: Globe, label: 'Languages / لغات' },
  { id: 'Sparkles', icon: Sparkles, label: 'Self Dev / تطوير ذات' },
  { id: 'Moon', icon: Moon, label: 'Spiritual / ديني' },
  { id: 'BookOpen', icon: BookOpen, label: 'Study / دراسة' },
  { id: 'HeartPulse', icon: HeartPulse, label: 'Health / صحة' },
  { id: 'DollarSign', icon: DollarSign, label: 'Finance / مالية' },
  { id: 'Compass', icon: Compass, label: 'Goals / مسار' },
  { id: 'Code', icon: Code, label: 'Coding / برمجة' },
  { id: 'Music', icon: Music, label: 'Art / فن' },
  { id: 'Trophy', icon: Trophy, label: 'Sports / رياضة' },
  { id: 'Star', icon: Star, label: 'Priority / مهم' }
];

const COLOR_OPTIONS = [
  '#3b82f6', '#06b6d4', '#ec4899', '#10b981', 
  '#8b5cf6', '#ef4444', '#f59e0b', '#6366f1', '#14b8a6'
];

export default function TracksManager({ 
  categories = [], 
  onCreateTrack, 
  onUpdateTrack, 
  onDeleteTrack,
  onSelectTrackForFilter 
}) {
  const { t, lang } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Compass');

  const handleOpenCreate = () => {
    setEditingTrack(null);
    setNameAr('');
    setNameEn('');
    setColor('#3b82f6');
    setIcon('Compass');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track) => {
    setEditingTrack(track);
    setNameAr(track.name_ar || '');
    setNameEn(track.name_en || '');
    setColor(track.color || '#3b82f6');
    setIcon(track.icon || 'Compass');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameAr.trim() && !nameEn.trim()) return;

    if (editingTrack) {
      onUpdateTrack(editingTrack.id, {
        name_ar: nameAr.trim() || nameEn.trim(),
        name_en: nameEn.trim() || nameAr.trim(),
        color,
        icon
      });
    } else {
      onCreateTrack({
        name_ar: nameAr.trim() || nameEn.trim(),
        name_en: nameEn.trim() || nameAr.trim(),
        color,
        icon
      });
    }

    setIsModalOpen(false);
  };

  const getIconComponent = (iconName) => {
    const found = ICON_OPTIONS.find(item => item.id === iconName);
    return found ? found.icon : Compass;
  };

  return (
    <section>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <Layers size={24} color="var(--primary)" />
            {t.tracksTitle}
          </h2>
          <p>{t.tracksSubtitle}</p>
        </div>

        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>{t.addNewTrack}</span>
        </button>
      </div>

      {/* Tracks Grid */}
      {categories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {categories.map(track => {
            const IconComp = getIconComponent(track.icon);
            const trackName = lang === 'ar' ? track.name_ar : track.name_en;
            const completion = track.completionRate || 0;

            return (
              <div 
                key={track.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.4rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  borderTop: `4px solid ${track.color || '#3b82f6'}`
                }}
              >
                {/* Track Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        background: `${track.color || '#3b82f6'}22`, 
                        color: track.color || '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComp size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {trackName}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {track.totalHabits || 0} {t.trackHabitsCount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => handleOpenEdit(track)}
                      title={t.edit}
                      style={{ width: 32, height: 32 }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => onDeleteTrack(track.id)}
                      title={t.delete}
                      style={{ width: 32, height: 32, color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Tasks count */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {t.trackTasksCount}: <strong style={{ color: 'var(--text-primary)' }}>{track.completedTasks || 0} / {track.totalTasks || 0}</strong>
                    </span>
                    <span style={{ fontWeight: '700', color: track.color || '#3b82f6' }}>
                      {completion}%
                    </span>
                  </div>

                  <div style={{ height: '7px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${completion}%`, 
                        background: track.color || '#3b82f6', 
                        borderRadius: '999px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>

                {/* Quick filter button */}
                <button
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.85rem', padding: '0.45rem' }}
                  onClick={() => onSelectTrackForFilter(track.id)}
                >
                  <span>{t.viewTrackDetails}</span>
                  {lang === 'ar' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-icon">
            <Layers size={28} color="var(--primary)" />
          </div>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {t.noTracks}
          </p>
        </div>
      )}

      {/* Create / Edit Track Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {editingTrack ? t.editTrack : t.addNewTrack}
              </h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t.trackNameAr}</label>
                <input
                  type="text"
                  className="form-input"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: مسار تعلم اللغات، المسار الديني، تطوير الذات..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.trackNameEn}</label>
                <input
                  type="text"
                  className="form-input"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. Languages Track, Spiritual Track..."
                />
              </div>

              {/* Color Options */}
              <div className="form-group">
                <label className="form-label">{t.trackColor}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map(c => (
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

              {/* Icon Options */}
              <div className="form-group">
                <label className="form-label">{t.trackIcon}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {ICON_OPTIONS.map(item => {
                    const ItemIcon = item.icon;
                    const isSelected = icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIcon(item.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${color}` : '1px solid var(--border-color)',
                          background: isSelected ? `${color}22` : 'var(--bg-input)',
                          color: isSelected ? color : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '0.72rem'
                        }}
                      >
                        <ItemIcon size={18} />
                        <span>{item.id}</span>
                      </button>
                    );
                  })}
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
