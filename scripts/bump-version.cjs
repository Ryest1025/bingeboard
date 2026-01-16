#!/usr/bin/env node

/**
 * Automated Version Bump Script
 * 
 * Updates version numbers across all files that need to stay in sync:
 * - client/src/main.tsx (BUILD_ID and version comment)
 * - client/index.html (cache-version, build-time, version check script)
 * - package.json (version field)
 * 
 * Usage:
 *   node scripts/bump-version.js [patch|minor|major] [description]
 *   
 * Examples:
 *   node scripts/bump-version.js patch "Fix login loop"
 *   node scripts/bump-version.js minor "Add SMS recovery"
 *   node scripts/bump-version.js major "Complete redesign"
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const [,, bumpType = 'patch', ...descriptionParts] = process.argv;
const description = descriptionParts.join(' ') || 'Version update';

const validBumpTypes = ['patch', 'minor', 'major'];
if (!validBumpTypes.includes(bumpType)) {
  console.error('❌ Invalid bump type. Use: patch, minor, or major');
  process.exit(1);
}

// Get current date/time
const now = new Date();
const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // 20260116
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').slice(0, 4) + '00'; // 125000
const buildTimestamp = `${dateStr}-${timeStr}`;
const readableDate = now.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});

console.log('🔧 BingeBoard Version Bump Utility');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Read package.json to get current version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

const versionString = `v${newVersion}`;
const slugifiedDescription = description.toLowerCase().replace(/[^a-z0-9]+/g, '-');

console.log(`📦 Current version: ${currentVersion}`);
console.log(`📦 New version: ${newVersion}`);
console.log(`📝 Description: ${description}`);
console.log(`🕐 Build timestamp: ${buildTimestamp}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Update package.json
console.log('1️⃣ Updating package.json...');
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('   ✅ package.json updated\n');

// Update client/src/main.tsx
console.log('2️⃣ Updating client/src/main.tsx...');
const mainTsxPath = path.join(__dirname, '..', 'client', 'src', 'main.tsx');
let mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');

const mainTsxUpdates = [
  {
    pattern: /\/\/ App Version [\d.v-]+ - .+ \(.+\)/,
    replacement: `// App Version ${versionString} - ${description} (${readableDate})`
  },
  {
    pattern: /\/\/ Build timestamp: .+/,
    replacement: `// Build timestamp: ${now.toISOString()}`
  },
  {
    pattern: /const BUILD_ID = "v[\d.]+-\d+-\d+";/,
    replacement: `const BUILD_ID = "${versionString}-${buildTimestamp}";`
  }
];

mainTsxUpdates.forEach(({ pattern, replacement }) => {
  mainTsxContent = mainTsxContent.replace(pattern, replacement);
});

fs.writeFileSync(mainTsxPath, mainTsxContent);
console.log('   ✅ main.tsx updated\n');

// Update client/index.html
console.log('3️⃣ Updating client/index.html...');
const indexHtmlPath = path.join(__dirname, '..', 'client', 'index.html');
let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const indexHtmlUpdates = [
  {
    pattern: /<!-- NUCLEAR CACHE BUSTING - .+ \(v[\d.]+ - .+\) -->/,
    replacement: `<!-- NUCLEAR CACHE BUSTING - ${readableDate} (${versionString} - ${description}) -->`
  },
  {
    pattern: /<meta name="build-time" content="\d+-\d+">/,
    replacement: `<meta name="build-time" content="${buildTimestamp}">`
  },
  {
    pattern: /<meta name="cache-version" content="v[\d.]+-[^"]+">/,
    replacement: `<meta name="cache-version" content="${versionString}-${slugifiedDescription}">`
  },
  {
    pattern: /const CURRENT_VERSION = 'v[\d.]+-[^']+';/,
    replacement: `const CURRENT_VERSION = '${versionString}-${slugifiedDescription}';`
  },
  {
    pattern: /<!-- IMMEDIATE CACHE CHECK - .+ - Runs BEFORE any modules load -->/,
    replacement: `<!-- IMMEDIATE CACHE CHECK - ${readableDate} - Runs BEFORE any modules load -->`
  }
];

indexHtmlUpdates.forEach(({ pattern, replacement }) => {
  indexHtmlContent = indexHtmlContent.replace(pattern, replacement);
});

fs.writeFileSync(indexHtmlPath, indexHtmlContent);
console.log('   ✅ index.html updated\n');

// Create version info file for reference
const versionInfoPath = path.join(__dirname, '..', 'VERSION_INFO.json');
const versionInfo = {
  version: newVersion,
  versionString,
  buildTimestamp,
  description,
  date: now.toISOString(),
  readableDate,
  bumpType,
  files: [
    'package.json',
    'client/src/main.tsx',
    'client/index.html'
  ]
};

fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2) + '\n');
console.log('4️⃣ Created VERSION_INFO.json\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Version bump complete!\n');
console.log('📋 Summary:');
console.log(`   Version: ${currentVersion} → ${newVersion}`);
console.log(`   Build ID: ${versionString}-${buildTimestamp}`);
console.log(`   Description: ${description}`);
console.log('\n💡 Next steps:');
console.log('   1. Review changes: git diff');
console.log(`   2. Commit: git commit -am "${versionString}: ${description}"`);
console.log('   3. Push: git push origin main');
console.log('   4. Wait 2-3 minutes for deployment');
console.log('   5. Hard refresh browser (Ctrl+Shift+R)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
