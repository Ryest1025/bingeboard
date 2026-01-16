#!/usr/bin/env node

/**
 * Version Sync Checker
 * 
 * Verifies that all version strings across the codebase are in sync.
 * Run this before committing to catch version mismatches.
 * 
 * Usage:
 *   node scripts/check-version-sync.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking version synchronization...\n');

// Extract version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const packageVersion = packageJson.version;

console.log(`📦 package.json version: ${packageVersion}`);

// Extract version from main.tsx
const mainTsxPath = path.join(__dirname, '..', 'client', 'src', 'main.tsx');
const mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');
const mainTsxVersionMatch = mainTsxContent.match(/\/\/ App Version (v[\d.]+)/);
const mainTsxVersion = mainTsxVersionMatch ? mainTsxVersionMatch[1].replace('v', '') : 'NOT FOUND';
const buildIdMatch = mainTsxContent.match(/const BUILD_ID = "(v[\d.]+-\d+-\d+)"/);
const buildId = buildIdMatch ? buildIdMatch[1] : 'NOT FOUND';

console.log(`📄 main.tsx version: ${mainTsxVersion}`);
console.log(`🏗️ main.tsx BUILD_ID: ${buildId}`);

// Extract version from index.html
const indexHtmlPath = path.join(__dirname, '..', 'client', 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
const cacheVersionMatch = indexHtmlContent.match(/<meta name="cache-version" content="(v[\d.]+)-/);
const cacheVersion = cacheVersionMatch ? cacheVersionMatch[1].replace('v', '') : 'NOT FOUND';
const jsVersionMatch = indexHtmlContent.match(/const CURRENT_VERSION = '(v[\d.]+)-/);
const jsVersion = jsVersionMatch ? jsVersionMatch[1].replace('v', '') : 'NOT FOUND';

console.log(`🌐 index.html cache-version: ${cacheVersion}`);
console.log(`📜 index.html JS version: ${jsVersion}\n`);

// Check if all versions match
const allVersions = [packageVersion, mainTsxVersion, cacheVersion, jsVersion];
const uniqueVersions = [...new Set(allVersions)];

if (uniqueVersions.length === 1 && uniqueVersions[0] !== 'NOT FOUND') {
  console.log('✅ All versions are in sync!\n');
  process.exit(0);
} else {
  console.log('❌ Version mismatch detected!\n');
  console.log('📋 Versions found:');
  console.log(`   package.json:          ${packageVersion}`);
  console.log(`   main.tsx:              ${mainTsxVersion}`);
  console.log(`   index.html (meta):     ${cacheVersion}`);
  console.log(`   index.html (script):   ${jsVersion}\n`);
  console.log('💡 Fix this by running:');
  console.log('   node scripts/bump-version.js patch "Sync versions"\n');
  process.exit(1);
}
