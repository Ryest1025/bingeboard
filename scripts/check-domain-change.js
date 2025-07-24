#!/usr/bin/env node

/**
 * Domain Change Checker
 * Monitors if the Replit domain has changed and alerts for OAuth URL updates
 */

const fs = require('fs');
const path = require('path');

const DOMAIN_FILE = path.join(__dirname, '../current-domain.txt');

function getCurrentDomain() {
  return process.env.REPLIT_DOMAINS || 'localhost';
}

function getStoredDomain() {
  try {
    return fs.readFileSync(DOMAIN_FILE, 'utf8').trim();
  } catch (error) {
    return null;
  }
}

function storeDomain(domain) {
  fs.writeFileSync(DOMAIN_FILE, domain);
}

function main() {
  const currentDomain = getCurrentDomain();
  const storedDomain = getStoredDomain();

  console.log(`Current domain: ${currentDomain}`);
  
  if (storedDomain && storedDomain !== currentDomain) {
    console.log('\n🚨 DOMAIN CHANGE DETECTED!');
    console.log(`Previous: ${storedDomain}`);
    console.log(`Current:  ${currentDomain}`);
    console.log('\n⚠️  OAUTH URLS NEED UPDATING:');
    console.log(`Google: https://${currentDomain}/api/auth/google/callback`);
    console.log(`Facebook: https://${currentDomain}/api/auth/facebook/callback`);
    console.log('\n📋 Update these URLs in:');
    console.log('- Google Cloud Console (OAuth Credentials)');
    console.log('- Facebook Developer Console (OAuth Settings)');
    console.log('\n💡 PERMANENT FIX: Set up custom domain joinbingeboard.com');
  } else if (!storedDomain) {
    console.log('First run - storing current domain');
  } else {
    console.log('✅ Domain unchanged - OAuth URLs still valid');
  }

  storeDomain(currentDomain);
}

main();