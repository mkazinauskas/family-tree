import React from 'react';
import { TreeMetadata } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  PAPER_FORMATS,
  Orientation,
  findClosestFormat,
  getCanvasPixelSize,
} from '../../engine/paperFormats';

interface MetaTabProps {
  meta: TreeMetadata;
  onChange: (meta: TreeMetadata) => void;
}

export const MetaTab: React.FC<MetaTabProps> = ({ meta, onChange }) => {
  const { t } = useTranslation();

  const inferred = findClosestFormat(meta.canvasWidth, meta.canvasHeight);
  const paperFormat = meta.paperFormat || inferred.formatId;
  const orientation: Orientation = meta.orientation || inferred.orientation;

  const applyCanvasSize = (formatId: string, newOrientation: Orientation) => {
    const { width, height } = getCanvasPixelSize(formatId, newOrientation);
    onChange({
      ...meta,
      paperFormat: formatId,
      orientation: newOrientation,
      canvasWidth: width,
      canvasHeight: height,
    });
  };

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('treeMetadataModal.canvasSizeLabel')}</label>
          <select
            className="form-select"
            value={paperFormat}
            onChange={(e) => applyCanvasSize(e.target.value, orientation)}
          >
            {PAPER_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('treeMetadataModal.orientationLabel')}</label>
          <select
            className="form-select"
            value={orientation}
            onChange={(e) => applyCanvasSize(paperFormat, e.target.value as Orientation)}
          >
            <option value="landscape">{t('treeMetadataModal.orientationLandscape')}</option>
            <option value="portrait">{t('treeMetadataModal.orientationPortrait')}</option>
          </select>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px' }}>
        {t('treeMetadataModal.canvasSizeHint')}
      </div>

      <div className="form-group">
        <label className="form-label">{t('treeMetadataModal.treeTitleLabel')}</label>
        <input
          type="text"
          className="form-input"
          value={meta.title}
          onChange={(e) => onChange({ ...meta, title: e.target.value })}
          placeholder={t('treeMetadataModal.treeTitlePlaceholder')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('treeMetadataModal.subtitleLabel')}</label>
        <input
          type="text"
          className="form-input"
          value={meta.subtitle}
          onChange={(e) => onChange({ ...meta, subtitle: e.target.value })}
          placeholder={t('treeMetadataModal.subtitlePlaceholder')}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('treeMetadataModal.sheetNumberLabel')}</label>
          <input
            type="text"
            className="form-input"
            value={meta.sheetNumber}
            onChange={(e) => onChange({ ...meta, sheetNumber: e.target.value })}
            placeholder={t('treeMetadataModal.sheetNumberPlaceholder')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('treeMetadataModal.fontFamilyLabel')}</label>
          <input
            type="text"
            className="form-input"
            value={meta.fontFamily}
            onChange={(e) => onChange({ ...meta, fontFamily: e.target.value })}
            placeholder={t('treeMetadataModal.fontFamilyPlaceholder')}
          />
        </div>
      </div>
    </>
  );
};
