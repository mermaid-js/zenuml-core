export function getTheme(): string {
  // The workbench preview uses the unstyled black-on-white default unless the
  // page is opened with `?theme=theme-dark` (any theme name), which applies
  // to every render without touching the stored choice.
  const param = new URLSearchParams(window.location.search).get("theme");
  return param || "theme-default";
}

export function setTheme(theme: string): void {
  localStorage.setItem(`${location.hostname}-zenuml-theme`, theme);
}

export const defaultConfig = {
  enableMultiTheme: true,
  stickyOffset: 0,
  theme: getTheme(),
  onThemeChange: ({ theme }: { theme: string }) => {
    setTheme(theme);
  },
};

export function createConfig(overrides = {}) {
  return { ...defaultConfig, ...overrides };
}
