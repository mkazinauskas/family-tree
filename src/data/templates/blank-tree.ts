import { Template } from './types';

const template: Template = {
  id: 'blank-tree',
  name: 'Tuščias medis (Nuo nulio)',
  description: 'Tuščia A3 drobė su pradiniu protėviu, paruošta kurti naują genealoginį medį.',
  data: {
    id: 'tree-blank',
    name: 'NAUJAS ŠEIMOS MEDIS',
    version: 1,
    updatedAt: new Date().toISOString(),
    metadata: {
      title: 'NAUJAS ŠEIMOS GENEALOGINIS MEDIS',
      subtitle: 'Įrašykite giminės pavadinimą, vietovę ir istorinį kontekstą',
      sheetNumber: 'LAPAS 1 / 1',
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
        title: 'I KARTA · ŠEIMOS PRADŽIA',
        y: 82,
        height: 600,
        generationBands: [
          { generation: 1, label: 'I karta', labelX: 26, labelY: 158, bgX: 22, bgY: 96, bgWidth: 1898, bgHeight: 120, hasBgRect: true },
          { generation: 2, label: 'II karta', labelX: 26, labelY: 340, bgX: 22, bgY: 280, bgWidth: 1898, bgHeight: 140, hasBgRect: false },
        ],
      },
    ],
    people: [
      {
        id: 'p-root',
        firstName: 'VARDAS',
        lastName: 'PAVARDĖ',
        gender: 'male',
        birthDate: '1850',
        deathDate: '1920',
        location: 'Kaimas, Parapija',
        notes: ['Pradinis asmuo. Spustelėkite dukart, kad redaguotumėte.'],
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
      { id: 'leg-1', label: 'I karta', fill: '#D9E7F5', stroke: '#245C8C', x: 22, y: 1295 },
      { id: 'leg-2', label: 'Palikuonys', fill: '#EFF7F4', stroke: '#7FB3A5', x: 130, y: 1295 },
    ],
    footnotes: [
      { id: 'fn-1', text: 'Čia galite įrašyti archyvinius šaltinius, liudininkų pavardes ir istorinius faktus.', column: 1, order: 1 },
    ],
  },
};

export default template;
