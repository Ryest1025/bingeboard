# Codespace Recovery

Safely preserve a Codespace’s work without affecting `main`.

## Quick rescue (inside the Codespace)

```bash
npm run codespace:recover
```

This will:
- Create a new branch `recovery/codespace-YYYYMMDD-HHMMSS`
- Commit all changes (WIP ok)
- Push to `origin`

If you want to push to a different remote (e.g., a fork) or skip pushing:

```bash
# Push to a fork remote by name
bash scripts/recover-from-codespace.sh --remote fork

# Push to a fork via URL
bash scripts/recover-from-codespace.sh --remote https://github.com/YOURUSER/bingeboard.git

# Don’t push (local only)
bash scripts/recover-from-codespace.sh --no-push
```

## Review locally (non-destructive)

```bash
git fetch origin
# Create a review branch tracking the recovery branch
git switch -c review/codespace origin/recovery/codespace-YYYYMMDD-HHMMSS

# Compare against your local working branch
git diff YOUR_LOCAL_BRANCH...review/codespace

# Take a single file from the recovery branch
git restore --source=review/codespace -- path/to/file
```

## Merge options

- Merge and resolve conflicts as needed:
  ```bash
  git switch YOUR_LOCAL_BRANCH
  git merge review/codespace
  ```
- Cherry-pick specific commits:
  ```bash
  git log --oneline review/codespace
  git cherry-pick <sha>
  ```
- Adopt one file during a merge conflict:
  ```bash
  # Keep local version
  git checkout --ours -- path/to/file && git add path/to/file
  # Or keep recovery version
  git checkout --theirs -- path/to/file && git add path/to/file
  ```

## Last-resort backups (if push is blocked)

```bash
# Only unstaged/staged diffs
git diff > ~/codespace-changes.patch

# Full repository history (including local commits)
git bundle create ~/codespace-archive.bundle --all

# Zip working tree (excludes node_modules and .git)
tar --exclude=node_modules --exclude=.git -czf ~/codespace-backup-$(date +%Y%m%d).tar.gz .
```

## Tips

- Don’t rewrite history in the Codespace until you’ve pushed the recovery branch.
- Check for secrets before pushing; rotate any accidentally committed credentials.
- For large files, consider Git LFS or ignore them before pushing.
