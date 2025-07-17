// Fix imports in landing page
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to landing page
const landingPath = path.resolve(__dirname, 'client/src/pages/landing.tsx');

// Process landing page
console.log(`Updating imports in landing.tsx...`);
let content = fs.readFileSync(landingPath, 'utf8');

// Replace UI component imports
content = content.replace(/from\s+["']@\/components\/ui\/(.*?)["']/g, 'from "../components/ui/$1"');

// Replace other common imports
content = content.replace(/from\s+["']@\/hooks\/(.*?)["']/g, 'from "../hooks/$1"');
content = content.replace(/from\s+["']@\/components\/(.*?)["']/g, 'from "../components/$1"');
content = content.replace(/from\s+["']@\/lib\/(.*?)["']/g, 'from "../lib/$1"');

// Write the updated content back to the file
fs.writeFileSync(landingPath, content);
console.log('Landing page imports updated successfully!');

// Also fix App.tsx
const appPath = path.resolve(__dirname, 'client/src/App.tsx');
console.log(`Checking App.tsx...`);
let appContent = fs.readFileSync(appPath, 'utf8');

// Make sure React is imported
if (!appContent.includes('import React from "react"')) {
  appContent = 'import React from "react";\n' + appContent;
  console.log('Added React import to App.tsx');
}

// Write the updated content back to the file
fs.writeFileSync(appPath, appContent);
console.log('App.tsx updated successfully!');
