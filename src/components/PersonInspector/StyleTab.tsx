import React from 'react';
import { Person } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';
import { useThemePresetList } from './useThemePresetList';

interface StyleTabProps {
  person: Person;
  onFieldChange: (field: keyof Person, value: any) => void;
}

export const StyleTab: React.FC<StyleTabProps> = ({ person, onFieldChange }) => {
  const { t } = useTranslation();
  const presetList = useThemePresetList();

  return (
    <>
      <div className="form-group">
        <label className="form-label">{t('personInspector.colorTheme')}</label>
        <div className="color-swatches-grid">
          {presetList.map((preset) => (
            <div
              key={preset.key}
              className={`color-swatch-item ${person.themePreset === preset.key ? 'selected' : ''}`}
              onClick={() => onFieldChange('themePreset', preset.key)}
            >
              <div
                className="color-swatch-preview"
                style={{ backgroundColor: preset.preview, borderColor: preset.border }}
              />
              <span className="color-swatch-label">{preset.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('personInspector.positionX')}</label>
          <input
            type="number"
            className="form-input"
            value={person.x ?? 0}
            onChange={(e) => onFieldChange('x', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('personInspector.positionY')}</label>
          <input
            type="number"
            className="form-input"
            value={person.y ?? 0}
            onChange={(e) => onFieldChange('y', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('personInspector.widthLabel')}</label>
          <input
            type="number"
            className="form-input"
            value={person.width || 140}
            onChange={(e) => onFieldChange('width', parseInt(e.target.value) || 140)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('personInspector.heightLabel')}</label>
          <input
            type="number"
            className="form-input"
            value={person.height || 80}
            onChange={(e) => onFieldChange('height', parseInt(e.target.value) || 80)}
          />
        </div>
      </div>
    </>
  );
};
