import React from 'react';
import { Person, TreeSection } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';

interface MinimapProps {
  sections: TreeSection[];
  people: Person[];
  selectedPersonId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  sections,
  people,
  selectedPersonId,
  canvasWidth,
  canvasHeight,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="minimap-container" onClick={onClick} title={t('canvas.minimapTitle')}>
      <svg width="100%" height="100%" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
        <rect width="100%" height="100%" fill="#ffffff" />
        {sections.map((sec) => (
          <line
            key={sec.id}
            x1={22}
            y1={sec.y}
            x2={canvasWidth - 22}
            y2={sec.y}
            stroke="#cbd5e1"
            strokeWidth={4}
          />
        ))}
        {people.map((p) => (
          <rect
            key={p.id}
            x={p.x ?? 0}
            y={p.y ?? 0}
            width={p.width ?? 140}
            height={p.height ?? 80}
            rx={6}
            fill={selectedPersonId === p.id ? '#0284c7' : '#94a3b8'}
          />
        ))}
      </svg>
    </div>
  );
};
