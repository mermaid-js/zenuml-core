import { test } from "./fixtures";
import * as fs from "fs";
import * as path from "path";
import type { GeometryFixture } from "../src/svg/geometry-fixture";
import { CASES } from "../cy/compare-cases";

const CANONICAL_CASES = [
  "sync-call",
  "empty",
  "single-participant",
  "simple-messages",
  "repro-msg-y",
  "demo5-self-named",
  "nested-sync",
  "nested-occurrence",
  "async-self",
  "async-1",
  "if-fragment",
  "fragment-loop",
  "fragment-tcf",
  "creation",
  "creation-rtl",
  "return",
  "repro-return-after-creation",
  "vertical-2",
  "return-only-two",
  "repro-alt-nested-tcf",
  "repro-occ-mixed-2ret",
];

const FIXTURES_DIR = path.resolve(
  __dirname,
  "../src/svg/__fixtures__",
);

for (const caseName of CANONICAL_CASES) {
  test(`record HTML fixture: ${caseName}`, async ({ page }) => {
    const caseCode = (CASES as Record<string, string>)[caseName] || "";

    await page.goto(
      `http://localhost:8080/cy/compare-case.html?case=${encodeURIComponent(caseName)}`,
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(500);

    const fixture = await page.evaluate(({ cName, code }: { cName: string; code: string }) => {
      const htmlOutput = document.getElementById("html-output");
      if (!htmlOutput) {
        return {
          case: cName,
          code: "",
          anchor: { participant: "", bottom: 0 },
          participants: [],
          messages: [],
          selfCalls: [],
          occurrences: [],
          returns: [],
          creations: [],
          fragments: [],
          dividers: [],
          comments: [],
          lifelines: [],
        };
      }

      const seqDiagram = htmlOutput.querySelector(".sequence-diagram");
      if (!seqDiagram) {
        // Empty diagram case — no .sequence-diagram container
        // code is passed from Playwright (from compare-cases.js import)
        return {
          case: cName,
          code,
          anchor: { participant: "", bottom: 0 },
          participants: [],
          messages: [],
          selfCalls: [],
          occurrences: [],
          returns: [],
          creations: [],
          fragments: [],
          dividers: [],
          comments: [],
          lifelines: [],
        };
      }

      const containerRect = seqDiagram.getBoundingClientRect();

      // Helper: get position relative to container (raw floats, no rounding)
      function rel(rect: DOMRect) {
        return {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };
      }

      // code is passed from Playwright via the { cName, code } parameter

      // --- Participants ---
      // Collect all .bg-skin-participant elements in the top participant layer
      // (avoid bottom duplicates by filtering to the first occurrence per name)
      const participantEls = Array.from(
        seqDiagram.querySelectorAll(".bg-skin-participant"),
      );
      const seenParticipants = new Set<string>();
      const participants: {
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];
      for (const el of participantEls) {
        const name = (el as HTMLElement).textContent?.trim() || "";
        if (!name || seenParticipants.has(name)) continue;
        seenParticipants.add(name);
        const rect = (el as HTMLElement).getBoundingClientRect();
        const p = rel(rect);
        participants.push({
          name,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
        });
      }

      // --- Identify creation participant names ---
      // Creations have a wrapper with class "creation" containing participant boxes
      const creationWrappers = Array.from(
        seqDiagram.querySelectorAll(".creation"),
      );
      const creationParticipantNames = new Set<string>();
      for (const cw of creationWrappers) {
        const pEl = cw.querySelector(".bg-skin-participant");
        if (pEl) {
          creationParticipantNames.add(
            (pEl as HTMLElement).textContent?.trim() || "",
          );
        }
      }

      // --- Frame height ---
      const frameEl = htmlOutput.querySelector(".frame") as HTMLElement | null;
      const frameHeight = frameEl ? frameEl.getBoundingClientRect().height : 0;

      // --- Anchor: first non-creation participant ---
      let anchorParticipant = "";
      let anchorBottom = 0;
      for (const p of participants) {
        if (!creationParticipantNames.has(p.name)) {
          anchorParticipant = p.name;
          anchorBottom = p.y + p.height;
          break;
        }
      }

      // --- Messages (non-self, non-return) ---
      // Look for .interaction elements that are NOT .return
      const allInteractions = Array.from(
        seqDiagram.querySelectorAll(
          ".interaction:not(.return)",
        ),
      );
      const messages: {
        label: string;
        fromX: number;
        toX: number;
        y: number;
      }[] = [];

      for (const el of allInteractions) {
        const htmlEl = el as HTMLElement;
        // Skip if it's inside a creation wrapper
        if (htmlEl.closest(".creation")) continue;

        // Detect self-calls: the interaction has a nested occurrence
        // that belongs to the same participant (arrow loops back)
        const arrowSvg = htmlEl.querySelector("svg");
        const nameEl = htmlEl.querySelector(".name");
        const label = nameEl
          ? (nameEl as HTMLElement).textContent?.trim() || ""
          : "";

        // Check if this is a self-call by looking for the self-call pattern:
        // the interaction contains an .occurrence child (block body)
        const hasOccurrenceChild =
          htmlEl.querySelector(":scope > .occurrence") !== null ||
          htmlEl.querySelector(
            ":scope > .flex > .occurrence",
          ) !== null;

        // Self-calls have their arrow SVG looping to the same side
        // We detect by checking if the interaction's inner structure
        // has an occurrence (block/body) — that makes it a sync call
        // For simple async messages (A->B: msg), there's no occurrence
        if (hasOccurrenceChild) continue; // This is a sync/self call with block

        if (!arrowSvg) continue;

        const arrowRect = arrowSvg.getBoundingClientRect();
        const arrowLeft = arrowRect.left - containerRect.left;
        const arrowRight = arrowRect.right - containerRect.left;
        const arrowY =
          arrowRect.top + arrowRect.height / 2 - containerRect.top;

        // Determine direction from the SVG polyline/line
        const polyline = arrowSvg.querySelector("polyline");
        const line = arrowSvg.querySelector("line");
        let fromX = arrowLeft;
        let toX = arrowRight;

        if (polyline) {
          const points = polyline.getAttribute("points") || "";
          const pts = points
            .trim()
            .split(/\s+/)
            .map((p: string) => {
              const [x] = p.split(",").map(Number);
              return x;
            });
          if (pts.length >= 2) {
            const firstX = pts[0];
            const lastX = pts[pts.length - 1];
            // Map SVG-local coords to page coords
            const svgRect = arrowSvg.getBoundingClientRect();
            const svgWidth = parseFloat(
              arrowSvg.getAttribute("width") ||
                String(svgRect.width),
            );
            const scale =
              svgWidth > 0 ? svgRect.width / svgWidth : 1;
            fromX =
              svgRect.left + firstX * scale - containerRect.left;
            toX =
              svgRect.left + lastX * scale - containerRect.left;
          }
        } else if (line) {
          const x1Raw = line.getAttribute("x1") || "0";
          const x2Raw = line.getAttribute("x2") || "0";
          const svgRect = arrowSvg.getBoundingClientRect();
          const svgWidth = parseFloat(
            arrowSvg.getAttribute("width") ||
              String(svgRect.width),
          );
          const scale =
            svgWidth > 0 ? svgRect.width / svgWidth : 1;
          // Handle percentage coordinates (e.g., x2="100%")
          const x1 = x1Raw.includes("%")
            ? svgWidth * (parseFloat(x1Raw) / 100)
            : parseFloat(x1Raw);
          const x2 = x2Raw.includes("%")
            ? svgWidth * (parseFloat(x2Raw) / 100)
            : parseFloat(x2Raw);
          fromX =
            svgRect.left + x1 * scale - containerRect.left;
          toX =
            svgRect.left + x2 * scale - containerRect.left;
        }

        messages.push({ label, fromX, toX, y: arrowY });
      }

      // --- Self-calls ---
      // Self-calls are sync calls where from === to participant
      // They appear as interactions with an occurrence that loops back
      // Look for interactions where the arrow points to self
      const selfCalls: {
        label: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];

      // Self-calls in ZenUML: A.methodA() { A.methodA1() }
      // The inner self-invocation has a specific structure
      // We look for interactions that contain a block AND whose lifeline
      // position indicates self (same participant on both sides)
      for (const el of allInteractions) {
        const htmlEl = el as HTMLElement;
        if (htmlEl.closest(".creation")) continue;

        const hasOccurrenceChild =
          htmlEl.querySelector(":scope > .occurrence") !== null ||
          htmlEl.querySelector(
            ":scope > .flex > .occurrence",
          ) !== null;
        if (!hasOccurrenceChild) continue;

        // Check if this is truly a self-call by checking the arrow
        const arrowSvg = htmlEl.querySelector("svg");
        if (!arrowSvg) continue;

        const polyline = arrowSvg.querySelector("polyline");
        if (!polyline) continue;

        // Self-call polylines have a characteristic shape: they go right and come back
        const points = polyline.getAttribute("points") || "";
        const pts = points
          .trim()
          .split(/\s+/)
          .map((p: string) => {
            const [x, y] = p.split(",").map(Number);
            return { x, y };
          });

        // A self-call polyline typically has 4+ points forming a loop
        if (pts.length < 4) continue;

        // Check if first and last X are close (both on same side)
        const firstX = pts[0]?.x ?? 0;
        const lastX = pts[pts.length - 1]?.x ?? 0;
        if (Math.abs(firstX - lastX) > 5) continue; // Not a self-call

        const nameEl = htmlEl.querySelector(".name");
        const label = nameEl
          ? (nameEl as HTMLElement).textContent?.trim() || ""
          : "";
        const rect = htmlEl.getBoundingClientRect();
        const p = rel(rect);
        selfCalls.push({
          label,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
        });
      }

      // --- Returns ---
      // Return arrows use an SVG with a <line x1=0 x2=100%> — the SVG
      // bounding box IS the arrow extent, so use left/right directly.
      const returnEls = Array.from(
        seqDiagram.querySelectorAll(".interaction.return"),
      );
      const returns: {
        label: string;
        fromX: number;
        toX: number;
        y: number;
      }[] = [];
      for (const el of returnEls) {
        const htmlEl = el as HTMLElement;
        const nameEl = htmlEl.querySelector(".name");
        const label = nameEl
          ? (nameEl as HTMLElement).textContent?.trim() || ""
          : "";

        const arrowSvg = htmlEl.querySelector("svg");
        if (!arrowSvg) continue;

        const arrowRect = arrowSvg.getBoundingClientRect();
        const fromX = arrowRect.left - containerRect.left;
        const toX = arrowRect.right - containerRect.left;
        const arrowY =
          arrowRect.top + arrowRect.height / 2 - containerRect.top;

        returns.push({ label, fromX, toX, y: arrowY });
      }

      // --- Occurrences ---
      const occEls = Array.from(
        seqDiagram.querySelectorAll(".occurrence.min-h-6"),
      );
      // Filter out collapsible headers
      const filteredOccEls = occEls.filter(
        (el) =>
          !el.classList.contains("occurrence-collapsible-header"),
      );

      const occurrences: {
        participant: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];
      for (const el of filteredOccEls) {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const p = rel(rect);
        const centerX = rect.left + rect.width / 2;

        // Match to nearest participant by center X
        let bestName = "";
        let bestDist = Infinity;
        for (const part of participants) {
          const partCenterX =
            containerRect.left + part.x + part.width / 2;
          const dist = Math.abs(centerX - partCenterX);
          if (dist < bestDist) {
            bestDist = dist;
            bestName = part.name;
          }
        }

        occurrences.push({
          participant: bestName,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
        });
      }

      // --- Creations ---
      const creations: {
        participantName: string;
        px: number;
        py: number;
        pw: number;
        ph: number;
        msgFromX: number;
        msgToX: number;
        msgY: number;
      }[] = [];
      for (const cw of creationWrappers) {
        // The creation wrapper (.interaction.creation) contains the arrow,
        // but the created participant box is in the life-line-layer, not
        // inside .creation. First try direct child lookup, then fall back
        // to matching via arrow endpoint → nearest participant center.
        const interaction = (cw as HTMLElement).classList.contains("interaction")
          ? (cw as HTMLElement)
          : (cw as HTMLElement).closest(".interaction");

        // Extract arrow endpoints first — needed for both participant
        // matching and the creation record itself.
        let msgFromX = 0,
          msgToX = 0,
          msgY = 0;
        if (interaction) {
          const arrowSvg = interaction.querySelector("svg");
          if (arrowSvg) {
            const arrowRect = arrowSvg.getBoundingClientRect();
            msgY =
              arrowRect.top +
                arrowRect.height / 2 -
                containerRect.top;

            const polyline = arrowSvg.querySelector("polyline");
            const line = arrowSvg.querySelector("line");
            if (polyline) {
              const points =
                polyline.getAttribute("points") || "";
              const pts = points
                .trim()
                .split(/\s+/)
                .map((p: string) => p.split(",").map(Number));
              if (pts.length >= 2) {
                const svgRect =
                  arrowSvg.getBoundingClientRect();
                const svgWidth = parseFloat(
                  arrowSvg.getAttribute("width") ||
                    String(svgRect.width),
                );
                const scale =
                  svgWidth > 0
                    ? svgRect.width / svgWidth
                    : 1;
                msgFromX =
                  svgRect.left +
                    (pts[0]?.[0] ?? 0) * scale -
                    containerRect.left;
                msgToX =
                  svgRect.left +
                    (pts[pts.length - 1]?.[0] ?? 0) * scale -
                    containerRect.left;
              }
            } else if (line) {
              const x1Raw = line.getAttribute("x1") || "0";
              const x2Raw = line.getAttribute("x2") || "0";
              const svgRect =
                arrowSvg.getBoundingClientRect();
              const svgWidth = parseFloat(
                arrowSvg.getAttribute("width") ||
                  String(svgRect.width),
              );
              const scale =
                svgWidth > 0
                  ? svgRect.width / svgWidth
                  : 1;
              // Handle percentage coordinates (e.g., x2="100%")
              const x1 = x1Raw.includes("%")
                ? svgWidth * (parseFloat(x1Raw) / 100)
                : parseFloat(x1Raw);
              const x2 = x2Raw.includes("%")
                ? svgWidth * (parseFloat(x2Raw) / 100)
                : parseFloat(x2Raw);
              msgFromX =
                svgRect.left +
                  x1 * scale -
                  containerRect.left;
              msgToX =
                svgRect.left +
                  x2 * scale -
                  containerRect.left;
            }
          }
        }

        // Find the created participant. Try inside .creation first,
        // then match by arrow toX → nearest creation participant center.
        let pEl = cw.querySelector(".bg-skin-participant");
        let pName = pEl ? (pEl as HTMLElement).textContent?.trim() || "" : "";
        let pp = pEl ? rel((pEl as HTMLElement).getBoundingClientRect()) : null;

        if (!pp && msgToX > 0) {
          // The created participant box is in life-line-layer, not inside
          // .creation. Match by arrow toX → nearest participant center X.
          let bestDist = Infinity;
          for (const cp of participants) {
            if (!cp.name) continue; // skip unnamed starter
            const cpCenterX = cp.x + cp.width / 2;
            const dist = Math.abs(msgToX - cpCenterX);
            if (dist < bestDist) {
              bestDist = dist;
              pName = cp.name;
              pp = { x: cp.x, y: cp.y, width: cp.width, height: cp.height };
            }
          }
        }

        if (!pp) continue;

        creations.push({
          participantName: pName,
          px: pp.x,
          py: pp.y,
          pw: pp.width,
          ph: pp.height,
          msgFromX,
          msgToX,
          msgY,
        });
      }

      // --- Fragments ---
      const fragmentEls = Array.from(
        seqDiagram.querySelectorAll(".fragment"),
      );
      const fragments: {
        kind: string;
        x: number;
        y: number;
        width: number;
        height: number;
        conditionLabel?: string;
        conditionX?: number;
        conditionY?: number;
        conditionTextWidth?: number;
        sections: { label: string; y: number; height: number }[];
      }[] = [];
      for (const el of fragmentEls) {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const p = rel(rect);

        // Determine fragment kind and visible label from header.
        // The header has a hidden seq number div and a visible .name div.
        const header = htmlEl.querySelector(".header");
        let kind = "unknown";
        let headerLabel = "";
        if (header) {
          // Use the visible .name element for kind detection
          const nameEl = (header as HTMLElement).querySelector(".name");
          const visibleText = nameEl
            ? (nameEl as HTMLElement).textContent?.trim() || ""
            : "";
          headerLabel = visibleText; // e.g., "Alt", "Try", "Loop"
          const headerText = visibleText.toLowerCase();
          if (headerText?.startsWith("alt") || headerText?.startsWith("if"))
            kind = "alt";
          else if (headerText?.startsWith("loop") || headerText?.startsWith("while") || headerText?.startsWith("foreach"))
            kind = "loop";
          else if (headerText?.startsWith("opt")) kind = "opt";
          else if (headerText?.startsWith("par")) kind = "par";
          else if (headerText?.startsWith("try")) kind = "try";
          else if (headerText?.startsWith("critical"))
            kind = "critical";
          else if (headerText?.startsWith("section"))
            kind = "section";
          else if (headerText?.startsWith("ref")) kind = "ref";
          else kind = headerText?.split(/[\s(]/)[0] || "unknown";
        }

        // Sections: look for section dividers within this fragment.
        // Two patterns: (1) direct child dividers (.section-divider, .fragment-divider, .divider)
        // (2) .segment.border-t elements inside a block container (used by alt/if-else, try-catch-finally)
        const sections: {
          label: string;
          y: number;
          height: number;
        }[] = [];
        let sectionDividers = Array.from(
          htmlEl.querySelectorAll(
            ":scope > .section-divider, :scope > .fragment-divider, :scope > .divider",
          ),
        );

        // Fallback: look for .segment.border-t in the fragment's direct block container
        // (alt/tcf sections). Only get segments that are direct children of the block,
        // not segments inside nested fragments.
        if (sectionDividers.length === 0) {
          const blockContainer = htmlEl.querySelector(":scope > .block") || htmlEl.querySelector(":scope > div:not(.header)");
          if (blockContainer) {
            sectionDividers = Array.from(
              blockContainer.querySelectorAll(":scope > .segment.border-t"),
            );
          }
        }

        // First section starts at fragment top
        if (sectionDividers.length > 0) {
          // Section before first divider
          const firstDivRect = (
            sectionDividers[0] as HTMLElement
          ).getBoundingClientRect();
          sections.push({
            label: headerLabel || kind,
            y: p.y,
            height: firstDivRect.top - rect.top,
          });

          // Sections between dividers
          for (let i = 0; i < sectionDividers.length; i++) {
            const divEl = sectionDividers[i] as HTMLElement;
            const divRect = divEl.getBoundingClientRect();
            // Extract the visible section label from the segment.
            // The first child element (.text-skin-fragment) contains the label,
            // but may have hidden elements (e.g., "else if" with class="hidden").
            // Extract only visible text to match what the user sees.
            const labelEl = divEl.firstElementChild as HTMLElement;
            let divLabel = "";
            if (labelEl) {
              const visibleParts: string[] = [];
              for (const child of Array.from(labelEl.childNodes)) {
                if (child.nodeType === 3) {
                  const t = (child as Text).textContent?.trim();
                  if (t) visibleParts.push(t);
                } else {
                  const el = child as HTMLElement;
                  const cs = window.getComputedStyle(el);
                  if (cs.display === "none" || el.classList?.contains("hidden")) continue;
                  const t = el.textContent?.trim();
                  if (t) visibleParts.push(t);
                }
              }
              divLabel = visibleParts.join(" ");
            }
            const nextY =
              divRect.top - containerRect.top;
            const nextBottom =
              i + 1 < sectionDividers.length
                ? (
                    sectionDividers[
                      i + 1
                    ] as HTMLElement
                  ).getBoundingClientRect().top
                : rect.bottom;
            sections.push({
              label: divLabel,
              y: nextY,
              height: nextBottom - divRect.top,
            });
          }
        }

        // Condition label: the .text-skin-fragment div that contains a
        // .condition span (e.g., "[true]", "[x > 0]").  Only alt/opt/loop
        // fragments have conditions — try/catch/finally sections also use
        // .text-skin-fragment but without a .condition child.
        let conditionLabel: string | undefined;
        let conditionX: number | undefined;
        let conditionY: number | undefined;
        let conditionTextWidth: number | undefined;
        const condSpan = htmlEl.querySelector(".text-skin-fragment .condition");
        if (condSpan) {
          const condContainer = (condSpan as HTMLElement).closest(".text-skin-fragment") as HTMLElement;
          const condText = condContainer?.textContent?.trim() || "";
          if (condText) {
            const condRect = condContainer.getBoundingClientRect();
            conditionLabel = condText;
            conditionX = condRect.left - containerRect.left;
            conditionY = condRect.top - containerRect.top;
            // Measure actual inline text width: from first <label> "[" to last <label> "]"
            const labels = condContainer.querySelectorAll("label");
            if (labels.length >= 2) {
              const firstRect = labels[0].getBoundingClientRect();
              const lastRect = labels[labels.length - 1].getBoundingClientRect();
              conditionTextWidth = lastRect.right - firstRect.left;
            }
          }
        }

        fragments.push({
          kind,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          conditionLabel,
          conditionX,
          conditionY,
          conditionTextWidth,
          sections,
        });
      }

      // --- Dividers ---
      const dividerEls = Array.from(
        seqDiagram.querySelectorAll(".divider"),
      );
      const dividers: { y: number; label: string }[] = [];
      for (const el of dividerEls) {
        const htmlEl = el as HTMLElement;
        // Skip dividers that are inside fragments (section dividers)
        if (htmlEl.closest(".fragment")) continue;
        const rect = htmlEl.getBoundingClientRect();
        dividers.push({
          y: rect.top - containerRect.top,
          label: htmlEl.textContent?.trim() || "",
        });
      }

      // --- Comments ---
      const commentEls = Array.from(
        seqDiagram.querySelectorAll(".comment"),
      );
      const comments: { text: string; x: number; y: number }[] =
        [];
      for (const el of commentEls) {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        comments.push({
          text: htmlEl.textContent?.trim() || "",
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
        });
      }

      // --- Lifelines ---
      // Use only lifelines that contain a .line child (the actual dashed line),
      // not the duplicate participant-box containers from the second LifeLineLayer.
      const lifelineEls = Array.from(
        seqDiagram.querySelectorAll(".lifeline"),
      ).filter(el => el.querySelector(":scope > .line") !== null);
      const seenLifelineParticipants = new Set<string>();
      const lifelines: {
        participant: string;
        x: number;
        y1: number;
        y2: number;
      }[] = [];

      for (let i = 0; i < lifelineEls.length; i++) {
        const htmlEl = lifelineEls[i] as HTMLElement;

        // Match to nearest participant by left position
        let bestName = "";
        let bestDist = Infinity;
        for (const part of participants) {
          const partCenterX = part.x + part.width / 2;
          const lifelineLeft = htmlEl.getBoundingClientRect().left - containerRect.left;
          const dist = Math.abs(lifelineLeft - partCenterX);
          if (dist < bestDist) {
            bestDist = dist;
            bestName = part.name;
          }
        }

        // Deduplicate per participant
        if (seenLifelineParticipants.has(bestName)) continue;
        seenLifelineParticipants.add(bestName);

        // Lifeline y1 = participant bottom (matching geometry's topY = p.y + p.height)
        const matchedP = participants.find(p => p.name === bestName);
        const y1 = matchedP ? matchedP.y + matchedP.height : htmlEl.getBoundingClientRect().top - containerRect.top;
        const y2 = htmlEl.getBoundingClientRect().bottom - containerRect.top;
        const x = matchedP ? matchedP.x + matchedP.width / 2 : htmlEl.getBoundingClientRect().left - containerRect.left;

        lifelines.push({ participant: bestName, x, y1, y2 });
      }

      return {
        case: cName,
        code,
        anchor: {
          participant: anchorParticipant,
          bottom: anchorBottom,
        },
        frameHeight,
        participants,
        messages,
        selfCalls,
        occurrences,
        returns,
        creations,
        fragments,
        dividers,
        comments,
        lifelines,
      };
    }, { cName: caseName, code: caseCode });

    // Write fixture to JSON file
    const filePath = path.join(FIXTURES_DIR, `${caseName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fixture, null, 2) + "\n");
    console.log(
      `Wrote fixture: ${caseName} — ${fixture.participants.length} participants, ${fixture.messages.length} messages, ${fixture.selfCalls.length} selfCalls, ${fixture.occurrences.length} occurrences, ${fixture.returns.length} returns, ${fixture.creations.length} creations, ${fixture.fragments.length} fragments`,
    );
  });
}
