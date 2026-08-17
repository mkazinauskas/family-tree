import { Person, PersonTheme } from '../types/familyTree';
import { getPersonTheme } from './themePresets';

export interface RenderedTextLine {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight?: string;
  fontStyle?: string;
  textAnchor: 'middle' | 'start' | 'end';
  fill: string;
  textLength?: number;
  lengthAdjust?: 'spacingAndGlyphs' | 'spacing';
}

export interface ComputedCardLayout {
  px: number;
  py: number;
  pw: number;
  ph: number;
  banner?: {
    text: string;
    bg: string;
    textColor: string;
    pathD: string;
    textX: number;
    textY: number;
  };
  lines: RenderedTextLine[];
  theme: PersonTheme;
}

export function computeCardTextLayout(
  person: Person,
  customThemeOverride?: PersonTheme
): ComputedCardLayout {
  const theme = customThemeOverride || getPersonTheme(person.themePreset, person.customTheme);
  const px = person.x ?? 0;
  const py = person.y ?? 0;
  const pw = person.width ?? 140;

  const lines: RenderedTextLine[] = [];
  let currentY = py + (person.spouseBanner ? 33.0 : 19.0);
  const availableWidth = pw - 12;

  // 1. Spouse Banner
  let banner: ComputedCardLayout['banner'] | undefined;
  if (person.spouseBanner) {
    const bannerBg = person.spouseBannerBg || theme.bannerBg || theme.stroke;
    const bannerText = theme.bannerText || '#ffffff';
    const bx = px + 0.6;
    const by = py + 0.6;
    const bw = pw - 1.2;
    banner = {
      text: person.spouseBanner,
      bg: bannerBg,
      textColor: bannerText,
      pathD: `M${bx} ${by + 18.4} L${bx} ${by + 5.4} A5.4 5.4 0 0 1 ${bx + 5.4} ${by} L${bx + bw - 5.4} ${by} A5.4 5.4 0 0 1 ${bx + bw} ${by + 5.4} L${bx + bw} ${by + 18.4} Z`,
      textX: px + pw / 2,
      textY: py + 13.4,
    };
  }

  // 2. Name Lines
  let nameLinesToRender: string[] = [];
  if (person.nameLines && person.nameLines.length > 0) {
    nameLinesToRender = [...person.nameLines];
  } else {
    const fn = (person.firstName || '').trim();
    const ln = (person.lastName || '').trim();

    if (fn && ln) {
      const combined = `${fn} ${ln}`;
      // In cards of width >= 140, single names <= 18 chars fit in one line
      const estCombinedWidth = combined.length * 7.5;
      if (estCombinedWidth <= availableWidth && combined.length <= 18) {
        nameLinesToRender.push(combined);
      } else {
        nameLinesToRender.push(fn);
        nameLinesToRender.push(ln);
      }
    } else if (fn) {
      nameLinesToRender.push(fn);
    } else if (ln) {
      nameLinesToRender.push(ln);
    }

    if (person.maidenName) {
      nameLinesToRender.push(person.maidenName.trim());
    }
  }

  nameLinesToRender.forEach((nLine, idx) => {
    if (idx > 0) {
      currentY += 14.0;
    }
    const estWidth = nLine.length * 7.6;
    const needsFit = estWidth > availableWidth;

    lines.push({
      id: `name-${idx}`,
      text: nLine,
      x: px + pw / 2,
      y: currentY,
      fontSize: 12.0,
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: theme.nameColor,
      textLength: needsFit ? availableWidth : undefined,
      lengthAdjust: needsFit ? 'spacingAndGlyphs' : undefined,
    });
  });

  // 3. Dates
  let dateStr = '';
  if (person.birthDate && person.deathDate) {
    dateStr = `${person.birthDate} – ${person.deathDate}`;
  } else if (person.birthDate) {
    dateStr = person.birthDate;
  } else if (person.deathDate) {
    dateStr = `m. ${person.deathDate}`;
  }
  if (person.ageAtDeath) {
    dateStr += ` (${person.ageAtDeath})`;
  }

  if (dateStr) {
    if (nameLinesToRender.length > 0) {
      currentY += 14.6;
    }

    // Check if dates contains newlines or needs wrapping
    const dateParts = dateStr.includes('\n') ? dateStr.split('\n') : [dateStr];
    dateParts.forEach((dPart, idx) => {
      if (idx > 0) currentY += 13.2;
      const estWidth = dPart.length * 6.5;
      const needsFit = estWidth > availableWidth;

      lines.push({
        id: `date-${idx}`,
        text: dPart,
        x: px + pw / 2,
        y: currentY,
        fontSize: 11.0,
        textAnchor: 'middle',
        fill: theme.textColor,
        textLength: needsFit ? availableWidth : undefined,
        lengthAdjust: needsFit ? 'spacingAndGlyphs' : undefined,
      });
    });
  }

  // 4. Location
  if (person.location) {
    if (dateStr) {
      currentY += 13.7;
    } else if (nameLinesToRender.length > 0) {
      currentY += 14.6;
    }

    const locParts = person.location.includes('\n') ? person.location.split('\n') : [person.location];
    locParts.forEach((lPart, idx) => {
      if (idx > 0) currentY += 11.6;
      const estWidth = lPart.length * 5.4;
      const needsFit = estWidth > availableWidth;

      lines.push({
        id: `loc-${idx}`,
        text: lPart,
        x: px + pw / 2,
        y: currentY,
        fontSize: 9.2,
        fontStyle: 'italic',
        textAnchor: 'middle',
        fill: theme.textColor,
        textLength: needsFit ? availableWidth : undefined,
        lengthAdjust: needsFit ? 'spacingAndGlyphs' : undefined,
      });
    });
  }

  // 5. Notes
  if (person.notes && person.notes.length > 0) {
    person.notes.forEach((note, idx) => {
      if (idx === 0) {
        if (person.location) {
          currentY += 11.6;
        } else if (dateStr) {
          currentY += 13.7;
        } else if (nameLinesToRender.length > 0) {
          currentY += 14.6;
        }
      } else {
        currentY += 11.6;
      }

      const isSpecialEvent =
        note.startsWith('Santuoka:') ||
        note.startsWith('I santuoka:') ||
        note.startsWith('II santuoka:') ||
        note.startsWith('→') ||
        note.startsWith('↓');

      const isCenteredNotice =
        note.startsWith('→') ||
        note.startsWith('↓') ||
        note.startsWith('Dvyn');

      const estWidth = note.length * 5.4;
      const noteAvailableWidth = isCenteredNotice ? availableWidth : pw - 14;
      const needsFit = estWidth > noteAvailableWidth;

      lines.push({
        id: `note-${idx}`,
        text: note,
        x: isCenteredNotice ? px + pw / 2 : px + 7,
        y: currentY,
        fontSize: 9.2,
        fontWeight: isSpecialEvent ? 'bold' : undefined,
        textAnchor: isCenteredNotice ? 'middle' : 'start',
        fill: theme.textColor,
        textLength: needsFit ? noteAvailableWidth : undefined,
        lengthAdjust: needsFit ? 'spacingAndGlyphs' : undefined,
      });
    });
  }

  // Calculate required height with clearance for bottom descenders
  const lastLineY = lines.length > 0 ? lines[lines.length - 1].y : currentY;
  const requiredHeight = Math.ceil(lastLineY - py + 9.0);
  const finalHeight = Math.max(person.height ?? 44, requiredHeight);

  return {
    px,
    py,
    pw,
    ph: finalHeight,
    banner,
    lines,
    theme,
  };
}
