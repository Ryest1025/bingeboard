// checkReactImports.mjs - Script to check all UI components for React imports
import fs from 'fs';
import path from 'path';

const componentsDir = path.resolve('./client/src/components/ui');
const files = fs.readdirSync(componentsDir);

console.log('Checking React imports in UI components...');
let missingReactImports = [];

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for React import
    const hasReactImport = content.includes('import React') ||
      content.includes('import * as React');

    if (!hasReactImport) {
      missingReactImports.push(file);
      console.log(`❌ Missing React import in: ${file}`);
    } else {
      console.log(`✅ React properly imported in: ${file}`);
    }
  }
});

if (missingReactImports.length > 0) {
  console.log('\n❌ Found components missing React imports:');
  missingReactImports.forEach(file => console.log(`  - ${file}`));
  console.log('\nYou should add the import to these files.');
} else {
  console.log('\n✅ All UI components have React imported properly!');
}
