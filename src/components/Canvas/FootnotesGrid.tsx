import React from 'react';
import { FootnoteItem, TreeMetadata } from '../../types/familyTree';

interface FootnotesGridProps {
  footnotes: FootnoteItem[] | undefined;
  metadata: TreeMetadata;
  canvasWidth: number;
  onOpenMetadataModal: () => void;
}

export const FootnotesGrid: React.FC<FootnotesGridProps> = ({
  footnotes,
  metadata,
  canvasWidth,
  onOpenMetadataModal,
}) => {
  if (!footnotes || footnotes.length === 0) return null;

  const col1Items = footnotes.filter((f) => f.column === 1 || !f.column);
  const col2Items = footnotes.filter((f) => f.column === 2);

  return (
    <g className="footer-footnotes-group" onClick={onOpenMetadataModal} style={{ cursor: 'pointer' }}>
      {footnotes.map((fn, idx) => {
        const isCol2 = fn.column === 2;
        const rowIdx = isCol2 ? col2Items.indexOf(fn) : col1Items.indexOf(fn);
        const fnX = isCol2 ? Math.round(canvasWidth / 2) : 22;
        const fnY = (metadata.footerY ? metadata.footerY + 36 : 1321) + rowIdx * 12.5;

        return (
          <text key={fn.id || idx} x={fnX} y={fnY} fontSize={8.9} fill="#8A929C">
            {fn.text}
          </text>
        );
      })}
    </g>
  );
};
