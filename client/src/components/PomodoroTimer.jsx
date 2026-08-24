import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Bell, 
  Check, 
  Tag 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Web Audio API synth bell sound
function playBellSound(isWork) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isWork ? 880 : 587.33, now); // A5 or D5
    osc.frequency.exponentialRampToValueAtTime(isWork ? 440 : 293.66, now + 1.2);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  } catch (err) {
    console.log('Audio playback error:', err);
  }
}

export default function PomodoroTimer({ 
  selectedTask, 
  setSelectedTask, 
  tasks = [], 
  pomoStats, 
  onRecordSession 
}) {
  const { t, lang } = useLanguage();

  const MODE_DURATIONS = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  const [mode, setMode] = useState('work'); // 'work' | 'short_break' | 'long_break'
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // When mode changes, reset timer
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    playBellSound(mode === 'work');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (mode === 'work') {
      const minutes = Math.round(MODE_DURATIONS.work / 60);
      onRecordSession({
        task_id: selectedTask ? selectedTask.id : null,
        mode: 'work',
        duration_minutes: minutes
      });
    }
  };

  const handleTogglePlay = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <section>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-group">
          <h2>
            <Timer size={24} color="var(--primary)" />
            {t.pomoTitle}
          </h2>
          <p>{t.pomoSubtitle}</p>
        </div>
      </div>

      {/* Main Pomodoro Box */}
      <div className="glass-card pomodoro-container">
        {/* Mode Selector */}
        <div className="pomo-mode-selector">
          <button
            className={`pomo-mode-btn ${mode === 'work' ? 'active' : ''}`}
            onClick={() => switchMode('work')}
          >
            {t.workMode} (25m)
          </button>
          <button
            className={`pomo-mode-btn ${mode === 'short_break' ? 'active' : ''}`}
            onClick={() => switchMode('short_break')}
          >
            {t.shortBreak} (5m)
          </button>
          <button
            className={`pomo-mode-btn ${mode === 'long_break' ? 'active' : ''}`}
            onClick={() => switchMode('long_break')}
          >
            {t.longBreak} (15m)
          </button>
        </div>

        {/* Linked Task Selector */}
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <select
            className="form-select"
            value={selectedTask ? selectedTask.id : ''}
            onChange={(e) => {
              const task = tasks.find(t => t.id === e.target.value);
              setSelectedTask(task || null);
            }}
            style={{ width: '100%', textAlign: 'center' }}
          >
            <option value="">-- {t.selectLinkedTask} --</option>
            {tasks.filter(t => !t.completed).map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        {/* Circular Progress Display */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pomo-timer-display">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', maxWidth: '320px', height: '6px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: mode === 'work' ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : '#10b981',
              transition: 'width 0.5s ease'
            }}
          />
        </div>

        {/* Controls */}
        <div className="pomo-controls">
          <button
            className="icon-btn"
            onClick={handleReset}
            title={t.resetTimer}
            style={{ width: 46, height: 46 }}
          >
            <RotateCcw size={20} />
          </button>

          <button
            className="pomo-play-btn"
            onClick={handleTogglePlay}
            title={isRunning ? t.pauseTimer : t.startTimer}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} style={{ transform: 'translateX(2px)' }} />}
          </button>
        </div>

        {/* Today's Focus Stats */}
        {pomoStats && (
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)' }}>
                {pomoStats.today ? pomoStats.today.sessions : 0}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.sessionsCompletedToday}</p>
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>
                {pomoStats.today ? pomoStats.today.minutes : 0} {t.minutes}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.focusMinutesToday}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent History Table */}
      {pomoStats && pomoStats.recentSessions && pomoStats.recentSessions.length > 0 && (
        <div className="glass-card" style={{ marginTop: '1.75rem', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            {t.recentSessions}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pomoStats.recentSessions.slice(0, 5).map(session => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.9rem',
                  background: 'var(--bg-input)',
                  borderRadius: '8px',
                  fontSize: '0.88rem'
                }}
              >
                <span>{session.task_title || (lang === 'ar' ? 'جلسة تركيز حرة' : 'Free Focus Session')}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {session.duration_minutes} {t.minutes} • {new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
