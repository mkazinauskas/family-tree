import React from 'react';
import { 
  GitFork, 
  Plus, 
  Search, 
  Download, 
  BarChart3, 
  Layers, 
  FileText, 
  Undo2, 
  Redo2, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  treeTitle: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenTemplates: () => void;
  onOpenAddPerson: () => void;
  onOpenMetadata: () => void;
  onOpenAnalytics: () => void;
  onOpenExport: () => void;
  onToggleOutliner: () => void;
  isOutlinerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  treeTitle,
  searchQuery,
  onSearchChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenTemplates,
  onOpenAddPerson,
  onOpenMetadata,
  onOpenAnalytics,
  onOpenExport,
  onToggleOutliner,
  isOutlinerOpen,
}) => {
  return (
    <header className="top-header">
      {/* Brand & Tree Title */}
      <div className="brand-section">
        <div className="brand-logo" title="Family Tree Studio">
          <GitFork size={18} />
        </div>
        <div className="brand-text">
          <span className="brand-title">Family Tree Studio</span>
          <span className="brand-badge">Genealogijos Redaktorius</span>
        </div>

        {/* Tree Title Badge Button */}
        <div 
          className="tree-title-pill" 
          onClick={onOpenMetadata}
          title="Redaguoti medžio pavadinimą ir parametrus"
        >
          <FileText size={14} className="text-muted" />
          <span className="truncate" style={{ maxWidth: '280px' }}>
            {treeTitle || 'Genealoginis Medis'}
          </span>
          <Sliders size={12} className="text-muted" />
        </div>
      </div>

      {/* Center Tools: Search & Undo/Redo */}
      <div className="header-center-tools">
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search 
            size={14} 
            style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '30px', height: '32px', fontSize: '12px' }}
            placeholder="Ieškoti giminaičio..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn-ghost"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px 6px',
                fontSize: '11px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Undo / Redo */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="icon-btn"
            disabled={!canUndo}
            onClick={onUndo}
            title="Atšaukti (Ctrl+Z)"
            style={{ opacity: canUndo ? 1 : 0.4 }}
          >
            <Undo2 size={15} />
          </button>
          <button
            className="icon-btn"
            disabled={!canRedo}
            onClick={onRedo}
            title="Grąžinti (Ctrl+Y)"
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            <Redo2 size={15} />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        {/* Templates Picker */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenTemplates}>
          <Sparkles size={14} className="text-amber-400" />
          <span>Šablonai</span>
        </button>

        {/* Add Person Button */}
        <button className="btn btn-primary btn-sm" onClick={onOpenAddPerson}>
          <Plus size={15} />
          <span>Pridėti Asmenį</span>
        </button>

        {/* Tree Outliner Toggle */}
        <button
          className={`icon-btn ${isOutlinerOpen ? 'active' : ''}`}
          onClick={onToggleOutliner}
          title="Giminės sąrašas ir struktūra"
        >
          <Layers size={16} />
        </button>

        {/* Analytics Button */}
        <button
          className="icon-btn"
          onClick={onOpenAnalytics}
          title="Statistika ir analizė"
        >
          <BarChart3 size={16} />
        </button>

        {/* Export Button */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenExport}>
          <Download size={14} />
          <span>Eksportuoti</span>
        </button>
      </div>
    </header>
  );
};
