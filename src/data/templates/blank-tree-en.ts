import { Template } from './types';

const template: Template = {
  id: 'blank-tree-en',
  name: 'Blank Tree (English)',
  description: 'Empty A3 canvas with a starting ancestor, ready to build a new family tree in English.',
  data: {
    id: 'tree-blank-en',
    name: 'NEW FAMILY TREE',
    version: 1,
    updatedAt: new Date().toISOString(),
    metadata: {
      title: 'NEW FAMILY GENEALOGY TREE',
      subtitle: 'Enter the family name, location, and historical context',
      sheetNumber: 'SHEET 1 / 1',
      canvasWidth: 1942,
      canvasHeight: 1383,
      paperFormat: 'A3',
      orientation: 'landscape',
      headerDividerY: 76,
      footerY: 1285,
      fontFamily: '"DejaVu Sans Condensed", "Outfit", "Inter", sans-serif',
    },
    sections: [
      {
        id: 'sec-1',
        title: 'GENERATION I · FAMILY BEGINNINGS',
        y: 82,
        height: 600,
        generationBands: [
          { generation: 1, label: 'Generation I', labelX: 26, labelY: 158, bgX: 22, bgY: 96, bgWidth: 1898, bgHeight: 120, hasBgRect: true },
          { generation: 2, label: 'Generation II', labelX: 26, labelY: 340, bgX: 22, bgY: 280, bgWidth: 1898, bgHeight: 140, hasBgRect: false },
        ],
      },
    ],
    people: [
      {
        id: 'p-root',
        firstName: 'FIRST NAME',
        lastName: 'LAST NAME',
        gender: 'male',
        birthDate: '1850',
        deathDate: '1920',
        location: 'Village, Parish',
        notes: ['Starting person. Double-click to edit.'],
        themePreset: 'ancestor-blue',
        sectionId: 'sec-1',
        generation: 1,
        x: 900,
        y: 110,
        width: 140,
        height: 86,
      },
    ],
    marriages: [],
    legend: [
      { id: 'leg-1', label: 'Generation I', fill: '#D9E7F5', stroke: '#245C8C', x: 22, y: 1295 },
      { id: 'leg-2', label: 'Descendants', fill: '#EFF7F4', stroke: '#7FB3A5', x: 130, y: 1295 },
    ],
    footnotes: [
      { id: 'fn-1', text: 'Record archival sources, witness names, and historical facts here.', column: 1, order: 1 },
    ],
  },
};

export default template;
