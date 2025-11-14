export interface LayoutMetrics {
  messageLayerPaddingTop: number;
  messageLayerPaddingBottom: number;
  statementMarginTop: number;
  statementMarginBottom: number;
  statementGap: number;
  lifelineLayerPaddingTop: number;
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
  occurrenceContentInset: number;
  creationOccurrenceContentInset: number;
  returnStatementMarginBottom: number;
  fragmentOccurrenceMinHeight: number;
  tcfSegmentHeaderHeight: number;
  creationAltBranchOffset: number;
  creationTcfSegmentOffset: number;
  creationSectionOffset: number;
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
  lifelineLayerPaddingTop: tw(2), // pt-2 on lifeline layer container
  commentLineHeight: rem(1.25),
  commentCodeLineHeight: rem(1.1),
  commentBlockSpacing: tw(2),
  commentPaddingY: 0,
  commentMaxWidth: 640,
  messageHeight: 31,
  asyncMessageHeight: 16,
  selfInvocationHeight: 31,
  selfAsyncHeight: 54,
  creationMessageHeight: 38,
  returnMessageHeight: 16,
  occurrenceMinHeight: tw(6),
  fragmentHeaderHeight: rem(1.5) + 1,
  fragmentConditionHeight: rem(1.5),
  fragmentPaddingBottom: tw(2.5),
  fragmentBodyGap: 0,
  fragmentBranchGap: tw(2),
  dividerHeight: tw(10),
  occurrenceContentInset: 1,
  creationOccurrenceContentInset: 18,
  returnStatementMarginBottom: 0,
  fragmentOccurrenceMinHeight: 10,
  tcfSegmentHeaderHeight: 18,
  creationAltBranchOffset: 13,
  creationTcfSegmentOffset: 5,
  creationSectionOffset: 14,
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
