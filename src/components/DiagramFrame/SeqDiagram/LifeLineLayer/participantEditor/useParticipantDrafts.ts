import { useEffect, useRef, useState } from "react";
import type {
  ParticipantDeclaration,
  ParticipantUpdates,
} from "@/utils/participantStyleTransform";
import type { RenameResult } from "@/utils/participantRenameTransform";

export type DraftField = "name" | "stereotype" | "label";

/**
 * The participant editor's text drafts (name, stereotype, label), their
 * validation errors and their commit rules. Applying a commit to the DSL is
 * the caller's: the commit functions take the apply step as an argument.
 */
export function useParticipantDrafts(
  participantName: string | null,
  declaration: ParticipantDeclaration | null,
) {
  const currentStereotype = declaration?.stereotype ?? "";
  const currentLabel = declaration?.label ?? "";

  // Text fields are committed on Enter/blur, so they keep local drafts that
  // resync whenever the participant or its declaration changes underneath.
  const [nameDraft, setNameDraft] = useState("");
  const [stereotypeDraft, setStereotypeDraft] = useState("");
  const [labelDraft, setLabelDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [styleError, setStyleError] = useState<string | null>(null);
  // Escape discards the drafts; the blur that follows must not commit them.
  const skipCommitRef = useRef(false);
  // `participantName` is a dependency of every draft so that switching to
  // another participant whose value is identical (e.g. both unlabeled) still
  // resets the field.
  useEffect(() => {
    setNameDraft(participantName ?? "");
    setNameError(null);
    setStyleError(null);
    skipCommitRef.current = false;
  }, [participantName]);
  useEffect(
    () => setStereotypeDraft(currentStereotype),
    [participantName, currentStereotype],
  );
  useEffect(() => setLabelDraft(currentLabel), [participantName, currentLabel]);

  const commitName = (
    rename: (draft: string) => RenameResult,
    onRenamed: (result: { code: string; name: string }) => void,
  ): boolean => {
    if (skipCommitRef.current) return true;
    if (nameDraft.trim() === participantName) {
      setNameDraft(participantName);
      setNameError(null);
      return true;
    }
    const result = rename(nameDraft);
    if ("error" in result) {
      setNameError(result.error);
      return false;
    }
    setNameError(null);
    setNameDraft(result.name);
    onRenamed(result);
    return true;
  };

  const commitStereotype = (
    applyStyle: (updates: ParticipantUpdates) => boolean,
  ): boolean => {
    if (skipCommitRef.current) return true;
    const next = stereotypeDraft.trim();
    if (next === currentStereotype) return true;
    return applyStyle({ stereotype: next || null });
  };

  const commitLabel = (
    applyStyle: (updates: ParticipantUpdates) => boolean,
  ): boolean => {
    if (skipCommitRef.current) return true;
    const next = labelDraft.trim();
    if (next === currentLabel) return true;
    return applyStyle({ label: next || null });
  };

  // Escape: discard the field's draft; the blur that follows must not commit.
  const discard = (field: DraftField) => {
    skipCommitRef.current = true;
    if (field === "name") setNameDraft(participantName ?? "");
    else if (field === "stereotype") setStereotypeDraft(currentStereotype);
    else setLabelDraft(currentLabel);
  };

  return {
    nameDraft,
    setNameDraft,
    stereotypeDraft,
    setStereotypeDraft,
    labelDraft,
    setLabelDraft,
    nameError,
    setNameError,
    styleError,
    setStyleError,
    commitName,
    commitStereotype,
    commitLabel,
    discard,
  };
}
