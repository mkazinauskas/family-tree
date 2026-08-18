export type Orientation = 'landscape' | 'portrait';

export interface PaperFormat {
  id: string;
  label: string;
  /** Portrait-orientation dimensions, in millimeters */
  widthMm: number;
  heightMm: number;
}

export const PAPER_FORMATS: PaperFormat[] = [
  { id: 'A4', label: 'A4', widthMm: 210, heightMm: 297 },
  { id: 'A3', label: 'A3', widthMm: 297, heightMm: 420 },
  { id: 'A2', label: 'A2', widthMm: 420, heightMm: 594 },
  { id: 'A1', label: 'A1', widthMm: 594, heightMm: 841 },
  { id: 'A0', label: 'A0', widthMm: 841, heightMm: 1189 },
  { id: 'Letter', label: 'Letter', widthMm: 215.9, heightMm: 279.4 },
  { id: 'Legal', label: 'Legal', widthMm: 215.9, heightMm: 355.6 },
  { id: 'Tabloid', label: 'Tabloid', widthMm: 279.4, heightMm: 431.8 },
];

export const DEFAULT_PAPER_FORMAT_ID = 'A3';
export const DEFAULT_ORIENTATION: Orientation = 'landscape';

// Derived from the app's original A3-landscape default canvas (1942x1383 px),
// so existing designs keep their exact on-screen scale.
const PX_PER_MM = 1942 / 420;

export function getPaperFormat(id: string): PaperFormat {
  return (
    PAPER_FORMATS.find((f) => f.id === id) ||
    PAPER_FORMATS.find((f) => f.id === DEFAULT_PAPER_FORMAT_ID)!
  );
}

export function getOrientedMm(
  format: PaperFormat,
  orientation: Orientation
): { widthMm: number; heightMm: number } {
  return orientation === 'landscape'
    ? { widthMm: format.heightMm, heightMm: format.widthMm }
    : { widthMm: format.widthMm, heightMm: format.heightMm };
}

export function getCanvasPixelSize(
  formatId: string,
  orientation: Orientation
): { width: number; height: number } {
  const { widthMm, heightMm } = getOrientedMm(getPaperFormat(formatId), orientation);
  return {
    width: Math.round(widthMm * PX_PER_MM),
    height: Math.round(heightMm * PX_PER_MM),
  };
}

/**
 * Best-effort match for trees saved before paperFormat/orientation existed
 * (or imported from arbitrary HTML/SVG) — picks the known format whose aspect
 * ratio is closest to the tree's current canvas pixel dimensions.
 */
export function findClosestFormat(
  canvasWidth: number,
  canvasHeight: number
): { formatId: string; orientation: Orientation } {
  const ratio = canvasWidth / canvasHeight;
  let best = { formatId: DEFAULT_PAPER_FORMAT_ID, orientation: DEFAULT_ORIENTATION, diff: Infinity };

  for (const format of PAPER_FORMATS) {
    for (const orientation of ['landscape', 'portrait'] as Orientation[]) {
      const { widthMm, heightMm } = getOrientedMm(format, orientation);
      const diff = Math.abs(widthMm / heightMm - ratio);
      if (diff < best.diff) {
        best = { formatId: format.id, orientation, diff };
      }
    }
  }

  return { formatId: best.formatId, orientation: best.orientation };
}
