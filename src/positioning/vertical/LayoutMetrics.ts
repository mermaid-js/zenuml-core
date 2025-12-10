export interface LayoutMetrics {
  statementMarginY: number;
  commentLineHeight: number;
  commentCodeLineHeight: number;
  commentBlockSpacing: number;
  commentMaxWidth: number;
  returnMessageHeight: number;
  returnSelfMessageHeight: number;
  fragmentHeaderHeight: number;
  fragmentPaddingBottom: number;
  fragmentBranchGap: number;
  dividerHeight: number;
  creationOccurrenceContentInset: number;
  returnStatementMarginBottom: number;
  tcfSegmentHeaderHeight: number;
  creationAltBranchOffset: number;
}

const SPACING_UNIT = 4; // Tailwind spacing scale unit (1 => 0.25rem => 4px)
const rem = (value: number) => value * 16;
const tw = (value: number) => value * SPACING_UNIT;

/** Theme agnostic default values derived from the Tailwind config. */
export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  statementMarginY: tw(4), // .statement-container .my-4
  commentLineHeight: rem(1.25),
  commentCodeLineHeight: rem(1.1),
  commentBlockSpacing: tw(2),
  commentMaxWidth: 640,
  // messageHeight: 31,
  returnMessageHeight: 16,
  returnSelfMessageHeight: 20,
  fragmentHeaderHeight: 25, // .fragment .leading-4 => line-height: 1rem
  fragmentPaddingBottom: 10, // .zenuml .fragment =>padding-bottom: 10px
  fragmentBranchGap: tw(2),
  dividerHeight: tw(10),
  creationOccurrenceContentInset: 18,
  returnStatementMarginBottom: 2,
  tcfSegmentHeaderHeight: 13,
  creationAltBranchOffset: 11,
};

export type ThemeName = string | null | undefined;

const THEME_OVERRIDES: Record<string, Partial<LayoutMetrics>> = {
  "theme-clean-light": {
    // messageHeight: tw(11),
  },
};

/** Returns theme-specific overrides merged onto the baseline metrics. */
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
