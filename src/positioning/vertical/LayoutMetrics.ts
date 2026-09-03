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

// Fixed element heights shared by the vertical layout engine (the StatementVM
// classes below) and the SVG geometry builders in src/svg. They are not part of
// the themeable LayoutMetrics record above because no theme varies them; they
// live here so the two renderers cannot drift apart.

/** A straight (non-self) sync or async message. */
export const MESSAGE_HEIGHT = 16;

/** A self sync message — the looped arrow drawn beside the lifeline. */
export const SELF_MESSAGE_HEIGHT = 30;

/** A self async message — label (~20px) stacked on the 24px arrow SVG. */
export const ASYNC_SELF_MESSAGE_HEIGHT = 44;

/** A creation message — `[data-type="creation"]`, `.h-10`. */
export const CREATION_MESSAGE_HEIGHT = 40;

/** One line box of a comment, as measured by MarkdownMeasurer. */
export const COMMENT_LINE_HEIGHT = tw(5);

/** `.fragment` border-width, one pixel per side. */
export const FRAGMENT_BORDER_WIDTH = 1;
