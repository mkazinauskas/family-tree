import React from 'react';
import { Person, TreeSection } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';

interface GeneralTabProps {
  person: Person;
  sections: TreeSection[];
  onFieldChange: (field: keyof Person, value: any) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ person, sections, onFieldChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-group">
        <label className="form-label">{t('personInspector.firstName')}</label>
        <input
          type="text"
          className="form-input"
          value={person.firstName}
          onChange={(e) => onFieldChange('firstName', e.target.value)}
          placeholder={t('personInspector.firstNamePlaceholder')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('personInspector.lastName')}</label>
        <input
          type="text"
          className="form-input"
          value={person.lastName || ''}
          onChange={(e) => onFieldChange('lastName', e.target.value)}
          placeholder={t('personInspector.lastNamePlaceholder')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('personInspector.maidenName')}</label>
        <input
          type="text"
          className="form-input"
          value={person.maidenName || ''}
          onChange={(e) => onFieldChange('maidenName', e.target.value)}
          placeholder={t('personInspector.maidenNamePlaceholder')}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('personInspector.gender')}</label>
          <select
            className="form-select"
            value={person.gender || 'male'}
            onChange={(e) => onFieldChange('gender', e.target.value)}
          >
            <option value="male">{t('personInspector.genderMale')}</option>
            <option value="female">{t('personInspector.genderFemale')}</option>
            <option value="other">{t('personInspector.genderOther')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('personInspector.generation')}</label>
          <input
            type="number"
            min={1}
            max={10}
            className="form-input"
            value={person.generation || 1}
            onChange={(e) => onFieldChange('generation', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('personInspector.section')}</label>
        <select
          className="form-select"
          value={person.sectionId || ''}
          onChange={(e) => onFieldChange('sectionId', e.target.value)}
        >
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.title}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
