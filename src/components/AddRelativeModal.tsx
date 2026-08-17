import React, { useState } from 'react';
import { Person, TreeSection, ThemePreset } from '../types/familyTree';
import { THEME_PRESETS } from '../engine/themePresets';
import { X, UserPlus, Heart, Users, ArrowUp, Sparkles } from 'lucide-react';

interface AddRelativeModalProps {
  relativeTo: Person | null;
  allPeople: Person[];
  sections: TreeSection[];
  onAdd: (params: {
    relationType: 'child' | 'spouse' | 'sibling' | 'parent' | 'root';
    personData: Partial<Person>;
    marriageData?: {
      marriageNumber?: string;
      marriageDate?: string;
      spouseBanner?: string;
    };
  }) => void;
  onClose: () => void;
}

export const AddRelativeModal: React.FC<AddRelativeModalProps> = ({
  relativeTo,
  allPeople,
  sections,
  onAdd,
  onClose,
}) => {
  const [relationType, setRelationType] = useState<'child' | 'spouse' | 'sibling' | 'parent' | 'root'>(
    relativeTo ? 'child' : 'root'
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(relativeTo?.lastName || '');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [location, setLocation] = useState(relativeTo?.location || '');
  const [notes, setNotes] = useState('');
  const [themePreset, setThemePreset] = useState<ThemePreset>(
    relativeTo?.themePreset || 'branch1-descendant'
  );
  const [marriageNumber, setMarriageNumber] = useState('I');
  const [marriageDate, setMarriageDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const noteLines = notes
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let spouseBanner = undefined;
    if (relationType === 'spouse') {
      spouseBanner = marriageDate
        ? `SANTUOKA · ${marriageDate}`
        : `${marriageNumber} SANTUOKA`;
    }

    onAdd({
      relationType,
      personData: {
        firstName: firstName.trim().toUpperCase(),
        lastName: lastName.trim() ? lastName.trim().toUpperCase() : undefined,
        maidenName: maidenName.trim() ? maidenName.trim().toUpperCase() : undefined,
        gender,
        birthDate: birthDate.trim() || undefined,
        deathDate: deathDate.trim() || undefined,
        location: location.trim() || undefined,
        notes: noteLines.length > 0 ? noteLines : undefined,
        themePreset,
        spouseBanner,
        sectionId: relativeTo?.sectionId || sections[0]?.id,
        generation: relativeTo
          ? relationType === 'child'
            ? (relativeTo.generation || 1) + 1
            : relationType === 'parent'
            ? Math.max(1, (relativeTo.generation || 1) - 1)
            : relativeTo.generation
          : 1,
      },
      marriageData:
        relationType === 'spouse'
          ? {
              marriageNumber,
              marriageDate: marriageDate.trim() || undefined,
              spouseBanner,
            }
          : undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <UserPlus size={20} className="text-sky-400" />
            <span>Pridėti Naują Giminės Narį</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Relation Type Picker */}
            {relativeTo && (
              <div className="form-group">
                <label className="form-label">
                  Ryšys su <strong>{relativeTo.firstName} {relativeTo.lastName || ''}</strong>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${relationType === 'child' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => {
                      setRelationType('child');
                      setThemePreset('branch1-descendant');
                    }}
                  >
                    <Sparkles size={14} /> Vaikas
                  </button>
                  <button
                    type="button"
                    className={`btn ${relationType === 'spouse' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => {
                      setRelationType('spouse');
                      setGender(relativeTo.gender === 'male' ? 'female' : 'male');
                      setThemePreset('branch1-primary');
                    }}
                  >
                    <Heart size={14} /> Sutuoktinis
                  </button>
                  <button
                    type="button"
                    className={`btn ${relationType === 'sibling' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setRelationType('sibling')}
                  >
                    <Users size={14} /> Brolis/Sesuo
                  </button>
                  <button
                    type="button"
                    className={`btn ${relationType === 'parent' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => {
                      setRelationType('parent');
                      setThemePreset('ancestor-blue');
                    }}
                  >
                    <ArrowUp size={14} /> Tėvas/Motina
                  </button>
                </div>
              </div>
            )}

            {/* If Spouse, show Marriage info */}
            {relationType === 'spouse' && (
              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Santuokos numeris</label>
                    <select
                      className="form-select"
                      value={marriageNumber}
                      onChange={(e) => setMarriageNumber(e.target.value)}
                    >
                      <option value="I">I Santuoka</option>
                      <option value="II">II Santuoka</option>
                      <option value="III">III Santuoka</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Santuokos data</label>
                    <input
                      type="text"
                      className="form-input"
                      value={marriageDate}
                      onChange={(e) => setMarriageDate(e.target.value)}
                      placeholder="pvz., 1916.02.29"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Names */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vardas *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="pvz., JONAS"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pavardė</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="pvz., GAIDYS"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mergautinė pavardė / Alias</label>
                <input
                  type="text"
                  className="form-input"
                  value={maidenName}
                  onChange={(e) => setMaidenName(e.target.value)}
                  placeholder="pvz., (ŠILAITĖ)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lytis</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="male">Vyras</option>
                  <option value="female">Moteris</option>
                  <option value="other">Kita</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gimimo data</label>
                <input
                  type="text"
                  className="form-input"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="pvz., 1877.03.02"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mirties data</label>
                <input
                  type="text"
                  className="form-input"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  placeholder="pvz., 1945 arba xxxx"
                />
              </div>
            </div>

            {/* Location & Notes */}
            <div className="form-group">
              <label className="form-label">Vietovė / Parapija</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="pvz., Vareikų k., Subačiaus par."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pastabos (kiekviena eilutė atskirai)</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Krikšto tėvai: Kazimieras Gaidys..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Atšaukti
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Sukurti ir Įterpti</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
