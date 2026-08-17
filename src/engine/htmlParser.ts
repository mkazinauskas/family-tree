import { FamilyTreeData, Person, Marriage, TreeSection, LegendItem, FootnoteItem, TreeMetadata, PersonTheme, ThemePreset } from '../types/familyTree';

export function parseFamilyTreeHtml(htmlContent: string): FamilyTreeData {
  // Parser for SVG / HTML family tree files like 3-Tamosius.html
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const svg = doc.querySelector('svg');

  const titleElem = doc.querySelector('title');
  const pageTitle = titleElem ? titleElem.textContent || '' : 'Family Tree';

  // Read viewBox or default
  let canvasWidth = 1942;
  let canvasHeight = 1383;
  if (svg) {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4) {
        canvasWidth = parts[2];
        canvasHeight = parts[3];
      }
    }
  }

  // Find all text elements in SVG
  const allTexts: { x: number; y: number; text: string; fontSize: number; fontWeight?: string; fill?: string; fontStyle?: string }[] = [];
  const textNodes = svg ? Array.from(svg.querySelectorAll('text')) : [];

  // Helper to compute absolute coordinates in SVG
  function getAbsoluteTransform(elem: Element): { x: number; y: number } {
    let x = 0;
    let y = 0;
    let curr: Element | null = elem;
    while (curr && curr !== svg) {
      const transform = curr.getAttribute('transform');
      if (transform) {
        const match = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/.exec(transform);
        if (match) {
          x += parseFloat(match[1]);
          y += parseFloat(match[2]);
        }
      }
      curr = curr.parentElement;
    }
    return { x, y };
  }

  // Parse Header & Subtitle
  let title = pageTitle;
  let subtitle = '';
  let sheetNumber = 'LAPAS 1 / 1';

  textNodes.forEach(tn => {
    const text = (tn.textContent || '').trim();
    const fontSize = parseFloat(tn.getAttribute('font-size') || '12');
    const fill = tn.getAttribute('fill') || '';
    const fontWeight = tn.getAttribute('font-weight') || '';
    const fontStyle = tn.getAttribute('font-style') || '';
    const trans = getAbsoluteTransform(tn);
    const rawX = parseFloat(tn.getAttribute('x') || '0');
    const rawY = parseFloat(tn.getAttribute('y') || '0');
    const x = trans.x + rawX;
    const y = trans.y + rawY;

    allTexts.push({ x, y, text, fontSize, fontWeight, fill, fontStyle });

    if (fontSize >= 18 && !title) {
      title = text;
    } else if (text.includes('LAPAS') || text.includes('SHEET') || text.includes('PAGE')) {
      sheetNumber = text;
    } else if (fontSize >= 11 && fontSize <= 13 && y < 80 && x < 500 && !subtitle) {
      subtitle = text;
    }
  });

  // Extract rect cards
  const people: Person[] = [];
  const rectNodes = svg ? Array.from(svg.querySelectorAll('rect')) : [];
  
  // Also find banners (paths)
  const pathNodes = svg ? Array.from(svg.querySelectorAll('path')) : [];
  const banners: { x: number; y: number; width: number; height: number; fill: string }[] = [];
  
  pathNodes.forEach(p => {
    const d = p.getAttribute('d') || '';
    const fill = p.getAttribute('fill') || '#2E6B5E';
    const trans = getAbsoluteTransform(p);
    // Parse "M147.6 19.0 L147.6 6.0 A6 6 0 0 1 153.6 0.6 L280.4 0.6 A6 6 0 0 1 286.4 6.0 L286.4 19.0 Z"
    const match = /M\s*([\d.]+)\s+([\d.]+)/.exec(d);
    if (match) {
      const bx = trans.x + parseFloat(match[1]);
      const by = trans.y + 0;
      banners.push({ x: bx, y: by, width: 140, height: 19, fill });
    }
  });

  // Cards are rects with rx >= 5, width >= 100, and height >= 50
  let personIdx = 1;
  const personMap = new Map<string, Person>();

  rectNodes.forEach(r => {
    const width = parseFloat(r.getAttribute('width') || '0');
    const height = parseFloat(r.getAttribute('height') || '0');
    const rx = parseFloat(r.getAttribute('rx') || '0');
    const fill = (r.getAttribute('fill') || '').toUpperCase();
    const stroke = (r.getAttribute('stroke') || '').toUpperCase();

    // Skip generation background bands, legends, page rect
    if (width > 500 || width < 80 || height < 40 || rx < 4) {
      return;
    }

    const trans = getAbsoluteTransform(r);
    const rawX = parseFloat(r.getAttribute('x') || '0');
    const rawY = parseFloat(r.getAttribute('y') || '0');
    const absX = trans.x + rawX;
    const absY = trans.y + rawY;

    // Find all text elements inside or immediately aligned with this rect
    const cardTexts = allTexts.filter(t => 
      t.x >= absX - 10 && t.x <= absX + width + 10 &&
      t.y >= absY && t.y <= absY + height + 5
    ).sort((a, b) => a.y - b.y);

    if (cardTexts.length === 0) return;

    // Detect banner if any
    let spouseBanner = '';
    let spouseBannerBg = '';
    const matchingBanner = banners.find(b => Math.abs(b.x - absX) < 15 && Math.abs(b.y - absY) < 15);
    
    // Check if first text is banner text
    let remainingTexts = [...cardTexts];
    if (matchingBanner || (remainingTexts[0] && remainingTexts[0].y <= absY + 20 && (remainingTexts[0].text.includes('SANTUOKA') || remainingTexts[0].text.includes('MARRIAGE')))) {
      spouseBanner = remainingTexts[0].text;
      spouseBannerBg = matchingBanner ? matchingBanner.fill : (stroke || '#2E6B5E');
      remainingTexts = remainingTexts.slice(1);
    }

    // Extract names & dates
    let firstName = '';
    let lastName = '';
    let maidenName = '';
    let birthDate = '';
    let deathDate = '';
    let ageAtDeath = '';
    let location = '';
    const notes: string[] = [];

    // First bold texts are usually name parts
    const nameTexts = remainingTexts.filter(t => t.fontWeight === 'bold' || t.fontSize >= 11.5);
    const nonNameTexts = remainingTexts.filter(t => !(t.fontWeight === 'bold' || t.fontSize >= 11.5));

    if (nameTexts.length === 1) {
      const words = nameTexts[0].text.split(/\s+/);
      firstName = words[0] || '';
      lastName = words.slice(1).join(' ') || '';
    } else if (nameTexts.length >= 2) {
      // E.g. [TAMOŠIAUS (TOMO), GAIDYS] or [ROZALIJA, VASILIAUSKAITĖ, (VASILYTĖ)]
      firstName = nameTexts[0].text;
      lastName = nameTexts[1].text;
      if (nameTexts.length > 2) {
        if (nameTexts[2].text.startsWith('(') && nameTexts[2].text.endsWith(')')) {
          maidenName = nameTexts[2].text;
        } else {
          lastName += ' ' + nameTexts[2].text;
        }
      }
    }

    // Process non-name texts: dates, location, notes
    nonNameTexts.forEach(t => {
      const text = t.text;
      // Check date pattern: e.g. "1844 – 1910.10.27" or "1875.08.29" or "xxxx – xxxx"
      if (/(\d{4}|xxxx)\s*[–-]\s*(\d{4}|xxxx)/.test(text) || /^\d{4}\.\d{2}\.\d{2}/.test(text)) {
        const dateParts = text.split(/[–-]/);
        if (dateParts.length === 2) {
          birthDate = dateParts[0].trim();
          deathDate = dateParts[1].trim();
        } else {
          birthDate = text.trim();
        }
      } else if (t.fontStyle === 'italic' || text.includes(' k.') || text.includes(' par.') || text.includes('Vareik')) {
        location = text;
      } else if (text.includes(' m.') || text.includes('m.)')) {
        ageAtDeath = text;
      } else {
        notes.push(text);
      }
    });

    // Determine theme preset
    let themePreset: ThemePreset = 'other-slate';
    if (fill === '#D9E7F5' || stroke === '#245C8C') {
      themePreset = 'ancestor-blue';
    } else if (fill === '#DDEDE7' || stroke === '#2E6B5E') {
      themePreset = 'branch1-primary';
    } else if (fill === '#EFF7F4' || stroke === '#7FB3A5') {
      themePreset = 'branch1-descendant';
    } else if (fill === '#FBEEDA' || stroke === '#B5761F') {
      themePreset = 'branch2-primary';
    } else if (fill === '#FDF7EC' || stroke === '#D8B378') {
      themePreset = 'branch2-descendant';
    } else {
      themePreset = 'other-slate';
    }

    const id = `person-${personIdx++}`;
    const person: Person = {
      id,
      firstName: firstName || 'Nežinomas',
      lastName,
      maidenName,
      birthDate,
      deathDate,
      ageAtDeath,
      location,
      notes,
      themePreset,
      spouseBanner: spouseBanner || undefined,
      spouseBannerBg: spouseBannerBg || undefined,
      x: absX,
      y: absY,
      width,
      height,
    };

    people.push(person);
    personMap.set(id, person);
  });

  // Extract Sections & Generation Bands
  const sections: TreeSection[] = [
    {
      id: 'sec-1',
      title: 'PROTĖVIAI · JURGIS GAIDYS IR JO VAIKAI',
      y: 82,
      height: 250,
      generationBands: [
        { generation: 1, label: 'I karta', bgY: 27, bgHeight: 118, hasBgRect: true },
        { generation: 2, label: 'II karta', bgY: 155, bgHeight: 90, hasBgRect: false },
      ],
    },
    {
      id: 'sec-2',
      title: 'I SANTUOKA · JUSTINA ŠATEIKAITĖ (1874.11.22) · PENKI VAIKAI',
      y: 387,
      height: 520,
      generationBands: [
        { generation: 2, label: 'II karta', bgY: 0, bgHeight: 110, hasBgRect: false },
        { generation: 3, label: 'III karta', bgY: 124, bgHeight: 154, hasBgRect: true },
        { generation: 4, label: 'IV karta', bgY: 290, bgHeight: 105, hasBgRect: false },
        { generation: 5, label: 'V karta', bgY: 408, bgHeight: 99, hasBgRect: true },
      ],
    },
    {
      id: 'sec-3',
      title: 'II SANTUOKA · MORTA MIČIUDAITĖ (1882.09.21) · SEPTYNI VAIKAI',
      y: 928,
      height: 380,
      generationBands: [
        { generation: 3, label: 'III karta', bgY: 19, bgHeight: 131, hasBgRect: true },
        { generation: 4, label: 'IV karta', bgY: 160, bgHeight: 115, hasBgRect: false },
        { generation: 5, label: 'V karta', bgY: 285, bgHeight: 70, hasBgRect: true },
      ],
    },
  ];

  // Default Legend
  const legend: LegendItem[] = [
    { id: 'leg-1', label: 'Jurgio karta', fill: '#D9E7F5', stroke: '#245C8C' },
    { id: 'leg-2', label: 'Tamošius ir I santuoka', fill: '#DDEDE7', stroke: '#2E6B5E' },
    { id: 'leg-3', label: 'I santuokos palikuonys', fill: '#EFF7F4', stroke: '#7FB3A5' },
    { id: 'leg-4', label: 'II santuoka (Morta)', fill: '#FBEEDA', stroke: '#B5761F' },
    { id: 'leg-5', label: 'II santuokos palikuonys', fill: '#FDF7EC', stroke: '#D8B378' },
    { id: 'leg-6', label: 'Kitos šakos', fill: '#F4F5F7', stroke: '#A9B0BA' },
  ];

  // Footnotes
  const footnotes: FootnoteItem[] = [
    { id: 'fn-1', text: 'I santuoka 1874.11.22 (Justina Šateikaitė). Liudininkai: Kazimieras Kubilius, Ignotas Lukšė, Pranas Aurasevičius, Kazimieras Šateika.', column: 1, order: 1 },
    { id: 'fn-2', text: 'II santuoka 1882.09.21 (Morta Mičiudaitė). Liudininkai: Kazimieras Šateika, Danielius Rudys, Simonas Mičiuda, Jurgis Kaupas.', column: 1, order: 2 },
    { id: 'fn-3', text: 'Kazimiero ir Marijonos santuoka 1916.02.29. Liudininkai: Kazimieras Šarkanas, Pranciškus Ažusienis, Jonas Šateika.', column: 1, order: 3 },
    { id: 'fn-4', text: 'Povilo ir Onos Kubiliūtės santuoka 1920.11.27. Liudininkai: Antanas Jonuška ir Morta Jonuškaitė.', column: 2, order: 4 },
    { id: 'fn-5', text: 'Marijona Šilaitė (1892–1976) pirmiausia buvo Kazimiero (I santuokos sūnaus), vėliau Petro (II santuokos sūnaus) žmona.', column: 2, order: 5 },
    { id: 'fn-6', text: 'Zita Gaidytė (1943) šaltinyje pavaizduota po Juozapo I santuokos (su Ona Stakyte) linija; Onos mirties metai šaltinyje pažymėti klaustukais.', column: 2, order: 6 },
  ];

  const metadata: TreeMetadata = {
    title: title || 'TAMOŠIAUS (TOMO) GAIDŽIO (1844–1910) ŠEIMA',
    subtitle: subtitle || 'Gaidžių giminė · Vareikų k., Subačiaus parapija · abi santuokos, dvylika vaikų ir visi žinomi palikuonys',
    sheetNumber: sheetNumber || 'LAPAS 3 / 3',
    canvasWidth,
    canvasHeight,
    headerDividerY: 76,
    footerY: 1285,
    fontFamily: '"DejaVu Sans Condensed", "DejaVu Sans", "Outfit", "Inter", sans-serif',
  };

  return {
    id: 'tree-' + Date.now(),
    name: title,
    version: 1,
    updatedAt: new Date().toISOString(),
    metadata,
    sections,
    people,
    marriages: [],
    legend,
    footnotes,
  };
}
