# Dependency PR Review & Action Plan

**Date:** January 6, 2026  
**Total Dependency PRs:** 8  
**Package Manager:** Bun (uses `bun.lock`, not `yarn.lock` or `pnpm-lock.yaml`)

---

## Current State Analysis

### Installed Versions (from `bun pm ls`)
- ✅ `vite@6.3.5` (PR wants 6.4.1)
- ✅ `happy-dom@18.0.1` (PR wants 20.0.2) ⚠️ **MAJOR VERSION**
- ✅ `dompurify@3.2.6` (PR wants 3.2.4) ❌ **PR OUTDATED** (already newer)
- ✅ `vitest@3.2.4` (PR wants 2.1.9) ❌ **PR OUTDATED** (already newer)

### Critical Issue
**ALL PRs update wrong lock files:**
- ❌ PRs modify `yarn.lock` or `pnpm-lock.yaml`
- ✅ Project uses **Bun** - should update `bun.lock`

---

## PR-by-PR Action Plan

### ✅ PR #317: vite 6.3.5 → 6.4.1
**Status:** Current: 6.3.5 | Target: 6.4.1  
**Risk:** LOW (minor version bump)  
**Lock File Issue:** Updates `yarn.lock` ❌

#### Actions:
1. **Close PR** - Dependabot configured for wrong package manager
2. **Manual Update:**
   ```bash
   bun update vite@6.4.1
   bun install
   ```
3. **Verify:**
   ```bash
   bun run build
   bun run dev  # Test dev server
   ```
4. **Test:** Run full test suite
5. **Commit:** Update `bun.lock` and `package.json`

#### Recommendation: ✅ **SAFE TO UPDATE** (after fixing lock file)

---

### ⚠️ PR #316: happy-dom 18.0.1 → 20.0.2
**Status:** Current: 18.0.1 | Target: 20.0.2  
**Risk:** HIGH (major version bump: 18 → 20)  
**Lock File Issue:** Updates `yarn.lock` ❌

#### Actions:
1. **Review Migration Guide:**
   - Check [happy-dom v20 release notes](https://github.com/capricorn86/happy-dom/releases)
   - Look for breaking changes between v18 and v20
   - Review API changes

2. **Test Before Updating:**
   ```bash
   bun run test  # Baseline - ensure current tests pass
   ```

3. **Update Carefully:**
   ```bash
   bun update happy-dom@20.0.2 @happy-dom/global-registrator@latest
   bun install
   ```

4. **Comprehensive Testing:**
   ```bash
   bun run test  # Unit tests
   bun run pw:smoke  # E2E tests
   ```

5. **Check for Breaking Changes:**
   - Review test output for failures
   - Check if `@happy-dom/global-registrator` needs update
   - Verify DOM simulation still works correctly

#### Recommendation: ⚠️ **REVIEW CAREFULLY** - Major version bump requires testing

#### Potential Issues:
- API changes in happy-dom v20
- Compatibility with `@happy-dom/global-registrator@18.0.1`
- Test failures due to DOM API changes

---

### ✅ PR #315: js-yaml 4.1.0 → 4.1.1
**Status:** Transitive dependency (not in package.json)  
**Risk:** LOW (patch version bump)  
**Lock File Issue:** Updates `yarn.lock` ❌

#### Actions:
1. **Identify Parent Dependency:**
   ```bash
   bun pm why js-yaml
   ```

2. **Update Parent:**
   - Update the package that depends on js-yaml
   - Or update js-yaml directly if possible:
   ```bash
   bun update js-yaml@4.1.1
   bun install
   ```

3. **Verify:**
   ```bash
   bun run test
   ```

#### Recommendation: ✅ **SAFE TO UPDATE** (patch version)

---

### ✅ PR #269: brace-expansion 1.1.11 → 1.1.12
**Status:** Transitive dependency (not in package.json)  
**Risk:** LOW (patch version bump)  
**Lock File Issue:** Updates `pnpm-lock.yaml` ❌

#### Actions:
1. **Identify Parent Dependency:**
   ```bash
   bun pm why brace-expansion
   ```

2. **Update:**
   ```bash
   bun update brace-expansion@1.1.12
   bun install
   ```

3. **Verify:**
   ```bash
   bun run test
   ```

#### Recommendation: ✅ **SAFE TO UPDATE** (patch version)

---

### ⚠️ PR #251: @babel/helpers 7.26.0 → 7.27.0
**Status:** Transitive dependency (not in package.json)  
**Risk:** MEDIUM (minor version bump)  
**Lock File Issue:** Updates `pnpm-lock.yaml` ❌

#### Actions:
1. **Identify Parent Dependency:**
   ```bash
   bun pm why @babel/helpers
   ```

2. **Review Babel 7.27 Changes:**
   - Check [Babel 7.27 release notes](https://github.com/babel/babel/releases)
   - Look for breaking changes

3. **Update:**
   ```bash
   bun update @babel/helpers@7.27.0
   bun install
   ```

4. **Test Build:**
   ```bash
   bun run build  # Verify Babel transforms still work
   bun run test
   ```

#### Recommendation: ⚠️ **REVIEW** - Check Babel release notes first

---

### ⚠️ PR #250: @babel/runtime 7.20.6 → 7.27.0
**Status:** Transitive dependency (not in package.json)  
**Risk:** HIGH (large version jump: 7.20.6 → 7.27.0)  
**Lock File Issue:** Updates `pnpm-lock.yaml` ❌

#### Actions:
1. **Identify Parent Dependency:**
   ```bash
   bun pm why @babel/runtime
   ```

2. **Review Migration Path:**
   - Check Babel 7.21, 7.22, 7.23, 7.24, 7.25, 7.26, 7.27 release notes
   - Look for cumulative breaking changes
   - Review runtime API changes

3. **Test Current State:**
   ```bash
   bun run build  # Baseline
   bun run test
   ```

4. **Update Incrementally (if possible):**
   ```bash
   # Try updating to latest
   bun update @babel/runtime@7.27.0
   bun install
   ```

5. **Comprehensive Testing:**
   ```bash
   bun run build  # Verify build still works
   bun run test  # All tests must pass
   bun run dev  # Test dev server
   ```

#### Recommendation: ⚠️ **REVIEW CAREFULLY** - Large version jump

#### Potential Issues:
- Runtime API changes
- Breaking changes across multiple minor versions
- Compatibility with other Babel packages

---

### ❌ PR #248: dompurify 3.1.5 → 3.2.4
**Status:** Current: 3.2.6 | Target: 3.2.4  
**Risk:** N/A (PR is outdated)  
**Lock File Issue:** Updates `pnpm-lock.yaml` ❌

#### Actions:
1. **Close PR** - Already at newer version (3.2.6 > 3.2.4)
2. **Verify Current Version:**
   ```bash
   bun pm ls dompurify
   # Should show: dompurify@3.2.6
   ```

3. **Check for Latest:**
   ```bash
   bun update dompurify@latest
   bun install
   ```

#### Recommendation: ❌ **CLOSE PR** - Already outdated

---

### ❌ PR #247: vitest 2.1.5 → 2.1.9
**Status:** Current: 3.2.4 | Target: 2.1.9  
**Risk:** N/A (PR is outdated)  
**Lock File Issue:** Updates `pnpm-lock.yaml` ❌

#### Actions:
1. **Close PR** - Already at newer version (3.2.4 > 2.1.9)
2. **Verify Current Version:**
   ```bash
   bun pm ls vitest
   # Should show: vitest@3.2.4
   ```

3. **Check for Latest:**
   ```bash
   bun update vitest@latest
   bun install
   ```

#### Recommendation: ❌ **CLOSE PR** - Already outdated

---

## Immediate Actions Summary

### Step 1: Close Outdated PRs
```bash
# Close these PRs - they're outdated
gh pr close 248  # dompurify (already at 3.2.6)
gh pr close 247  # vitest (already at 3.2.4)
```

### Step 2: Fix Dependabot Configuration
The root cause: Dependabot is configured for npm/yarn, but project uses Bun.

**Option A: Configure Dependabot for Bun**
Create/update `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    package-manager: "bun"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Option B: Disable Dependabot, Use Manual Updates**
- Close all dependabot PRs
- Manually update dependencies using `bun update`
- Set up weekly dependency review process

### Step 3: Update Safe Dependencies
```bash
# Safe updates (patch/minor, low risk)
bun update vite@6.4.1
bun update js-yaml@4.1.1
bun update brace-expansion@1.1.12
bun install
bun run test
bun run build
```

### Step 4: Review Major Updates
```bash
# Review these carefully before updating
# PR #316: happy-dom 18 → 20
# PR #250: @babel/runtime 7.20 → 7.27
# PR #251: @babel/helpers 7.26 → 7.27
```

---

## Testing Checklist

For each dependency update:

- [ ] `bun run test` - All unit tests pass
- [ ] `bun run build` - Build succeeds
- [ ] `bun run dev` - Dev server starts correctly
- [ ] `bun run pw:smoke` - E2E tests pass (for UI-related deps)
- [ ] No new linter errors
- [ ] Check for deprecation warnings
- [ ] Verify `bun.lock` is updated (not yarn/pnpm lock files)

---

## Recommended Update Order

1. **Close outdated PRs** (#248, #247)
2. **Update safe patch versions** (#315, #269)
3. **Update vite** (#317) - minor version, low risk
4. **Review and update Babel packages** (#251, #250) - coordinate together
5. **Review and update happy-dom** (#316) - major version, test thoroughly

---

## Long-term Recommendations

1. **Fix Dependabot Configuration**
   - Configure for Bun package manager
   - Or disable and use manual updates

2. **Automated Dependency Updates**
   - Consider Renovate bot (supports Bun)
   - Or weekly manual review process

3. **Dependency Update Policy**
   - Patch versions: Auto-merge after tests pass
   - Minor versions: Review changelog, test, then merge
   - Major versions: Full review, migration guide, comprehensive testing

4. **Lock File Hygiene**
   - Ensure only `bun.lock` is committed
   - Remove `yarn.lock` and `pnpm-lock.yaml` if they exist
   - Add to `.gitignore` if needed

---

## Quick Reference Commands

```bash
# Check current versions
bun pm ls | grep -E "(vite|happy-dom|dompurify|vitest)"

# Update specific package
bun update <package>@<version>

# Update all dependencies
bun update

# Check what depends on a package
bun pm why <package>

# Test after update
bun run test && bun run build && bun run pw:smoke
```

---

**Report Generated:** January 6, 2026  
**Next Review:** After fixing dependabot configuration

