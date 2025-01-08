export function getTheme(): string {
  return (
    localStorage.getItem(`${location.hostname}-zenuml-theme`) ||
    "theme-idle-afternoon"
  );
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
