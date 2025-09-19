import { atom } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext } from "@/parser";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";
import { buildMessagesModel, buildMessagesModelWithContexts } from "@/ir/messages";
import { buildParticipantsModel } from "@/ir/participants";
import { buildFramesModel } from "@/ir/frames";
import { buildGroupsModel } from "@/ir/groups";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { buildMessagesVM } from "@/vm/messages";
import type { MessageVM } from "@/vm/messages";
import { buildParticipantsVM } from "@/vm/participants";
import { buildGroupsVM } from "@/vm/groups";
import { buildTitleVM } from "@/vm/title";
import { buildBlockVM } from "@/vm/block";
import { buildMessageLayerVM } from "@/vm/messageLayer";

/*
 * RenderMode
 * Static: Compatible with Mermaid which renders once and never update. It also disables sticky participants and hides the footer
 * Dynamic: Render once and update when code changes
 */
export const enum RenderMode {
  Static = "static",
  Dynamic = "dynamic",
}

export const codeAtom = atom("");

export const rootContextAtom = atom((get) => RootContext(get(codeAtom)));

export const titleAtom = atom<string | null>((get) =>
  get(rootContextAtom)?.title()?.content(),
);

export const titleVMAtom = atom((get) => {
  const titleContext = get(rootContextAtom)?.title();
  return buildTitleVM(titleContext);
});

export const coordinatesAtom = atom(
  (get) => new Coordinates(get(rootContextAtom), WidthProviderOnBrowser),
);

// Thin messages model atom (used incrementally)
export const messagesModelAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildMessagesModel(ctx) : [];
});

// Messages model with contexts for VM building
export const messagesModelWithContextsAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildMessagesModelWithContexts(ctx) : { messages: [], contexts: {} };
});

// View-model for messages (adapter over IR)
export const messagesVMAtom = atom((get) => {
  const { messages, contexts } = get(messagesModelWithContextsAtom);
  return buildMessagesVM(messages, contexts);
});

export const messagesVMByStartAtom = atom((get) => {
  const vms = get(messagesVMAtom);
  const map: Record<number, MessageVM> = {};
  for (const vm of vms) {
    const start = vm.range?.[0];
    if (typeof start === "number") {
      map[start] = vm;
    }
  }
  return map;
});

// Participants IR is the canonical source of participants
export const participantsAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildParticipantsModel(ctx) : [];
});

// Participants VM provides enhanced participant data for UI components
export const participantsVMAtom = atom((get) => {
  const participantsIR = get(participantsAtom);
  return buildParticipantsVM(participantsIR);
});

// Groups IR is the canonical source of groups
export const groupsAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildGroupsModel(ctx) : [];
});

// Groups VM provides enhanced group data for UI components
export const groupsVMAtom = atom((get) => {
  const groupsIR = get(groupsAtom);
  return buildGroupsVM(groupsIR);
});

export const framesModelAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  if (!ctx) {
    return { root: null, byId: {} };
  }
  const coordinates = get(coordinatesAtom);
  const ordered = coordinates.orderedParticipantNames();
  return buildFramesModel(ctx, ordered);
});

// MessageLayer VM (origin and padding)
export const messageLayerVMAtom = atom((get) => {
  const coordinates = get(coordinatesAtom);
  const messagesVM = get(messagesVMAtom);
  return buildMessageLayerVM(messagesVM, coordinates);
});

// BlockVM for the root message block
export const blockVMAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  const blockCtx = ctx?.block();
  return buildBlockVM(blockCtx);
});

export const themeAtom = atom("theme-default");

export const enableScopedThemingAtom = atom<boolean>(false);

export const themeIconDotAtom = atomWithLocalStorage(
  `${location.hostname}-zenuml-theme-icon-dot`,
  "1",
);

export const enableMultiThemeAtom = atom(true);

export const scaleAtom = atom(1);

export const selectedAtom = atom<string[]>([]);

export const onSelectAtom = atom(null, (get, set, payload: string) => {
  const selected = get(selectedAtom);
  if (selected.includes(payload)) {
    set(
      selectedAtom,
      selected.filter((item) => item !== payload),
    );
  } else {
    set(selectedAtom, [...selected, payload]);
  }
});

export const cursorAtom = atom<number | null | undefined>(null);

export const showTipsAtom = atom(false);

export const modeAtom = atom(RenderMode.Dynamic);

export const enableNumberingAtom = atomWithLocalStorage(
  `${location.hostname}-zenuml-numbering`,
  true,
);

export const stickyOffsetAtom = atom(0);

export const diagramElementAtom = atom<HTMLElement | null>(null);

export const onElementClickAtom = atomWithFunctionValue(
  (codeRange: CodeRange) => {
    console.log("Element clicked", codeRange);
  },
);

export const onMessageClickAtom = atomWithFunctionValue<
  (codeRange: CodeRange, element: HTMLElement) => void
>(() => {});

export const onContentChangeAtom = atomWithFunctionValue<
  (code: string) => void
>(() => {});

export const onThemeChangeAtom = atomWithFunctionValue<
  (data: { theme: string; scoped: boolean }) => void
>(() => {});

export const onEventEmitAtom = atomWithFunctionValue<
  (name: string, data: any) => void
>(() => {});

export const lifelineReadyAtom = atom<string[]>([]);

export const renderingReadyAtom = atom((get) => {
  const lifeLineReady = get(lifelineReadyAtom);
  const names = get(coordinatesAtom).orderedParticipantNames();
  const expected = names.filter((n) => n !== _STARTER_).length;
  return lifeLineReady.length === expected;
});
