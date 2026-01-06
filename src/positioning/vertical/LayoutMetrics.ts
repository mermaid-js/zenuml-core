const SPACING_UNIT = 4; // Tailwind spacing scale unit (1 => 0.25rem => 4px)
const tw = (value: number) => value * SPACING_UNIT;

export interface LayoutMetrics {
  statementMarginY: number;
  fragmentHeaderHeight: number;
  fragmentPaddingBottom: number;
}

export const DEFAULT_LAYOUT_METRICS: LayoutMetrics = {
  statementMarginY: tw(4), // .statement-container .my-4
  fragmentHeaderHeight: 25, // .fragment .leading-4 => line-height: 1rem
  fragmentPaddingBottom: 10, // .zenuml .fragment =>padding-bottom: 10px
};
