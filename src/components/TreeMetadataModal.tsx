import React, { useState } from 'react';
import { TreeMetadata, TreeSection, LegendItem, FootnoteItem } from '../types/familyTree';
import { X, Sliders, Plus, Trash2, Layers, BookOpen, Bookmark } from 'lucide-react';

interface TreeMetadataModalProps {
  metadata: TreeMetadata;
  sections: TreeSection[];
  legend: LegendItem[];
  footnotes: FootnoteItem[];
  onSave: (updated: {
    metadata: TreeMetadata;
    sections: TreeSection[];
    legend: LegendItem[];
    footnotes: FootnoteItem[];
  }) => void;
  onClose: () => void;
}

export const TreeMetadataModal: React.FC<TreeMetadataModalProps> = ({
  metadata,
  sections,
  legend,
  footnotes,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'meta' | 'sections' | 'legend' | 'footnotes'>('meta');

  const [currentMeta, setCurrentMeta] = useState<TreeMetadata>({ ...metadata });
  const [currentSections, setCurrentSections] = useState<TreeSection[]>([...sections]);
  const [currentLegend, setCurrentLegend] = useState<LegendItem[]>([...legend]);
  const [currentFootnotes, setCurrentFootnotes] = useState<FootnoteItem[]>([...footnotes]);

  const handleAddFootnote = (column: 1 | 2) => {
    const newFn: FootnoteItem = {
      id: 'fn-' + Date.now(),
      text: '',
      column,
      order: currentFootnotes.length + 1,
    };
    setCurrentFootnotes([...currentFootnotes, newFn]);
  };

  const handleUpdateFootnote = (id: string, text: string) => {
    setCurrentFootnotes(
      currentFootnotes.map((f) => (f.id === id ? { ...f, text } : f))
    );
  };

  const handleRemoveFootnote = (id: string) => {
    setCurrentFootnotes(currentFootnotes.filter((f) => f.id !== id));
  };

  const handleAddLegend = () => {
    const newLeg: LegendItem = {
      id: 'leg-' + Date.now(),
      label: 'Nauja šaka',
      fill: '#EFF7F4',
      stroke: '#7FB3A5',
    };
    setCurrentLegend([...currentLegend, newLeg]);
  };

  const handleUpdateLegend = (id: string, field: keyof LegendItem, val: string) => {
    setCurrentLegend(
      currentLegend.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  };

  const handleRemoveLegend = (id: string) => {
    setCurrentLegend(currentLegend.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      metadata: currentMeta,
      sections: currentSections,
      legend: currentLegend,
      footnotes: currentFootnotes.filter((f) => f.text.trim().length > 0),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={20} className="text-sky-400" />
            <span>Medžio Antraštė, Legendos ir Išnašos</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)' }}>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'meta' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'meta' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('meta')}
          >
            <Bookmark size={14} /> Antraštė ir Lapas
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'sections' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'sections' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('sections')}
          >
            <Layers size={14} /> Sekcijos & Kartos
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'legend' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'legend' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('legend')}
          >
            <BookOpen size={14} /> Spalvų Legenda
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'footnotes' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'footnotes' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('footnotes')}
          >
            <BookOpen size={14} /> Istorinės Išnašos
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* Tab 1: Meta */}
            {activeTab === 'meta' && (
              <>
                <div className="form-group">
                  <label className="form-label">Medžio Pavadinimas (H1)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentMeta.title}
                    onChange={(e) => setCurrentMeta({ ...currentMeta, title: e.target.value })}
                    placeholder="TAMOŠIAUS (TOMO) GAIDŽIO (1844–1910) ŠEIMA"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paantraštė / Giminės aprašymas</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentMeta.subtitle}
                    onChange={(e) => setCurrentMeta({ ...currentMeta, subtitle: e.target.value })}
                    placeholder="Gaidžių giminė · Vareikų k., Subačiaus parapija..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lapo numeris / Sheet Label</label>
                    <input
                      type="text"
                      className="form-input"
                      value={currentMeta.sheetNumber}
                      onChange={(e) => setCurrentMeta({ ...currentMeta, sheetNumber: e.target.value })}
                      placeholder="LAPAS 3 / 3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Šrifto šeima</label>
                    <input
                      type="text"
                      className="form-input"
                      value={currentMeta.fontFamily}
                      onChange={(e) => setCurrentMeta({ ...currentMeta, fontFamily: e.target.value })}
                      placeholder="'DejaVu Sans Condensed', sans-serif"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tab 2: Sections */}
            {activeTab === 'sections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="form-label">Giminės Medžio Sekcijos ({currentSections.length})</label>
                {currentSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Sekcijos {idx + 1} Pavadinimas</label>
                      <input
                        type="text"
                        className="form-input"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...currentSections];
                          updated[idx].title = e.target.value;
                          setCurrentSections(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Legend */}
            {activeTab === 'legend' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Spalvų Legendos Įrašai</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLegend}>
                    <Plus size={14} /> Pridėti įrašą
                  </button>
                </div>

                {currentLegend.map((leg) => (
                  <div
                    key={leg.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px 36px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      value={leg.label}
                      onChange={(e) => handleUpdateLegend(leg.id, 'label', e.target.value)}
                      placeholder="Pavadinimas"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={leg.fill}
                        onChange={(e) => handleUpdateLegend(leg.id, 'fill', e.target.value)}
                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fonas</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={leg.stroke}
                        onChange={(e) => handleUpdateLegend(leg.id, 'stroke', e.target.value)}
                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rėmelis</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => handleRemoveLegend(leg.id)}
                      title="Pašalinti"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Footnotes */}
            {activeTab === 'footnotes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Column 1 */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Kairysis stulpelis (1 Stulpelis)</label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleAddFootnote(1)}
                    >
                      <Plus size={13} /> Pridėti išnašą
                    </button>
                  </div>

                  {currentFootnotes
                    .filter((f) => f.column === 1 || !f.column)
                    .map((fn) => (
                      <div key={fn.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={fn.text}
                          onChange={(e) => handleUpdateFootnote(fn.id, e.target.value)}
                          placeholder="Išnašos tekstas..."
                        />
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ flexShrink: 0 }}
                          onClick={() => handleRemoveFootnote(fn.id)}
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Column 2 */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Dešinysis stulpelis (2 Stulpelis)</label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleAddFootnote(2)}
                    >
                      <Plus size={13} /> Pridėti išnašą
                    </button>
                  </div>

                  {currentFootnotes
                    .filter((f) => f.column === 2)
                    .map((fn) => (
                      <div key={fn.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={fn.text}
                          onChange={(e) => handleUpdateFootnote(fn.id, e.target.value)}
                          placeholder="Išnašos tekstas..."
                        />
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ flexShrink: 0 }}
                          onClick={() => handleRemoveFootnote(fn.id)}
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Atšaukti
            </button>
            <button type="submit" className="btn btn-primary">
              Išsaugoti Pakeitimus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
