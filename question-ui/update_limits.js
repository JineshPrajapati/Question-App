const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', 'utf8');

// Increase QPP limits for Question Paper
content = content.replace(/const QPP = isA5 \? 4 : 6;/, 'const QPP = isA5 ? 8 : 14;');

// Increase QPP limits for Solutions
content = content.replace(/const SOL_QPP = isA5 \? 4 : 6;/, 'const SOL_QPP = isA5 ? 6 : 12;');

// Increase QPP limits for Answer Key
content = content.replace(/const ANS_QPP = isA5 \? 12 : 16;/, 'const ANS_QPP = isA5 ? 16 : 24;');

fs.writeFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', content);
console.log("Limits increased!");
