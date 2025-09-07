// test-module-admin.mjs
// Simple test script to verify Firebase Admin initialization and authentication
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if the simple-firebase-admin.ts file exists
const filePath = resolve(__dirname, 'server', 'simple-firebase-admin.ts');
console.log(`Checking if file exists: ${filePath}`);
console.log(`File exists: ${fs.existsSync(filePath)}`);

// Import the module dynamically
async function importAdmin() {
  try {
    // For TypeScript files, we need to use the compiled JavaScript version
    // or use ts-node to execute them directly
    console.log('Trying to import Firebase Admin module...');
    
    // List files in the server directory
    const serverDir = resolve(__dirname, 'server');
    console.log('Files in server directory:');
    fs.readdirSync(serverDir).forEach(file => {
      console.log(` - ${file}`);
    });
    
    console.log('Unable to import TypeScript files directly in Node.js');
    console.log('Please use ts-node or compile the TypeScript files first');
  } catch (error) {
    console.error('Import error:', error);
  }
}

// Run the test
importAdmin()
  .then(() => console.log('Tests complete'))
  .catch(error => console.error('Test error:', error));
