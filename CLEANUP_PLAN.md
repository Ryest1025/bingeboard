# 🧹 BingeBoard Cleanup Plan
## Date: July 20, 2025
## Goal: Remove outdated code while preserving working configuration

---

## 🔒 **PROTECTED FILES - DO NOT REMOVE**
### Core Working Configuration
- `WORKING_CONFIG_LOCKDOWN.md` - Lockdown documentation
- `EMERGENCY_RESTORE.sh` - Recovery script  
- `quick-recovery.sh` - Quick recovery
- `.critical-files-warning` - Protection warning

### Essential Application Files
- `client/` - React frontend (KEEP ALL)
- `server/` - Express backend (KEEP ALL) 
- `shared/` - Shared utilities
- `package.json` & `package-lock.json`
- `vite.config.ts` & `tailwind.config.ts`
- `tsconfig.json`
- `components.json`
- `.env`, `.env.example`

---

## 🗑️ **FILES TO REMOVE**

### Old Test/Debug Files
- `firebase-diagnostic.html`
- `firebase-social-test.html` 
- `firebase-test-local.html`
- `mobile-*.html` (all mobile test files)
- `test-*.html` (all test files)
- `test-*.js` (all test scripts)
- `simple-server.js`
- `server-debug.mjs`

### Archive & Backup Files  
- `archive/` (entire directory)
- `WORKING_BACKUP_LANDING.tsx`
- `bingeboardapp-backup.bundle`
- `bfg.jar`
- `cookies.txt`

### Old Scripts & Tools
- `fix-*.mjs` & `fix-*.js` (all fix scripts)
- `check*.js` & `check*.mjs`
- `create-test-user.js` & `create_user.mjs`
- `monitor-errors.mjs`
- `verify-*.sh` & `verify-*.js`

### Batch Files & Old Starters
- `*.bat` files (Windows batch files)
- `start-dynamic.sh`
- `quick-start.bat`
- `restart-dev-server.bat`
- `start-*.bat`

### Old Documentation (Outdated)
- `AUTHENTICATION_DOCUMENTATION.md`
- `AUTHENTICATION_PROGRESS.md` 
- `DEVELOPMENT_PROGRESS.md`
- `STABILITY_STATUS.md`
- `TOMORROW_TODO.md`
- `CODE_PROTECTION.md`
- `IMPROVEMENT_PLAN.md`
- `QUICK_RECOVERY.md` (duplicate of script)

### Old Configuration
- `drizzle.config.local.ts` (if using Drizzle)
- `index.html` (root level - replaced by client/index.html)
- `postcss.config.js` (if not needed)
- `localhost.conf`, `localhost.crt`, `localhost.key`
- `generate-ssl.*`

### Test Data
- `test_viewing_history.csv`
- `test-component.tsx` (if standalone)
- `database.sqlite` (if old test data)
- `dev.db` (if old test data)

---

## ❓ **REVIEW FILES** (Check before removing)
- `migrations/` - Keep if database migrations needed
- `tests/` - Keep if contains useful tests  
- `docs/` - Keep if contains useful documentation
- `android/` & `ios/` - Keep if mobile app needed
- `dist/` - Can remove (build output)
- `public/` - Clean up test files but keep essentials

---

## 🎯 **Cleanup Strategy**
1. **Backup first** - Ensure working state is committed
2. **Remove in batches** - Test after each batch
3. **Keep emergency restore** - Always have recovery option
4. **Update .gitignore** - Add patterns for future cleanup

---

## ⚠️ **SAFETY RULES**
- Never remove core application directories (`client/`, `server/`)
- Keep all package files and configs
- Preserve all working lockdown files
- Test application after each cleanup batch
