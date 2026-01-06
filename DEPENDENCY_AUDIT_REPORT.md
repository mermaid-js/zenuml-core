# Dependency Audit Report
**Date:** January 6, 2026  
**Package Manager:** Bun 1.2.22  
**Audit Command:** `bun audit`

---

## Executive Summary

**Total Vulnerabilities:** 8
- 🔴 **Critical:** 1
- 🟠 **High:** 3
- 🟡 **Moderate:** 2
- 🟢 **Low:** 2

**Status:** ⚠️ **Action Required** - Critical and high severity vulnerabilities detected

---

## Critical Vulnerabilities (1)

### 🔴 happy-dom <20.0.0
**Severity:** Critical  
**CVE:** [GHSA-37j7-fg3j-429f](https://github.com/advisories/GHSA-37j7-fg3j-429f)  
**Issue:** VM Context Escape can lead to Remote Code Execution  
**Current Version:** 18.0.1  
**Required Version:** >=20.0.0  
**Affected Packages:**
- `happy-dom@18.0.1` (direct dependency)
- `@happy-dom/global-registrator@18.0.1` (depends on happy-dom)
- `vitest` (uses happy-dom)

**Action Required:** ⚠️ **URGENT** - Update to happy-dom@20.0.0 or later

**Update Command:**
```bash
bun update happy-dom@latest @happy-dom/global-registrator@latest
```

**Testing Required:**
- Run full test suite: `bun run test`
- Verify DOM simulation works: `bun run pw:smoke`
- Check for breaking changes in happy-dom v20

---

## High Severity Vulnerabilities (3)

### 🟠 storybook >=9.0.0 <9.1.17
**Severity:** High  
**CVE:** [GHSA-8452-54wp-rmv6](https://github.com/advisories/GHSA-8452-54wp-rmv6)  
**Issue:** Storybook manager bundle may expose environment variables during build  
**Current Version:** 9.1.4 (check if <9.1.17)  
**Required Version:** >=9.1.17  
**Affected Packages:**
- `storybook@9.1.4` (direct dependency)
- `@storybook/addon-docs@9.1.4`
- `@storybook/addon-onboarding@9.1.4`
- `@storybook/react-vite@9.1.4`

**Action Required:** Update to storybook@9.1.17 or later

**Update Command:**
```bash
bun update storybook@latest @storybook/addon-docs@latest @storybook/addon-onboarding@latest @storybook/react-vite@latest
```

**Note:** Check if 9.1.4 is actually vulnerable or if audit is outdated

---

### 🟠 glob >=10.2.0 <10.5.0
**Severity:** High  
**CVE:** [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)  
**Issue:** glob CLI: Command injection via -c/--cmd executes matches with shell:true  
**Current Version:** (transitive dependency)  
**Required Version:** >=10.5.0  
**Affected Packages:**
- `@storybook/react-vite › @joshwooding/vite-plugin-react-docgen-typescript › glob`
- `tailwindcss › sucrase › glob`

**Action Required:** Update parent dependencies to versions that use glob >=10.5.0

**Update Command:**
```bash
bun update tailwindcss@latest
# Check if @joshwooding/vite-plugin-react-docgen-typescript can be updated
```

---

### 🟠 playwright <1.55.1
**Severity:** High  
**CVE:** [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp)  
**Issue:** Playwright downloads and installs browsers without verifying the authenticity of the SSL certificate  
**Current Version:** 1.55.0  
**Required Version:** >=1.55.1  
**Affected Packages:**
- `@playwright/test@1.55.0 › playwright`

**Action Required:** Update to @playwright/test@1.55.1 or later

**Update Command:**
```bash
bun update @playwright/test@latest
```

**Testing Required:**
- Run Playwright tests: `bun run pw:smoke`
- Verify browser downloads work correctly

---

## Moderate Severity Vulnerabilities (2)

### 🟡 vite >=6.0.0 <=6.3.5
**Severity:** Moderate  
**CVE:** [GHSA-93m4-6634-74q7](https://github.com/advisories/GHSA-93m4-6634-74q7)  
**Issue:** vite allows server.fs.deny bypass via backslash on Windows  
**Current Version:** 6.3.5  
**Required Version:** >6.3.5 (6.4.0+)  
**Affected Packages:**
- `vite@6.3.5` (direct dependency)
- Multiple packages depend on vite

**Action Required:** Update to vite@6.4.0 or later

**Update Command:**
```bash
bun update vite@latest
```

**Testing Required:**
- Build: `bun run build`
- Dev server: `bun run dev`
- Check vite 6.4.x changelog for breaking changes

---

### 🟡 js-yaml >=4.0.0 <4.1.1
**Severity:** Moderate  
**CVE:** [GHSA-mh29-5h37-fv8m](https://github.com/advisories/GHSA-mh29-5h37-fv8m)  
**Issue:** js-yaml has prototype pollution in merge (<<)  
**Current Version:** (transitive dependency, likely <4.1.1)  
**Required Version:** >=4.1.1  
**Affected Packages:**
- `eslint › @eslint/eslintrc › js-yaml`
- `vite-plugin-svgr › @svgr/plugin-jsx › @svgr/core › cosmiconfig › js-yaml`

**Action Required:** Update parent dependencies

**Update Command:**
```bash
bun update eslint@latest vite-plugin-svgr@latest
```

---

## Low Severity Vulnerabilities (2)

### 🟢 vite (2 additional issues)
**Severity:** Low  
**CVEs:**
- [GHSA-g4jq-h2w9-997c](https://github.com/advisories/GHSA-g4jq-h2w9-997c) - Vite middleware may serve files starting with the same name with the public directory
- [GHSA-jqfw-vq24-v9c3](https://github.com/advisories/GHSA-jqfw-vq24-v9c3) - Vite's `server.fs` settings were not applied to HTML files

**Current Version:** 6.3.5  
**Required Version:** >6.3.5 (likely fixed in 6.4.0+)

**Action Required:** Update to vite@latest (will be fixed with moderate severity update)

---

## Recommended Update Plan

### Phase 1: Critical & High Priority (Do First)
```bash
# 1. Critical: happy-dom (RCE vulnerability)
bun update happy-dom@latest @happy-dom/global-registrator@latest

# 2. High: playwright (SSL verification)
bun update @playwright/test@latest

# 3. High: storybook (environment variable exposure)
bun update storybook@latest @storybook/addon-docs@latest @storybook/addon-onboarding@latest @storybook/react-vite@latest

# 4. High: glob (via tailwindcss)
bun update tailwindcss@latest
```

**Test after Phase 1:**
```bash
bun run test
bun run build
bun run pw:smoke
```

### Phase 2: Moderate Priority
```bash
# 5. Moderate: vite (Windows path bypass)
bun update vite@latest

# 6. Moderate: js-yaml (via eslint, vite-plugin-svgr)
bun update eslint@latest vite-plugin-svgr@latest
```

**Test after Phase 2:**
```bash
bun run test
bun run build
bun run dev  # Test dev server
```

### Phase 3: Verify & Cleanup
```bash
# Re-run audit to verify fixes
bun audit

# Check for any remaining issues
bun pm scan

# Update all other dependencies to latest compatible versions
bun update
```

---

## Update All Dependencies (Alternative)

If you want to update everything at once:

```bash
# Update all to latest compatible versions (respects semver)
bun update

# Or update all to absolute latest (may include breaking changes)
bun update --latest
```

**⚠️ Warning:** `bun update --latest` may introduce breaking changes. Test thoroughly.

---

## Testing Checklist

After each update phase:

- [ ] `bun install` - Dependencies install correctly
- [ ] `bun run test` - All unit tests pass
- [ ] `bun run build` - Build succeeds without errors
- [ ] `bun run dev` - Dev server starts and works
- [ ] `bun run pw:smoke` - E2E tests pass
- [ ] `bun audit` - Verify vulnerabilities are resolved
- [ ] Check for deprecation warnings
- [ ] Review changelogs for breaking changes

---

## Post-Update Verification

```bash
# Verify all vulnerabilities are fixed
bun audit

# Should show: "0 vulnerabilities" or only low-severity issues

# Check updated versions
bun pm ls | grep -E "(happy-dom|playwright|storybook|vite|js-yaml|glob)"

# Verify lock file is updated
git status bun.lock
```

---

## Breaking Changes to Watch For

### happy-dom 18 → 20
- Check [happy-dom v20 release notes](https://github.com/capricorn86/happy-dom/releases)
- Review API changes
- Test DOM simulation thoroughly

### vite 6.3 → 6.4+
- Check [vite 6.4 changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)
- Review plugin compatibility
- Test build configuration

### storybook 9.1.4 → 9.1.17+
- Check [storybook changelog](https://github.com/storybookjs/storybook/blob/next/CHANGELOG.md)
- Review configuration changes
- Test Storybook build

---

## Current Dependency Versions

From `bun pm ls`:
- `happy-dom@18.0.1` → **Update to >=20.0.0**
- `@playwright/test@1.55.0` → **Update to >=1.55.1**
- `storybook@9.1.4` → **Check if <9.1.17, update if needed**
- `vite@6.3.5` → **Update to >=6.4.0**
- `dompurify@3.2.6` ✅ (up to date)
- `vitest@3.2.4` ✅ (up to date)

---

## Next Steps

1. **Review this audit report**
2. **Execute Phase 1 updates** (critical & high)
3. **Test thoroughly** after Phase 1
4. **Execute Phase 2 updates** (moderate)
5. **Test again** after Phase 2
6. **Run final audit** to verify all fixes
7. **Commit changes** with descriptive message

---

## Commands Reference

```bash
# Audit vulnerabilities
bun audit

# Scan for security issues
bun pm scan

# Update specific package
bun update <package>@latest

# Update all packages
bun update

# Update all to latest (breaking changes possible)
bun update --latest

# Check what depends on a package
bun pm why <package>

# List all dependencies
bun pm ls

# Check for outdated packages (if available)
bun pm outdated  # May not be available in Bun
```

---

**Report Generated:** January 6, 2026  
**Next Review:** After completing updates

