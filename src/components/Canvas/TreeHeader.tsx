import React from 'react';
import { TreeMetadata } from '../../types/familyTree';

interface TreeHeaderProps {
  metadata: TreeMetadata;
  canvasWidth: number;
  onOpenMetadataModal: () => void;
}

export const TreeHeader: React.FC<TreeHeaderProps> = ({ metadata, canvasWidth, onOpenMetadataModal }) => (
  <g onClick={onOpenMetadataModal} style={{ cursor: 'pointer' }} className="tree-header-group">
    <text x={22} y={44} fontSize={21} fontWeight="bold" fill="#111827">
      {metadata.title}
    </text>
    <text x={22} y={64} fontSize={11.5} fill="#5A6472">
      {metadata.subtitle}
    </text>
    <text
      x={canvasWidth - 22}
      y={44}
      textAnchor="end"
      fontSize={12}
      fontWeight="bold"
      fill="#9AA3AE"
    >
      {metadata.sheetNumber}
    </text>
    <line
      x1={22}
      y1={metadata.headerDividerY || 76}
      x2={canvasWidth - 22}
      y2={metadata.headerDividerY || 76}
      stroke="#D5DAE0"
      strokeWidth={1.2}
    />
  </g>
);
