import React from 'react';
import { TreeMetadata } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';

interface MetaTabProps {
  meta: TreeMetadata;
  onChange: (meta: TreeMetadata) => void;
}

export const MetaTab: React.FC<MetaTabProps> = ({ meta, onChange }) => {
  const { t } = useTranslation();

  return (
    <>
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
