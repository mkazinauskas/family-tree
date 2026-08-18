import React, { useRef } from 'react';
import { FamilyTreeData } from '../types/familyTree';
import { TEMPLATES } from '../data/templates';
import { parseFamilyTreeHtml } from '../engine/htmlParser';
import { X, Sparkles, Upload, FileCode, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface TemplatePickerModalProps {
  currentTreeId: string;
  onSelectTemplate: (treeData: FamilyTreeData) => void;
  onClose: () => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  currentTreeId,
  onSelectTemplate,
  onClose,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content) as FamilyTreeData;
          onSelectTemplate(parsed);
        } else {
          // Parse HTML / SVG
          const parsed = parseFamilyTreeHtml(content);
          onSelectTemplate(parsed);
        }
      } catch (err) {
        alert(t('templatePickerModal.importError') + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-lg">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} className="text-amber-400" />
            <span>{t('templatePickerModal.title')}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t('templatePickerModal.description')}
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
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

          {/* Templates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '10px' }}>
            {TEMPLATES.map((tpl) => {
              const isSelected = currentTreeId === tpl.data.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => onSelectTemplate(tpl.data)}
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
                    <span>·</span>
                    <span>{t('templatePickerModal.marriagesCount', { count: tpl.data.marriages.length })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('templatePickerModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
