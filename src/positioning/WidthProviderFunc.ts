import { TextType } from "@/positioning/Coordinate";
import { getCache, setCache } from "./../utils/RenderingCache";

const FONT_FAMILY = "Helvetica, Verdana, serif";
const FONT_SIZE_MESSAGE = "14px"; // 0.875rem at 16px base
const FONT_SIZE_PARTICIPANT = "16px"; // 1rem

function getFontSpec(type: TextType): string {
  const size =
    type === TextType.MessageContent ? FONT_SIZE_MESSAGE : FONT_SIZE_PARTICIPANT;
  return `${size} ${FONT_FAMILY}`;
}

let canvasCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (canvasCtx) return canvasCtx;
  try {
    if (typeof OffscreenCanvas !== "undefined") {
      canvasCtx = new OffscreenCanvas(1, 1).getContext("2d");
    } else if (typeof document !== "undefined") {
      canvasCtx = document.createElement("canvas").getContext("2d");
    }
  } catch {
    // no canvas available
  }
  return canvasCtx;
}

export function WidthProviderOnCanvas(
  text: string,
  type: TextType,
): number {
  const cacheKey = `WidthProviderOnCanvas_${text}_${type}`;
  const cacheValue = getCache(cacheKey);
  if (cacheValue != null) {
    return cacheValue;
  }

  const ctx = getCanvasContext();
  if (!ctx) {
    // Fallback: estimate based on character count
    const fontSize = type === TextType.MessageContent ? 14 : 16;
    const width = Math.ceil(text.length * fontSize * 0.6);
    setCache(cacheKey, width, true);
    return width;
  }

  ctx.font = getFontSpec(type);
  const width = Math.ceil(ctx.measureText(text).width);
  setCache(cacheKey, width, true);
  return width;
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
