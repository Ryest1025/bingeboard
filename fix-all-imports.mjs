// Comprehensive import path fixer
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Calculate relative path to src directory
    const relativePathToSrc = path.relative(path.dirname(filePath), path.resolve(__dirname, 'client/src')).replace(/\\/g, '/');
    
    // Replace imports using @ with relative paths
    content = content.replace(/from\s+["']@\/lib\/(.*?)["']/g, `from "${relativePathToSrc}/lib/$1"`);
    content = content.replace(/from\s+["']@\/hooks\/(.*?)["']/g, `from "${relativePathToSrc}/hooks/$1"`);
    content = content.replace(/from\s+["']@\/components\/ui\/(.*?)["']/g, `from "${relativePathToSrc}/components/ui/$1"`);
    content = content.replace(/from\s+["']@\/components\/(.*?)["']/g, `from "${relativePathToSrc}/components/$1"`);
    content = content.replace(/from\s+["']@\/pages\/(.*?)["']/g, `from "${relativePathToSrc}/pages/$1"`);
    content = content.replace(/from\s+["']@\/firebase\/(.*?)["']/g, `from "${relativePathToSrc}/firebase/$1"`);
    
    // Write back only if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Process files in a directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let changedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      changedFiles += processDirectory(filePath);
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.endsWith('.d.ts')) {
      if (fixImportsInFile(filePath)) {
        console.log(`Updated imports in ${filePath}`);
        changedFiles++;
      }
    }
  }
  
  return changedFiles;
}

// Main directories to process
const directories = [
  path.resolve(__dirname, 'client/src/components'),
  path.resolve(__dirname, 'client/src/pages'),
  path.resolve(__dirname, 'client/src')
];

// Process each directory
let totalChangedFiles = 0;
for (const dir of directories) {
  totalChangedFiles += processDirectory(dir);
}

console.log(`Fixed imports in ${totalChangedFiles} files successfully!`);
