import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Timer, 
  CheckCircle2, 
  Circle,
  ListTodo,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TaskItem({ task, onToggle, onDelete, onEdit, onToggleSubtask, onStartPomo }) {
  const { t, lang } = useLanguage();
  const [showSubtasks, setShowSubtasks] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!task.completed) {
      // Trigger festive confetti
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e']
      });
    }
    onToggle(task.id);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-priority-urgent';
      case 'high': return 'badge-priority-high';
      case 'low': return 'badge-priority-low';
      default: return 'badge-priority-medium';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return t.priorityUrgent;
      case 'high': return t.priorityHigh;
      case 'low': return t.priorityLow;
      default: return t.priorityMedium;
    }
  };

  const completedSubtasksCount = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  return (
    <div 
      className={`glass-card task-card ${task.completed ? 'completed' : ''}`}
      style={{
        borderLeft: lang === 'ltr' && task.category_color ? `4px solid ${task.category_color}` : undefined,
        borderRight: lang === 'ar' && task.category_color ? `4px solid ${task.category_color}` : undefined,
      }}
    >
      <div className="task-card-main">
        {/* Custom Checkbox */}
        <div 
          className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          title={task.completed ? t.completed : t.pending}
        >
          {task.completed && <Check size={15} strokeWidth={3} />}
        </div>

        {/* Content */}
        <div className="task-content">
          <div 
            className="task-title" 
            style={{ cursor: totalSubtasks > 0 ? 'pointer' : 'default' }}
            onClick={() => totalSubtasks > 0 && setShowSubtasks(!showSubtasks)}
          >
            {task.title}
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Badges & Metadata */}
          <div className="task-meta-tags">
            {/* Priority Badge */}
            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>

            {/* Category / Track Badge */}
            {task.category_id && (
              <span 
                className="badge badge-category"
                style={{ 
                  borderColor: task.category_color ? `${task.category_color}55` : undefined,
                  background: task.category_color ? `${task.category_color}18` : undefined,
                  color: task.category_color || 'var(--text-primary)'
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.category_color || '#3b82f6' }} />
                {lang === 'ar' ? (task.category_name_ar || task.category_name_en) : (task.category_name_en || task.category_name_ar)}
              </span>
            )}

            {/* Due Date & Time */}
            {task.due_date && (
              <span className="badge badge-due">
                <Calendar size={12} />
                {task.due_date} {task.due_time ? `• ${task.due_time}` : ''}
              </span>
            )}

            {/* Subtasks Expand Button */}
            {totalSubtasks > 0 && (
              <button 
                type="button" 
                className="badge" 
                style={{ 
                  background: showSubtasks ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)', 
                  cursor: 'pointer', 
                  border: showSubtasks ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                  color: showSubtasks ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: '700'
                }}
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                <ListTodo size={13} />
                <span>
                  {lang === 'ar' ? `مهام اليوم (${completedSubtasksCount}/${totalSubtasks})` : `Day Subtasks (${completedSubtasksCount}/${totalSubtasks})`}
                </span>
                {showSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Subtasks Mini Progress Bar when has subtasks */}
          {totalSubtasks > 0 && (
            <div style={{ marginTop: '0.65rem', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                <span>{lang === 'ar' ? 'إنجاز مهام اليوم:' : 'Day progress:'}</span>
                <span style={{ fontWeight: '700', color: completedSubtasksCount === totalSubtasks ? '#10b981' : 'var(--text-secondary)' }}>
                  {subtaskProgress}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${subtaskProgress}%`, 
                    background: completedSubtasksCount === totalSubtasks ? '#10b981' : 'var(--primary)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="task-actions">
          {/* Pomodoro link button */}
          {!task.completed && (
            <button 
              className="icon-btn" 
              onClick={() => onStartPomo(task)}
              title={t.navPomodoro}
              style={{ color: '#8b5cf6' }}
            >
              <Timer size={16} />
            </button>
          )}

          {/* Edit */}
          <button 
            className="icon-btn" 
            onClick={() => onEdit(task)}
            title={t.edit}
          >
            <Edit3 size={16} />
          </button>

          {/* Delete */}
          <button 
            className="icon-btn" 
            onClick={() => onDelete(task.id)}
            title={t.delete}
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtasks Accordion Box */}
      {showSubtasks && totalSubtasks > 0 && (
        <div 
          className="subtasks-section" 
          style={{ 
            marginTop: '0.85rem', 
            padding: '0.85rem 1rem', 
            background: 'var(--bg-input)', 
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ListTodo size={14} color="var(--primary)" />
            <span>{lang === 'ar' ? 'خطوات ومهام هذا اليوم بالتفصيل:' : 'Detailed breakdown for this day:'}</span>
          </div>

          {task.subtasks.map(sub => (
            <div 
              key={sub.id} 
              className={`subtask-item ${sub.completed ? 'done' : ''}`}
              onClick={() => onToggleSubtask(task.id, sub.id)}
              style={{ 
                cursor: 'pointer', 
                padding: '0.4rem 0.5rem', 
                borderRadius: '6px',
                background: sub.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                transition: 'background 0.15s ease'
              }}
            >
              {sub.completed ? (
                <CheckCircle2 size={17} color="#10b981" style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={17} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{sub.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
