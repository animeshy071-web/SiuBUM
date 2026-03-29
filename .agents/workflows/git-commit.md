---
description: Auto-commit and push changes to GitHub after each meaningful change
---

# Git Auto-Commit Workflow

After completing each meaningful feature, fix, or change, follow these steps:

// turbo-all

1. Stage all changes:
```
git add -A
```

2. Check what's staged:
```
git status --short
```

3. Commit with a structured message using one of these prefixes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `style:` for UI improvements

Example:
```
git commit -m "feat: add exercise performance tracking"
```

4. Push to remote:
```
git push origin main
```

## Rules
- Commit after **each completed feature or fix** — don't batch too many changes
- Keep commit messages short but descriptive
- Never commit `node_modules`, `dist`, or temp files (`.gitignore` handles this)
- Repository: `https://github.com/animeshy071-web/SiuBUM`
- Branch: `main`
