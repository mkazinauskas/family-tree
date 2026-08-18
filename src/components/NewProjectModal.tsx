import React, { useRef, useState } from 'react';
import { FamilyTreeData } from '../types/familyTree';
import { TEMPLATES } from '../data/templates';
import { parseFamilyTreeHtml } from '../engine/htmlParser';
import { X, FolderPlus, Upload, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface NewProjectModalProps {
  onCreate: (name: string, treeData: FamilyTreeData) => void;
  /** Omit to force the user to create a project (e.g. when none exist yet) — hides the close/cancel controls. */
  onClose?: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onCreate, onClose }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(t('newProjectModal.defaultName'));
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0]?.id ?? '');
  const [uploadedTree, setUploadedTree] = useState<FamilyTreeData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const parsed = file.name.endsWith('.json')
          ? (JSON.parse(content) as FamilyTreeData)
          : parseFamilyTreeHtml(content);
        setUploadedTree(parsed);
        setUploadedFileName(file.name);
        if (!name.trim() || name === t('newProjectModal.defaultName')) {
          setName(parsed.metadata?.title || parsed.name || file.name);
        }
      } catch (err) {
        alert(t('templatePickerModal.importError') + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    const finalName = name.trim() || t('newProjectModal.defaultName');
    const treeData = uploadedTree || TEMPLATES.find((tpl) => tpl.id === selectedTemplateId)?.data;
    if (!treeData) return;
    onCreate(finalName, treeData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-lg">
        <div className="modal-header">
          <div className="modal-title">
            <FolderPlus size={20} className="text-sky-400" />
            <span>{t('newProjectModal.title')}</span>
          </div>
          {onClose && (
            <button className="icon-btn" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t('newProjectModal.nameLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('newProjectModal.namePlaceholder')}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t('newProjectModal.templateDescription')}
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} />
              <span>{t('templatePickerModal.importButton')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.svg,.json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {uploadedTree && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{t('newProjectModal.usingUploadedFile', { name: uploadedFileName })}</span>
              <button
                className="btn-ghost"
                style={{ fontSize: '11px', cursor: 'pointer' }}
                onClick={() => setUploadedTree(null)}
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginTop: '10px',
              opacity: uploadedTree ? 0.4 : 1,
              pointerEvents: uploadedTree ? 'none' : 'auto',
            }}
          >
            {TEMPLATES.map((tpl) => {
              const isSelected = !uploadedTree && selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  style={{
                    background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                    borderColor: isSelected ? '#38bdf8' : 'var(--border-subtle)',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {tpl.name}
                      </span>
                      {isSelected && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                          <Check size={14} /> {t('templatePickerModal.active')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                      {tpl.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{t('templatePickerModal.peopleCount', { count: tpl.data.people.length })}</span>
                    <span>·</span>
                    <span>{t('templatePickerModal.sectionsCount', { count: tpl.data.sections.length })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!uploadedTree && !selectedTemplateId}>
            <FolderPlus size={14} />
            <span>{t('newProjectModal.create')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
