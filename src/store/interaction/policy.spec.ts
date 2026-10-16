import {
  createMessageDragAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderPendingAtom,
  modeAtom,
  RenderMode,
  activeTextEditorsAtom,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
  canAtom,
  enterMenuAtom,
  exitMenuAtom,
  interactionAtom,
  openMenuAtom,
} from "./interactionAtom";
import { CAPABILITIES, can, INTERACTION_KINDS, POLICY } from "./policy";

const DRAG = {
  source: "A",
  sourceX: 0,
  sourceY: 0,
  pointerX: 0,
  pointerY: 0,
  hoverTarget: null,
  insertIndex: 0,
  blockContext: null,
};

describe("POLICY table", () => {
  it("defines every capability for every state", () => {
    for (const kind of INTERACTION_KINDS) {
      for (const cap of CAPABILITIES) {
        expect(typeof POLICY[kind][cap]).toBe("boolean");
      }
    }
  });

  it("allows everything in idle", () => {
    for (const cap of CAPABILITIES) expect(POLICY.idle[cap]).toBe(true);
  });

  it("allows only selection while the participant editor is open", () => {
    const allowed = CAPABILITIES.filter((cap) => POLICY.participantEditor[cap]);
    expect(allowed).toEqual(["select"]);
  });

  it("keeps each drag's own capability so the drag can complete", () => {
    expect(POLICY.createDrag.createMessage).toBe(true);
    expect(POLICY.createDrag.reorder).toBe(false);
    expect(POLICY.reorderDrag.reorder).toBe(true);
    expect(POLICY.reorderDrag.createMessage).toBe(false);
  });

  it("blocks everything while a gap menu is open (its own item is ungated)", () => {
    const allowed = CAPABILITIES.filter((cap) => POLICY.gapMenu[cap]);
    expect(allowed).toEqual([]);
  });

  it("allows only select, reorder and text edit while the message menu is open", () => {
    const allowed = CAPABILITIES.filter((cap) => POLICY.messageMenu[cap]);
    expect(allowed).toEqual(["select", "reorder", "textEdit"]);
  });
});

describe("can()", () => {
  const ctx = { mode: RenderMode.Dynamic, textEditing: false };

  it("follows the table in Dynamic mode", () => {
    expect(can({ kind: "idle" }, "reorder", ctx)).toBe(true);
    expect(
      can({ kind: "participantEditor", participant: "A" }, "reorder", ctx),
    ).toBe(false);
  });

  it("allows nothing editable in Static mode, but keeps view-only collapse", () => {
    const staticCtx = { mode: RenderMode.Static, textEditing: false };
    expect(can({ kind: "idle" }, "reorder", staticCtx)).toBe(false);
    expect(can({ kind: "idle" }, "createMessage", staticCtx)).toBe(false);
    expect(can({ kind: "idle" }, "collapse", staticCtx)).toBe(true);
  });

  it("allows nothing outside the active text editor while text editing", () => {
    const editing = { mode: RenderMode.Dynamic, textEditing: true };
    for (const cap of CAPABILITIES) {
      expect(can({ kind: "idle" }, cap, editing)).toBe(cap === "textEdit");
    }
  });
});

describe("interactionAtom (derived from existing atoms in P1)", () => {
  it("is idle by default", () => {
    expect(createStore().get(interactionAtom)).toEqual({ kind: "idle" });
  });

  it("is participantEditor when one participant is selected and editing is enabled", () => {
    const store = createStore();
    store.set(selectedAtom, ["A"]);
    expect(store.get(interactionAtom).kind).toBe("idle");
    store.set(enableParticipantStyleEditingAtom, true);
    expect(store.get(interactionAtom)).toEqual({
      kind: "participantEditor",
      participant: "A",
    });
  });

  it("prefers createDrag over the selection an occurrence drag also sets", () => {
    const store = createStore();
    store.set(enableParticipantStyleEditingAtom, true);
    store.set(selectedAtom, ["A"]);
    store.set(createMessageDragAtom, DRAG);
    expect(store.get(interactionAtom).kind).toBe("createDrag");
  });

  it("is reorderDrag while a reorder press is pending or dragging", () => {
    const store = createStore();
    store.set(messageReorderPendingAtom, { key: "1-2", startX: 0, startY: 0 });
    expect(store.get(interactionAtom).kind).toBe("reorderDrag");
    store.set(messageReorderPendingAtom, null);
    store.set(messageReorderDragAtom, "1-2");
    expect(store.get(interactionAtom).kind).toBe("reorderDrag");
  });

  it("stays idle while a message is selected but its menu is closed", () => {
    const store = createStore();
    store.set(selectedMessageAtom, { start: 1, end: 2, token: 1 });
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("canAtom combines state, mode and the text-edit overlay", () => {
    const store = createStore();
    expect(store.get(canAtom("collapse"))).toBe(true);
    store.set(enableParticipantStyleEditingAtom, true);
    store.set(selectedAtom, ["A"]);
    expect(store.get(canAtom("collapse"))).toBe(false);
    store.set(selectedAtom, []);
    store.set(activeTextEditorsAtom, new Set([Symbol("editor")]));
    expect(store.get(canAtom("collapse"))).toBe(false);
    store.set(activeTextEditorsAtom, new Set());
    store.set(modeAtom, RenderMode.Static);
    expect(store.get(canAtom("reorder"))).toBe(false);
  });
});

describe("stored menu state (P2)", () => {
  it("is messageMenu while the message menu is open", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    expect(store.get(interactionAtom)).toEqual({
      kind: "messageMenu",
      start: 1,
      end: 2,
    });
    store.set(exitMenuAtom, { kind: "messageMenu" });
    expect(store.get(interactionAtom)).toEqual({ kind: "idle" });
  });

  it("is gapMenu while a gap menu is open", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "gapMenu", id: "g1" });
    expect(store.get(interactionAtom)).toEqual({ kind: "gapMenu", id: "g1" });
  });

  it("R1: entering a menu exits the menu that was open", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    store.set(enterMenuAtom, { kind: "gapMenu", id: "g1" });
    expect(store.get(openMenuAtom)).toEqual({ kind: "gapMenu", id: "g1" });
  });

  it("an exit only closes the menu it names", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "gapMenu", id: "g1" });
    store.set(exitMenuAtom, { kind: "gapMenu", id: "g2" });
    store.set(exitMenuAtom, { kind: "messageMenu" });
    expect(store.get(openMenuAtom)).toEqual({ kind: "gapMenu", id: "g1" });
    store.set(exitMenuAtom, { kind: "gapMenu", id: "g1" });
    expect(store.get(openMenuAtom)).toBeNull();
  });

  it("drags and the participant editor win over a stored menu", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    store.set(createMessageDragAtom, DRAG);
    expect(store.get(interactionAtom).kind).toBe("createDrag");
    store.set(createMessageDragAtom, null);
    store.set(enableParticipantStyleEditingAtom, true);
    store.set(selectedAtom, ["A"]);
    expect(store.get(interactionAtom).kind).toBe("participantEditor");
  });

  it("blocks create, collapse and insert participant while the message menu is open", () => {
    const store = createStore();
    store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    expect(store.get(canAtom("createMessage"))).toBe(false);
    expect(store.get(canAtom("collapse"))).toBe(false);
    expect(store.get(canAtom("insertParticipant"))).toBe(false);
    expect(store.get(canAtom("hoverAffordance"))).toBe(false);
    expect(store.get(canAtom("reorder"))).toBe(true);
    expect(store.get(canAtom("select"))).toBe(true);
  });
});
