import { TextType } from "@/positioning/Coordinate";
import { getCache, setCache } from "./../utils/RenderingCache";
import logger from "@/logger/logger";

const FONT_FAMILY = "Helvetica, Verdana, serif";
const FONT_SIZE_PARTICIPANT = "16px"; // 1rem — used for ALL measurements (see getFontSpec comment)
const FONT_SIZE_FRAGMENT = "14px";

function getFontSpec(): string {
  // WidthProviderOnBrowser has a latent bug: it creates a hidden div with
  // fontSize set once on the first call (always 16px for participant names,
  // since withParticipantGaps runs before withMessageGaps in Coordinates).
  // The div is reused for all subsequent calls without updating fontSize,
  // so ALL measurements effectively happen at 16px.
  // To match HTML Coordinates output, we always use 16px here too.
  return `${FONT_SIZE_PARTICIPANT} ${FONT_FAMILY}`;
}

let canvasCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

/** Inject a custom canvas context (e.g., from @napi-rs/canvas for accurate text measurement in Node/Bun). */
export function setCanvasContext(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null): void {
  canvasCtx = ctx;
}

function getCanvasContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (canvasCtx) return canvasCtx;
  try {
    if (typeof OffscreenCanvas !== "undefined") {
      canvasCtx = new OffscreenCanvas(1, 1).getContext("2d");
      logger.debug("[ZenUML] WidthProviderOnCanvas: using OffscreenCanvas");
    } else if (typeof document !== "undefined") {
      canvasCtx = document.createElement("canvas").getContext("2d");
      logger.debug("[ZenUML] WidthProviderOnCanvas: using <canvas> element");
    } else {
      logger.debug("[ZenUML] WidthProviderOnCanvas: no canvas available, using character estimate fallback");
    }
  } catch {
    logger.debug("[ZenUML] WidthProviderOnCanvas: canvas creation failed, using character estimate fallback");
  }
  return canvasCtx;
}

export function WidthProviderOnCanvas(
  text: string,
  type: TextType,
): number {
  // Trim whitespace to match browser behavior: DOM scrollWidth (used by
  // WidthProviderOnBrowser) ignores leading/trailing spaces because the hidden
  // div has display:inline + width:0px.  Canvas measureText includes them,
  // so we trim to keep both providers consistent.
  const measured = text.trim();
  const cacheKey = `WidthProviderOnCanvas_${measured}_${type}`;
  const cacheValue = getCache(cacheKey);
  if (cacheValue != null) {
    return cacheValue;
  }

  const ctx = getCanvasContext();
  if (!ctx) {
    // Fallback: estimate based on character count (always 16px to match browser)
    const width = Math.ceil(measured.length * 16 * 0.6);
    setCache(cacheKey, width, true);
    return width;
  }

  ctx.font = getFontSpec();
  const width = Math.round(ctx.measureText(measured).width);
  setCache(cacheKey, width, true);
  return width;
}

// eslint-disable-next-line no-misleading-character-class
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/u;

/**
 * Measure text width using SVG <text> element (accurate for emoji).
 * Canvas measureText returns wider values for emoji than SVG actually renders.
 */
function measureWithSvg(text: string, fontSize: string): number | null {
  if (typeof document === "undefined") return null;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position:absolute;left:-9999px;top:-9999px");
  const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textEl.setAttribute("font-family", FONT_FAMILY);
  textEl.setAttribute("font-size", fontSize);
  textEl.textContent = text;
  svg.appendChild(textEl);
  document.body.appendChild(svg);
  const width = textEl.getBBox().width;
  document.body.removeChild(svg);
  return width;
}

export function measureTextWithFont(text: string, fontSize: string): number {
  const measured = text.trim();
  if (!measured) return 0;

  // Use SVG measurement for text containing emoji — canvas measureText
  // returns wider values for emoji glyphs than SVG <text> actually renders.
  const hasEmoji = EMOJI_PATTERN.test(measured);
  const cacheKey = hasEmoji
    ? `measureTextWithFont_svg_${fontSize}_${measured}`
    : `measureTextWithFont_${fontSize}_${measured}`;
  const cacheValue = getCache(cacheKey);
  if (cacheValue != null) {
    return cacheValue;
  }

  if (hasEmoji) {
    const svgWidth = measureWithSvg(measured, fontSize);
    if (svgWidth != null) {
      setCache(cacheKey, svgWidth, true);
      return svgWidth;
    }
  }

  const ctx = getCanvasContext();
  if (!ctx) {
    const px = Number.parseFloat(fontSize) || 14;
    const width = Math.ceil(measured.length * px * 0.6);
    setCache(cacheKey, width, true);
    return width;
  }

  ctx.font = `${fontSize} ${FONT_FAMILY}`;
  const width = ctx.measureText(measured).width;
  setCache(cacheKey, width, true);
  return width;
}

export function measureSvgFragmentLabelWidth(text: string): number {
  return measureTextWithFont(text, FONT_SIZE_FRAGMENT);
}

export function measureSvgParticipantLabelWidth(text: string): number {
  return measureTextWithFont(text, FONT_SIZE_PARTICIPANT);
}

export default function WidthProviderOnBrowser(
  text: string,
  type: TextType,
): number {
  const cacheKey = `WidthProviderOnBrowser_${text}_${type}`;
  const cacheValue = getCache(cacheKey);
  if (cacheValue != null) {
    return cacheValue;
  }
  let hiddenDiv = document.querySelector(
    ".textarea-hidden-div",
  ) as HTMLDivElement;
  if (!hiddenDiv) {
    const newDiv = document.createElement("div");
    newDiv.className = "textarea-hidden-div ";
    newDiv.style.fontSize =
      type === TextType.MessageContent ? "0.875rem" : "1rem";
    newDiv.style.fontFamily = "Helvetica, Verdana, serif";
    newDiv.style.display = "inline";
    // newDiv.style.zIndex = '-9999';
    newDiv.style.whiteSpace = "nowrap";
    newDiv.style.visibility = "hidden";
    newDiv.style.position = "absolute";
    newDiv.style.top = "0";
    newDiv.style.left = "0";
    newDiv.style.overflow = "hidden";
    newDiv.style.width = "0px";
    // newDiv.style.height = '0px';
    newDiv.style.paddingLeft = "0px";
    newDiv.style.paddingRight = "0px";
    newDiv.style.margin = "0px";
    newDiv.style.border = "0px";
    document.body.appendChild(newDiv);
    hiddenDiv = newDiv;
  }
  // hiddenDiv.className = 'textarea-hidden-div ' + (type === TextType.ParticipantName ? 'participant' : 'message');

  hiddenDiv.textContent = text;
  const scrollWidth = hiddenDiv.scrollWidth;
  setCache(cacheKey, scrollWidth, true);
  return scrollWidth;
}
