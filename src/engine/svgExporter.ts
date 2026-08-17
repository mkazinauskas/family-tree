import { FamilyTreeData, Person } from '../types/familyTree';
import { getPersonTheme } from './themePresets';
import { computeTreeLayout } from './layoutEngine';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateTreeSvgString(tree: FamilyTreeData): string {
  const { metadata, sections, people, legend, footnotes, extraLinks } = tree;
  const { marriageLines } = computeTreeLayout(tree);

  const w = metadata.canvasWidth || 1942;
  const h = metadata.canvasHeight || 1383;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" font-family="'DejaVu Sans Condensed', 'DejaVu Sans', 'Outfit', 'Inter', sans-serif">
  <rect width="100%" height="100%" fill="#ffffff" />
  
  <!-- Header -->
  <text x="22" y="44" font-size="21" font-weight="bold" fill="#111827">${escapeXml(metadata.title)}</text>
  <text x="22" y="64" font-size="11.5" fill="#5A6472">${escapeXml(metadata.subtitle)}</text>
  <text x="${w - 22}" y="44" text-anchor="end" font-size="12" font-weight="bold" fill="#9AA3AE">${escapeXml(metadata.sheetNumber)}</text>
  <line x1="22" y1="${metadata.headerDividerY || 76}" x2="${w - 22}" y2="${metadata.headerDividerY || 76}" stroke="#D5DAE0" stroke-width="1.2" />

  <!-- Sections & Generation Bands Backgrounds -->
`;

  sections.forEach(sec => {
    // Section Header
    svg += `  <text x="22" y="${sec.y + 13}" font-size="11.4" font-weight="bold" fill="#6B7280" letter-spacing="0.8">${escapeXml(sec.title)}</text>\n`;
    const divX1 = sec.dividerX1 || 250;
    const divY = sec.dividerY || (sec.y + 9);
    const divX2 = sec.dividerX2 || (w - 22);
    svg += `  <line x1="${divX1}" y1="${divY}" x2="${divX2}" y2="${divY}" stroke="#E2E6EA" stroke-width="1" />\n`;

    // Generation Bands
    sec.generationBands.forEach(band => {
      if (band.hasBgRect && band.bgY !== undefined && band.bgHeight !== undefined) {
        const bgX = band.bgX ?? 22;
        const bgW = band.bgWidth ?? (w - 44);
        svg += `  <rect x="${bgX}" y="${band.bgY}" width="${bgW}" height="${band.bgHeight}" rx="7" fill="#F6F7F9" />\n`;
      }
      if (band.label && band.labelY !== undefined) {
        const lblX = band.labelX ?? 26;
        svg += `  <text x="${lblX}" y="${band.labelY}" font-size="9.4" font-weight="bold" fill="#B4BAC2" letter-spacing="0.6">${escapeXml(band.label)}</text>\n`;
      }
    });
  });

  svg += `\n  <!-- Marriage Connectors & Child Lines -->\n`;

  // Draw Marriages
  marriageLines.forEach(ml => {
    // Horizontal spouse connector
    if (ml.hasSpouseLine) {
      svg += `  <line x1="${ml.x1}" y1="${ml.y1}" x2="${ml.x2}" y2="${ml.y2}" stroke="${ml.color}" stroke-width="2" />\n`;
      svg += `  <circle cx="${ml.dotX}" cy="${ml.dotY}" r="3.2" fill="${ml.color}" />\n`;
    }

    // Children bus & drops
    if (ml.hasChildren && ml.busY !== undefined && ml.busX1 !== undefined && ml.busX2 !== undefined) {
      if (ml.hasDropLine && ml.dropEndY !== undefined) {
        svg += `  <path d="M${ml.dotX} ${ml.dotY} L${ml.dotX} ${ml.dropEndY}" stroke="${ml.color}" stroke-width="2" fill="none" />\n`;
      }
      // Sibling bus bar
      svg += `  <line x1="${ml.busX1}" y1="${ml.busY}" x2="${ml.busX2}" y2="${ml.busY}" stroke="${ml.color}" stroke-width="2" />\n`;

      // Badge
      if (ml.hasDropLine && ml.badgeText && ml.badgeX !== undefined && ml.badgeY !== undefined) {
        const bw = 15;
        const bh = 13;
        svg += `  <rect x="${ml.badgeX - bw / 2}" y="${ml.badgeY - bh / 2}" width="${bw}" height="${bh}" rx="6.5" fill="${ml.color}" />\n`;
        svg += `  <text x="${ml.badgeX}" y="${ml.badgeY + 3.8}" text-anchor="middle" font-size="8.6" font-weight="bold" fill="#ffffff" letter-spacing="0.4">${escapeXml(ml.badgeText)}</text>\n`;
      }

      // Child drops
      ml.childDrops.forEach(cd => {
        svg += `  <line x1="${cd.x}" y1="${cd.y1}" x2="${cd.x}" y2="${cd.y2}" stroke="${ml.color}" stroke-width="2" />\n`;
      });
    }
  });

  // Extra links (e.g. remarriages)
  if (extraLinks && extraLinks.length > 0) {
    const personMap = new Map<string, Person>();
    people.forEach(p => personMap.set(p.id, p));

    extraLinks.forEach(el => {
      const from = personMap.get(el.fromPersonId);
      const to = personMap.get(el.toPersonId);
      if (from && to) {
        const x1 = (from.x ?? 0) + (from.width ?? 140) / 2;
        const y1 = (from.y ?? 0) + (from.height ?? 80);
        const x2 = (to.x ?? 0) + (to.width ?? 140) / 2;
        const y2 = to.y ?? 0;
        const midY = (y1 + y2) / 2;
        const color = el.color || '#B5761F';
        svg += `  <!-- Extra Link: ${escapeXml(el.type)} -->\n`;
        svg += `  <path d="M${x1} ${y1} C${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${el.strokeDasharray || '4 3'}" fill="none" opacity="0.75" />\n`;
      }
    });
  }

  svg += `\n  <!-- People Cards -->\n`;

  // Draw Person Cards
  people.forEach(p => {
    const theme = getPersonTheme(p.themePreset, p.customTheme);
    const px = p.x ?? 0;
    const py = p.y ?? 0;
    const pw = p.width ?? 140;
    const ph = p.height ?? 80;

    // Card background
    svg += `  <g class="person-card" data-person-id="${p.id}">\n`;
    svg += `    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="6" fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="1.3" />\n`;

    let currentY = py + 19;

    // Spouse banner if any
    if (p.spouseBanner) {
      const bannerBg = p.spouseBannerBg || theme.bannerBg || theme.stroke;
      const bannerText = theme.bannerText || '#ffffff';
      // Rounded top banner path
      const bx = px + 0.6;
      const by = py + 0.6;
      const bw = pw - 1.2;
      svg += `    <path d="M${bx} ${by + 18.4} L${bx} ${by + 5.4} A5.4 5.4 0 0 1 ${bx + 5.4} ${by} L${bx + bw - 5.4} ${by} A5.4 5.4 0 0 1 ${bx + bw} ${by + 5.4} L${bx + bw} ${by + 18.4} Z" fill="${bannerBg}" />\n`;
      svg += `    <text x="${px + pw / 2}" y="${py + 13.4}" text-anchor="middle" font-size="8.6" font-weight="bold" fill="${bannerText}" letter-spacing="0.5">${escapeXml(p.spouseBanner)}</text>\n`;
      currentY = py + 33;
    }

    // Name (FirstName & LastName)
    svg += `    <text x="${px + pw / 2}" y="${currentY}" text-anchor="middle" font-size="12.0" font-weight="bold" fill="${theme.nameColor}">${escapeXml(p.firstName)}</text>\n`;
    currentY += 14;

    if (p.lastName) {
      svg += `    <text x="${px + pw / 2}" y="${currentY}" text-anchor="middle" font-size="12.0" font-weight="bold" fill="${theme.nameColor}">${escapeXml(p.lastName)}</text>\n`;
      currentY += 14;
    }

    // Maiden name / Alias
    if (p.maidenName) {
      svg += `    <text x="${px + pw / 2}" y="${currentY}" text-anchor="middle" font-size="12.0" font-weight="bold" fill="${theme.nameColor}">${escapeXml(p.maidenName)}</text>\n`;
      currentY += 14.6;
    }

    // Dates
    if (p.birthDate || p.deathDate) {
      let dateStr = '';
      if (p.birthDate && p.deathDate) {
        dateStr = `${p.birthDate} – ${p.deathDate}`;
      } else if (p.birthDate) {
        dateStr = p.birthDate;
      } else {
        dateStr = `m. ${p.deathDate}`;
      }
      if (p.ageAtDeath) {
        dateStr += ` (${p.ageAtDeath})`;
      }
      svg += `    <text x="${px + pw / 2}" y="${currentY}" text-anchor="middle" font-size="11.0" fill="${theme.textColor}">${escapeXml(dateStr)}</text>\n`;
      currentY += 13.7;
    }

    // Location
    if (p.location) {
      svg += `    <text x="${px + pw / 2}" y="${currentY}" text-anchor="middle" font-size="9.2" fill="${theme.textColor}" font-style="italic">${escapeXml(p.location)}</text>\n`;
      currentY += 11.6;
    }

    // Notes
    if (p.notes && p.notes.length > 0) {
      p.notes.forEach(noteLine => {
        svg += `    <text x="${px + 7}" y="${currentY}" font-size="9.2" fill="${theme.textColor}">${escapeXml(noteLine)}</text>\n`;
        currentY += 11.6;
      });
    }

    svg += `  </g>\n`;
  });

  svg += `\n  <!-- Footer & Legend -->\n`;

  // Draw Legend
  if (legend && legend.length > 0) {
    let legX = 22;
    const legY = metadata.footerY ? metadata.footerY + 10 : 1295;

    legend.forEach(item => {
      const curX = item.x || legX;
      const curY = item.y || legY;
      svg += `  <rect x="${curX}" y="${curY}" width="16" height="11" rx="2.5" fill="${item.fill}" stroke="${item.stroke}" stroke-width="1.2" />\n`;
      svg += `  <text x="${curX + 22}" y="${curY + 9}" font-size="9.6" fill="#4B5563">${escapeXml(item.label)}</text>\n`;
      legX = curX + item.label.length * 7 + 35;
    });
  }

  // Draw Footnotes in 2 columns
  if (footnotes && footnotes.length > 0) {
    const col1Items = footnotes.filter(f => f.column === 1 || !f.column);
    const col2Items = footnotes.filter(f => f.column === 2);

    let fnY1 = metadata.footerY ? metadata.footerY + 36 : 1321;
    col1Items.forEach(fn => {
      svg += `  <text x="22" y="${fnY1}" font-size="8.9" fill="#8A929C">${escapeXml(fn.text)}</text>\n`;
      fnY1 += 12.5;
    });

    let fnY2 = metadata.footerY ? metadata.footerY + 36 : 1321;
    const col2X = Math.round(w / 2);
    col2Items.forEach(fn => {
      svg += `  <text x="${col2X}" y="${fnY2}" font-size="8.9" fill="#8A929C">${escapeXml(fn.text)}</text>\n`;
      fnY2 += 12.5;
    });
  }

  svg += `</svg>`;
  return svg;
}

export function generateStandaloneHtml(tree: FamilyTreeData): string {
  const svgContent = generateTreeSvgString(tree);
  return `<!doctype html>
<html lang="lt">
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(tree.metadata.title || tree.name)}</title>
    <style>
      @page {
        size: A3 landscape;
        margin: 0;
      }
      html,
      body {
        margin: 0;
        padding: 0;
        background: #e9ecef;
        font-family: "DejaVu Sans Condensed", "DejaVu Sans", "Outfit", "Inter", sans-serif;
      }
      .sheet {
        width: 420mm;
        height: 297mm;
        box-sizing: border-box;
        padding: 7mm;
        margin: 10px auto;
        background: #fff;
        overflow: hidden;
        box-shadow: 0 2px 14px rgba(0, 0, 0, 0.18);
      }
      .sheet svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      @media print {
        html,
        body {
          background: #fff;
          width: 420mm;
          height: 297mm;
          overflow: hidden;
        }
        .sheet {
          margin: 0;
          box-shadow: none;
          page-break-after: avoid;
          break-after: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      ${svgContent}
    </div>
  </body>
</html>`;
}
