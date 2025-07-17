// Utility script to fix import paths
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all UI component files
const uiDir = path.resolve(__dirname, 'client/src/components/ui');
const files = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

// Process each file
files.forEach(file => {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace @/lib/utils with relative path
  content = content.replace(/from\s+["']@\/lib\/utils["']/g, 'from "../../lib/utils"');

  // Replace other common imports with relative paths
  content = content.replace(/from\s+["']@\/hooks\/(.*?)["']/g, 'from "../../hooks/$1"');
  content = content.replace(/from\s+["']@\/components\/ui\/(.*?)["']/g, 'from "./$1"');
  content = content.replace(/from\s+["']@\/components\/(.*?)["']/g, 'from "../$1"');

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated imports in ${file}`);
});

console.log('All UI component imports updated successfully!');
