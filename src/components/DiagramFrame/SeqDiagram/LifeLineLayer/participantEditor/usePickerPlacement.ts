import { usePopoverPresence } from "@/components/common/usePopoverPresence";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// Pickers open below their slot: type picker right-aligned with the box,
// colour picker starting just left of the colour slot.
const PICKER_TOP = 42;
const TYPE_PICKER_WIDTH = 220;
const COLOR_PICKER_LEFT = -44;
export const VIEWPORT_MARGIN = 8;

export type Picker = "type" | "color";

/** The selected participant's box, in viewport coordinates. */
export type Anchor = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

/**
 * Where the participant editor's open picker sits (below its slot, clamped to
 * the viewport), the picker presences that keep it mounted for its exit
 * animation, focus on open, and the measured width of the name row.
 */
export function usePickerPlacement(
  anchor: Anchor | null,
  openPicker: Picker | null,
) {
  const typePresence = usePopoverPresence(openPicker === "type");
  const colorPresence = usePopoverPresence(openPicker === "color");
  const pickerMounted = typePresence.mounted || colorPresence.mounted;
  const [pickerPos, setPickerPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const nameRowRef = useRef<HTMLDivElement>(null);
  const [nameRowWidth, setNameRowWidth] = useState(0);

  // Pickers open below their slot.
  useLayoutEffect(() => {
    if (!anchor || (!openPicker && !pickerMounted)) {
      setPickerPos(null);
      return;
    }
    // A closing picker keeps its last position for the exit frame.
    if (!openPicker) return;
    setPickerPos({
      top: anchor.top + PICKER_TOP,
      left:
        openPicker === "type"
          ? anchor.right - TYPE_PICKER_WIDTH
          : anchor.right + COLOR_PICKER_LEFT,
    });
  }, [anchor, openPicker, pickerMounted]);

  // A newly opened picker takes focus: its first pressed item, else its
  // first control.
  const focusedPickerRef = useRef<Picker | null>(null);
  useEffect(() => {
    if (!openPicker || !pickerPos) {
      if (!openPicker) focusedPickerRef.current = null;
      return;
    }
    if (focusedPickerRef.current === openPicker) return;
    focusedPickerRef.current = openPicker;
    const root = pickerRef.current;
    (
      root?.querySelector<HTMLElement>('button[aria-pressed="true"]') ??
      root?.querySelector<HTMLElement>("button")
    )?.focus();
  }, [openPicker, pickerPos]);

  // Clamp the open picker to the viewport after it renders.
  useLayoutEffect(() => {
    if (!pickerRef.current || !pickerPos || !anchor) return;
    const picker = pickerRef.current.getBoundingClientRect();
    let { top, left } = pickerPos;
    const margin = VIEWPORT_MARGIN;
    if (left + picker.width > window.innerWidth - margin) {
      left = window.innerWidth - picker.width - margin;
    }
    if (left < margin) left = margin;
    if (top + picker.height > window.innerHeight - margin) {
      top = anchor.top - picker.height - margin; // flip above participant
    }
    if (top !== pickerPos.top || left !== pickerPos.left) {
      setPickerPos({ top, left });
    }
  }, [pickerPos, anchor]);

  // The name row is centred under the box; measure it to clamp it on screen.
  // The row mounts one render after the anchor is set (FloatingPortal renders
  // its children late, and the portal node may still be detached when the
  // ref attaches, so offsetWidth is 0 there) and nothing re-renders this
  // component afterwards. A ResizeObserver on the row reports the real width
  // as soon as the row has layout, and again when the label field flips
  // between empty and filled or the row re-mounts after a picker closes.
  const [nameRowEl, setNameRowEl] = useState<HTMLDivElement | null>(null);
  const attachNameRow = useCallback((node: HTMLDivElement | null) => {
    nameRowRef.current = node;
    setNameRowEl(node);
  }, []);
  useLayoutEffect(() => {
    if (!nameRowEl) return;
    const measure = () => setNameRowWidth(nameRowEl.offsetWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(nameRowEl);
    return () => observer.disconnect();
  }, [nameRowEl]);

  return {
    typePresence,
    colorPresence,
    pickerPos,
    pickerRef,
    attachNameRow,
    nameRowWidth,
  };
}
