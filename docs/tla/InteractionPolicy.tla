------------------------- MODULE InteractionPolicy -------------------------
(***************************************************************************)
(* The on-canvas interaction state of one diagram (ADR 0002).              *)
(*                                                                         *)
(* The variable `s` mirrors the Jotai atoms the state is read from; each   *)
(* action is one input event or one React effect, named after the code     *)
(* that runs it. Files are under src/ unless they start with "SeqDiagram/" *)
(* (src/components/DiagramFrame/SeqDiagram/).                              *)
(*                                                                         *)
(*   s.sel    selectedAtom (as a set)                                      *)
(*   s.msg    selectedMessageAtom /= null                                  *)
(*   s.menu   openMenuAtom: None, "messageMenu" or a gap                   *)
(*   s.cdrag  createMessageDragAtom /= null                                *)
(*   s.rpend  messageReorderPendingAtom /= null                            *)
(*   s.rdrag  messageReorderDragAtom /= null                               *)
(*   s.edit   textEditingAtom (the text-edit overlay)                      *)
(*                                                                         *)
(* Input events are atomic steps: the InteractionController's capture      *)
(* listener runs first, then the target's own handler unless the press     *)
(* was consumed (gate B). React effects are separate steps, so input can   *)
(* interleave with them, which is the race the drag handlers guard         *)
(* against by reading the store.                                           *)
(*                                                                         *)
(* Run: `bun run tla` (InteractionPolicy.cfg, must pass) and               *)
(* `bun run tla gaps` (InteractionPolicyGaps.cfg, the ADR's P4 known       *)
(* gaps written as properties). See docs/tla/README.md.                    *)
(***************************************************************************)
EXTENDS FiniteSets

CONSTANTS Participants, Gaps

None == "none"

States == {"idle", "participantEditor", "messageMenu", "gapMenu",
           "createDrag", "reorderDrag"}

Caps == {"select", "insertParticipant", "createMessage", "reorder",
         "collapse", "textEdit", "hoverAffordance"}

\* BEGIN POLICY: must equal POLICY in store/interaction/policy.ts.
\* store/interaction/policy.tla.spec.ts compares the two.
Policy == [
  idle              |-> Caps,
  participantEditor |-> {"select"},
  messageMenu       |-> {"select", "reorder", "textEdit"},
  gapMenu           |-> {},
  createDrag        |-> {"createMessage"},
  reorderDrag       |-> {"reorder"}
]
\* END POLICY

ViewOnly == {"collapse"}

\* InteractionController: the states a press can leave. A drag holds the
\* pointer; only Escape ends it.
PressExits == {"participantEditor", "messageMenu", "gapMenu"}

VARIABLES s,          \* the atoms, see above
          dynamic,    \* modeAtom = RenderMode.Dynamic (fixed per run)
          editorFlag, \* enableParticipantStyleEditingAtom (fixed per run)
          last        \* ghost: the name of the last action, for properties

vars == <<s, dynamic, editorFlag, last>>

Atoms == [sel   : SUBSET Participants,
          msg   : BOOLEAN,
          menu  : {None, "messageMenu"} \cup Gaps,
          cdrag : BOOLEAN,
          rpend : BOOLEAN,
          rdrag : BOOLEAN,
          edit  : BOOLEAN]

-----------------------------------------------------------------------------
(* store/interaction/interactionAtom.ts                                    *)

\* derivedInteractionAtom: drags win over selection.
DerivedOf(x) ==
  IF x.cdrag THEN "createDrag"
  ELSE IF x.rpend \/ x.rdrag THEN "reorderDrag"
  ELSE IF editorFlag /\ Cardinality(x.sel) = 1 THEN "participantEditor"
  ELSE None

\* interactionAtom: a derived state wins over the stored menu.
StateOf(x) ==
  IF DerivedOf(x) /= None THEN DerivedOf(x)
  ELSE IF x.menu = "messageMenu" THEN "messageMenu"
  ELSE IF x.menu \in Gaps THEN "gapMenu"
  ELSE "idle"

\* policy.ts can()
CanIn(x, cap) ==
  /\ (dynamic \/ cap \in ViewOnly)
  /\ (~x.edit \/ cap = "textEdit")
  /\ cap \in Policy[StateOf(x)]

\* yieldMenuAtom. The controller runs it from store.sub whenever
\* derivedInteractionAtom changes, synchronously, so it is part of the step.
Yield(x) ==
  IF DerivedOf(x) /= None /\ x.menu /= None
  THEN [x EXCEPT !.menu = None]
  ELSE x

\* exitInteractionAtom
ExitOf(x) ==
  CASE StateOf(x) = "participantEditor" -> [x EXCEPT !.sel = {}]
    [] StateOf(x) \in {"messageMenu", "gapMenu"} -> [x EXCEPT !.menu = None]
    [] StateOf(x) = "createDrag" -> [x EXCEPT !.cdrag = FALSE, !.sel = {}]
    [] StateOf(x) = "reorderDrag" ->
         [x EXCEPT !.rpend = FALSE, !.rdrag = FALSE]
    [] OTHER -> x

-----------------------------------------------------------------------------
(* Press targets and their `data-cap`. `id` is a participant or a gap.     *)

Target(k, i, c) == [kind |-> k, id |-> i, cap |-> c]

Targets ==
  {Target("canvas", None, None), Target("outside", None, None),
   Target("message", None, "select"), Target("collapse", None, "collapse"),
   Target("insert", None, "insertParticipant"),
   Target("reorderHandle", None, "reorder")}
  \cup {Target("participant", p, "select") : p \in Participants}
  \cup {Target("occurrence", p, "createMessage") : p \in Participants}
  \cup {Target("gap", g, "createMessage") : g \in Gaps}

\* Kinds inside `.participant, .interaction`: a press on them keeps a
\* participant highlight.
KeepsHighlight == {"participant", "message", "occurrence", "reorderHandle"}

\* store/interaction/InteractionController.tsx onPointerDown. Returns the
\* atoms after the capture listener and whether the press was consumed.
Press(x, t) ==
  LET a == IF x.msg /\ t.kind /= "message"
           THEN [x EXCEPT !.msg = FALSE] ELSE x
      b == IF /\ a.sel /= {}
              /\ DerivedOf(a) = None
              /\ t.kind /= "outside"
              /\ t.kind \notin KeepsHighlight
           THEN [a EXCEPT !.sel = {}] ELSE a
      st == StateOf(b)
      gated == ~b.edit /\ st \in PressExits
      isConsumed == gated /\ t.cap /= None /\ t.cap \notin Policy[st]
      switch == st = "participantEditor" /\ t.kind = "participant"
  IN [after |-> IF gated /\ ~switch THEN ExitOf(b) ELSE b,
      consumed |-> isConsumed]

Do(x, name) ==
  /\ s' = Yield(x)
  /\ last' = name
  /\ UNCHANGED <<dynamic, editorFlag>>

-----------------------------------------------------------------------------
(* Input events                                                           *)

\* A press whose target does nothing further (or was consumed).
PressOnly(t) == dynamic /\ Do(Press(s, t).after, "Press")

\* SeqDiagram/MessageLayer/Block/Statement/Interaction/Occurrence/Occurrence.tsx
\* pointerdown. dragEnabled comes from the last render (pre-press state).
OccurrenceDragStart(p) ==
  LET r == Press(s, Target("occurrence", p, "createMessage"))
  IN /\ dynamic
     /\ CanIn(s, "createMessage")
     /\ ~r.consumed
     /\ Do([r.after EXCEPT !.msg = FALSE, !.sel = {p}, !.cdrag = TRUE],
           "OccurrenceDragStart")

\* SeqDiagram/MessageLayer/GapHandleZone.tsx pointerdown on the handle.
GapDragStart(g) ==
  LET r == Press(s, Target("gap", g, "createMessage"))
  IN /\ dynamic
     /\ CanIn(s, "createMessage")
     /\ ~r.consumed
     /\ Do([r.after EXCEPT !.msg = FALSE, !.sel = {}, !.cdrag = TRUE],
           "GapDragStart")

\* GapHandleZone.tsx contextmenu: canInsertDivider from the last render.
OpenGapMenu(g) ==
  LET r == Press(s, Target("gap", g, "createMessage"))
  IN /\ dynamic
     /\ CanIn(s, "createMessage")
     /\ ~r.consumed
     /\ Do([r.after EXCEPT !.menu = g], "OpenGapMenu")

\* SeqDiagram/MessageLayer/Block/Block.tsx pointerdown on a reorder handle.
\* In the message menu only the selected message can be reordered
\* (useCanReorderMessage).
ReorderStart ==
  LET r == Press(s, Target("reorderHandle", None, "reorder"))
  IN /\ dynamic
     /\ CanIn(s, "reorder")
     /\ (StateOf(s) /= "messageMenu" \/ s.msg)
     /\ ~r.consumed
     /\ Do([r.after EXCEPT !.menu = IF @ = "messageMenu" THEN None ELSE @,
                       !.msg = FALSE, !.sel = {}, !.rpend = TRUE],
           "ReorderStart")

\* SeqDiagram/LifeLineLayer/Participant.tsx click. The click comes after the
\* press has re-rendered, so it reads the post-press state.
ClickParticipant(p) ==
  LET r == Press(s, Target("participant", p, "select"))
      x == r.after
  IN /\ dynamic
     /\ ~r.consumed
     /\ CanIn(x, "select")
     /\ Do(IF StateOf(x) = "participantEditor"
           THEN (IF p \in x.sel THEN x ELSE [x EXCEPT !.sel = {p}])
           ELSE [x EXCEPT !.sel = IF p \in @ THEN @ \ {p} ELSE @ \cup {p}],
           "ClickParticipant")

\* SeqDiagram/MessageLayer/StylePanel.tsx onMessageClick.
ClickMessage ==
  LET r == Press(s, Target("message", None, "select"))
      x == r.after
  IN /\ dynamic
     /\ ~r.consumed
     /\ CanIn(x, "select")
     /\ Do([x EXCEPT !.msg = TRUE, !.menu = "messageMenu"], "ClickMessage")

\* SeqDiagram/LifeLineLayer/MessageCreateControls.tsx onPointerUp, insert or
\* not. Both branches end the drag; only the allowed one clears the
\* selection.
CreateDragRelease ==
  /\ s.cdrag
  /\ CanIn(s, "createMessage")
  /\ Do([s EXCEPT !.cdrag = FALSE, !.sel = {}], "CreateDragRelease")

CreateDragReleaseWithoutCap ==
  /\ s.cdrag
  /\ ~CanIn(s, "createMessage")
  /\ Do([s EXCEPT !.cdrag = FALSE], "CreateDragReleaseWithoutCap")

\* SeqDiagram/MessageLayer/Block/useMessageReorderDrag.ts
ReorderPromote ==
  /\ s.rpend
  /\ CanIn(s, "reorder")
  /\ Do([s EXCEPT !.rpend = FALSE, !.rdrag = TRUE], "ReorderPromote")

ReorderRelease ==
  /\ s.rpend \/ s.rdrag
  /\ Do([s EXCEPT !.rpend = FALSE, !.rdrag = FALSE], "ReorderRelease")

\* InteractionController.tsx onKeyDown. The text editor owns Escape.
Escape ==
  /\ dynamic
  /\ ~s.edit
  /\ Do([ExitOf(s) EXCEPT !.msg = FALSE], "Escape")

\* A double click on a participant or message label. P4 known gap: labels
\* decide editability by mode only, not by `textEdit`. During a drag the
\* controller does not gate presses, so this models a second pointer.
LabelEdit(t) ==
  LET r == Press(s, t)
  IN /\ dynamic
     /\ ~s.edit
     /\ t.kind \in {"participant", "message"}
     /\ ~r.consumed
     /\ Do([r.after EXCEPT !.edit = TRUE], "LabelEdit")

\* An edit started from an active surface: the participant editor's name
\* slot or the message menu's rename item. Surfaces are not gated.
SurfaceEdit ==
  /\ dynamic
  /\ ~s.edit
  /\ StateOf(s) \in {"participantEditor", "messageMenu"}
  /\ Do([s EXCEPT !.edit = TRUE], "SurfaceEdit")

EditEnd ==
  /\ s.edit
  /\ Do([s EXCEPT !.edit = FALSE], "EditEnd")

-----------------------------------------------------------------------------
(* React effects: each owner ends its state when a text edit starts       *)
(* (P4 known gap "overlay-start transitions are per owner").              *)

\* MessageCreateControls.tsx "A drag that loses its capability ... ends."
EffCreateDragLosesCap ==
  /\ s.cdrag
  /\ ~CanIn(s, "createMessage")
  /\ Do([s EXCEPT !.cdrag = FALSE], "EffCreateDragLosesCap")

\* useMessageReorderDrag.ts: a reorder that loses `reorder` ends.
EffReorderLosesCap ==
  /\ s.rpend \/ s.rdrag
  /\ ~CanIn(s, "reorder")
  /\ Do([s EXCEPT !.rpend = FALSE, !.rdrag = FALSE], "EffReorderLosesCap")

\* StylePanel.tsx: `if (textEditing) closeMenu()`.
EffMenuClosesOnEdit ==
  /\ s.edit
  /\ s.menu = "messageMenu"
  /\ Do([s EXCEPT !.menu = None], "EffMenuClosesOnEdit")

EffectsPending ==
  \/ s.cdrag /\ ~CanIn(s, "createMessage")
  \/ (s.rpend \/ s.rdrag) /\ ~CanIn(s, "reorder")
  \/ s.edit /\ s.menu = "messageMenu"

-----------------------------------------------------------------------------

Init ==
  /\ dynamic \in BOOLEAN
  /\ editorFlag \in BOOLEAN
  /\ s = [sel |-> {}, msg |-> FALSE, menu |-> None, cdrag |-> FALSE,
          rpend |-> FALSE, rdrag |-> FALSE, edit |-> FALSE]
  /\ last = "Init"

Next ==
  \/ \E t \in Targets : PressOnly(t) \/ LabelEdit(t)
  \/ \E p \in Participants : OccurrenceDragStart(p) \/ ClickParticipant(p)
  \/ \E g \in Gaps : GapDragStart(g) \/ OpenGapMenu(g)
  \/ ReorderStart \/ ReorderPromote \/ ReorderRelease
  \/ ClickMessage \/ CreateDragRelease \/ CreateDragReleaseWithoutCap
  \/ Escape \/ SurfaceEdit \/ EditEnd
  \/ EffCreateDragLosesCap \/ EffReorderLosesCap \/ EffMenuClosesOnEdit

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
(* Properties that hold (InteractionPolicy.cfg)                           *)

TypeOK ==
  /\ s \in Atoms
  /\ dynamic \in BOOLEAN
  /\ editorFlag \in BOOLEAN

\* R1: one primary state. The two drags never run together.
OneDrag == ~(s.cdrag /\ (s.rpend \/ s.rdrag))

\* R1 for derived states (P3): a stored menu never outlives a derived state.
MenuYieldsToDerived == DerivedOf(s) /= None => s.menu = None

\* R3: a static render never leaves idle and never edits text.
StaticIsInert == ~dynamic => (StateOf(s) = "idle" /\ ~s.edit)

\* The three per-owner effects cover every state an edit must end: once
\* they have run, a text edit only overlays idle or the participant editor.
EditNestsOnlyWhereAllowed ==
  (s.edit /\ ~EffectsPending) => StateOf(s) \in {"idle", "participantEditor"}

\* With the editor on, a participant highlight is the editor: never two.
EditorHighlightsOne == editorFlag => Cardinality(s.sel) <= 1

-----------------------------------------------------------------------------
(* P4 known gaps as properties (InteractionPolicyGaps.cfg). TLC reports a *)
(* counterexample for each until the gap is closed.                       *)

\* Every way a create drag ends drops the participant it selected, as
\* Escape (exitInteractionAtom) and a release with the capability do.
CreateDragEndsCleanly ==
  [][(s.cdrag /\ ~s'.cdrag) => s'.sel = {}]_vars

\* The participant editor opens only when a participant is clicked.
EditorOpensOnlyOnClick ==
  [][(/\ DerivedOf(s') = "participantEditor"
      /\ DerivedOf(s) /= "participantEditor")
     => last' = "ClickParticipant"]_vars

=============================================================================
