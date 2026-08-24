import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import QuickStatsBanner from './components/QuickStatsBanner';
import TaskManager from './components/TaskManager';
import TracksManager from './components/TracksManager';
import HabitTracker from './components/HabitTracker';
import PomodoroTimer from './components/PomodoroTimer';
import AnalyticsView from './components/AnalyticsView';
import DailyJournal from './components/DailyJournal';
import BackupModal from './components/BackupModal';

function MainApp() {
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [habits, setHabits] = useState([]);
  const [pomoStats, setPomoStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dailyNote, setDailyNote] = useState(null);

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPomoTask, setSelectedPomoTask] = useState(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all initial data
  const loadAllData = async () => {
    try {
      const [catRes, taskRes, habitRes, pomoRes, anaRes, noteRes] = await Promise.all([
        api.getCategories(),
        api.getTasks({
          date: filterDate,
          status: filterStatus,
          category: filterCategory,
          priority: filterPriority,
          search: searchQuery
        }),
        api.getHabits(),
        api.getPomodoroStats(),
        api.getAnalytics(),
        api.getDailyNote(filterDate)
      ]);

      if (catRes.success) setCategories(catRes.categories);
      if (taskRes.success) setTasks(taskRes.tasks);
      if (habitRes.success) setHabits(habitRes.habits);
      if (pomoRes.success) setPomoStats(pomoRes);
      if (anaRes.success) setAnalyticsData(anaRes);
      if (noteRes.success) setDailyNote(noteRes.note);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks whenever filters change
  useEffect(() => {
    const fetchFilteredTasks = async () => {
      try {
        const res = await api.getTasks({
          date: filterDate,
          status: filterStatus,
          category: filterCategory,
          priority: filterPriority,
          search: searchQuery
        });
        if (res.success) setTasks(res.tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchFilteredTasks();
  }, [filterDate, filterStatus, filterCategory, filterPriority, searchQuery]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Track Handlers
  const handleCreateTrack = async (trackData) => {
    try {
      const res = await api.createCategory(trackData);
      if (res.success) {
        setCategories(prev => [...prev, res.category]);
        const anaRes = await api.getAnalytics();
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error creating track:', err);
    }
  };

  const handleUpdateTrack = async (id, trackData) => {
    try {
      const res = await api.updateCategory(id, trackData);
      if (res.success) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...res.category } : c));
        // Refresh tasks and analytics
        loadAllData();
      }
    } catch (err) {
      console.error('Error updating track:', err);
    }
  };

  const handleDeleteTrack = async (id) => {
    if (!window.confirm(t.confirmDeleteTrack || 'Are you sure you want to delete this track?')) return;
    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        loadAllData();
      }
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  const handleSelectTrackForFilter = (trackId) => {
    setFilterCategory(trackId);
    setActiveTab('tasks');
  };

  // Task Handlers
  const handleToggleTask = async (id) => {
    try {
      const res = await api.toggleTask(id);
      if (res.success) {
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: res.completed } : t)));
        // Refresh categories and analytics
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const res = await api.createTask(taskData);
      if (res.success) {
        setTasks(prev => [res.task, ...prev]);
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const res = await api.updateTask(id, taskData);
      if (res.success) {
        setTasks(prev => prev.map(t => (t.id === id ? res.task : t)));
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm(t.confirmDeleteTask || 'Are you sure you want to delete this task?')) return;
    try {
      const res = await api.deleteTask(id);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      const res = await api.toggleSubtask(taskId, subtaskId);
      if (res.success) {
        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: res.completed } : s)
            };
          }
          return task;
        }));
      }
    } catch (err) {
      console.error('Error toggling subtask:', err);
    }
  };

  // Habit Handlers
  const handleCreateHabit = async (habitData) => {
    try {
      const res = await api.createHabit(habitData);
      if (res.success) {
        setHabits(prev => [...prev, res.habit]);
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleToggleHabit = async (habitId, date) => {
    try {
      const res = await api.toggleHabit(habitId, date);
      if (res.success) {
        setHabits(prev => prev.map(h => {
          if (h.id === habitId) {
            return {
              ...h,
              logsMap: { ...(h.logsMap || {}), [date]: res.completed },
              currentStreak: res.currentStreak,
              totalCompleted: res.totalCompleted
            };
          }
          return h;
        }));
        const anaRes = await api.getAnalytics();
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm(t.confirmDeleteHabit || 'Are you sure you want to delete this habit?')) return;
    try {
      const res = await api.deleteHabit(id);
      if (res.success) {
        setHabits(prev => prev.filter(h => h.id !== id));
        const [catRes, anaRes] = await Promise.all([api.getCategories(), api.getAnalytics()]);
        if (catRes.success) setCategories(catRes.categories);
        if (anaRes.success) setAnalyticsData(anaRes);
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Pomodoro Handlers
  const handleRecordPomoSession = async (sessionData) => {
    try {
      await api.recordPomodoroSession(sessionData);
      const pomoRes = await api.getPomodoroStats();
      if (pomoRes.success) setPomoStats(pomoRes);
      const anaRes = await api.getAnalytics();
      if (anaRes.success) setAnalyticsData(anaRes);
    } catch (err) {
      console.error('Error recording session:', err);
    }
  };

  const handleStartPomoForTask = (task) => {
    setSelectedPomoTask(task);
    setActiveTab('pomodoro');
  };

  // Daily Journal Handlers
  const handleSaveDailyNote = async (date, noteData) => {
    try {
      const res = await api.saveDailyNote(date, noteData);
      if (res.success) setDailyNote(res.note);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackup={() => setIsBackupOpen(false || true)}
      />

      {/* Quick Stats Summary Banner */}
      <QuickStatsBanner stats={analyticsData ? analyticsData.summary : null} />

      {/* Main Tab Views */}
      <main>
        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            categories={categories}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onToggleSubtask={handleToggleSubtask}
            onStartPomo={handleStartPomoForTask}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'tracks' && (
          <TracksManager
            categories={categories}
            onCreateTrack={handleCreateTrack}
            onUpdateTrack={handleUpdateTrack}
            onDeleteTrack={handleDeleteTrack}
            onSelectTrackForFilter={handleSelectTrackForFilter}
          />
        )}

        {activeTab === 'habits' && (
          <HabitTracker
            habits={habits}
            onCreateHabit={handleCreateHabit}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
            categories={categories}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroTimer
            selectedTask={selectedPomoTask}
            setSelectedTask={setSelectedPomoTask}
            tasks={tasks}
            pomoStats={pomoStats}
            onRecordSession={handleRecordPomoSession}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView analyticsData={analyticsData} />
        )}

        {activeTab === 'journal' && (
          <DailyJournal
            noteData={dailyNote}
            onSaveNote={handleSaveDailyNote}
            currentDate={filterDate}
            setCurrentDate={setFilterDate}
          />
        )}
      </main>

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRefreshAll={loadAllData}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
