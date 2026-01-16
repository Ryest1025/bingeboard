# 🚀 Deployment & Version Management Guide

**Last Updated:** January 16, 2026  
**Current System:** Automated version sync across all files

---

## 🎯 The Problem We Solved

**Before:** Manual version updates led to:
- ❌ Version numbers out of sync across files
- ❌ Browser cache serving old versions
- ❌ Users seeing outdated code with missing features
- ❌ Infinite loops from mismatched versions
- ❌ Manual hunting through 3+ files to update versions

**After:** Automated system ensures:
- ✅ Single command updates all version references
- ✅ Automatic cache busting on every deployment
- ✅ CI/CD checks prevent version mismatches
- ✅ Users always get latest version
- ✅ No more manual version hunting

---

## 🔧 How to Deploy Changes

### Option 1: Automated Version Bump (RECOMMENDED)

Use this for any change you want to deploy:

```bash
# For bug fixes
node scripts/bump-version.js patch "Fix login loop"

# For new features
node scripts/bump-version.js minor "Add SMS recovery"

# For breaking changes
node scripts/bump-version.js major "New UI redesign"
```

**What it does automatically:**
1. ✅ Updates `package.json` version
2. ✅ Updates `client/src/main.tsx` (BUILD_ID + comment)
3. ✅ Updates `client/index.html` (cache-version + build-time)
4. ✅ Creates `VERSION_INFO.json` for reference
5. ✅ Shows you the git commands to run next

**Then commit and push:**
```bash
git add -A
git commit -m "v16.15: Fix login loop"
git push origin main
```

### Option 2: Manual Update (Not Recommended)

If you really need to update manually, you must update these 3 files:

1. **package.json:**
   ```json
   {
     "version": "16.15.0"
   }
   ```

2. **client/src/main.tsx:**
   ```typescript
   // App Version v16.15 - Description (Jan 16, 2026)
   // Build timestamp: 2026-01-16T12:50:00Z
   const BUILD_ID = "v16.15-20260116-125000";
   ```

3. **client/index.html:**
   ```html
   <!-- NUCLEAR CACHE BUSTING - January 16, 2026 (v16.15 - Description) -->
   <meta name="build-time" content="20260116-125000">
   <meta name="cache-version" content="v16.15-description">
   
   <!-- Inside script tag: -->
   const CURRENT_VERSION = 'v16.15-description';
   ```

---

## 🔍 Checking Version Sync

Before committing, verify all versions match:

```bash
node scripts/check-version-sync.js
```

**Output if synced:**
```
✅ All versions are in sync!
```

**Output if mismatched:**
```
❌ Version mismatch detected!
   package.json:          16.14.0
   main.tsx:              16.13.0
   index.html (meta):     16.15.0
```

---

## 🤖 Automated CI/CD Checks

A GitHub Action runs on every PR and commit to check version sync:

**File:** `.github/workflows/version-check.yml`

**What it does:**
- Runs `check-version-sync.js` automatically
- Fails the build if versions don't match
- Comments on PRs with fix instructions
- Prevents deployment of mismatched versions

---

## 📦 Version Numbering Convention

We use **Semantic Versioning** (semver):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── Bug fixes, small tweaks
  │     └───────── New features, non-breaking changes
  └─────────────── Breaking changes, major rewrites
```

**Examples:**
- `16.14.0 → 16.14.1` - Fixed login bug (patch)
- `16.14.1 → 16.15.0` - Added SMS recovery (minor)
- `16.15.0 → 17.0.0` - Complete UI overhaul (major)

---

## 🚨 Emergency Hotfix Process

For critical production bugs:

```bash
# 1. Fix the bug
# 2. Bump version
node scripts/bump-version.js patch "HOTFIX: Critical login issue"

# 3. Commit with HOTFIX prefix
git add -A
git commit -m "HOTFIX v16.14.2: Critical login issue"

# 4. Push immediately
git push origin main

# 5. Monitor deployment
# GitHub Actions: ~2 minutes build + deploy
# Cache propagation: ~1-3 minutes
# Total: 3-5 minutes to production
```

---

## 🌐 Deployment Pipeline

### Step 1: GitHub Actions Trigger

**Workflow:** `.github/workflows/pages.yml`

**Triggers on:**
- Push to `main` branch
- Changes to `client/**` files
- Manual workflow dispatch

**Build process:**
1. Checkout code
2. Install dependencies
3. Run `npm run build:pages`
4. Upload to GitHub Pages
5. Deploy (~2 minutes total)

### Step 2: Cache Invalidation

**How it works:**
1. New `cache-version` in `<meta>` tag
2. New `build-time` timestamp
3. JavaScript version check on page load
4. Auto-clears localStorage if mismatch
5. Forces browser to fetch new files

**Cache layers handled:**
- ✅ Browser HTTP cache (meta tags)
- ✅ Service workers (unregistered on load)
- ✅ localStorage (cleared on version change)
- ✅ sessionStorage (cleared on version change)

### Step 3: User Experience

**On first visit after deployment:**
1. Browser loads new `index.html`
2. JS version check detects mismatch
3. Clears old cached data (except auth)
4. Loads new JavaScript bundle
5. User sees latest version

**No action required from user** (auto-refresh on version change)

---

## 📊 Monitoring Deployments

### Check Deployment Status

```bash
# View recent deployments
gh run list --workflow=pages.yml --limit 5

# View specific deployment
gh run view <run-id>

# View deployment logs
gh run view <run-id> --log
```

### Verify Version in Production

```bash
# Check deployed version
curl -s https://bingeboardapp.com/ | grep -E "cache-version|CURRENT_VERSION"

# Should return:
# <meta name="cache-version" content="v16.15-fix-login-loop">
# const CURRENT_VERSION = 'v16.15-fix-login-loop';
```

### Check Backend Status

```bash
# Test backend API
curl https://bingeboard-two.vercel.app/api/auth/status

# Should return:
# {"isAuthenticated":false,"user":null}
```

---

## 🐛 Troubleshooting

### Issue: Users Still Seeing Old Version

**Cause:** Browser aggressive caching

**Fix:**
```bash
# 1. Bump version again (force new cache-version)
node scripts/bump-version.js patch "Force cache refresh"
git add -A && git commit -m "v16.14.3: Force cache refresh" && git push

# 2. Tell users to hard refresh
# Chrome/Firefox: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
# Safari: Cmd+Option+R
```

### Issue: Version Check Script Fails

**Cause:** Versions out of sync

**Fix:**
```bash
node scripts/bump-version.js patch "Sync versions"
```

### Issue: GitHub Action Fails to Deploy

**Cause:** Build errors or missing files

**Fix:**
```bash
# 1. Check workflow logs
gh run view --log

# 2. Test build locally
npm run build:pages

# 3. Fix errors and redeploy
git commit --amend
git push --force origin main
```

### Issue: Login Loop Still Happening

**Cause:** State sync timing or cache issues

**Check:**
1. Verify v16.14+ is deployed
2. Hard refresh browser
3. Clear all site data (F12 → Application → Clear storage)
4. Check console logs for auth state

---

## 📝 Best Practices

### DO ✅
- Always use `bump-version.js` for version updates
- Run `check-version-sync.js` before committing
- Use descriptive version descriptions
- Wait 3-5 minutes after push for full deployment
- Test on production after deployment

### DON'T ❌
- Don't manually edit version numbers
- Don't skip version bumps for "small" changes
- Don't push without running version check
- Don't assume deployment is instant
- Don't forget to update version on hotfixes

---

## 🔗 Related Files

**Version Scripts:**
- `scripts/bump-version.js` - Automated version bumper
- `scripts/check-version-sync.js` - Version sync checker
- `VERSION_INFO.json` - Last version bump metadata

**Workflows:**
- `.github/workflows/pages.yml` - Frontend deployment
- `.github/workflows/version-check.yml` - Version sync CI
- `.github/workflows/deploy-backend.yml` - Backend deployment

**Version References:**
- `package.json` - Node package version
- `client/src/main.tsx` - Build ID and version comment
- `client/index.html` - Cache version and JS version check

---

## 🚀 Quick Reference

**Most common command:**
```bash
node scripts/bump-version.js patch "Description" && \
git add -A && \
git commit -m "v$(node -p "require('./package.json').version"): Description" && \
git push origin main
```

**Check if deployment is done:**
```bash
# Should match your new version
curl -s https://bingeboardapp.com/ | grep cache-version
```

**Emergency rollback:**
```bash
git revert HEAD
git push origin main
```

---

## 📞 Support

**Version issues?** Run:
```bash
node scripts/check-version-sync.js
```

**Deployment issues?** Check:
```bash
gh run list --workflow=pages.yml --limit 1
```

**Still stuck?** Check these docs:
- `AUTH_STATE_SYNC_GUARANTEE.md` - Authentication flow
- `PASSWORD_RECOVERY_TESTING.md` - Password reset testing
- `SMS_RECOVERY_PRODUCTION_SETUP.md` - SMS setup guide

---

**Remember:** Every time you push to `main`, wait 3-5 minutes for deployment to complete, then hard refresh your browser!
