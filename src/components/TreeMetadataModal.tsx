import React, { useState } from 'react';
import { TreeMetadata, TreeSection, GenerationBand, LegendItem, FootnoteItem } from '../types/familyTree';
import { X, Sliders, Plus, Trash2, Layers, BookOpen, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    currentSections[0]?.id || null
  );

  const handleAddSection = () => {
    const lastSection = currentSections[currentSections.length - 1];
    const newY = lastSection ? lastSection.y + (lastSection.height || 200) : 82;
    const newSection: TreeSection = {
      id: 'sec-' + Date.now(),
      title: 'NAUJA SEKCIJA',
      y: newY,
      height: 200,
      generationBands: [],
    };
    setCurrentSections([...currentSections, newSection]);
    setExpandedSectionId(newSection.id);
  };

  const handleRemoveSection = (id: string) => {
    setCurrentSections(currentSections.filter((s) => s.id !== id));
  };

  const handleUpdateSectionField = (
    id: string,
    field: keyof TreeSection,
    value: string | number
  ) => {
    setCurrentSections(
      currentSections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddGenerationBand = (sectionId: string) => {
    const section = currentSections.find((s) => s.id === sectionId);
    if (!section) return;
    const nextGen = (section.generationBands[section.generationBands.length - 1]?.generation || 0) + 1;

    // Auto-space the new band under the existing ones so it's visible immediately
    const bandCount = section.generationBands.length;
    const availableHeight = Math.max((section.height || 200) - 20, 80);
    const bandHeight = Math.max(Math.floor(availableHeight / (bandCount + 1)), 70);
    const bandTop = section.y + 14 + bandCount * bandHeight;

    const newBand: GenerationBand = {
      generation: nextGen,
      label: `${nextGen} karta`,
      labelX: 26,
      labelY: bandTop + bandHeight / 2,
      bgY: bandTop,
      bgHeight: bandHeight,
      hasBgRect: bandCount % 2 === 0,
    };
    setCurrentSections(
      currentSections.map((s) =>
        s.id === sectionId
          ? { ...s, generationBands: [...s.generationBands, newBand] }
          : s
      )
    );
  };

  const handleUpdateGenerationBand = (
    sectionId: string,
    bandIdx: number,
    field: keyof GenerationBand,
    value: string | number | boolean
  ) => {
    setCurrentSections(
      currentSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              generationBands: s.generationBands.map((b, i) =>
                i === bandIdx ? { ...b, [field]: value } : b
              ),
            }
          : s
      )
    );
  };

  const handleRemoveGenerationBand = (sectionId: string, bandIdx: number) => {
    setCurrentSections(
      currentSections.map((s) =>
        s.id === sectionId
          ? { ...s, generationBands: s.generationBands.filter((_, i) => i !== bandIdx) }
          : s
      )
    );
  };

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Giminės Medžio Sekcijos ({currentSections.length})</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSection}>
                    <Plus size={14} /> Pridėti sekciją
                  </button>
                </div>

                {currentSections.map((sec, idx) => {
                  const isExpanded = expandedSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Section header row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          background: 'var(--bg-surface-subtle)',
                        }}
                        onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {idx + 1}.
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sec.title || 'Bevardė sekcija'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {sec.generationBands.length} karta(os)
                        </span>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Pašalinti sekciją"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSection(sec.id);
                          }}
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Sekcijos Pavadinimas</label>
                            <input
                              type="text"
                              className="form-input"
                              value={sec.title}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'title', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Paantraštė</label>
                            <input
                              type="text"
                              className="form-input"
                              value={sec.subhead || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'subhead', e.target.value)}
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Y pozicija</label>
                              <input
                                type="number"
                                className="form-input"
                                value={sec.y}
                                onChange={(e) => handleUpdateSectionField(sec.id, 'y', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Aukštis</label>
                              <input
                                type="number"
                                className="form-input"
                                value={sec.height || 0}
                                onChange={(e) => handleUpdateSectionField(sec.id, 'height', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          {/* Generation Bands */}
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <label className="form-label" style={{ margin: 0 }}>Kartos ({sec.generationBands.length})</label>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleAddGenerationBand(sec.id)}
                              >
                                <Plus size={13} /> Pridėti kartą
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {sec.generationBands.map((band, bIdx) => (
                                <div
                                  key={bIdx}
                                  style={{
                                    background: 'var(--bg-surface-subtle)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '60px 1fr 36px',
                                      gap: '8px',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <input
                                      type="number"
                                      className="form-input"
                                      title="Kartos numeris"
                                      value={band.generation}
                                      onChange={(e) =>
                                        handleUpdateGenerationBand(
                                          sec.id,
                                          bIdx,
                                          'generation',
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      placeholder="I karta"
                                      value={band.label}
                                      onChange={(e) =>
                                        handleUpdateGenerationBand(sec.id, bIdx, 'label', e.target.value)
                                      }
                                    />
                                    <button
                                      type="button"
                                      className="icon-btn"
                                      title="Pašalinti kartą"
                                      onClick={() => handleRemoveGenerationBand(sec.id, bIdx)}
                                    >
                                      <Trash2 size={13} className="text-red-400" />
                                    </button>
                                  </div>

                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 1fr 1fr auto',
                                      gap: '8px',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <div>
                                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Etiketės Y</label>
                                      <input
                                        type="number"
                                        className="form-input"
                                        value={band.labelY ?? ''}
                                        onChange={(e) =>
                                          handleUpdateGenerationBand(
                                            sec.id,
                                            bIdx,
                                            'labelY',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fono Y</label>
                                      <input
                                        type="number"
                                        className="form-input"
                                        value={band.bgY ?? ''}
                                        onChange={(e) =>
                                          handleUpdateGenerationBand(
                                            sec.id,
                                            bIdx,
                                            'bgY',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fono aukštis</label>
                                      <input
                                        type="number"
                                        className="form-input"
                                        value={band.bgHeight ?? ''}
                                        onChange={(e) =>
                                          handleUpdateGenerationBand(
                                            sec.id,
                                            bIdx,
                                            'bgHeight',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                    <label
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '10px',
                                        color: 'var(--text-muted)',
                                        whiteSpace: 'nowrap',
                                        paddingTop: '13px',
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={band.hasBgRect ?? false}
                                        onChange={(e) =>
                                          handleUpdateGenerationBand(sec.id, bIdx, 'hasBgRect', e.target.checked)
                                        }
                                      />
                                      Fonas
                                    </label>
                                  </div>
                                </div>
                              ))}
                              {sec.generationBands.length === 0 && (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 0' }}>
                                  Nėra kartų. Paspauskite „Pridėti kartą“.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {currentSections.length === 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
                    Nėra sekcijų. Paspauskite „Pridėti sekciją“, kad sukurtumėte pirmąją.
                  </div>
                )}
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
