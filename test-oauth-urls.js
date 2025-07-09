#!/usr/bin/env node

/**
 * OAuth URL Test Script
 * Tests if OAuth provider consoles are properly configured
 */

import https from 'https';
import http from 'http';

const CURRENT_DOMAIN = '80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev';

function testURL(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https://') ? https : http;
    
    const req = client.request(url, { method: 'GET' }, (res) => {
      console.log(`${description}: Status ${res.statusCode}`);
      if (res.statusCode === 302) {
        console.log(`  → Redirects to: ${res.headers.location}`);
        if (res.headers.location && res.headers.location.includes('accounts.google.com')) {
          console.log(`  ✅ Google OAuth redirect working`);
        } else if (res.headers.location && res.headers.location.includes('facebook.com')) {
          console.log(`  ✅ Facebook OAuth redirect working`);
        }
      }
      resolve({ status: res.statusCode, location: res.headers.location });
    });
    
    req.on('error', (err) => {
      console.log(`${description}: Error - ${err.message}`);
      resolve({ status: 0, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`${description}: Timeout`);
      req.destroy();
      resolve({ status: 0, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function main() {
  console.log('\n=== OAuth URL Test ===');
  console.log(`Current domain: ${CURRENT_DOMAIN}`);
  
  console.log('\n1. Testing Google OAuth...');
  const googleResult = await testURL(
    `https://${CURRENT_DOMAIN}/api/auth/google`,
    'Google OAuth'
  );
  
  console.log('\n2. Testing Facebook OAuth...');  
  const facebookResult = await testURL(
    `https://${CURRENT_DOMAIN}/api/auth/facebook`,
    'Facebook OAuth'
  );
  
  console.log('\n=== Results Summary ===');
  
  if (googleResult.status === 302 && googleResult.location?.includes('accounts.google.com')) {
    console.log('✅ Google OAuth: Server configured correctly');
    console.log('❌ Google OAuth: Needs callback URL in Google Cloud Console');
    console.log(`   Add: https://${CURRENT_DOMAIN}/api/auth/google/callback`);
  } else {
    console.log('❌ Google OAuth: Server configuration issue');
  }
  
  if (facebookResult.status === 302 && facebookResult.location?.includes('facebook.com')) {
    console.log('✅ Facebook OAuth: Server configured correctly');
    console.log('❌ Facebook OAuth: Needs callback URL in Facebook Developer Console');
    console.log(`   Add: https://${CURRENT_DOMAIN}/api/auth/facebook/callback`);
  } else {
    console.log('❌ Facebook OAuth: Server configuration issue');
  }
  
  console.log('\n=== Required Actions ===');
  console.log('1. Google Cloud Console:');
  console.log('   https://console.cloud.google.com/apis/credentials');
  console.log('   OAuth 2.0 Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com');
  console.log(`   Add redirect URI: https://${CURRENT_DOMAIN}/api/auth/google/callback`);
  
  console.log('\n2. Facebook Developer Console:');
  console.log('   https://developers.facebook.com/apps/1407155243762479/fb-login/settings/');
  console.log(`   Add redirect URI: https://${CURRENT_DOMAIN}/api/auth/facebook/callback`);
  
  console.log('\n3. Test after updating:');
  console.log(`   https://${CURRENT_DOMAIN}/login`);
  console.log('   Click Google/Facebook login buttons');
}