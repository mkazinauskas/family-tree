import React, { useState } from 'react';
import { Person, Marriage, TreeSection } from '../../types/familyTree';
import { User, X, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { GeneralTab } from './GeneralTab';
import { NotesTab } from './NotesTab';
import { MarriagesTab } from './MarriagesTab';
import { StyleTab } from './StyleTab';

interface PersonInspectorProps {
  person: Person;
  allPeople: Person[];
  sections: TreeSection[];
  marriages: Marriage[];
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (personId: string) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
  onClose: () => void;
}

export const PersonInspector: React.FC<PersonInspectorProps> = ({
  person,
  allPeople,
  sections,
  marriages,
  onUpdatePerson,
  onDeletePerson,
  onAddChild,
  onAddSpouse,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'notes' | 'marriages' | 'style'>('general');

  const personMarriages = marriages.filter(
    (m) => m.husbandId === person.id || m.wifeId === person.id
  );

  const handleFieldChange = (field: keyof Person, value: any) => {
    onUpdatePerson({
      ...person,
      [field]: value,
    });
  };

  const handleAddNoteLine = () => {
    const notes = person.notes ? [...person.notes, ''] : [''];
    handleFieldChange('notes', notes);
  };

  const handleUpdateNoteLine = (idx: number, text: string) => {
    if (!person.notes) return;
    const notes = [...person.notes];
    notes[idx] = text;
    handleFieldChange('notes', notes);
  };

  const handleRemoveNoteLine = (idx: number) => {
    if (!person.notes) return;
    const notes = person.notes.filter((_, i) => i !== idx);
    handleFieldChange('notes', notes);
  };

  return (
    <aside className="inspector-sidebar">
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <User size={18} className="text-sky-400" />
          <span className="truncate" style={{ maxWidth: '240px' }}>
            {person.firstName} {person.lastName || ''}
          </span>
        </div>
        <button className="icon-btn" onClick={onClose} title={t('personInspector.closeEditor')}>
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)' }}>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'general' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'general' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('general')}
        >
          {t('personInspector.tabGeneral')}
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'notes' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'notes' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('notes')}
        >
          {t('personInspector.tabNotes')}
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'marriages' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'marriages' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('marriages')}
        >
          {t('personInspector.tabMarriages')}
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'style' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'style' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('style')}
        >
          {t('personInspector.tabStyle')}
        </button>
      </div>

      {/* Body */}
      <div className="inspector-body">
        {activeTab === 'general' && (
          <GeneralTab person={person} sections={sections} onFieldChange={handleFieldChange} />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            person={person}
            onFieldChange={handleFieldChange}
            onAddNoteLine={handleAddNoteLine}
            onUpdateNoteLine={handleUpdateNoteLine}
            onRemoveNoteLine={handleRemoveNoteLine}
          />
        )}

        {activeTab === 'marriages' && (
          <MarriagesTab
            person={person}
            allPeople={allPeople}
            personMarriages={personMarriages}
            onFieldChange={handleFieldChange}
            onAddChild={onAddChild}
            onAddSpouse={onAddSpouse}
          />
        )}

        {activeTab === 'style' && <StyleTab person={person} onFieldChange={handleFieldChange} />}

        {/* Delete Person Action */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-danger btn-sm"
            style={{ width: '100%' }}
            onClick={() => {
              if (window.confirm(t('personInspector.deleteConfirm', { name: `${person.firstName} ${person.lastName || ''}` }))) {
                onDeletePerson(person.id);
              }
            }}
          >
            <Trash2 size={14} />
            <span>{t('personInspector.deletePerson')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
