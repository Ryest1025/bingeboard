# 🚀 Quick Deployment Reference

## Common Commands

```bash
# Deploy a bug fix
node scripts/bump-version.cjs patch "Fix login issue"
git add -A && git commit -m "v$(node -p 'require(\"./package.json\").version'): Fix login issue"
git push origin main

# Deploy a new feature
node scripts/bump-version.cjs minor "Add SMS recovery"
git add -A && git commit -m "v$(node -p 'require(\"./package.json\").version'): Add SMS recovery"
git push origin main

# Check if versions are synced
node scripts/check-version-sync.cjs

# Check deployment status
curl -s https://bingeboardapp.com/ | grep cache-version
```

## Troubleshooting

```bash
# Users seeing old version?
node scripts/bump-version.cjs patch "Force cache refresh"
git add -A && git commit -m "Force cache refresh" && git push

# Build failing?
npm run build:pages

# Version mismatch?
node scripts/check-version-sync.cjs
```

## Wait Times

- **GitHub Actions Build:** 2 minutes
- **CDN Cache Propagation:** 1-3 minutes  
- **Total Time:** ~3-5 minutes

**Always hard refresh after deployment:** Ctrl+Shift+R (or Cmd+Shift+R)

---

See **DEPLOYMENT_GUIDE.md** for full documentation.
