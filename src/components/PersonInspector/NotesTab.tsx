import React from 'react';
import { Person } from '../../types/familyTree';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface NotesTabProps {
  person: Person;
  onFieldChange: (field: keyof Person, value: any) => void;
  onAddNoteLine: () => void;
  onUpdateNoteLine: (idx: number, text: string) => void;
  onRemoveNoteLine: (idx: number) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  person,
  onFieldChange,
  onAddNoteLine,
  onUpdateNoteLine,
  onRemoveNoteLine,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('personInspector.birthDate')}</label>
          <input
            type="text"
            className="form-input"
            value={person.birthDate || ''}
            onChange={(e) => onFieldChange('birthDate', e.target.value)}
            placeholder={t('personInspector.birthDatePlaceholder')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('personInspector.deathDate')}</label>
          <input
            type="text"
            className="form-input"
            value={person.deathDate || ''}
            onChange={(e) => onFieldChange('deathDate', e.target.value)}
            placeholder={t('personInspector.deathDatePlaceholder')}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('personInspector.ageAtDeath')}</label>
        <input
          type="text"
          className="form-input"
          value={person.ageAtDeath || ''}
          onChange={(e) => onFieldChange('ageAtDeath', e.target.value)}
          placeholder={t('personInspector.ageAtDeathPlaceholder')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('personInspector.location')}</label>
        <input
          type="text"
          className="form-input"
          value={person.location || ''}
          onChange={(e) => onFieldChange('location', e.target.value)}
          placeholder={t('personInspector.locationPlaceholder')}
        />
      </div>

      {/* Notes List */}
      <div className="form-group">
        <div className="form-label">
          <span>{t('personInspector.historicalNotes')}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onAddNoteLine}
            style={{ padding: '2px 6px', fontSize: '11px' }}
          >
            <Plus size={12} /> {t('personInspector.addLine')}
          </button>
        </div>

        {person.notes && person.notes.length > 0 ? (
          person.notes.map((note, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
              <input
                type="text"
                className="form-input"
                value={note}
                onChange={(e) => onUpdateNoteLine(idx, e.target.value)}
                placeholder={t('personInspector.notePlaceholder')}
              />
              <button
                className="icon-btn"
                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                onClick={() => onRemoveNoteLine(idx)}
                title={t('personInspector.removeLine')}
              >
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
            {t('personInspector.noNotes')}
          </div>
        )}
      </div>
    </>
  );
};
