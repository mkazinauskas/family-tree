import React, { useState } from 'react';
import { ProjectMeta } from '../hooks/useProjects';
import { X, FolderOpen, FolderPlus, Pencil, Copy, Trash2, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface ProjectExplorerModalProps {
  projects: ProjectMeta[];
  activeProjectId: string;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export const ProjectExplorerModal: React.FC<ProjectExplorerModalProps> = ({
  projects,
  activeProjectId,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onCreateNew,
  onClose,
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const sorted = [...projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const startEditing = (p: ProjectMeta) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const commitEditing = () => {
    if (editingId) {
      const trimmed = editingName.trim();
      if (trimmed) onRename(editingId, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-lg">
        <div className="modal-header">
          <div className="modal-title">
            <FolderOpen size={20} className="text-sky-400" />
            <span>{t('projectExplorer.title', { count: projects.length })}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t('projectExplorer.description')}
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={onCreateNew}>
              <FolderPlus size={14} />
              <span>{t('projectExplorer.newProject')}</span>
            </button>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sorted.map((p) => {
              const isActive = p.id === activeProjectId;
              const isEditing = editingId === p.id;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                    border: isActive ? '1.5px solid #38bdf8' : '1.5px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: isEditing ? 'default' : 'pointer' }}
                    onClick={() => !isEditing && onSelect(p.id)}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-input"
                        style={{ height: '30px', fontSize: '13px' }}
                        value={editingName}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEditing();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '14px',
                            color: isActive ? '#38bdf8' : 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.name}
                        </span>
                        {isActive && (
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
                              flexShrink: 0,
                            }}
                          >
                            {t('projectExplorer.activeBadge')}
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {t('projectExplorer.peopleCount', { count: p.peopleCount })} ·{' '}
                      {t('projectExplorer.updatedAt', { date: formatDate(p.updatedAt) })}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <button className="icon-btn" title={t('common.save')} onClick={commitEditing}>
                        <Check size={14} />
                      </button>
                      <button className="icon-btn" title={t('common.cancel')} onClick={() => setEditingId(null)}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" title={t('projectExplorer.rename')} onClick={() => startEditing(p)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title={t('projectExplorer.duplicate')}
                        onClick={() => onDuplicate(p.id, t('projectExplorer.duplicateName', { name: p.name }))}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title={t('projectExplorer.delete')}
                        onClick={() => {
                          if (window.confirm(t('projectExplorer.deleteConfirm', { name: p.name }))) {
                            onDelete(p.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
