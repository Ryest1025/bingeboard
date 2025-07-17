// Fix missing React imports in UI components
import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'client', 'src', 'components');
const pagesDir = path.join(process.cwd(), 'client', 'src', 'pages');

// Process a directory recursively
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fixReactImport(filePath);
    }
  }
}

// Fix React import in a file
function fixReactImport(filePath) {
  console.log(`Checking ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if the file uses JSX/TSX syntax (contains angle brackets with component-like usage)
  const hasJSX = /<[A-Z][A-Za-z]*(\s+[^>]*)?\/?>/.test(content) ||
    /<\/[A-Z][A-Za-z]*>/.test(content);

  if (!hasJSX) {
    console.log(`  - No JSX detected, skipping.`);
    return;
  }

  // Check if React is already imported
  const hasReactImport = /import\s+(\*\s+as\s+)?React/.test(content) ||
    /import\s+{\s*.*?\bReact\b.*?\s*}/.test(content);

  if (hasReactImport) {
    console.log(`  - React already imported, skipping.`);
    return;
  }

  // Add React import at the beginning of the file
  content = `import * as React from "react";\n${content}`;

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`  - Added React import to ${path.basename(filePath)}`);
}

// Start processing
console.log('Fixing React imports in UI components...');
processDirectory(componentsDir);
processDirectory(pagesDir);
console.log('Done!');
