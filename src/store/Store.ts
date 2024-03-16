import now from "lodash/now";
import {
  RootContext,
  Participants,
  GroupContext,
  ParticipantContext,
} from "../parser/index.js";

import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";
import { StoreOptions } from "vuex";

let storeInitiationTime: number = 0;
setTimeout(function () {
  if (!storeInitiationTime) {
    console.warn(
      "[@zenuml/core] Store is a function and is not initiated in 1 second.",
    );
  }
}, 1000);

export interface Warning {
  title: string;
  message: string;
}

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
  warning: Warning | undefined;
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
  // TODO: remove state any type
  storeInitiationTime = now();
  return {
    state: {
      warning: undefined,
      code: "",
      theme:
        localStorage.getItem(`${location.hostname}-zenuml-theme`) ||
        "theme-default",
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
        return Participants(getters.rootContext, true);
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
        if (payload) {
          localStorage.setItem(`${location.hostname}-zenuml-theme`, payload);
        } else {
          localStorage.setItem(
            `${location.hostname}-zenuml-theme`,
            "theme-default",
          );
        }
        state.theme = payload;
        state.onThemeChange?.(payload);
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
export default Store;
