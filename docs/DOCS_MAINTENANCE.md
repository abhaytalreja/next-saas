# Documentation Maintenance Guide

## 📋 Pre-Commit Checklist

Before every commit, ensure documentation is in sync:

### 1. **Quick Check** (30 seconds)
- [ ] Does your change affect user-facing features?
- [ ] Does it change setup/installation steps?
- [ ] Does it add/remove dependencies?
- [ ] Does it change environment variables?

If YES to any → Update docs!

### 2. **Files to Keep in Sync**

| Change Type | Update These Files |
|------------|-------------------|
| New features | - `/apps/docs/src/pages/features/*` <br> - `/README.md` (features section) |
| Setup/Install | - `/apps/docs/src/pages/quickstart.tsx` <br> - `/README.md` (getting started) |
| Architecture | - `/apps/docs/src/pages/architecture/*` <br> - `/apps/docs/src/pages/project-structure.tsx` |
| Roadmap items | - `/ROADMAP.md` <br> - `/apps/docs/src/pages/index.tsx` (if major) |
| Environment vars | - `/.env.example` <br> - `/apps/docs/src/pages/quickstart.tsx` |

### 3. **Quick Update Process**

```bash
# 1. Make your code changes
git add .

# 2. Check if docs need updates
npm run docs:check  # (we should create this script)

# 3. Update relevant docs
# Edit files as needed

# 4. Verify docs still build
cd apps/docs && npm run build

# 5. Commit with confidence
git commit -m "feat: add feature X with updated docs"
```

### 4. **Common Updates**

#### Adding a new environment variable:
1. Add to `.env.example`
2. Update quickstart.tsx Step 3
3. Document in relevant feature page

#### Adding a new package:
1. Update project-structure.tsx
2. Add to features section if user-facing
3. Update README.md

#### Changing setup steps:
1. Update quickstart.tsx
2. Update README.md getting started
3. Test the steps yourself!

## 🤖 Automation Ideas

Consider adding:
- Pre-commit hook to remind about docs
- GitHub Action to check if PR has docs updates
- Script to verify .env.example matches docs

## 📝 Documentation Philosophy

- **User-first**: Write for developers using the template, not contributing to it
- **Action-oriented**: Show how to DO things, not just what exists
- **Time-conscious**: Always mention how long things take
- **Progressive**: Start simple, add complexity gradually

---

Remember: Good documentation is as important as good code. Future you (and your users) will thank you! 🙏