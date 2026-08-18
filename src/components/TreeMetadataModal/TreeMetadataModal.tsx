import React, { useState } from 'react';
import { TreeMetadata, TreeSection, GenerationBand, LegendItem, FootnoteItem } from '../../types/familyTree';
import { X, Sliders, Layers, BookOpen, Bookmark } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTab } from './MetaTab';
import { SectionsTab } from './SectionsTab';
import { LegendTab } from './LegendTab';
import { FootnotesTab } from './FootnotesTab';

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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'meta' | 'sections' | 'legend' | 'footnotes'>('meta');

  const [currentMeta, setCurrentMeta] = useState<TreeMetadata>({ ...metadata });
  const [currentSections, setCurrentSections] = useState<TreeSection[]>([...sections]);
  const [currentLegend, setCurrentLegend] = useState<LegendItem[]>([...legend]);
  const [currentFootnotes, setCurrentFootnotes] = useState<FootnoteItem[]>([...footnotes]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const handleAddSection = () => {
    const lastSection = currentSections[currentSections.length - 1];
    const newY = lastSection ? lastSection.y + (lastSection.height || 200) : 82;
    const newSection: TreeSection = {
      id: 'sec-' + Date.now(),
      title: t('treeMetadataModal.newSectionDefault'),
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
      label: t('treeMetadataModal.newGenerationLabelDefault', { gen: nextGen }),
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
      label: t('treeMetadataModal.newLegendDefault'),
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
    <div className="modal-overlay">
      <div className="modal-content modal-content-lg">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={20} className="text-sky-400" />
            <span>{t('treeMetadataModal.title')}</span>
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
            <Bookmark size={14} /> {t('treeMetadataModal.tabMeta')}
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'sections' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'sections' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('sections')}
          >
            <Layers size={14} /> {t('treeMetadataModal.tabSections')}
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'legend' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'legend' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('legend')}
          >
            <BookOpen size={14} /> {t('treeMetadataModal.tabLegend')}
          </button>
          <button
            type="button"
            className={`btn-ghost btn-sm ${activeTab === 'footnotes' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'footnotes' ? '2px solid #38bdf8' : 'none', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setActiveTab('footnotes')}
          >
            <BookOpen size={14} /> {t('treeMetadataModal.tabFootnotes')}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {activeTab === 'meta' && <MetaTab meta={currentMeta} onChange={setCurrentMeta} />}

            {activeTab === 'sections' && (
              <SectionsTab
                sections={currentSections}
                expandedSectionId={expandedSectionId}
                onExpandSection={setExpandedSectionId}
                onAddSection={handleAddSection}
                onRemoveSection={handleRemoveSection}
                onUpdateSectionField={handleUpdateSectionField}
                onAddGenerationBand={handleAddGenerationBand}
                onUpdateGenerationBand={handleUpdateGenerationBand}
                onRemoveGenerationBand={handleRemoveGenerationBand}
              />
            )}

            {activeTab === 'legend' && (
              <LegendTab
                legend={currentLegend}
                onAddLegend={handleAddLegend}
                onUpdateLegend={handleUpdateLegend}
                onRemoveLegend={handleRemoveLegend}
              />
            )}

            {activeTab === 'footnotes' && (
              <FootnotesTab
                footnotes={currentFootnotes}
                onAddFootnote={handleAddFootnote}
                onUpdateFootnote={handleUpdateFootnote}
                onRemoveFootnote={handleRemoveFootnote}
              />
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('treeMetadataModal.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('treeMetadataModal.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
