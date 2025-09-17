
// Migration Rollback Utility
// Usage: node migration-rollback.js

const fs = require('fs');
const path = require('path');

class MigrationRollback {
  static rollback(backupDir) {
    if (!backupDir || !fs.existsSync(backupDir)) {
      console.error('❌ Backup directory not found:', backupDir);
      return false;
    }

    console.log('🔄 Rolling back Multi-API migration...');
    
    try {
      this.restoreFiles(backupDir);
      console.log('✅ Rollback completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      return false;
    }
  }

  static restoreFiles(backupDir) {
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          walkDir(fullPath);
        } else {
          const relativePath = path.relative(backupDir, fullPath);
          const targetPath = path.join(process.cwd(), relativePath);
          
          // Create target directory if it doesn't exist
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          fs.copyFileSync(fullPath, targetPath);
          console.log(`  ✓ Restored: ${relativePath}`);
        }
      }
    };

    walkDir(backupDir);
  }
}

if (require.main === module) {
  const backupDir = process.argv[2];
  if (!backupDir) {
    console.error('Usage: node migration-rollback.js <backup-directory>');
    process.exit(1);
  }
  
  MigrationRollback.rollback(backupDir);
}

module.exports = MigrationRollback;
