import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  CheckSquare, 
  Layers, 
  Flame, 
  Timer, 
  BarChart3, 
  BookOpen, 
  Sun, 
  Moon, 
  Globe, 
  Database,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenBackup }) {
  const { lang, toggleLanguage, theme, toggleTheme, t } = useLanguage();

  const navItems = [
    { id: 'tasks', label: t.navTasks, icon: CheckSquare },
    { id: 'tracks', label: t.navTracks, icon: Layers },
    { id: 'habits', label: t.navHabits, icon: Flame },
    { id: 'pomodoro', label: t.navPomodoro, icon: Timer },
    { id: 'analytics', label: t.navAnalytics, icon: BarChart3 },
    { id: 'journal', label: t.navJournal, icon: BookOpen }
  ];

  return (
    <header className="navbar">
      {/* Brand Logo */}
      <div className="logo-section">
        <div className="logo-icon-badge">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="logo-title">{t.appName}</h1>
          <p className="logo-subtitle">{t.appTagline}</p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="nav-tabs">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Actions (Language, Theme, Backup) */}
      <div className="nav-actions">
        {/* Backup / Export-Import */}
        <button 
          className="icon-btn" 
          onClick={onOpenBackup}
          title={t.backupTitle}
        >
          <Database size={18} />
        </button>

        {/* Theme Toggle */}
        <button 
          className="icon-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? t.themeLight : t.themeDark}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language Switch */}
        <button 
          className="lang-toggle-btn" 
          onClick={toggleLanguage}
          title={t.language}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={14} />
            {lang === 'ar' ? 'English' : 'عربي'}
          </span>
        </button>
      </div>
    </header>
  );
}
