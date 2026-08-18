import React from 'react';
import { History, X, Clock, CheckCircle2 } from 'lucide-react';
import { HistoryEntry } from '../hooks/useTreeHistory';
import { useTranslation } from '../i18n/LanguageContext';

interface HistorySidebarProps {
  entries: HistoryEntry[];
  currentIndex: number;
  onJumpToIndex: (index: number) => void;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
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
    <aside
      style={{
        width: '320px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 35,
      }}
    >
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <History size={18} className="text-sky-400" />
          <span>{t('historySidebar.title', { count: entries.length })}</span>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          {t('historySidebar.description')}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {entries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {t('historySidebar.empty')}
          </div>
        ) : (
          orderedIndices.map((index) => {
            const entry = entries[index];
            const isCurrent = index === currentIndex;

            return (
              <div
                key={`${index}-${entry.timestamp}`}
                onClick={() => onJumpToIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                  border: isCurrent ? '1px solid rgba(2, 132, 199, 0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'all 0.12s ease',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    marginTop: '4px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: isCurrent ? '#38bdf8' : 'var(--text-muted)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isCurrent ? '#38bdf8' : 'var(--text-primary)',
                      overflowWrap: 'break-word',
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
                      marginTop: '2px',
                    }}
                  >
                    <Clock size={11} />
                    {formatTime(entry.timestamp)}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.15)',
                        padding: '1px 7px',
                        borderRadius: '999px',
                        marginTop: '6px',
                        width: 'fit-content',
                      }}
                    >
                      <CheckCircle2 size={11} />
                      {t('historySidebar.currentBadge')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
