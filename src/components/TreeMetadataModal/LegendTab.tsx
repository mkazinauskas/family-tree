import React from 'react';
import { LegendItem } from '../../types/familyTree';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface LegendTabProps {
  legend: LegendItem[];
  onAddLegend: () => void;
  onUpdateLegend: (id: string, field: keyof LegendItem, val: string) => void;
  onRemoveLegend: (id: string) => void;
}

export const LegendTab: React.FC<LegendTabProps> = ({ legend, onAddLegend, onUpdateLegend, onRemoveLegend }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label">{t('treeMetadataModal.legendEntriesLabel')}</label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAddLegend}>
          <Plus size={14} /> {t('treeMetadataModal.addLegendEntry')}
        </button>
      </div>

      {legend.map((leg) => (
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
            onChange={(e) => onUpdateLegend(leg.id, 'label', e.target.value)}
            placeholder={t('treeMetadataModal.legendNamePlaceholder')}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="color"
              value={leg.fill}
              onChange={(e) => onUpdateLegend(leg.id, 'fill', e.target.value)}
              style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('treeMetadataModal.fillLabel')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="color"
              value={leg.stroke}
              onChange={(e) => onUpdateLegend(leg.id, 'stroke', e.target.value)}
              style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('treeMetadataModal.strokeLabel')}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onRemoveLegend(leg.id)}
            title={t('treeMetadataModal.removeEntry')}
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
};
