import React from 'react';
import { GenerationBand, TreeSection } from '../../types/familyTree';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface SectionsTabProps {
  sections: TreeSection[];
  expandedSectionId: string | null;
  onExpandSection: (id: string | null) => void;
  onAddSection: () => void;
  onRemoveSection: (id: string) => void;
  onUpdateSectionField: (id: string, field: keyof TreeSection, value: string | number) => void;
  onAddGenerationBand: (sectionId: string) => void;
  onUpdateGenerationBand: (
    sectionId: string,
    bandIdx: number,
    field: keyof GenerationBand,
    value: string | number | boolean
  ) => void;
  onRemoveGenerationBand: (sectionId: string, bandIdx: number) => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  expandedSectionId,
  onExpandSection,
  onAddSection,
  onRemoveSection,
  onUpdateSectionField,
  onAddGenerationBand,
  onUpdateGenerationBand,
  onRemoveGenerationBand,
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label">{t('treeMetadataModal.sectionsLabel', { count: sections.length })}</label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAddSection}>
          <Plus size={14} /> {t('treeMetadataModal.addSection')}
        </button>
      </div>

      {sections.map((sec, idx) => {
        const isExpanded = expandedSectionId === sec.id;
        return (
          <div
            key={sec.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            {/* Section header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                cursor: 'pointer',
                background: 'var(--bg-surface-subtle)',
              }}
              onClick={() => onExpandSection(isExpanded ? null : sec.id)}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                {idx + 1}.
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sec.title || t('treeMetadataModal.unnamedSection')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {t('treeMetadataModal.generationsCountShort', { count: sec.generationBands.length })}
              </span>
              <button
                type="button"
                className="icon-btn"
                title={t('treeMetadataModal.removeSection')}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSection(sec.id);
                }}
              >
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>

            {isExpanded && (
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">{t('treeMetadataModal.sectionTitleLabel')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sec.title}
                    onChange={(e) => onUpdateSectionField(sec.id, 'title', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('treeMetadataModal.sectionSubheadLabel')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sec.subhead || ''}
                    onChange={(e) => onUpdateSectionField(sec.id, 'subhead', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('treeMetadataModal.yPosition')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={sec.y}
                      onChange={(e) => onUpdateSectionField(sec.id, 'y', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('treeMetadataModal.heightLabel')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={sec.height || 0}
                      onChange={(e) => onUpdateSectionField(sec.id, 'height', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Generation Bands */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>{t('treeMetadataModal.generationsLabel', { count: sec.generationBands.length })}</label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onAddGenerationBand(sec.id)}
                    >
                      <Plus size={13} /> {t('treeMetadataModal.addGeneration')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sec.generationBands.map((band, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          background: 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 36px',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <input
                            type="number"
                            className="form-input"
                            title={t('treeMetadataModal.generationNumberTitle')}
                            value={band.generation}
                            onChange={(e) =>
                              onUpdateGenerationBand(sec.id, bIdx, 'generation', parseInt(e.target.value) || 0)
                            }
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder={t('treeMetadataModal.generationLabelPlaceholder')}
                            value={band.label}
                            onChange={(e) => onUpdateGenerationBand(sec.id, bIdx, 'label', e.target.value)}
                          />
                          <button
                            type="button"
                            className="icon-btn"
                            title={t('treeMetadataModal.removeGeneration')}
                            onClick={() => onRemoveGenerationBand(sec.id, bIdx)}
                          >
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr auto',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('treeMetadataModal.labelY')}</label>
                            <input
                              type="number"
                              className="form-input"
                              value={band.labelY ?? ''}
                              onChange={(e) =>
                                onUpdateGenerationBand(sec.id, bIdx, 'labelY', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('treeMetadataModal.bgY')}</label>
                            <input
                              type="number"
                              className="form-input"
                              value={band.bgY ?? ''}
                              onChange={(e) =>
                                onUpdateGenerationBand(sec.id, bIdx, 'bgY', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('treeMetadataModal.bgHeight')}</label>
                            <input
                              type="number"
                              className="form-input"
                              value={band.bgHeight ?? ''}
                              onChange={(e) =>
                                onUpdateGenerationBand(sec.id, bIdx, 'bgHeight', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              paddingTop: '13px',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={band.hasBgRect ?? false}
                              onChange={(e) => onUpdateGenerationBand(sec.id, bIdx, 'hasBgRect', e.target.checked)}
                            />
                            {t('treeMetadataModal.bgCheckbox')}
                          </label>
                        </div>
                      </div>
                    ))}
                    {sec.generationBands.length === 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 0' }}>
                        {t('treeMetadataModal.noGenerations')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {sections.length === 0 && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
          {t('treeMetadataModal.noSections')}
        </div>
      )}
    </div>
  );
};
