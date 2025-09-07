#!/usr/bin/env node

/**
 * Stability Check Script
 * Validates environment and dependencies before starting the server
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Running stability checks...\n');

let issues = [];

// Check 1: Environment file exists
if (!fs.existsSync('.env')) {
  issues.push('❌ .env file missing');
} else {
  console.log('✅ .env file exists');
  
  // Check 2: Required environment variables
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = ['TMDB_API_KEY', 'SESSION_SECRET'];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`) && 
                   !envContent.includes(`${varName}=your_`) && 
                   !envContent.includes(`${varName}=\n`);
    
    if (hasVar) {
      console.log(`✅ ${varName} configured`);
    } else {
      issues.push(`❌ ${varName} not configured in .env`);
    }
  });
}

// Check 3: Database file exists
if (fs.existsSync('./dev.db')) {
  console.log('✅ Database file exists');
} else {
  issues.push('❌ Database file missing (run npm run db:push)');
}

// Check 4: Node modules
if (fs.existsSync('./node_modules')) {
  console.log('✅ Dependencies installed');
} else {
  issues.push('❌ Dependencies missing (run npm install)');
}

// Check 5: TypeScript build
if (fs.existsSync('./client/dist')) {
  console.log('✅ Frontend built');
} else {
  console.log('⚠️  Frontend not built (will build automatically)');
}

console.log('\n' + '='.repeat(50));

if (issues.length === 0) {
  console.log('🎉 All stability checks passed!');
  console.log('Server should run without major issues.');
  process.exit(0);
} else {
  console.log('🚨 Stability issues found:');
  issues.forEach(issue => console.log(`   ${issue}`));
  console.log('\n💡 Fix these issues before starting the server.');
  
  if (issues.some(i => i.includes('TMDB_API_KEY'))) {
    console.log('\n📝 To get TMDB API key:');
    console.log('   1. Go to https://www.themoviedb.org/settings/api');
    console.log('   2. Create an account and request an API key');
    console.log('   3. Add it to your .env file');
  }
  
  process.exit(1);
}
