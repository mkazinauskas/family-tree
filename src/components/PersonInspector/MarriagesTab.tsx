import React from 'react';
import { Marriage, Person } from '../../types/familyTree';
import { Plus, Heart } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface MarriagesTabProps {
  person: Person;
  allPeople: Person[];
  personMarriages: Marriage[];
  onFieldChange: (field: keyof Person, value: any) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
}

export const MarriagesTab: React.FC<MarriagesTabProps> = ({
  person,
  allPeople,
  personMarriages,
  onFieldChange,
  onAddChild,
  onAddSpouse,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-group">
        <label className="form-label">{t('personInspector.spouseBanner')}</label>
        <input
          type="text"
          className="form-input"
          value={person.spouseBanner || ''}
          onChange={(e) => onFieldChange('spouseBanner', e.target.value)}
          placeholder={t('personInspector.spouseBannerPlaceholder')}
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <span>{t('personInspector.registeredMarriages', { count: personMarriages.length })}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onAddSpouse(person)}
            style={{ padding: '2px 6px', fontSize: '11px' }}
          >
            <Plus size={12} /> {t('personInspector.addSpouse')}
          </button>
        </div>

        {personMarriages.map((m) => {
          const isHusband = m.husbandId === person.id;
          const spouseId = isHusband ? m.wifeId : m.husbandId;
          const spouse = allPeople.find((p) => p.id === spouseId);

          return (
            <div
              key={m.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#38bdf8' }}>
                  {m.marriageNumber || t('personInspector.marriageWord')} {m.marriageDate ? `(${m.marriageDate})` : ''}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('personInspector.childrenCount', { count: m.childrenIds.length })}
                </span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-primary)' }}>
                {t('personInspector.spouseLabel')} <strong>{spouse ? `${spouse.firstName} ${spouse.lastName || ''}` : t('personInspector.notSpecified')}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onAddChild(person)}>
          <Plus size={14} />
          <span>{t('personInspector.addChild')}</span>
        </button>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onAddSpouse(person)}>
          <Heart size={14} className="text-rose-400" />
          <span>{t('personInspector.addSpouseBtn')}</span>
        </button>
      </div>
    </>
  );
};
