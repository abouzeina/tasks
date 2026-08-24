import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Sparkles, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  FolderClosed,
  Clock,
  Compass
} from 'lucide-react';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';

export default function TaskManager({
  tasks,
  categories,
  onToggleTask,
  onDeleteTask,
  onCreateTask,
  onUpdateTask,
  onToggleSubtask,
  onStartPomo,
  filterDate,
  setFilterDate,
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  filterPriority,
  setFilterPriority,
  searchQuery,
  setSearchQuery
}) {
  const { t, lang } = useLanguage();
  const [quickTitle, setQuickTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isViewingAllDays = !filterDate || filterDate === 'all';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onCreateTask({
      title: quickTitle.trim(),
      category_id: filterCategory !== 'all' ? filterCategory : 'work',
      priority: 'medium',
      due_date: isViewingAllDays ? todayStr : filterDate
    });

    setQuickTitle('');
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (taskData) => {
    if (taskData.id) {
      onUpdateTask(taskData.id, taskData);
    } else {
      onCreateTask(taskData);
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === filterCategory);

  return (
    <section>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <CheckSquare size={22} color="var(--primary)" />
            {selectedCategoryObj ? (lang === 'ar' ? selectedCategoryObj.name_ar : selectedCategoryObj.name_en) : t.navTasks}
          </h2>
          <p>
            {isViewingAllDays 
              ? (lang === 'ar' ? `عرض الخطة الكاملة لجميع الأيام (${tasks.length} يوم/مهمة)` : `Viewing all days roadmap (${tasks.length} days/tasks)`) 
              : (lang === 'ar' ? `مهام تاريخ: ${filterDate}` : `Tasks for: ${filterDate}`)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Quick Switcher between Today and All Days */}
          <button
            className={`btn-secondary ${!isViewingAllDays ? 'btn-primary' : ''}`}
            onClick={() => setFilterDate(todayStr)}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            <Calendar size={15} />
            <span>{lang === 'ar' ? '📅 مهام اليوم فقط' : '📅 Today Only'}</span>
          </button>

          <button
            className={`btn-secondary ${isViewingAllDays ? 'btn-primary' : ''}`}
            onClick={() => setFilterDate('all')}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            <Layers size={15} />
            <span>{lang === 'ar' ? '🗺️ عرض كل الأيام (الخطة كاملة)' : '🗺️ All Days (Full Roadmap)'}</span>
          </button>

          <button className="btn-primary" onClick={handleOpenCreate} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <Plus size={16} />
            <span>{t.addNewTask}</span>
          </button>
        </div>
      </div>

      {/* Track Active Info Banner if a specific track is selected */}
      {selectedCategoryObj && (
        <div 
          className="glass-card" 
          style={{ 
            marginBottom: '1.25rem', 
            padding: '1rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderRight: lang === 'ar' ? `5px solid ${selectedCategoryObj.color || '#3b82f6'}` : undefined,
            borderLeft: lang === 'ltr' ? `5px solid ${selectedCategoryObj.color || '#3b82f6'}` : undefined,
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {lang === 'ar' ? selectedCategoryObj.name_ar : selectedCategoryObj.name_en}
            </h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? `إجمالي أيام ومهام المسار: ${tasks.length} • نسبة الإنجاز: ${selectedCategoryObj.completionRate || 0}%` : `Total track tasks: ${tasks.length} • Progress: ${selectedCategoryObj.completionRate || 0}%`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setFilterCategory('all')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {lang === 'ar' ? 'عرض كل المسارات' : 'Show All Tracks'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="task-quick-add">
        <Sparkles size={20} color="var(--primary)" />
        <input
          type="text"
          className="task-quick-input"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          placeholder={t.taskTitlePlaceholder}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span>{t.save}</span>
        </button>
      </form>

      {/* Filters & Search Toolbar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.search}
          />
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input
            type="date"
            className="select-filter"
            value={isViewingAllDays ? '' : filterDate}
            onChange={e => setFilterDate(e.target.value || 'all')}
            title={lang === 'ar' ? 'اختر تاريخاً أو اضغط عرض كل الأيام' : 'Pick a date'}
          />
          {!isViewingAllDays && (
            <button
              className="icon-btn"
              onClick={() => setFilterDate('all')}
              title={lang === 'ar' ? 'إلغاء تصفية التاريخ وعرض كل الأيام' : 'View all days'}
              style={{ width: 34, height: 34 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Track Filter */}
        <select
          className="select-filter"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="all">{t.all} ({t.category})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {lang === 'ar' ? c.name_ar : c.name_en}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="select-filter"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">{t.all} ({t.status})</option>
          <option value="pending">{t.pending}</option>
          <option value="completed">{t.completed}</option>
        </select>

        {/* Priority Filter */}
        <select
          className="select-filter"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="all">{t.all} ({t.priority})</option>
          <option value="urgent">{t.priorityUrgent}</option>
          <option value="high">{t.priorityHigh}</option>
          <option value="medium">{t.priorityMedium}</option>
          <option value="low">{t.priorityLow}</option>
        </select>
      </div>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={handleOpenEdit}
              onToggleSubtask={onToggleSubtask}
              onStartPomo={onStartPomo}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-icon">
            <CheckSquare size={28} />
          </div>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {t.noTasksFound}
          </p>
          <p style={{ fontSize: '0.9rem' }}>{t.createFirstTask}</p>
        </div>
      )}

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialTask={editingTask}
        categories={categories}
      />
    </section>
  );
}
