import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FamilyTreeData, Person } from '../types/familyTree';
import { computeTreeLayout } from '../engine/layoutEngine';
import { PersonCard } from './PersonCard';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Grid, 
  MapPin, 
  Move
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

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
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);

  // Dragging individual card
  const [draggingPersonId, setDraggingPersonId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialCardPos, setInitialCardPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const { metadata, sections, people, legend, footnotes, extraLinks } = tree;
  const { marriageLines } = computeTreeLayout(tree);

  const canvasWidth = metadata.canvasWidth || 1942;
  const canvasHeight = metadata.canvasHeight || 1383;

  // Fit to screen on initial mount
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 40;
    const availableWidth = clientWidth - padding * 2;
    const availableHeight = clientHeight - padding * 2;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 1.5);

    const newPanX = (clientWidth - canvasWidth * newScale) / 2;
    const newPanY = (clientHeight - canvasHeight * newScale) / 2;

    setScale(newScale);
    setPan({ x: newPanX, y: Math.max(20, newPanY) });
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    handleFitToScreen();
  }, [handleFitToScreen]);

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 2.5));
  };

  // Trackpad pinch (Chrome/Firefox send this as wheel + ctrlKey) and ctrl/cmd+scroll zoom,
  // plain scroll pans. Registered natively with { passive: false } because React's onWheel
  // prop is passive by default, so calling preventDefault() there does not stop the browser's
  // own pinch-to-zoom on the page.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = -e.deltaY * 0.0015;
        setScale((prev) => Math.min(Math.max(prev + zoomFactor, 0.2), 2.5));
      } else {
        setPan((prev) => ({
          x: prev.x - e.deltaX * 0.8,
          y: prev.y - e.deltaY * 0.8,
        }));
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  // Safari trackpad pinch fires gesturestart/gesturechange instead of ctrl+wheel.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let startScale = 1;

    const onGestureStart = (e: any) => {
      e.preventDefault();
      startScale = 1;
    };
    const onGestureChange = (e: any) => {
      e.preventDefault();
      const delta = e.scale - startScale;
      startScale = e.scale;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 2.5));
    };
    const onGestureEnd = (e: any) => {
      e.preventDefault();
    };

    node.addEventListener('gesturestart', onGestureStart as EventListener, { passive: false });
    node.addEventListener('gesturechange', onGestureChange as EventListener, { passive: false });
    node.addEventListener('gestureend', onGestureEnd as EventListener, { passive: false });
    return () => {
      node.removeEventListener('gesturestart', onGestureStart as EventListener);
      node.removeEventListener('gesturechange', onGestureChange as EventListener);
      node.removeEventListener('gestureend', onGestureEnd as EventListener);
    };
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).classList.contains('sheet-canvas') || (e.target as HTMLElement).classList.contains('canvas-viewport')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectPerson(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingPersonId) {
      const dx = (e.clientX - dragStartPos.x) / scale;
      const dy = (e.clientY - dragStartPos.y) / scale;
      onUpdatePersonPosition(
        draggingPersonId,
        Math.round(initialCardPos.x + dx),
        Math.round(initialCardPos.y + dy)
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingPersonId(null);
  };

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

            {/* Tree Header */}
            <g
              onClick={onOpenMetadataModal}
              style={{ cursor: 'pointer' }}
              className="tree-header-group"
            >
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

            {/* Sections & Generation Bands Backgrounds */}
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

            {/* Marriage Connectors & Child Drop Lines */}
            <g className="marriage-connectors-layer">
              {marriageLines.map((ml) => (
                <g key={ml.marriageId}>
                  {/* Horizontal Spouse Line & Marriage Dot */}
                  {ml.hasSpouseLine && (
                    <>
                      <line
                        x1={ml.x1}
                        y1={ml.y1}
                        x2={ml.x2}
                        y2={ml.y2}
                        stroke={ml.color}
                        strokeWidth={2}
                      />
                      <circle cx={ml.dotX} cy={ml.dotY} r={3.2} fill={ml.color} />
                    </>
                  )}

                  {/* Children Bus & Drops */}
                  {ml.hasChildren && ml.busY !== undefined && ml.busX1 !== undefined && ml.busX2 !== undefined && (
                    <g>
                      {/* Vertical Drop Line from Marriage Dot */}
                      {ml.hasDropLine && ml.dropEndY !== undefined && (
                        <path
                          d={`M${ml.dotX} ${ml.dotY} L${ml.dotX} ${ml.dropEndY}`}
                          stroke={ml.color}
                          strokeWidth={2}
                          fill="none"
                        />
                      )}

                      {/* Sibling bus bar */}
                      <line
                        x1={ml.busX1}
                        y1={ml.busY}
                        x2={ml.busX2}
                        y2={ml.busY}
                        stroke={ml.color}
                        strokeWidth={2}
                      />

                      {/* Roman Numeral Badge */}
                      {ml.hasDropLine && ml.badgeText && ml.badgeX !== undefined && ml.badgeY !== undefined && (
                        <g>
                          <rect
                            x={ml.badgeX - 7.5}
                            y={ml.badgeY - 6.5}
                            width={15}
                            height={13}
                            rx={6.5}
                            fill={ml.color}
                          />
                          <text
                            x={ml.badgeX}
                            y={ml.badgeY + 3.8}
                            textAnchor="middle"
                            fontSize={8.6}
                            fontWeight="bold"
                            fill="#ffffff"
                            letterSpacing={0.4}
                          >
                            {ml.badgeText}
                          </text>
                        </g>
                      )}

                      {/* Child Drop Lines */}
                      {ml.childDrops.map((cd, cdIdx) => (
                        <line
                          key={cdIdx}
                          x1={cd.x}
                          y1={cd.y1}
                          x2={cd.x}
                          y2={cd.y2}
                          stroke={ml.color}
                          strokeWidth={2}
                        />
                      ))}
                    </g>
                  )}
                </g>
              ))}
            </g>

            {/* Extra Remarriage Links */}
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

            {/* People Cards */}
            <g className="people-cards-layer">
              {people.map((person) => {
                const isMatched = isPersonMatched(person);
                const isSelected = selectedPersonId === person.id;
                const isHovered = hoveredPersonId === person.id;

                return (
                  <g
                    key={person.id}
                    onMouseEnter={() => setHoveredPersonId(person.id)}
                    onMouseLeave={() => setHoveredPersonId(null)}
                  >
                    {/* Search Highlight Halo */}
                    {isMatched && (
                      <rect
                        x={(person.x ?? 0) - 6}
                        y={(person.y ?? 0) - 6}
                        width={(person.width ?? 140) + 12}
                        height={(person.height ?? 80) + 12}
                        rx={12}
                        fill="rgba(245, 158, 11, 0.25)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    )}
                    <PersonCard
                      person={person}
                      isSelected={isSelected}
                      isHovered={isHovered}
                      onSelect={(p) => onSelectPerson(p)}
                      onDoubleClick={(p) => onEditPerson(p)}
                      onAddChild={(p) => onAddChild(p)}
                      onAddSpouse={(p) => onAddSpouse(p)}
                    />
                  </g>
                );
              })}
            </g>

            {/* Footer Legend */}
            {legend && legend.length > 0 && (
              <g
                className="footer-legend-group"
                onClick={onOpenMetadataModal}
                style={{ cursor: 'pointer' }}
              >
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
                      <text
                        x={curX + 22}
                        y={curY + 9}
                        fontSize={9.6}
                        fill="#4B5563"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Footnotes Grid */}
            {footnotes && footnotes.length > 0 && (
              <g
                className="footer-footnotes-group"
                onClick={onOpenMetadataModal}
                style={{ cursor: 'pointer' }}
              >
                {footnotes.map((fn, idx) => {
                  const isCol2 = fn.column === 2;
                  const col1Items = footnotes.filter((f) => f.column === 1 || !f.column);
                  const col2Items = footnotes.filter((f) => f.column === 2);
                  const rowIdx = isCol2
                    ? col2Items.indexOf(fn)
                    : col1Items.indexOf(fn);
                  const fnX = isCol2 ? Math.round(canvasWidth / 2) : 22;
                  const fnY = (metadata.footerY ? metadata.footerY + 36 : 1321) + rowIdx * 12.5;

                  return (
                    <text
                      key={fn.id || idx}
                      x={fnX}
                      y={fnY}
                      fontSize={8.9}
                      fill="#8A929C"
                    >
                      {fn.text}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Floating Canvas Controls Toolbar */}
      <div className="canvas-floating-toolbar">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleZoom(-0.1)}
          title={t('canvas.zoomOut')}
        >
          <ZoomOut size={16} />
        </button>

        <span className="zoom-level-text">
          {Math.round(scale * 100)}%
        </span>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleZoom(0.1)}
          title={t('canvas.zoomIn')}
        >
          <ZoomIn size={16} />
        </button>

        <div className="toolbar-divider" />

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleFitToScreen}
          title={t('canvas.fitToScreen')}
        >
          <Maximize2 size={16} />
          <span>{t('canvas.fit')}</span>
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setScale(1);
            setPan({ x: 40, y: 30 });
          }}
          title={t('canvas.resetZoom')}
        >
          <RotateCcw size={15} />
          <span>100%</span>
        </button>
      </div>

      {/* Minimap Preview Box */}
      <div
        className="minimap-container"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / rect.width;
          const clickY = (e.clientY - rect.top) / rect.height;
          if (!containerRef.current) return;
          const { clientWidth, clientHeight } = containerRef.current;
          setPan({
            x: clientWidth / 2 - clickX * canvasWidth * scale,
            y: clientHeight / 2 - clickY * canvasHeight * scale,
          });
        }}
        title={t('canvas.minimapTitle')}
      >
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
    </div>
  );
};
