import React from 'react';
import { X, History, Clock, CheckCircle2 } from 'lucide-react';
import { HistoryEntry } from '../App';
import { useTranslation } from '../i18n/LanguageContext';

interface HistoryModalProps {
  entries: HistoryEntry[];
  currentIndex: number;
  onJumpToIndex: (index: number) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  entries,
  currentIndex,
  onJumpToIndex,
  onClose,
}) => {
  const { t } = useTranslation();

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Most recent action first
  const orderedIndices = entries.map((_, i) => i).reverse();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <History size={20} className="text-sky-400" />
            <span>{t('historyModal.title')}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t('historyModal.description')}
          </p>

          {entries.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {t('historyModal.empty')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '420px', overflowY: 'auto' }}>
              {orderedIndices.map((index) => {
                const entry = entries[index];
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={`${index}-${entry.timestamp}`}
                    onClick={() => onJumpToIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                      border: isCurrent ? '1px solid rgba(2, 132, 199, 0.5)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isCurrent ? '#38bdf8' : 'var(--text-muted)',
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isCurrent ? '#38bdf8' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {entry.label}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={11} />
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    {isCurrent && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        {t('historyModal.currentBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            {t('historyModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
