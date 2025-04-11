import {
  RootContext,
  Participants,
  GroupContext,
  ParticipantContext,
} from "@/parser";

import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "@/positioning/Coordinates";
import { CodeRange } from "@/parser/CodeRange";
import { StoreOptions } from "vuex";
import { Participant } from "@/parser/Participants";

/*
 * RenderMode
 * Static: Compatible with Mermaid renderind which renders once and never update. It also disables sticky participants and hides the footer
 * Dynamic: Render once and update when code changes
 */
export const enum RenderMode {
  Static = "static",
  Dynamic = "dynamic",
}

export interface StoreState {
  code: string;
  scale: number;
  selected: any[];
  cursor: any;
  mode: RenderMode;
  showTips: boolean;
  onElementClick: (codeRange: CodeRange) => void;
  numbering: boolean;
}
// vuex 101: Deal with sync in mutation, async in actions
const Store = (): StoreOptions<StoreState> => {
  return {
    state: {
      code: "",
      theme: "theme-default",
      enableScopedTheming: false,
      themeIconDot: Boolean(
        localStorage.getItem(`${location.hostname}-zenuml-theme-icon-dot`),
      ),
      enableMultiTheme: true,
      scale: 1,
      selected: [],
      cursor: null,
      showTips: false,
      mode: RenderMode.Dynamic,
      numbering: Boolean(
        localStorage.getItem(`${location.hostname}-zenuml-numbering`),
      ),
      stickyOffset: 0,
      diagramElement: null,
      onElementClick: (codeRange: CodeRange) => {
        console.log("Element clicked", codeRange);
      },
      onMessageClick: () => {},
      onContentChange: () => {},
      onThemeChange: () => {},
      onEventEmit: () => {},
    } as StoreState,
    getters: {
      code: (state: any) => state.code,
      rootContext: (state: any) => {
        return RootContext(state.code);
      },
      title: (state: any, getters: any) => {
        return getters.rootContext?.title()?.content();
      },
      participants: (state: any, getters: any) => {
        return Participants(getters.rootContext);
      },
      coordinates: (state: any, getters: any) => {
        return new Coordinates(getters.rootContext, WidthProviderOnBrowser);
      },
      centerOf: (state: any, getters: any) => (entity: any) => {
        if (!entity) {
          console.error("[@zenuml/core] centerOf: entity is undefined");
          return 0;
        }
        try {
          return getters.coordinates.getPosition(entity) || 0;
        } catch (e) {
          console.error(e);
          return 0;
        }
      },
      GroupContext: () => GroupContext,
      ParticipantContext: () => ParticipantContext,
      cursor: (state: any) => state.cursor,
      // deprecated, use distances that returns centerOf(to) - centerOf(from)
      distance: (state: any, getters: any) => (from: any, to: any) => {
        return getters.centerOf(from) - getters.centerOf(to);
      },
      distance2: (state: any, getters: any) => (from: any, to: any) => {
        if (!from || !to) return 0;
        return getters.centerOf(to) - getters.centerOf(from);
      },
      onElementClick: (state: any) => state.onElementClick,
      onMessageClick: (state: any) => state.onMessageClick,
      diagramElement: (state: any) => state.diagramElement,
      onContentChange: (state: any) => state.onContentChange,
      onThemeChange: (state: any) => state.onThemeChange,
      onEventEmit: (state: any) => state.onEventEmit,
    },
    mutations: {
      code: function (state: any, payload: any) {
        state.code = payload;
      },
      setScale: function (state: any, payload: any) {
        state.scale = payload;
      },
      onSelect: function (state: any, payload: any) {
        if (state.selected.includes(payload)) {
          state.selected = state.selected.filter((p: any) => p !== payload);
        } else {
          state.selected.push(payload);
        }
      },
      cursor: function (state: any, payload: any) {
        state.cursor = payload;
      },
      toggleNumbering(state, payload: boolean) {
        if (payload) {
          localStorage.setItem(`${location.hostname}-zenuml-numbering`, "1");
        } else {
          localStorage.setItem(`${location.hostname}-zenuml-numbering`, "");
        }
        state.numbering = payload;
      },
      setTheme: function (state: any, payload: string) {
        state.theme = payload;
        state.onThemeChange?.({
          theme: payload,
          scoped: Boolean(state.enableScopedTheming),
        });
      },
      setThemeIconDot: function (state: any, payload: boolean) {
        localStorage.setItem(
          `${location.hostname}-zenuml-theme-icon-dot`,
          payload ? "1" : "",
        );
        state.themeIconDot = payload;
      },
      setEnableScopedTheming: function (state: any, payload: boolean) {
        state.enableScopedTheming = payload;
        state.onThemeChange?.({
          theme: state.theme,
          scoped: payload,
        });
      },
      updateParticipant: function (
        state: any,
        payload: { participant: Participant; color?: string },
      ) {
        const { participant, color } = payload;
        // Get the original text range
        const range = participant.getRange();
        if (!range) return;

        // Get the text content and update it with the new color
        const originalText = state.code.substring(range.start, range.end);
        const updatedText = updateParticipantColorInText(originalText, color);

        // Replace the text in the code
        state.code =
          state.code.substring(0, range.start) +
          updatedText +
          state.code.substring(range.end);
      },
      eventEmit: function (state: any, payload: any) {
        state.onEventEmit?.(payload.event, payload.data);
      },
      onEventEmit: function (state: any, payload: any) {
        state.onEventEmit = payload;
      },
      onMessageClick: function (state: any, payload: any) {
        state.onMessageClick = payload;
      },
      onContentChange: function (state: any, payload: any) {
        state.onContentChange = payload;
      },
      onThemeChange: function (state: any, payload: any) {
        state.onThemeChange = payload;
      },
      diagramElement: function (state: any, payload: any) {
        state.diagramElement = payload;
      },
    },
    actions: {
      updateParticipantColor(
        { commit, state },
        { color, participant }: { color?: string; participant: Participant },
      ) {
        console.log("participant:", participant);

        // Only update color if the participant was explicitly declared
        if (!participant?.explicit || !participant?.declaration) {
          return;
        }

        // Get the declaration and its position
        const declaration = participant.declaration;

        // Find the end of the declaration (either current color position or name position)
        const declarationStart = declaration.start;
        const declarationEnd = declaration.stop;

        // Get the full declaration text including any existing color
        const declarationText = state.code.substring(
          declarationStart,
          declarationEnd,
        );
        console.log("declarationText:", declarationText);

        // Update the color in the code
        const beforeCode = state.code.substring(0, declarationStart);
        const afterCode = state.code.substring(declarationEnd);
        const updatedDeclarationText = updateParticipantColorInText(
          declarationText,
          color,
        );
        const newCode = beforeCode + updatedDeclarationText + afterCode;

        // Update code through mutation
        commit("code", newCode);
        state.onContentChange?.(newCode);
      },
      // Why debounce is here instead of mutation 'code'?
      // Both code and cursor must be mutated together, especially during typing.
      updateCode: function ({ commit }: any, payload: any) {
        if (typeof payload === "string") {
          throw Error(
            "You are using a old version of vue-sequence. New version requires {code, cursor}.",
          );
        }
        if (payload.code !== this.state.code) {
          commit("code", payload.code);
        }
      },
    },
    // TODO: Enable strict for development?
    strict: false,
  };
};

// Helper function to update color in participant declaration text
export function updateParticipantColorInText(
  text: string,
  color?: string,
): string {
  // Remove any existing color (format: #RRGGBB) and trailing whitespace/newlines
  const baseText = text.replace(/#[0-9a-fA-F]{6}/g, "").trim();

  // Add new color if provided
  return color ? `${baseText} ${color}` : baseText;
}

export default Store;
