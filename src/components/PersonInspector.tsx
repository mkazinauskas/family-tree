import React, { useState } from 'react';
import { Person, Marriage, ThemePreset, TreeSection } from '../types/familyTree';
import { THEME_PRESETS } from '../engine/themePresets';
import { 
  User, 
  Heart, 
  Calendar, 
  MapPin, 
  FileText, 
  Palette, 
  Plus, 
  Trash2, 
  X, 
  Move,
  Users
} from 'lucide-react';

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

  const presetList: { key: ThemePreset; label: string; preview: string; border: string }[] = [
    { key: 'ancestor-blue', label: 'Protėviai (Mėlyna)', preview: '#D9E7F5', border: '#245C8C' },
    { key: 'branch1-primary', label: 'I Santuoka (Tamsi Žalia)', preview: '#DDEDE7', border: '#2E6B5E' },
    { key: 'branch1-descendant', label: 'I Palikuonys (Šviesi Žalia)', preview: '#EFF7F4', border: '#7FB3A5' },
    { key: 'branch2-primary', label: 'II Santuoka (Gintarinė)', preview: '#FBEEDA', border: '#B5761F' },
    { key: 'branch2-descendant', label: 'II Palikuonys (Šviesi Gintarinė)', preview: '#FDF7EC', border: '#D8B378' },
    { key: 'other-slate', label: 'Kitos šakos (Pilka)', preview: '#F4F5F7', border: '#A9B0BA' },
    { key: 'emerald', label: 'Smaragdas', preview: '#DCFCE7', border: '#16A34A' },
    { key: 'purple', label: 'Karališka Violetinė', preview: '#F3E8FF', border: '#9333EA' },
    { key: 'rose', label: 'Raudona / Rožinė', preview: '#FFE4E6', border: '#E11D48' },
  ];

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
        <button className="icon-btn" onClick={onClose} title="Uždaryti redaktorių">
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
          Bendra
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'notes' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'notes' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('notes')}
        >
          Pastabos
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'marriages' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'marriages' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('marriages')}
        >
          Santuokos
        </button>
        <button
          className={`btn-ghost btn-sm ${activeTab === 'style' ? 'active' : ''}`}
          style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'style' ? '2px solid #38bdf8' : 'none', padding: '9px 0', fontSize: '12px', fontWeight: 600 }}
          onClick={() => setActiveTab('style')}
        >
          Stilius
        </button>
      </div>

      {/* Body */}
      <div className="inspector-body">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <>
            <div className="form-group">
              <label className="form-label">Vardas</label>
              <input
                type="text"
                className="form-input"
                value={person.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                placeholder="pvz., TAMOŠIUS (TOMAS)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pavardė</label>
              <input
                type="text"
                className="form-input"
                value={person.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                placeholder="pvz., GAIDYS"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mergautinė pavardė / Papildomas vardas</label>
              <input
                type="text"
                className="form-input"
                value={person.maidenName || ''}
                onChange={(e) => handleFieldChange('maidenName', e.target.value)}
                placeholder="pvz., (VASILYTĖ)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lytis</label>
                <select
                  className="form-select"
                  value={person.gender || 'male'}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                >
                  <option value="male">Vyras</option>
                  <option value="female">Moteris</option>
                  <option value="other">Kita</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Karta</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="form-input"
                  value={person.generation || 1}
                  onChange={(e) => handleFieldChange('generation', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sekcija / Šaka</label>
              <select
                className="form-select"
                value={person.sectionId || ''}
                onChange={(e) => handleFieldChange('sectionId', e.target.value)}
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Tab 2: Vitals & Notes */}
        {activeTab === 'notes' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gimimo data</label>
                <input
                  type="text"
                  className="form-input"
                  value={person.birthDate || ''}
                  onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                  placeholder="1844 arba 1875.08.29"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mirties data</label>
                <input
                  type="text"
                  className="form-input"
                  value={person.deathDate || ''}
                  onChange={(e) => handleFieldChange('deathDate', e.target.value)}
                  placeholder="1910.10.27 arba xxxx"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amžius / Pastaba prie mirties datos</label>
              <input
                type="text"
                className="form-input"
                value={person.ageAtDeath || ''}
                onChange={(e) => handleFieldChange('ageAtDeath', e.target.value)}
                placeholder="pvz., 70 m. arba 35 m."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vietovė / Parapija / Kaimas</label>
              <input
                type="text"
                className="form-input"
                value={person.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="pvz., Vareikų k., Subačiaus par."
              />
            </div>

            {/* Notes List */}
            <div className="form-group">
              <div className="form-label">
                <span>Istorinės pastabos / Liudininkai / Krikšto tėvai</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleAddNoteLine}
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                >
                  <Plus size={12} /> Pridėti eilutę
                </button>
              </div>

              {person.notes && person.notes.length > 0 ? (
                person.notes.map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={note}
                      onChange={(e) => handleUpdateNoteLine(idx, e.target.value)}
                      placeholder="pvz., Krikšto tėvai: Kazimieras Gaidys..."
                    />
                    <button
                      className="icon-btn"
                      style={{ width: '32px', height: '32px', flexShrink: 0 }}
                      onClick={() => handleRemoveNoteLine(idx)}
                      title="Pašalinti eilutę"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
                  Nėra papildomų pastabų.
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 3: Marriages & Relationships */}
        {activeTab === 'marriages' && (
          <>
            <div className="form-group">
              <label className="form-label">Sutuoktinio kaspinas / Antraštė kortelėje</label>
              <input
                type="text"
                className="form-input"
                value={person.spouseBanner || ''}
                onChange={(e) => handleFieldChange('spouseBanner', e.target.value)}
                placeholder="pvz., I SANTUOKA · 1874.11.22"
              />
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Registruotos Santuokos ({personMarriages.length})</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onAddSpouse(person)}
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                >
                  <Plus size={12} /> Pridėti sutuoktinį
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
                        {m.marriageNumber || 'Santuoka'} {m.marriageDate ? `(${m.marriageDate})` : ''}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {m.childrenIds.length} vaikų
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-primary)' }}>
                      Sutuoktinis: <strong>{spouse ? `${spouse.firstName} ${spouse.lastName || ''}` : 'Nenurodytas'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onAddChild(person)}
              >
                <Plus size={14} />
                <span>Pridėti Vaiką</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onAddSpouse(person)}
              >
                <Heart size={14} className="text-rose-400" />
                <span>Pridėti Sutuoktinį</span>
              </button>
            </div>
          </>
        )}

        {/* Tab 4: Style & Position */}
        {activeTab === 'style' && (
          <>
            <div className="form-group">
              <label className="form-label">Spalvinė tema / Šaka</label>
              <div className="color-swatches-grid">
                {presetList.map((preset) => (
                  <div
                    key={preset.key}
                    className={`color-swatch-item ${person.themePreset === preset.key ? 'selected' : ''}`}
                    onClick={() => handleFieldChange('themePreset', preset.key)}
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
                <label className="form-label">Pozicija X</label>
                <input
                  type="number"
                  className="form-input"
                  value={person.x ?? 0}
                  onChange={(e) => handleFieldChange('x', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pozicija Y</label>
                <input
                  type="number"
                  className="form-input"
                  value={person.y ?? 0}
                  onChange={(e) => handleFieldChange('y', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Plotis (W)</label>
                <input
                  type="number"
                  className="form-input"
                  value={person.width || 140}
                  onChange={(e) => handleFieldChange('width', parseInt(e.target.value) || 140)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aukštis (H)</label>
                <input
                  type="number"
                  className="form-input"
                  value={person.height || 80}
                  onChange={(e) => handleFieldChange('height', parseInt(e.target.value) || 80)}
                />
              </div>
            </div>
          </>
        )}

        {/* Delete Person Action */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-danger btn-sm"
            style={{ width: '100%' }}
            onClick={() => {
              if (window.confirm(`Ar tikrai norite pašalinti ${person.firstName} ${person.lastName || ''} iš giminės medžio?`)) {
                onDeletePerson(person.id);
              }
            }}
          >
            <Trash2 size={14} />
            <span>Ištrinti šį asmenį</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
