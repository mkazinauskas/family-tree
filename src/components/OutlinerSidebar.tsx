import React, { useState } from 'react';
import { FamilyTreeData, Person } from '../types/familyTree';
import { getPersonTheme } from '../engine/themePresets';
import { Layers, Search, User, X, Plus } from 'lucide-react';

interface OutlinerSidebarProps {
  tree: FamilyTreeData;
  selectedPersonId: string | null;
  onSelectPerson: (person: Person) => void;
  onAddPerson: () => void;
  onClose: () => void;
}

export const OutlinerSidebar: React.FC<OutlinerSidebarProps> = ({
  tree,
  selectedPersonId,
  onSelectPerson,
  onAddPerson,
  onClose,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const { sections, people } = tree;

  const filteredPeople = people.filter((p) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      (p.lastName || '').toLowerCase().includes(q) ||
      (p.birthDate || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <aside
      style={{
        width: '320px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 35,
      }}
    >
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <Layers size={18} className="text-sky-400" />
          <span>Giminės Sąrašas ({people.length})</span>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Search in Outliner */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '30px', height: '32px', fontSize: '12px' }}
            placeholder="Filtruoti asmenis..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {sections.map((sec) => {
          const secPeople = filteredPeople.filter((p) => p.sectionId === sec.id);
          if (secPeople.length === 0 && filterQuery) return null;

          return (
            <div key={sec.id} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  padding: '4px 8px',
                  marginBottom: '4px',
                }}
              >
                {sec.title}
              </div>

              {secPeople.map((person) => {
                const theme = getPersonTheme(person.themePreset, person.customTheme);
                const isSelected = selectedPersonId === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                      border: isSelected ? '1px solid rgba(2, 132, 199, 0.5)' : '1px solid transparent',
                      cursor: 'pointer',
                      marginBottom: '2px',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: theme.stroke,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? '#38bdf8' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {person.firstName} {person.lastName || ''}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {person.birthDate || 'xxxx'}
                        {person.deathDate ? ` – ${person.deathDate}` : ''}
                        {person.generation ? ` · ${person.generation} karta` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Add Button at bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={onAddPerson}>
          <Plus size={14} />
          <span>Pridėti Asmenį</span>
        </button>
      </div>
    </aside>
  );
};
