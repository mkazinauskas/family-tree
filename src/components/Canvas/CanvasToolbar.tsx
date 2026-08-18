import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface CanvasToolbarProps {
  scale: number;
  onZoom: (delta: number) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ scale, onZoom, onFitToScreen, onResetZoom }) => {
  const { t } = useTranslation();

  return (
    <div className="canvas-floating-toolbar">
      <button className="btn btn-ghost btn-sm" onClick={() => onZoom(-0.1)} title={t('canvas.zoomOut')}>
        <ZoomOut size={16} />
      </button>

      <span className="zoom-level-text">{Math.round(scale * 100)}%</span>

      <button className="btn btn-ghost btn-sm" onClick={() => onZoom(0.1)} title={t('canvas.zoomIn')}>
        <ZoomIn size={16} />
      </button>

      <div className="toolbar-divider" />

      <button className="btn btn-ghost btn-sm" onClick={onFitToScreen} title={t('canvas.fitToScreen')}>
        <Maximize2 size={16} />
        <span>{t('canvas.fit')}</span>
      </button>

      <button className="btn btn-ghost btn-sm" onClick={onResetZoom} title={t('canvas.resetZoom')}>
        <RotateCcw size={15} />
        <span>100%</span>
      </button>
    </div>
  );
};
