import fs from 'fs';

const html = fs.readFileSync('/Users/modestas.kazinauskas/dev/family-tree/3-Tamosius.html', 'utf8');

// Let's inspect the sections in 3-Tamosius.html
// Section 1: Protėviai: transform="translate(22,82)" then translate(0,27)
// Section 2: I Santuoka: translate(0,305) (under translate(22,82)) -> absolute Y = 82 + 305 = 387
// Section 3: II Santuoka: translate(0,846) (under translate(22,82)) -> absolute Y = 82 + 846 = 928

// Let's write an intelligent parser that understands cards and links
console.log("Analyzing sections...");
