import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCanvasPanZoomOptions {
  canvasWidth: number;
  canvasHeight: number;
  onUpdatePersonPosition: (personId: string, x: number, y: number) => void;
  onDeselect: () => void;
}

export function useCanvasPanZoom({
  canvasWidth,
  canvasHeight,
  onUpdatePersonPosition,
  onDeselect,
}: UseCanvasPanZoomOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual card
  const [draggingPersonId, setDraggingPersonId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialCardPos, setInitialCardPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 40, y: 30 });
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

  // Mouse pan handlers. Pan on any left-click drag that doesn't start on a person card
  // (clicking the page background rect inside the SVG used to fail the old strict
  // target-equality check, so dragging the visible sheet did nothing).
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.svg-person-card')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    onDeselect();
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

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setPan({
      x: clientWidth / 2 - clickX * canvasWidth * scale,
      y: clientHeight / 2 - clickY * canvasHeight * scale,
    });
  };

  return {
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
    // Exposed for potential card-drag wiring; currently unused by any card interaction.
    draggingPersonId,
    setDraggingPersonId,
    dragStartPos,
    setDragStartPos,
    initialCardPos,
    setInitialCardPos,
  };
}
