import React, { useRef } from 'react';
import {
  GitFork,
  Plus,
  Search,
  Download,
  Upload,
  BarChart3,
  Layers,
  FileText,
  Undo2,
  Redo2,
  Sparkles,
  Sliders,
  Globe,
  History
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { LANGUAGES, Language } from '../i18n/translations';

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
  onOpenHistory: () => void;
  onImportJson: (data: any) => void;
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
  onOpenHistory,
  onImportJson,
  onToggleOutliner,
  isOutlinerOpen,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang, setLang } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        onImportJson(parsed);
      } catch (err) {
        alert(t('header.jsonImportError'));
        console.error('JSON import error:', err);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  };
  return (
    <header className="top-header">
      {/* Brand & Tree Title */}
      <div className="brand-section">
        <div className="brand-logo" title="Family Tree Studio">
          <GitFork size={18} />
        </div>
        <div className="brand-text">
          <span className="brand-title">{t('header.brandTitle')}</span>
          <span className="brand-badge">{t('header.brandBadge')}</span>
        </div>

        {/* Tree Title Badge Button */}
        <div
          className="tree-title-pill"
          onClick={onOpenMetadata}
          title={t('header.editTreeTitle')}
        >
          <FileText size={14} className="text-muted" />
          <span className="truncate" style={{ maxWidth: '280px' }}>
            {treeTitle || t('header.treeTitleFallback')}
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
            placeholder={t('header.searchPlaceholder')}
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
            title={t('header.undoTooltip')}
            style={{ opacity: canUndo ? 1 : 0.4 }}
          >
            <Undo2 size={15} />
          </button>
          <button
            className="icon-btn"
            disabled={!canRedo}
            onClick={onRedo}
            title={t('header.redoTooltip')}
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            <Redo2 size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={onOpenHistory}
            title={t('header.historyTooltip')}
          >
            <History size={15} />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        {/* Language Switcher */}
        <div
          className="icon-btn"
          title={t('header.languageTooltip')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'default',
            width: 'auto',
            height: '34px',
            padding: '0 8px',
          }}
        >
          <Globe size={14} className="text-muted" />
          <select
            className="form-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            title={t('header.languageTooltip')}
            style={{
              width: 'auto',
              padding: '4px 20px 4px 6px',
              fontSize: '11px',
              fontWeight: 700,
              height: '26px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Picker */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenTemplates}>
          <Sparkles size={14} className="text-amber-400" />
          <span>{t('header.templates')}</span>
        </button>

        {/* Add Person Button */}
        <button className="btn btn-primary btn-sm" onClick={onOpenAddPerson}>
          <Plus size={15} />
          <span>{t('header.addPerson')}</span>
        </button>

        {/* Tree Outliner Toggle */}
        <button
          className={`icon-btn ${isOutlinerOpen ? 'active' : ''}`}
          onClick={onToggleOutliner}
          title={t('header.outlinerTooltip')}
        >
          <Layers size={16} />
        </button>

        {/* Analytics Button */}
        <button
          className="icon-btn"
          onClick={onOpenAnalytics}
          title={t('header.analyticsTooltip')}
        >
          <BarChart3 size={16} />
        </button>

        {/* Import Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
          title={t('header.importTooltip')}
        >
          <Upload size={14} />
          <span>{t('header.import')}</span>
        </button>

        {/* Export Button */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenExport}>
          <Download size={14} />
          <span>{t('header.export')}</span>
        </button>
      </div>
    </header>
  );
};
