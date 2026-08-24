import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Download, Upload, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { api } from '../services/api';

export default function BackupModal({ isOpen, onClose, onRefreshAll }) {
  const { t } = useLanguage();
  const [importStatus, setImportStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const res = await fetch('/api/backup/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg('Failed to export backup');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const result = await api.importBackup(json.data || json);
        if (result.success) {
          setImportStatus(t.importSuccess);
          setErrorMsg('');
          if (onRefreshAll) onRefreshAll();
          setTimeout(() => {
            setImportStatus('');
            onClose();
          }, 1500);
        } else {
          setErrorMsg(result.error || 'Import failed');
        }
      } catch (err) {
        setErrorMsg('Invalid JSON backup file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--primary)" />
            {t.backupTitle}
          </h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Export Box */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} color="var(--primary)" />
            {t.exportData}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
            {t.exportDescription}
          </p>
          <button className="btn-primary" onClick={handleExport} style={{ width: '100%' }}>
            <Download size={16} />
            <span>{t.exportData}</span>
          </button>
        </div>

        {/* Import Box */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} color="#8b5cf6" />
            {t.importData}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
            {t.importDescription}
          </p>

          <label className="btn-secondary" style={{ width: '100%', cursor: 'pointer', display: 'flex' }}>
            <Upload size={16} />
            <span>{t.importData}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Status Alerts */}
        {importStatus && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} />
            <span>{importStatus}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
