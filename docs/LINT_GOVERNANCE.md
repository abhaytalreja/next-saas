# 🛡️ Lint Governance Rules

This document tracks temporarily disabled linting and establishes rules for re-enabling quality checks.

## 📋 Current Status

### Packages with Disabled Linting

| Package              | Lint Status | Type Check Status | Tests Status | Reason                         | Target Fix Date |
| -------------------- | ----------- | ----------------- | ------------ | ------------------------------ | --------------- |
| `@nextsaas/auth`     | ❌ Disabled | ✅ Enabled        | ✅ N/A       | ESLint flat config migration   | TBD             |
| `@nextsaas/config`   | ❌ Disabled | ❌ Disabled       | ❌ Disabled  | Organization modes refactoring | TBD             |
| `@nextsaas/database` | ❌ Disabled | ❌ Disabled       | ❌ Disabled  | Organization modes refactoring | TBD             |
| `@nextsaas/supabase` | ❌ Disabled | ❌ Disabled       | ❌ Disabled  | Organization modes refactoring | TBD             |
| `@nextsaas/types`    | ❌ Disabled | ✅ Enabled        | ✅ N/A       | ESLint flat config migration   | TBD             |
| `@nextsaas/ui`       | ❌ Disabled | ✅ Enabled        | ✅ N/A       | ESLint flat config migration   | TBD             |
| `@nextsaas/utils`    | ❌ Disabled | ✅ Enabled        | ❌ Disabled  | ESLint flat config migration   | TBD             |

### Apps with Disabled Linting

| App                 | Lint Status | Type Check Status | Reason                       | Target Fix Date |
| ------------------- | ----------- | ----------------- | ---------------------------- | --------------- |
| `@nextsaas/web`     | ❌ Disabled | ✅ Enabled        | ESLint flat config migration | TBD             |
| `@nextsaas/landing` | ❌ Disabled | ✅ Enabled        | ESLint flat config migration | TBD             |
| `@nextsaas/docs`    | ❌ Disabled | ✅ Enabled        | ESLint flat config migration | TBD             |

## 🚨 Mandatory Rules

### Rule 1: Pre-Commit Check

**Before any commit to packages with disabled linting:**

1. ✅ **REQUIRED**: Attempt to re-enable linting for the package being modified
2. ✅ **REQUIRED**: If linting passes, remove the temporary disable and include in the commit
3. ✅ **REQUIRED**: If linting fails, document specific errors and create follow-up task
4. ✅ **REQUIRED**: Update this document with current status

### Rule 2: Pull Request Requirements

**All PRs touching packages with disabled linting must:**

1. ✅ Include a section "Linting Status" in PR description
2. ✅ State whether linting was attempted to be re-enabled
3. ✅ If still disabled, provide justification and timeline for fix
4. ✅ Update the tracking table in this document

### Rule 3: Weekly Review

**Every Friday, team must:**

1. ✅ Review this document during team meeting
2. ✅ Assign owners for re-enabling linting on specific packages
3. ✅ Set target dates for fixes
4. ✅ Remove any packages that have been fixed

### Rule 4: No New Disables

**Strictly forbidden to disable linting on new packages without:**

1. ✅ Team approval in PR review
2. ✅ Adding to this tracking document
3. ✅ Setting a target fix date within 2 weeks
4. ✅ Assigning an owner for the fix

## 🔧 How to Re-enable Linting

### For ESLint Flat Config Issues

```bash
# 1. Try to run lint to see current errors
npm run lint --filter=@nextsaas/[package-name]

# 2. If ESLint config errors, update to flat config
# Example fix for package.json:
{
  "scripts": {
    "lint": "eslint src/ --config eslint.config.js"
  }
}

# 3. Create/update eslint.config.js in package root:
# See working examples in main apps
```

### For Organization Modes Refactoring

```bash
# 1. Check if types are available
npm run type-check --filter=@nextsaas/[package-name]

# 2. If types pass, try linting
npm run lint --filter=@nextsaas/[package-name]

# 3. Fix any import/export issues from refactoring
# 4. Update tests to match new organization structure
```

### For Test Issues

```bash
# 1. Run tests to see failures
npm run test --filter=@nextsaas/[package-name]

# 2. Update test imports for new organization structure
# 3. Mock any missing dependencies
# 4. Update test assertions for new data models
```

## 📝 Commit Template

When working on packages with disabled linting, use this commit template:

```
feat/fix: [your change description]

[Your detailed description]

Linting Status:
- ✅ Attempted to re-enable linting for [package-name]
- ✅ Linting now passes / ❌ Still disabled due to [specific reason]
- Target fix date: [date] / Fixed in this commit

[rest of commit message]
```

## 🎯 Success Criteria

A package is considered "fixed" when:

1. ✅ `npm run lint` passes without errors
2. ✅ `npm run type-check` passes without errors
3. ✅ `npm run test` passes without errors (if tests exist)
4. ✅ Package.json scripts are restored to normal commands
5. ✅ Package is removed from tracking table above

## 🏆 Tracking Progress

### Completed Fixes

_This section will track packages that have been successfully fixed_

| Package    | Fixed Date | Fixed By | PR Link |
| ---------- | ---------- | -------- | ------- |
| _None yet_ | -          | -        | -       |

## 🚀 Action Items

### Immediate (Next 1-2 PRs)

- [ ] Set up ESLint flat config template for packages
- [ ] Create automated check for disabled linting in CI
- [ ] Assign owners for each disabled package

### Short Term (Next Sprint)

- [ ] Fix ESLint issues in `@nextsaas/types` and `@nextsaas/utils`
- [ ] Complete organization modes refactoring in `@nextsaas/database`
- [ ] Re-enable tests for `@nextsaas/supabase`

### Medium Term (Next Month)

- [ ] All packages have linting re-enabled
- [ ] This document is archived as no longer needed
- [ ] Process is established to prevent future mass disabling

---

**Last Updated**: $(date)
**Next Review**: Every Friday in team meeting
**Document Owner**: Team Lead

> ⚠️ **Warning**: This document must be updated with every commit that touches packages with disabled linting!
