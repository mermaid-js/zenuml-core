// Single source of render config for the demo site and the e2e fixture pages
// (index.html, renderer.html, embed.html, e2e/fixtures/*.html). Not part of the
// published library: it is not exported from src/core.tsx.

export const THEME_STORAGE_KEY = `${location.hostname}-zenuml-theme`;

/** `?theme=theme-dark` (any theme name), or null when the page has no such param. */
export function getThemeParam(): string | null {
  return new URLSearchParams(window.location.search).get("theme") || null;
}

/** The theme the user last picked in the theme switcher, if any. */
export function getStoredTheme(): string | null {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

export function setTheme(theme: string): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export interface DemoConfigOptions {
  /**
   * Fallback theme when the page has no `?theme=` param. `?theme=` always wins
   * and applies to every render without touching the stored choice.
   */
  theme?: string;
  /** Keys merged last; they win over everything else. */
  overrides?: object;
  /**
   * Wire up the theme switcher: `enableMultiTheme`, `stickyOffset` and an
   * `onThemeChange` that stores the pick. Default true; the e2e fixtures turn it off.
   */
  themeSwitcher?: boolean;
}

export function demoConfig({
  theme = "theme-default",
  overrides = {},
  themeSwitcher = true,
}: DemoConfigOptions = {}) {
  return {
    ...(themeSwitcher
      ? {
          enableMultiTheme: true,
          stickyOffset: 0,
          onThemeChange: ({ theme }: { theme: string }) => setTheme(theme),
        }
      : {}),
    theme: getThemeParam() || theme,
    // Demo and fixture pages see all editing surfaces; the published library defaults each off.
    enableParticipantInsertion: true,
    enableMessageInsertion: true,
    enableDividerInsertion: true,
    enableParticipantStyleEditing: true,
    enableMessageReorder: true,
    ...overrides,
  };
}
