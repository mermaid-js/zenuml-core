export interface LayoutMetrics {
  statementMarginY: number;
  statementGap: number;
  commentLineHeight: number;
  commentCodeLineHeight: number;
  commentBlockSpacing: number;
  commentPaddingY: number;
  commentMaxWidth: number;
  /**
   * Height of a bare message arrow with no block/occurrence content.
   * This comes from the `.message` element in the DOM (~16px).
   */
  messageInlineHeight: number;
  messageHeight: number;
  asyncMessageHeight: number;
  selfInvocationHeight: number;
  selfAsyncHeight: number;
  creationMessageHeight: number;
  returnMessageHeight: number;
  /**
   * Height of a self-return (source === target) which renders a different DOM
   * structure (icon + text) and is a few pixels taller than a normal return.
   */
  returnSelfMessageHeight: number;
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
  fragmentElseLabelHeight: number;
  creationAssignmentOffset: number;
  creationAltBranchInset: number;
  creationParSiblingOffset: number;
}

const SPACING_UNIT = 4; // Tailwind spacing scale unit (1 => 0.25rem => 4px)
const rem = (value: number) => value * 16;
const tw = (value: number) => value * SPACING_UNIT;

/** Theme agnostic default values derived from the Tailwind config. */
export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  statementMarginY: tw(4), // .statement-container .my-4
  statementGap: tw(4),
  commentLineHeight: rem(1.25),
  commentCodeLineHeight: rem(1.1),
  commentBlockSpacing: tw(2),
  commentPaddingY: 0,
  commentMaxWidth: 640,
  messageInlineHeight: 16,
  messageHeight: 31,
  asyncMessageHeight: 16,
  selfInvocationHeight: 31,
  selfAsyncHeight: 54,
  creationMessageHeight: 38,
  returnMessageHeight: 16,
  returnSelfMessageHeight: 20,
  occurrenceMinHeight: tw(6),
  fragmentHeaderHeight: rem(1.5) + 2,
  fragmentConditionHeight: rem(1.5),
  fragmentPaddingBottom: tw(2.5),
  fragmentBodyGap: 0,
  fragmentBranchGap: tw(2),
  dividerHeight: tw(10),
  occurrenceContentInset: 1,
  creationOccurrenceContentInset: 18,
  returnStatementMarginBottom: 2,
  fragmentOccurrenceMinHeight: 22,
  tcfSegmentHeaderHeight: 13,
  creationAltBranchOffset: 11,
  creationTcfSegmentOffset: 0,
  creationSectionOffset: 0,
  fragmentElseLabelHeight: 13,
  creationAssignmentOffset: 0,
  creationAltBranchInset: 0,
  creationParSiblingOffset: 1,
};

export type ThemeName = string | null | undefined;

const THEME_OVERRIDES: Record<string, Partial<LayoutMetrics>> = {
  "theme-clean-light": {
    messageHeight: tw(11),
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
