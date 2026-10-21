import { useLayoutEffect } from "react";

/** Resolves a render request after React has committed its visible tree. */
export const CommitSignal = ({
  revision,
  onCommit,
}: {
  revision: number;
  onCommit: (revision: number) => void;
}) => {
  useLayoutEffect(() => onCommit(revision), [revision, onCommit]);
  return null;
};
