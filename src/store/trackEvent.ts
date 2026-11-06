/**
 * Usage events the diagram reports to the host through `Config.onEventEmit`.
 *
 * Each completed in-diagram edit emits one event:
 * `onEventEmit("trackEvent", { label, action, category: "sequence" })`.
 * The payload carries no diagram text: `action` names the edit and `label`
 * is coarse metadata about where it came from (often empty).
 */
export const TRACK_EVENT = "trackEvent";
export const TRACK_CATEGORY = "sequence";

export type TrackAction =
  | "title_edited"
  | "participant_added"
  | "participant_renamed"
  | "message_inserted"
  | "message_label_edited"
  | "message_reordered"
  | "divider_inserted"
  | "fragment_condition_edited";

/** The edit a commit completes. `label` must never carry user text. */
export interface TrackedEdit {
  action: TrackAction;
  label?: string;
}

export interface TrackEventData {
  label: string;
  action: TrackAction;
  category: typeof TRACK_CATEGORY;
}

export const trackEvent = (
  emit: (name: string, data: TrackEventData) => void,
  edit: TrackedEdit,
): void => {
  emit(TRACK_EVENT, {
    label: edit.label ?? "",
    action: edit.action,
    category: TRACK_CATEGORY,
  });
};
