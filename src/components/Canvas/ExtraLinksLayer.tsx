import React from 'react';
import { ExtraLink, Person } from '../../types/familyTree';

interface ExtraLinksLayerProps {
  extraLinks: ExtraLink[] | undefined;
  people: Person[];
}

export const ExtraLinksLayer: React.FC<ExtraLinksLayerProps> = ({ extraLinks, people }) => (
  <>
    {extraLinks && extraLinks.map((el) => {
      const fromP = people.find((p) => p.id === el.fromPersonId);
      const toP = people.find((p) => p.id === el.toPersonId);
      if (!fromP || !toP) return null;

      const x1 = (fromP.x ?? 0) + (fromP.width ?? 140) / 2;
      const y1 = (fromP.y ?? 0) + (fromP.height ?? 80);
      const x2 = (toP.x ?? 0) + (toP.width ?? 140) / 2;
      const y2 = toP.y ?? 0;
      const midY = (y1 + y2) / 2;
      const color = el.color || '#B5761F';

      return (
        <g key={el.id}>
          <path
            d={`M${x1} ${y1} C${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray={el.strokeDasharray || '4 3'}
            fill="none"
            opacity={0.8}
          />
        </g>
      );
    })}
  </>
);
