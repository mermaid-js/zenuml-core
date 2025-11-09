export interface LayoutMetrics {
  messageLayerPaddingTop: number;
  messageLayerPaddingBottom: number;
  statementMarginTop: number;
  statementMarginBottom: number;
  statementGap: number;
  commentLineHeight: number;
  commentCodeLineHeight: number;
  commentBlockSpacing: number;
  commentPaddingY: number;
  commentMaxWidth: number;
  messageHeight: number;
  asyncMessageHeight: number;
  selfInvocationHeight: number;
  selfAsyncHeight: number;
  creationMessageHeight: number;
  returnMessageHeight: number;
  occurrenceMinHeight: number;
  fragmentHeaderHeight: number;
  fragmentConditionHeight: number;
  fragmentPaddingBottom: number;
  fragmentBodyGap: number;
  fragmentBranchGap: number;
  dividerHeight: number;
}

const SPACING_UNIT = 4; // Tailwind spacing scale unit (1 => 0.25rem => 4px)
const rem = (value: number) => value * 16;
const tw = (value: number) => value * SPACING_UNIT;

export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  messageLayerPaddingTop: tw(14), // pt-14 => 56px
  messageLayerPaddingBottom: tw(10), // pb-10 => 40px
  statementMarginTop: tw(4),
  statementMarginBottom: tw(4),
  statementGap: tw(4),
  commentLineHeight: rem(1),
  commentCodeLineHeight: rem(1.1),
  commentBlockSpacing: tw(2),
  commentPaddingY: tw(1),
  commentMaxWidth: 360,
  messageHeight: tw(10),
  asyncMessageHeight: tw(10),
  selfInvocationHeight: rem(3),
  selfAsyncHeight: rem(3),
  creationMessageHeight: tw(10),
  returnMessageHeight: tw(8),
  occurrenceMinHeight: tw(6),
  fragmentHeaderHeight: rem(2.5),
  fragmentConditionHeight: rem(1.5),
  fragmentPaddingBottom: tw(2.5),
  fragmentBodyGap: tw(2),
  fragmentBranchGap: tw(2),
  dividerHeight: tw(10),
};

export type ThemeName = string | null | undefined;

const THEME_OVERRIDES: Record<string, Partial<LayoutMetrics>> = {
  "theme-clean-light": {
    messageHeight: tw(11),
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
