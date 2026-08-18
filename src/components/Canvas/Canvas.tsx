import React, { useState } from 'react';
import { FamilyTreeData, Person } from '../../types/familyTree';
import { computeTreeLayout } from '../../engine/layoutEngine';
import { useCanvasPanZoom } from './useCanvasPanZoom';
import { TreeHeader } from './TreeHeader';
import { SectionsLayer } from './SectionsLayer';
import { MarriageConnectorsLayer } from './MarriageConnectorsLayer';
import { ExtraLinksLayer } from './ExtraLinksLayer';
import { PeopleLayer } from './PeopleLayer';
import { FooterLegend } from './FooterLegend';
import { FootnotesGrid } from './FootnotesGrid';
import { CanvasToolbar } from './CanvasToolbar';
import { Minimap } from './Minimap';

interface CanvasProps {
  tree: FamilyTreeData;
  selectedPersonId: string | null;
  searchQuery: string;
  onSelectPerson: (person: Person | null) => void;
  onEditPerson: (person: Person) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
  onUpdatePersonPosition: (personId: string, x: number, y: number) => void;
  onOpenMetadataModal: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  tree,
  selectedPersonId,
  searchQuery,
  onSelectPerson,
  onEditPerson,
  onAddChild,
  onAddSpouse,
  onUpdatePersonPosition,
  onOpenMetadataModal,
}) => {
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);

  const { metadata, sections, people, legend, footnotes, extraLinks } = tree;
  const { marriageLines } = computeTreeLayout(tree);

  const canvasWidth = metadata.canvasWidth || 1942;
  const canvasHeight = metadata.canvasHeight || 1383;

  const {
    containerRef,
    scale,
    pan,
    isPanning,
    handleFitToScreen,
    handleZoom,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMinimapClick,
  } = useCanvasPanZoom({
    canvasWidth,
    canvasHeight,
    onUpdatePersonPosition,
    onDeselect: () => onSelectPerson(null),
  });

  // Search match filter
  const isPersonMatched = (p: Person): boolean => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName || ''} ${p.maidenName || ''}`.toLowerCase();
    const dates = `${p.birthDate || ''} ${p.deathDate || ''}`.toLowerCase();
    const loc = (p.location || '').toLowerCase();
    return fullName.includes(query) || dates.includes(query) || loc.includes(query);
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-viewport ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transform Layer for Pan & Zoom */}
      <div
        className="canvas-transform-layer"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <div className="sheet-canvas">
          <svg
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            preserveAspectRatio="xMidYMid meet"
            fontFamily={metadata.fontFamily || '"DejaVu Sans Condensed", "Outfit", "Inter", sans-serif'}
          >
            {/* Page White Background */}
            <rect width="100%" height="100%" fill="#ffffff" />

            <TreeHeader metadata={metadata} canvasWidth={canvasWidth} onOpenMetadataModal={onOpenMetadataModal} />

            <SectionsLayer sections={sections} canvasWidth={canvasWidth} />

            <MarriageConnectorsLayer marriageLines={marriageLines} />

            <ExtraLinksLayer extraLinks={extraLinks} people={people} />

            <PeopleLayer
              people={people}
              selectedPersonId={selectedPersonId}
              hoveredPersonId={hoveredPersonId}
              onHoverPerson={setHoveredPersonId}
              isPersonMatched={isPersonMatched}
              onSelectPerson={onSelectPerson}
              onEditPerson={onEditPerson}
              onAddChild={onAddChild}
              onAddSpouse={onAddSpouse}
            />

            <FooterLegend legend={legend} metadata={metadata} onOpenMetadataModal={onOpenMetadataModal} />

            <FootnotesGrid
              footnotes={footnotes}
              metadata={metadata}
              canvasWidth={canvasWidth}
              onOpenMetadataModal={onOpenMetadataModal}
            />
          </svg>
        </div>
      </div>

      <CanvasToolbar scale={scale} onZoom={handleZoom} onFitToScreen={handleFitToScreen} onResetZoom={handleResetZoom} />

      <Minimap
        sections={sections}
        people={people}
        selectedPersonId={selectedPersonId}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onClick={handleMinimapClick}
      />
    </div>
  );
};
