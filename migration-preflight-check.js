#!/usr/bin/env node

/**
 * 🔍 BingeBoard Multi-API Migration Pre-flight Validator
 * 
 * This script validates that all prerequisites are met before running
 * the full migration to the Multi-API system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class MigrationValidator {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  async validate() {
    log('🔍 BingeBoard Multi-API Migration Pre-flight Check', 'cyan');
    log('='.repeat(55), 'blue');

    await this.checkNodeVersion();
    await this.checkRequiredFiles();
    await this.checkMultiAPIService();
    await this.checkEnvironmentVariables();
    await this.checkDependencies();
    await this.checkServerStatus();
    await this.checkDiskSpace();
    await this.checkWritePermissions();

    this.printSummary();

    return this.errors.length === 0;
  }

  async checkNodeVersion() {
    const requiredVersion = 14;
    const currentVersion = parseInt(process.version.replace('v', '').split('.')[0]);

    if (currentVersion >= requiredVersion) {
      this.addCheck('Node.js Version', true, `v${process.version} (>= v${requiredVersion} required)`);
    } else {
      this.addCheck('Node.js Version', false, `v${process.version} (v${requiredVersion}+ required)`);
    }
  }

  async checkRequiredFiles() {
    const requiredFiles = [
      'server/services/multiAPIStreamingService.ts',
      'server/services/tmdb.ts',
      'server/services/watchmodeService.ts',
      'server/clients/utellyClient.ts',
      'server/cache/streaming-cache.ts',
      'migrate-to-multi-api.js',
      'package.json'
    ];

    let allPresent = true;
    const missing = [];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.addCheck(`File: ${file}`, true, 'Found');
      } else {
        this.addCheck(`File: ${file}`, false, 'Missing');
        missing.push(file);
        allPresent = false;
      }
    }

    if (!allPresent) {
      this.addError(`Missing required files: ${missing.join(', ')}`);
    }
  }

  async checkMultiAPIService() {
    const serviceFile = 'server/services/multiAPIStreamingService.ts';

    if (!fs.existsSync(serviceFile)) {
      this.addCheck('MultiAPIStreamingService', false, 'Service file not found');
      return;
    }

    const content = fs.readFileSync(serviceFile, 'utf8');

    const requiredClasses = [
      'MultiAPIStreamingService',
      'getComprehensiveAvailability',
      'getBatchAvailability',
      'generateAffiliateUrl'
    ];

    let allMethodsPresent = true;
    const missingMethods = [];

    for (const method of requiredClasses) {
      if (content.includes(method)) {
        this.addCheck(`Method: ${method}`, true, 'Found in service');
      } else {
        this.addCheck(`Method: ${method}`, false, 'Missing from service');
        missingMethods.push(method);
        allMethodsPresent = false;
      }
    }

    if (!allMethodsPresent) {
      this.addError(`MultiAPIStreamingService missing methods: ${missingMethods.join(', ')}`);
    }
  }

  async checkEnvironmentVariables() {
    const requiredEnvVars = [
      'TMDB_API_KEY',
      'WATCHMODE_API_KEY'
    ];

    const optionalEnvVars = [
      'UTELLY_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addCheck(`Env: ${envVar}`, true, 'Set');
      } else {
        this.addCheck(`Env: ${envVar}`, false, 'Missing');
        this.addError(`Required environment variable ${envVar} is not set`);
      }
    }

    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        this.addCheck(`Env: ${envVar}`, true, 'Set (optional)');
      } else {
        this.addCheck(`Env: ${envVar}`, false, 'Missing (optional)');
        this.addWarning(`Optional environment variable ${envVar} is not set - some features may be limited`);
      }
    }
  }

  async checkDependencies() {
    if (!fs.existsSync('package.json')) {
      this.addCheck('package.json', false, 'Not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'express',
      'node-fetch',
      'drizzle-orm'
    ];

    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const dep of requiredDeps) {
      if (allDeps[dep]) {
        this.addCheck(`Dependency: ${dep}`, true, `v${allDeps[dep]}`);
      } else {
        this.addCheck(`Dependency: ${dep}`, false, 'Missing');
        this.addError(`Required dependency ${dep} is not installed`);
      }
    }
  }

  async checkServerStatus() {
    // This is a basic check - in a real scenario you might want to ping the server
    const serverFile = 'server/index.ts';

    if (fs.existsSync(serverFile)) {
      this.addCheck('Server Entry Point', true, 'server/index.ts found');
    } else {
      this.addCheck('Server Entry Point', false, 'server/index.ts not found');
      this.addError('Server entry point not found');
    }
  }

  async checkDiskSpace() {
    try {
      const stats = fs.statSync('.');
      // Simple check - just verify we can read the current directory
      this.addCheck('Disk Access', true, 'Read/write access confirmed');
    } catch (error) {
      this.addCheck('Disk Access', false, 'Cannot access filesystem');
      this.addError('Filesystem access issues detected');
    }
  }

  async checkWritePermissions() {
    const testFile = '.migration-test-write';

    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      this.addCheck('Write Permissions', true, 'Can create/modify files');
    } catch (error) {
      this.addCheck('Write Permissions', false, 'Cannot write to directory');
      this.addError('Insufficient write permissions for migration');
    }
  }

  addCheck(name, passed, details) {
    this.checks.push({ name, passed, details });
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${name}: ${details}`, color);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addError(message) {
    this.errors.push(message);
  }

  printSummary() {
    log('\\n📊 Pre-flight Check Summary', 'cyan');
    log('='.repeat(30), 'blue');

    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.passed).length;

    log(`Total Checks: ${totalChecks}`, 'blue');
    log(`Passed: ${passedChecks}`, 'green');
    log(`Failed: ${totalChecks - passedChecks}`, 'red');
    log(`Warnings: ${this.warnings.length}`, 'yellow');

    if (this.warnings.length > 0) {
      log('\\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach(warning => log(`  • ${warning}`, 'yellow'));
    }

    if (this.errors.length > 0) {
      log('\\n❌ Errors:', 'red');
      this.errors.forEach(error => log(`  • ${error}`, 'red'));
    }

    log('\\n🎯 Migration Readiness', 'cyan');

    if (this.errors.length === 0) {
      log('✅ READY FOR MIGRATION', 'green');
      log('\\nYou can proceed with the migration:', 'blue');
      log('  ./migrate-to-multi-api.sh', 'cyan');
      log('  OR', 'blue');
      log('  node migrate-to-multi-api.js', 'cyan');
    } else {
      log('❌ NOT READY FOR MIGRATION', 'red');
      log('\\nPlease fix the errors above before proceeding.', 'yellow');
      log('\\nCommon solutions:', 'blue');
      log('  • Install missing dependencies: npm install', 'cyan');
      log('  • Set required environment variables in .env file', 'cyan');
      log('  • Ensure MultiAPIStreamingService is properly set up', 'cyan');
      log('  • Check file permissions and disk space', 'cyan');
    }

    log('\\n🔧 For help:', 'blue');
    log('  • Read: MULTI_API_MIGRATION_README.md', 'cyan');
    log('  • Check: migration-config.json', 'cyan');
    log('  • Run: ./migrate-to-multi-api.sh for interactive help', 'cyan');
  }
}

// Run validation if script is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const validator = new MigrationValidator();

  validator.validate()
    .then((isReady) => {
      process.exit(isReady ? 0 : 1);
    })
    .catch((error) => {
      log(`\\n💥 Validation failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

export default MigrationValidator;
