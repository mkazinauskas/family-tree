import React from 'react';
import { TreeSection } from '../../types/familyTree';

interface SectionsLayerProps {
  sections: TreeSection[];
  canvasWidth: number;
}

export const SectionsLayer: React.FC<SectionsLayerProps> = ({ sections, canvasWidth }) => (
  <>
    {sections.map((sec) => (
      <g key={sec.id} className="tree-section-group">
        {/* Section Title */}
        <text
          x={22}
          y={sec.y + 13}
          fontSize={11.4}
          fontWeight="bold"
          fill="#6B7280"
          letterSpacing={0.8}
        >
          {sec.title}
        </text>
        <line
          x1={sec.dividerX1 || 250}
          y1={sec.dividerY || sec.y + 9}
          x2={sec.dividerX2 || canvasWidth - 22}
          y2={sec.dividerY || sec.y + 9}
          stroke="#E2E6EA"
          strokeWidth={1}
        />

        {/* Generation Bands */}
        {sec.generationBands.map((band, bIdx) => (
          <g key={bIdx}>
            {band.hasBgRect && band.bgY !== undefined && band.bgHeight !== undefined && (
              <rect
                x={band.bgX ?? 22}
                y={band.bgY}
                width={band.bgWidth ?? canvasWidth - 44}
                height={band.bgHeight}
                rx={7}
                fill="#F6F7F9"
              />
            )}
            {band.label && band.labelY !== undefined && (
              <text
                x={band.labelX ?? 26}
                y={band.labelY}
                fontSize={9.4}
                fontWeight="bold"
                fill="#B4BAC2"
                letterSpacing={0.6}
              >
                {band.label}
              </text>
            )}
          </g>
        ))}
      </g>
    ))}
  </>
);
