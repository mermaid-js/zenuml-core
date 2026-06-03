export type PendingEditableRange = {
  start: number;
  end: number;
  token: number;
};

/** Match pending auto-edit only when a real range is stored (see EditableLabelField). */
export function resolveAutoEditToken(
  pending: PendingEditableRange | null,
  start: number | undefined,
  end: number | undefined,
): number | undefined {
  if (pending == null) {
    return undefined;
  }
  if (pending.start === start && pending.end === end) {
    return pending.token;
  }
  return undefined;
}
