import fs from 'fs';

const content = fs.readFileSync('/Users/modestas.kazinauskas/dev/family-tree/3-Tamosius.html', 'utf8');

// Parse transform stacks and extract all elements
const gTransformRegex = /<g\s+transform="translate\(([-\d.]+),\s*([-\d.]+)\)">/g;

// Let's create an accurate and comprehensive dataset in src/data/tamosiusTreeData.ts
// We'll inspect each section and ensure every person and link is included with perfection.

console.log('Building tamosiusTreeData.ts...');
