import fs from 'fs';

const html = fs.readFileSync('/Users/modestas.kazinauskas/dev/family-tree/3-Tamosius.html', 'utf8');

// Parse all elements from 3-Tamosius.html
console.log('Extracting complete tree from 3-Tamosius.html...');

// We have 3 groups:
// Section 1: translate(22,82) -> Protėviai:
//   Subgroup translate(0,27): y=82+27=109.
//   Jurgis Gaidys & Rozalija Vasiliauskaitė & Ona Čeriaukaitė
//   Children: Uršulė (1832), Viktorija (1836), Veronika (1839), Tamošius (1844), Kazimieras (1849)

// Let's write a comprehensive parser that builds the exact clean data model
const lines = html.split('\n');
console.log('Total HTML lines:', lines.length);
