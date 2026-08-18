import React from 'react';
import { LegendItem, TreeMetadata } from '../../types/familyTree';

interface FooterLegendProps {
  legend: LegendItem[] | undefined;
  metadata: TreeMetadata;
  onOpenMetadataModal: () => void;
}

export const FooterLegend: React.FC<FooterLegendProps> = ({ legend, metadata, onOpenMetadataModal }) => {
  if (!legend || legend.length === 0) return null;

  return (
    <g className="footer-legend-group" onClick={onOpenMetadataModal} style={{ cursor: 'pointer' }}>
      {legend.map((item, idx) => {
        const curX = item.x ?? (22 + idx * 135);
        const curY = item.y ?? (metadata.footerY ? metadata.footerY + 10 : 1295);
        return (
          <g key={item.id}>
            <rect
              x={curX}
              y={curY}
              width={16}
              height={11}
              rx={2.5}
              fill={item.fill}
              stroke={item.stroke}
              strokeWidth={1.2}
            />
            <text x={curX + 22} y={curY + 9} fontSize={9.6} fill="#4B5563">
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
