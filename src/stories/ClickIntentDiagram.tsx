import { useEffect, useMemo } from "react";
import { Provider, createStore } from "jotai";
import {
  codeAtom,
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  enableParticipantInsertionAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
} from "@/store/Store";
import { DiagramFrame } from "@/components/DiagramFrame/DiagramFrame";
import { ensureDiagramFontsLoaded } from "@/svg/fonts/ensureDiagramFontsLoaded";
import "@/assets/tailwind.css";
import "@/assets/tailwind-preflight.less";
import "@/components/Cosmetic.scss";
import "@/components/Cosmetic-blue.scss";
import "@/components/Cosmetic-black-white.scss";
import "@/components/Cosmetic-star-uml.scss";
import "@/components/theme-blue-river.scss";
import "@/themes/theme-dark.css";

export type ClickIntentMode = "Dynamic" | "Static";

export const ClickIntentDiagram = ({
  mode,
  code,
  selectedParticipant,
}: {
  mode: ClickIntentMode;
  code: string;
  /** Opens the participant editor on this participant once rendered. */
  selectedParticipant?: string;
}) => {
  const store = useMemo(() => {
    const nextStore = createStore();
    nextStore.set(
      modeAtom,
      mode === "Dynamic" ? RenderMode.Dynamic : RenderMode.Static,
    );
    nextStore.set(enableParticipantInsertionAtom, true);
    nextStore.set(enableMessageInsertionAtom, true);
    nextStore.set(enableDividerInsertionAtom, true);
    nextStore.set(enableParticipantStyleEditingAtom, true);
    nextStore.set(enableMessageReorderAtom, true);
    return nextStore;
  }, [mode]);

  useEffect(() => {
    let active = true;
    void ensureDiagramFontsLoaded().then(() => {
      if (!active) return;
      store.set(codeAtom, code);
      if (selectedParticipant) store.set(selectedAtom, [selectedParticipant]);
    });
    return () => {
      active = false;
    };
  }, [code, selectedParticipant, store]);

  return (
    <Provider store={store}>
      <div
        className="zenuml theme-default"
        style={{
          // Leave room below the diagram for the participant editor popover.
          minHeight: selectedParticipant ? 640 : 280,
          padding: "24px 24px 24px 56px",
        }}
      >
        <DiagramFrame />
      </div>
    </Provider>
  );
};
