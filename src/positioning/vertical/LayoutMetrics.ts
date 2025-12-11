export interface LayoutMetrics {
  statementMarginY: number;
  fragmentHeaderHeight: number;
  fragmentPaddingBottom: number;
}

const SPACING_UNIT = 4; // Tailwind spacing scale unit (1 => 0.25rem => 4px)
const tw = (value: number) => value * SPACING_UNIT;

export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  statementMarginY: tw(4), // .statement-container .my-4
  fragmentHeaderHeight: 25, // .fragment .leading-4 => line-height: 1rem
  fragmentPaddingBottom: 10, // .zenuml .fragment =>padding-bottom: 10px
};

export type ThemeName = string | null | undefined;

const THEME_OVERRIDES: Record<string, Partial<LayoutMetrics>> = {
  "theme-clean-light": {
    // messageHeight: tw(11),
  },
};

export function getLayoutMetrics(theme: ThemeName): LayoutMetrics {
  if (!theme) {
    return DEFAULT_LAYOUT_METRICS;
  }
  const override = Object.entries(THEME_OVERRIDES).find(([key]) =>
    theme.includes(key),
  )?.[1];
  if (!override) {
    return DEFAULT_LAYOUT_METRICS;
  }
  return { ...DEFAULT_LAYOUT_METRICS, ...override };
}
