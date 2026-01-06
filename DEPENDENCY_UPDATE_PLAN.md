# Dependency Update Plan - Quick Start

**Status:** All dependency PRs closed ✅  
**Next:** Perform comprehensive dependency audit and updates

---

## Quick Start Commands

### Step 1: Update Critical & High Priority Vulnerabilities

```bash
# Critical: happy-dom (RCE vulnerability)
bun update happy-dom@latest @happy-dom/global-registrator@latest

# High: playwright (SSL verification)
bun update @playwright/test@latest

# High: storybook (environment variable exposure)
bun update storybook@latest @storybook/addon-docs@latest @storybook/addon-onboarding@latest @storybook/react-vite@latest

# High: glob (via tailwindcss)
bun update tailwindcss@latest
```

### Step 2: Test After Critical Updates

```bash
bun install
bun run test
bun run build
bun run pw:smoke
```

### Step 3: Update Moderate Priority

```bash
# Moderate: vite (Windows path bypass)
bun update vite@latest

# Moderate: js-yaml (via eslint, vite-plugin-svgr)
bun update eslint@latest vite-plugin-svgr@latest
```

### Step 4: Test Again

```bash
bun run test
bun run build
bun run dev  # Test dev server works
```

### Step 5: Update Everything Else

```bash
# Update all remaining dependencies to latest compatible versions
bun update
```

### Step 6: Final Verification

```bash
# Check vulnerabilities are fixed
bun audit

# Should show: "0 vulnerabilities" or only low-severity issues
```

---

## Current Vulnerabilities Summary

- 🔴 **Critical (1):** happy-dom <20.0.0 (RCE)
- 🟠 **High (3):** storybook, glob, playwright
- 🟡 **Moderate (2):** vite, js-yaml
- 🟢 **Low (2):** vite (2 additional issues)

**Total: 8 vulnerabilities**

---

## Detailed Report

See `DEPENDENCY_AUDIT_REPORT.md` for:
- Detailed vulnerability descriptions
- CVE links
- Affected packages
- Testing checklists
- Breaking changes to watch for

---

## Alternative: Update Everything at Once

If you prefer to update all dependencies at once:

```bash
# Update all to latest compatible versions (respects semver)
bun update

# Then verify
bun audit
bun run test
bun run build
bun run pw:smoke
```

**⚠️ Warning:** This may introduce breaking changes. Test thoroughly.

---

## After Updates

1. Review `bun.lock` changes
2. Commit with message: `chore: update dependencies to fix security vulnerabilities`
3. Run full test suite
4. Verify all functionality works

---

**Ready to proceed?** Start with Step 1 above.

