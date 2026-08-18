import React from 'react';
import { FootnoteItem } from '../../types/familyTree';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface FootnotesTabProps {
  footnotes: FootnoteItem[];
  onAddFootnote: (column: 1 | 2) => void;
  onUpdateFootnote: (id: string, text: string) => void;
  onRemoveFootnote: (id: string) => void;
}

export const FootnotesTab: React.FC<FootnotesTabProps> = ({
  footnotes,
  onAddFootnote,
  onUpdateFootnote,
  onRemoveFootnote,
}) => {
  const { t } = useTranslation();

  const renderColumn = (column: 1 | 2, items: FootnoteItem[], label: string) => (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label">{label}</label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onAddFootnote(column)}>
          <Plus size={13} /> {t('treeMetadataModal.addFootnote')}
        </button>
      </div>

      {items.map((fn) => (
        <div key={fn.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input
            type="text"
            className="form-input"
            value={fn.text}
            onChange={(e) => onUpdateFootnote(fn.id, e.target.value)}
            placeholder={t('treeMetadataModal.footnoteTextPlaceholder')}
          />
          <button
            type="button"
            className="icon-btn"
            style={{ flexShrink: 0 }}
            onClick={() => onRemoveFootnote(fn.id)}
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {renderColumn(1, footnotes.filter((f) => f.column === 1 || !f.column), t('treeMetadataModal.leftColumn'))}
      {renderColumn(2, footnotes.filter((f) => f.column === 2), t('treeMetadataModal.rightColumn'))}
    </div>
  );
};
