import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ParticipantDeclaration } from "@/utils/participantStyleTransform";
import { useParticipantDrafts } from "./useParticipantDrafts";

type Props = {
  name: string | null;
  declaration: ParticipantDeclaration | null;
};

const setup = (initialProps: Props) =>
  renderHook(
    ({ name, declaration }: Props) => useParticipantDrafts(name, declaration),
    { initialProps },
  );

describe("useParticipantDrafts", () => {
  it("starts from the participant and its declaration", () => {
    const { result } = setup({
      name: "A",
      declaration: { name: "A", stereotype: "svc", label: "Alpha" },
    });
    expect(result.current.nameDraft).toBe("A");
    expect(result.current.stereotypeDraft).toBe("svc");
    expect(result.current.labelDraft).toBe("Alpha");
    expect(result.current.nameError).toBeNull();
    expect(result.current.styleError).toBeNull();
  });

  it("resyncs every draft and clears errors when the participant changes", () => {
    const { result, rerender } = setup({
      name: "A",
      declaration: { name: "A" },
    });
    act(() => {
      result.current.setNameDraft("typed");
      result.current.setLabelDraft("typed label");
      result.current.setNameError("bad");
      result.current.setStyleError("bad style");
    });
    // B has the same (empty) label as A: the draft still resets.
    rerender({ name: "B", declaration: { name: "B" } });
    expect(result.current.nameDraft).toBe("B");
    expect(result.current.labelDraft).toBe("");
    expect(result.current.nameError).toBeNull();
    expect(result.current.styleError).toBeNull();
  });

  it("resyncs the label and stereotype when the declaration changes underneath", () => {
    const { result, rerender } = setup({
      name: "A",
      declaration: { name: "A" },
    });
    rerender({
      name: "A",
      declaration: { name: "A", stereotype: "db", label: "Store" },
    });
    expect(result.current.stereotypeDraft).toBe("db");
    expect(result.current.labelDraft).toBe("Store");
  });

  describe("commitName", () => {
    it("normalises an unchanged name without renaming", () => {
      const { result } = setup({ name: "A", declaration: null });
      act(() => result.current.setNameDraft("  A  "));
      const rename = vi.fn();
      let ok = false;
      act(() => {
        ok = result.current.commitName(rename, vi.fn());
      });
      expect(ok).toBe(true);
      expect(rename).not.toHaveBeenCalled();
      expect(result.current.nameDraft).toBe("A");
    });

    it("keeps the draft and reports the error of a rejected rename", () => {
      const { result } = setup({ name: "A", declaration: null });
      act(() => result.current.setNameDraft("B"));
      const onRenamed = vi.fn();
      let ok = true;
      act(() => {
        ok = result.current.commitName(
          () => ({ error: '"B" already exists' }),
          onRenamed,
        );
      });
      expect(ok).toBe(false);
      expect(onRenamed).not.toHaveBeenCalled();
      expect(result.current.nameDraft).toBe("B");
      expect(result.current.nameError).toBe('"B" already exists');
    });

    it("takes the canonical name of a successful rename", () => {
      const { result } = setup({ name: "A", declaration: null });
      act(() => result.current.setNameDraft(" Bee "));
      const rename = vi.fn(() => ({ code: "Bee->C", name: "Bee" }));
      const onRenamed = vi.fn();
      act(() => {
        result.current.commitName(rename, onRenamed);
      });
      expect(rename).toHaveBeenCalledWith(" Bee ");
      expect(onRenamed).toHaveBeenCalledWith({ code: "Bee->C", name: "Bee" });
      expect(result.current.nameDraft).toBe("Bee");
      expect(result.current.nameError).toBeNull();
    });
  });

  describe("commitStereotype / commitLabel", () => {
    it("skips an unchanged value", () => {
      const { result } = setup({
        name: "A",
        declaration: { name: "A", stereotype: "svc", label: "Alpha" },
      });
      const apply = vi.fn(() => true);
      act(() => result.current.setStereotypeDraft(" svc "));
      expect(result.current.commitStereotype(apply)).toBe(true);
      expect(result.current.commitLabel(apply)).toBe(true);
      expect(apply).not.toHaveBeenCalled();
    });

    it("applies a trimmed value, and null for an erased one", () => {
      const { result } = setup({
        name: "A",
        declaration: { name: "A", stereotype: "svc" },
      });
      const apply = vi.fn(() => true);
      act(() => {
        result.current.setStereotypeDraft("  ");
        result.current.setLabelDraft(" Alpha ");
      });
      result.current.commitStereotype(apply);
      result.current.commitLabel(apply);
      expect(apply.mock.calls).toEqual([
        [{ stereotype: null }],
        [{ label: "Alpha" }],
      ]);
    });

    it("returns the apply result", () => {
      const { result } = setup({ name: "A", declaration: { name: "A" } });
      act(() => result.current.setLabelDraft("x"));
      expect(result.current.commitLabel(() => false)).toBe(false);
    });
  });

  describe("discard", () => {
    it("resets the field and makes the following commits no-ops", () => {
      const { result } = setup({
        name: "A",
        declaration: { name: "A", label: "Alpha" },
      });
      act(() => {
        result.current.setNameDraft("B");
        result.current.setLabelDraft("changed");
      });
      act(() => result.current.discard("label"));
      expect(result.current.labelDraft).toBe("Alpha");
      // The name draft is untouched, but the blur that follows Escape must
      // not commit it.
      expect(result.current.nameDraft).toBe("B");
      const rename = vi.fn();
      const apply = vi.fn(() => true);
      expect(result.current.commitName(rename, vi.fn())).toBe(true);
      expect(result.current.commitLabel(apply)).toBe(true);
      expect(rename).not.toHaveBeenCalled();
      expect(apply).not.toHaveBeenCalled();
    });

    it("resets the name and the stereotype to the committed values", () => {
      const { result } = setup({
        name: "A",
        declaration: { name: "A", stereotype: "svc" },
      });
      act(() => {
        result.current.setNameDraft("B");
        result.current.setStereotypeDraft("other");
      });
      act(() => result.current.discard("name"));
      act(() => result.current.discard("stereotype"));
      expect(result.current.nameDraft).toBe("A");
      expect(result.current.stereotypeDraft).toBe("svc");
    });

    it("is lifted when the participant changes", () => {
      const { result, rerender } = setup({
        name: "A",
        declaration: { name: "A" },
      });
      act(() => result.current.discard("label"));
      rerender({ name: "B", declaration: { name: "B" } });
      act(() => result.current.setLabelDraft("Bee"));
      const apply = vi.fn(() => true);
      result.current.commitLabel(apply);
      expect(apply).toHaveBeenCalledWith({ label: "Bee" });
    });
  });
});
