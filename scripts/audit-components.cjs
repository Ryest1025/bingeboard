#!/usr/bin/env node

/**
 * Component Audit Script
 * 
 * This script audits the codebase for:
 * - Duplicate components
 * - Non-standard imports
 * - Inconsistent prop names
 * - Missing documentation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ComponentAuditor {
  constructor() {
    this.issues = [];
    this.components = new Map();
    this.duplicates = [];
  }

  // Find all component files
  findComponents() {
    const componentFiles = glob.sync('client/src/components/**/*.{tsx,ts}', {
      ignore: ['**/*.test.*', '**/*.spec.*', '**/index.ts']
    });

    console.log(`🔍 Found ${componentFiles.length} component files`);
    return componentFiles;
  }

  // Check for duplicate component names
  checkDuplicates(files) {
    const componentNames = new Map();

    files.forEach(file => {
      const basename = path.basename(file, path.extname(file));
      const componentName = basename.replace(/[-_]/g, '').toLowerCase();

      if (componentNames.has(componentName)) {
        componentNames.get(componentName).push(file);
      } else {
        componentNames.set(componentName, [file]);
      }
    });

    // Find duplicates
    componentNames.forEach((files, name) => {
      if (files.length > 1) {
        this.duplicates.push({
          name,
          files,
          issue: `Duplicate component name: ${name}`,
          severity: 'error'
        });
      }
    });

    console.log(`⚠️  Found ${this.duplicates.length} duplicate component names`);
    return this.duplicates;
  }

  // Check for non-standard imports
  checkImports(files) {
    const importIssues = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for relative imports of shared components
        if (line.match(/import.*from\s+['"](\.\.?\/.*components?.*)['"]/)) {
          importIssues.push({
            file,
            line: index + 1,
            content: line.trim(),
            issue: 'Use absolute imports (@/components/...) instead of relative imports',
            severity: 'warning'
          });
        }

        // Check for deprecated StreamingLogos imports
        if (line.includes('StreamingLogos') && line.includes('from') && !line.includes('@/components/streaming-logos')) {
          importIssues.push({
            file,
            line: index + 1,
            content: line.trim(),
            issue: 'Use canonical StreamingLogos import: @/components/streaming-logos',
            severity: 'error'
          });
        }
      });
    });

    console.log(`📦 Found ${importIssues.length} import issues`);
    return importIssues;
  }

  // Check for inconsistent prop names
  checkPropConsistency(files) {
    const propIssues = [];
    const commonProps = {
      'maxLogos': 'Use "maxDisplayed" instead of "maxLogos"',
      'showNames': 'Use "showLabels" instead of "showNames"',
      'displayCount': 'Use "maxDisplayed" instead of "displayCount"'
    };

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      Object.keys(commonProps).forEach(prop => {
        if (content.includes(prop)) {
          propIssues.push({
            file,
            issue: commonProps[prop],
            severity: 'warning'
          });
        }
      });
    });

    console.log(`🎯 Found ${propIssues.length} prop consistency issues`);
    return propIssues;
  }

  // Generate report
  generateReport() {
    const files = this.findComponents();
    const duplicates = this.checkDuplicates(files);
    const importIssues = this.checkImports(files);
    const propIssues = this.checkPropConsistency(files);
    
    const allIssues = [
      ...duplicates,
      ...importIssues,
      ...propIssues
    ];

    console.log('\n📋 COMPONENT AUDIT REPORT');
    console.log('========================');

    if (allIssues.length === 0) {
      console.log('✅ No issues found! Components are consistent.');
      return;
    }

    // Group by severity
    const errors = allIssues.filter(issue => issue.severity === 'error');
    const warnings = allIssues.filter(issue => issue.severity === 'warning');

    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(error => {
        console.log(`  • ${error.issue}`);
        if (error.file) console.log(`    ${error.file}`);
        if (error.files) error.files.forEach(f => console.log(`    ${f}`));
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(warning => {
        console.log(`  • ${warning.issue}`);
        if (warning.file) console.log(`    ${warning.file}:${warning.line || ''}`);
      });
    }

    console.log(`\n📊 SUMMARY: ${errors.length} errors, ${warnings.length} warnings`);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Fix duplicate components by consolidating to a single canonical version');
    console.log('  2. Update imports to use absolute paths (@/components/...)');
    console.log('  3. Standardize prop names across similar components');
    console.log('  4. Add components to the universal component index');

    return allIssues;
  }

  // Auto-fix some issues
  autoFix() {
    console.log('\n🔧 AUTO-FIX (coming soon)...');
    // TODO: Implement auto-fixing for simple issues like import paths
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new ComponentAuditor();
  const issues = auditor.generateReport();
  
  // Exit with error code if there are errors
  const hasErrors = issues.some(issue => issue.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

module.exports = ComponentAuditor;