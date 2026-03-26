/*
 * What this file does:
 * Extracts semantic layout data from the live compare-case page inside Playwright.
 *
 * High-level flow:
 * - Runs in the page context after fonts are ready.
 * - Finds HTML and SVG roots for the current compare-case.
 * - Collects labels, per-letter glyph boxes, numbers, arrows, participant headers,
 *   icons, and participant boxes from both renderers.
 * - Returns normalized geometry that later scoring modules can compare directly.
 *
 * This file does not score anything. Its only job is to turn the live page into
 * structured measurement data.
 *
 * Example input:
 * A Playwright `page` already loaded with
 * `http://localhost:8080/cy/compare-case.html?case=async-2a`
 *
 * Example output:
 * `{ htmlLabels, svgLabels, htmlNumbers, svgNumbers, htmlArrows, svgArrows, htmlParticipants, svgParticipants, ... }`
 */
export async function collectLabelData(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;

    function relRect(rect, rootRect) {
      return {
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        w: rect.width,
        h: rect.height,
      };
    }

    function elementRect(el, rootRect) {
      if (!el) {
        return null;
      }
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        return null;
      }
      return relRect(rect, rootRect);
    }

    function strokedElementOuterRect(el, rootRect) {
      const box = elementRect(el, rootRect);
      if (!box) {
        return null;
      }
      const strokeWidth = parseFloat(getComputedStyle(el).strokeWidth || "0") || 0;
      if (strokeWidth <= 0) {
        return box;
      }
      const half = strokeWidth / 2;
      return {
        x: box.x - half,
        y: box.y - half,
        w: box.w + strokeWidth,
        h: box.h + strokeWidth,
      };
    }

    function pushBox(parts, part, box) {
      if (!box || box.w <= 0 || box.h <= 0) {
        return;
      }
      parts.push({ part, box });
    }

    function unionRect(rects) {
      if (!rects || rects.length === 0) {
        return { x: 0, y: 0, w: 0, h: 0 };
      }
      const left = Math.min(...rects.map((rect) => rect.x));
      const top = Math.min(...rects.map((rect) => rect.y));
      const right = Math.max(...rects.map((rect) => rect.x + rect.w));
      const bottom = Math.max(...rects.map((rect) => rect.y + rect.h));
      return { x: left, y: top, w: right - left, h: bottom - top };
    }

    function arrowEndpointsFromBox(box) {
      return {
        left_x: box.x,
        right_x: box.x + box.w,
        width: box.w,
      };
    }

    function collectTextNodes(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let cursor = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent ?? "";
        if (!text) continue;
        nodes.push({ node, start: cursor, end: cursor + text.length });
        cursor += text.length;
      }
      return nodes;
    }

    function locateOffset(nodes, offset) {
      for (const entry of nodes) {
        if (offset >= entry.start && offset <= entry.end) {
          return { node: entry.node, offset: offset - entry.start };
        }
      }
      const last = nodes[nodes.length - 1];
      return last ? { node: last.node, offset: last.node.textContent.length } : null;
    }

    function segmentText(text) {
      if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
        return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)).map(
          (part) => ({ grapheme: part.segment, start: part.index, end: part.index + part.segment.length }),
        );
      }
      const chars = Array.from(text);
      let cursor = 0;
      return chars.map((grapheme) => {
        const entry = { grapheme, start: cursor, end: cursor + grapheme.length };
        cursor += grapheme.length;
        return entry;
      });
    }

    function glyphBoxesForElement(el, rootRect) {
      const text = (el.textContent ?? "").trim();
      const sourceText = el.textContent ?? "";
      const trimStart = sourceText.indexOf(text);
      const trimOffset = trimStart >= 0 ? trimStart : 0;
      const segments = segmentText(text);
      const nodes = collectTextNodes(el);
      const range = document.createRange();
      const boxes = [];

      for (const [index, segment] of segments.entries()) {
        const start = locateOffset(nodes, trimOffset + segment.start);
        const end = locateOffset(nodes, trimOffset + segment.end);
        if (!start || !end) {
          continue;
        }
        try {
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);
        } catch (_error) {
          continue;
        }
        const rects = Array.from(range.getClientRects());
        if (rects.length === 0) {
          continue;
        }
        const left = Math.min(...rects.map((rect) => rect.left));
        const top = Math.min(...rects.map((rect) => rect.top));
        const right = Math.max(...rects.map((rect) => rect.right));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));
        boxes.push({
          index,
          grapheme: segment.grapheme,
          box: relRect({ left, top, width: right - left, height: bottom - top }, rootRect),
        });
      }

      return boxes;
    }

    function glyphBoxesForElements(elements, rootRect) {
      const boxes = [];
      let indexOffset = 0;
      for (const el of elements) {
        const elementBoxes = glyphBoxesForElement(el, rootRect);
        for (const box of elementBoxes) {
          boxes.push({
            ...box,
            index: box.index + indexOffset,
          });
        }
        indexOffset += elementBoxes.length;
      }
      return boxes;
    }

    function measureTextEntry(el, rootRect, fontEl = el) {
      const letters = glyphBoxesForElement(el, rootRect);
      return {
        box: letters.length > 0 ? unionRect(letters.map((letter) => letter.box)) : relRect(el.getBoundingClientRect(), rootRect),
        font: fontInfo(fontEl),
        letters,
      };
    }

    function measureTextEntryFromElements(elements, rootRect, fallbackEl, fontEl = fallbackEl) {
      const letters = glyphBoxesForElements(elements, rootRect);
      return {
        box: letters.length > 0 ? unionRect(letters.map((letter) => letter.box)) : relRect(fallbackEl.getBoundingClientRect(), rootRect),
        font: fontInfo(fontEl),
        letters,
      };
    }

    function fontInfo(el) {
      const style = getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        textAlign: style.textAlign,
      };
    }

    function textOrEmpty(el, selector) {
      return (el?.querySelector(selector)?.textContent ?? "").trim();
    }

    function fragmentOwnerText(fragmentEl) {
      return (
        textOrEmpty(fragmentEl, ":scope > .header .name") ||
        textOrEmpty(fragmentEl, ":scope > .header .text-skin-fragment span") ||
        textOrEmpty(fragmentEl, ":scope > .header .text-skin-fragment")
      );
    }

    function visibleChildren(el) {
      return Array.from(el.children).filter((child) => getComputedStyle(child).display !== "none");
    }

    function textContentNormalized(el) {
      return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    }

    function normalizeColorValue(value) {
      const normalized = (value ?? "").replace(/\s+/g, "").trim().toLowerCase();
      return normalized || null;
    }

    function boxOrNull(box) {
      if (!box || box.w <= 0 || box.h <= 0) {
        return null;
      }
      return box;
    }

    function paintedBox(el, rootRect) {
      if (!el) {
        return null;
      }
      const shapeSelectors = "path, rect, circle, ellipse, polygon, polyline, line, use";
      const rects = [];
      for (const shape of el.querySelectorAll(shapeSelectors)) {
        const rect = relRect(shape.getBoundingClientRect(), rootRect);
        if (rect.w > 0 && rect.h > 0) {
          rects.push(rect);
        }
      }
      if (rects.length > 0) {
        return unionRect(rects);
      }
      return boxOrNull(relRect(el.getBoundingClientRect(), rootRect));
    }

    function topParticipantsByName(entries) {
      const ordered = [...entries].sort((a, b) => (a.participantBox.y - b.participantBox.y) || (a.participantBox.x - b.participantBox.x));
      const byName = new Map();
      for (const entry of ordered) {
        if (!entry.name || byName.has(entry.name)) {
          continue;
        }
        byName.set(entry.name, entry);
      }
      return Array.from(byName.values());
    }

    function collectHtmlLabels(root, rootRect) {
      const labels = [];
      const selectorPairs = [
        {
          kind: "message",
          selector:
            ".interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message .editable-span-base",
        },
        {
          kind: "self",
          selector:
            ".interaction.self-invocation > .message .editable-span-base, .interaction.self > .self-invocation .editable-span-base",
        },
        {
          kind: "return",
          selector:
            ".interaction.return > .message .editable-span-base, .interaction.return > .flex.items-center > .name",
        },
        {
          kind: "creation",
          selector:
            ".interaction.creation .message .name",
        },
      ];

      for (const pair of selectorPairs) {
        for (const labelEl of root.querySelectorAll(pair.selector)) {
          const text = (labelEl.textContent ?? "").trim();
          if (!text) continue;
          const measured = measureTextEntry(labelEl, rootRect);
          labels.push({
            side: "html",
            kind: pair.kind,
            text,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }

      for (const conditionWrap of root.querySelectorAll(".fragment .segment > .text-skin-fragment:not(.finally)")) {
        const children = visibleChildren(conditionWrap);
        if (children.length === 0) continue;
        const text = children.map((child) => (child.textContent ?? "").trim()).join("").trim();
        if (!text) continue;
        const measured = measureTextEntryFromElements(children, rootRect, conditionWrap, children[0]);
        labels.push({
          side: "html",
          kind: "fragment-condition",
          text,
          ownerText: fragmentOwnerText(conditionWrap.closest(".fragment")) || null,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
        });
      }

      const sectionSelectors = [
        ".fragment.fragment-tcf .segment > .header.inline-block.bg-skin-frame.opacity-65",
        ".fragment.fragment-tcf .segment > .header.finally",
      ];
      for (const selector of sectionSelectors) {
        for (const sectionEl of root.querySelectorAll(selector)) {
          const children = visibleChildren(sectionEl);
          if (children.length === 0) continue;
          const text = children.map((child) => (child.textContent ?? "").trim()).join("").trim();
          if (!text) continue;
          const measured = measureTextEntryFromElements(children, rootRect, sectionEl, children[0]);
          labels.push({
            side: "html",
            kind: "fragment-section",
            text,
            ownerText: fragmentOwnerText(sectionEl.closest(".fragment")) || null,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }
      return labels;
    }

    function collectSvgLabels(root, rootRect) {
      const labels = [];
      const pairs = [
        { selector: "g.message:not(.self-call) > text.message-label", kind: "message" },
        { selector: "g.message.self-call > text.message-label", kind: "self" },
        { selector: "g.return > text.return-label", kind: "return" },
        { selector: "g.creation > text.message-label", kind: "creation" },
      ];
      for (const pair of pairs) {
        for (const labelEl of root.querySelectorAll(pair.selector)) {
          const text = (labelEl.textContent ?? "").trim();
          if (!text) continue;
          const measured = measureTextEntry(labelEl, rootRect);
          labels.push({
            side: "svg",
            kind: pair.kind,
            text,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }

      for (const labelEl of root.querySelectorAll("g.fragment > text.fragment-condition")) {
        const text = (labelEl.textContent ?? "").trim();
        if (!text) continue;
        const measured = measureTextEntry(labelEl, rootRect);
        labels.push({
          side: "svg",
          kind: "fragment-condition",
          text,
          ownerText: textOrEmpty(labelEl.closest("g.fragment"), ":scope > text.fragment-label") || null,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
        });
      }

      for (const fragmentEl of root.querySelectorAll("g.fragment")) {
        for (const groupEl of fragmentEl.querySelectorAll(":scope > g")) {
          const conditionTextEls = Array.from(groupEl.querySelectorAll(":scope > text.fragment-condition"));
          if (conditionTextEls.length > 0) {
            const text = conditionTextEls.map((el) => (el.textContent ?? "").trim()).join("").replace(/\s+\]/g, "]").trim();
            if (!text) continue;
            const measured = measureTextEntryFromElements(conditionTextEls, rootRect, groupEl, conditionTextEls[0]);
            labels.push({
              side: "svg",
              kind: "fragment-condition",
              text,
              ownerText: textOrEmpty(fragmentEl, ":scope > text.fragment-label") || null,
              box: measured.box,
              font: measured.font,
              letters: measured.letters,
            });
            continue;
          }

          const textEls = Array.from(groupEl.querySelectorAll("text.fragment-section-label"));
          if (textEls.length === 0) continue;
          const text = textEls.map((el) => (el.textContent ?? "").trim()).join("").replace(/\s+\]/g, "]").trim();
          if (!text) continue;
          const measured = measureTextEntryFromElements(textEls, rootRect, groupEl, textEls[0]);
          labels.push({
            side: "svg",
            kind: text.startsWith("[") ? "fragment-condition" : "fragment-section",
            text,
            ownerText: textOrEmpty(fragmentEl, ":scope > text.fragment-label") || null,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }
      return labels;
    }

    function collectHtmlParticipants(root, rootRect) {
      const participants = [];
      for (const participantEl of root.querySelectorAll(".participant[data-participant-id]")) {
        const name = (participantEl.getAttribute("data-participant-id") ?? "").trim();
        if (!name) continue;
        const participantBox = boxOrNull(relRect(participantEl.getBoundingClientRect(), rootRect));
        if (!participantBox) continue;

        const rowEl = participantEl.querySelector(":scope > .flex.items-center.justify-center, :scope > div:last-child");
        const firstChild = rowEl?.firstElementChild ?? null;
        const iconHost = firstChild && (
          firstChild.matches("[aria-description]") ||
          firstChild.querySelector("svg") ||
          /\bh-6\b/.test(firstChild.className || "")
        )
          ? firstChild
          : null;
        const labelEl = Array.from(participantEl.querySelectorAll(".name")).at(-1) ?? null;
        const measuredLabel = labelEl ? measureTextEntry(labelEl, rootRect) : null;
        const stereotypeEl = participantEl.querySelector("label.interface");
        const measuredStereotype = stereotypeEl ? measureTextEntry(stereotypeEl, rootRect) : null;
        const iconPaintRoot = iconHost?.querySelector("svg") ?? iconHost;
        const participantStyle = getComputedStyle(participantEl);

        participants.push({
          side: "html",
          name,
          labelText: textContentNormalized(labelEl),
          participantBox,
          labelBox: measuredLabel?.box ?? null,
          labelFont: measuredLabel?.font ?? null,
          labelLetters: measuredLabel?.letters ?? [],
          stereotypeText: textContentNormalized(stereotypeEl),
          stereotypeBox: measuredStereotype?.box ?? null,
          stereotypeFont: measuredStereotype?.font ?? null,
          stereotypeLetters: measuredStereotype?.letters ?? [],
          iconBox: paintedBox(iconPaintRoot, rootRect),
          anchorKind: measuredLabel?.box ? "label" : "participant-box",
          anchorBox: measuredLabel?.box ?? participantBox,
          backgroundColor: normalizeColorValue(participantStyle.backgroundColor),
          textColor: normalizeColorValue(labelEl ? getComputedStyle(labelEl).color : participantStyle.color),
          stereotypeColor: normalizeColorValue(stereotypeEl ? getComputedStyle(stereotypeEl).color : null),
        });
      }
      return topParticipantsByName(participants);
    }

    function collectSvgParticipants(root, rootRect) {
      const participants = [];
      for (const participantEl of root.querySelectorAll("g.participant[data-participant]")) {
        if (participantEl.classList.contains("participant-bottom")) {
          continue;
        }
        const name = (participantEl.getAttribute("data-participant") ?? "").trim();
        if (!name) continue;
        const participantBoxEl = participantEl.querySelector(":scope > rect.participant-box");
        const participantBox = boxOrNull(strokedElementOuterRect(participantBoxEl || participantEl, rootRect));
        if (!participantBox) continue;

        const labelEl = participantEl.querySelector(":scope > text.participant-label");
        const measuredLabel = labelEl ? measureTextEntry(labelEl, rootRect) : null;
        const stereotypeEl = participantEl.querySelector(":scope > text.stereotype-label")
          || Array.from(participantEl.querySelectorAll(":scope > text"))
            .filter((textEl) => textEl !== labelEl)
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0]
          || null;
        const measuredStereotype = stereotypeEl ? measureTextEntry(stereotypeEl, rootRect) : null;
        const iconEl = participantEl.querySelector(":scope > g[transform]");
        const participantBoxStyle = participantBoxEl ? getComputedStyle(participantBoxEl) : null;

        participants.push({
          side: "svg",
          name,
          labelText: textContentNormalized(labelEl),
          participantBox,
          labelBox: measuredLabel?.box ?? null,
          labelFont: measuredLabel?.font ?? null,
          labelLetters: measuredLabel?.letters ?? [],
          stereotypeText: textContentNormalized(stereotypeEl),
          stereotypeBox: measuredStereotype?.box ?? null,
          stereotypeFont: measuredStereotype?.font ?? null,
          stereotypeLetters: measuredStereotype?.letters ?? [],
          iconBox: paintedBox(iconEl, rootRect),
          anchorKind: measuredLabel?.box ? "label" : "participant-box",
          anchorBox: measuredLabel?.box ?? participantBox,
          backgroundColor: normalizeColorValue(participantBoxStyle?.fill || participantBoxEl?.getAttribute("fill")),
          textColor: normalizeColorValue(labelEl ? getComputedStyle(labelEl).fill : null),
          stereotypeColor: normalizeColorValue(stereotypeEl ? getComputedStyle(stereotypeEl).fill : null),
        });
      }
      return topParticipantsByName(participants);
    }

    function collectHtmlComments(root, rootRect) {
      const comments = [];
      for (const commentEl of root.querySelectorAll(".comments")) {
        const text = textContentNormalized(commentEl);
        if (!text) continue;
        const measured = measureTextEntry(commentEl, rootRect, commentEl);
        comments.push({
          side: "html",
          kind: "comment",
          text,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
          color: normalizeColorValue(getComputedStyle(commentEl).color),
        });
      }
      return comments;
    }

    function collectSvgComments(root, rootRect) {
      const comments = [];
      for (const commentEl of root.querySelectorAll("text.comment-text")) {
        const text = textContentNormalized(commentEl);
        if (!text) continue;
        const measured = measureTextEntry(commentEl, rootRect);
        comments.push({
          side: "svg",
          kind: "comment",
          text,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
          color: normalizeColorValue(getComputedStyle(commentEl).fill),
        });
      }
      return comments;
    }

    function collectHtmlGroups(root, rootRect) {
      const groups = [];
      for (const groupEl of root.querySelectorAll(".lifeline-group-container")) {
        const nameEl = groupEl.querySelector(".text-skin-lifeline-group-name");
        const name = textContentNormalized(nameEl);
        const box = boxOrNull(relRect(groupEl.getBoundingClientRect(), rootRect));
        if (!box) continue;
        const measuredName = nameEl ? measureTextEntry(nameEl, rootRect) : null;
        groups.push({
          side: "html",
          name,
          box,
          nameBox: measuredName?.box ?? null,
          nameFont: measuredName?.font ?? null,
          nameLetters: measuredName?.letters ?? [],
        });
      }
      return groups;
    }

    function collectSvgGroups(root, rootRect) {
      const groups = [];
      for (const groupEl of root.querySelectorAll("g.participant-group")) {
        const nameEl = groupEl.querySelector(":scope > text");
        const name = textContentNormalized(nameEl);
        const box = boxOrNull(relRect(groupEl.getBoundingClientRect(), rootRect));
        if (!box) continue;
        const measuredName = nameEl ? measureTextEntry(nameEl, rootRect) : null;
        groups.push({
          side: "svg",
          name,
          box,
          nameBox: measuredName?.box ?? null,
          nameFont: measuredName?.font ?? null,
          nameLetters: measuredName?.letters ?? [],
        });
      }
      return groups;
    }

    function collectHtmlArrows(root, rootRect) {
      const arrows = [];

      function addArrow(kind, interaction, text, parts) {
        if (!text || parts.length === 0) return;
        const box = unionRect(parts.map((part) => part.box));
        const labelText = (interaction.getAttribute("data-signature") || "").trim();
        arrows.push({
          side: "html",
          kind,
          text,
          pairText: text,
          box,
          ...arrowEndpointsFromBox(box),
          labelText,
        });
      }

      for (const interaction of root.querySelectorAll(".interaction:not(.return):not(.creation):not(.self-invocation):not(.self)")) {
        const text = (interaction.querySelector(":scope > .message > .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const messageEl = interaction.querySelector(":scope > .message");
        if (!messageEl) continue;
        const svgChildren = Array.from(messageEl.children).filter((child) => child.tagName?.toLowerCase() === "svg");
        const parts = [];
        if (svgChildren[0]) {
          parts.push({ part: "line", box: relRect(svgChildren[0].getBoundingClientRect(), rootRect) });
        }
        if (svgChildren[1]) {
          parts.push({ part: "head", box: relRect(svgChildren[1].getBoundingClientRect(), rootRect) });
        }
        addArrow("message", interaction, text, parts);
      }

      for (const interaction of root.querySelectorAll(".interaction.return")) {
        const text = (interaction.querySelector(":scope > .message > .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const messageEl = interaction.querySelector(":scope > .message");
        if (!messageEl) continue;
        const svgChildren = Array.from(messageEl.children).filter((child) => child.tagName?.toLowerCase() === "svg");
        const parts = [];
        if (svgChildren[0]) {
          parts.push({ part: "line", box: relRect(svgChildren[0].getBoundingClientRect(), rootRect) });
        }
        if (svgChildren[1]) {
          parts.push({ part: "head", box: relRect(svgChildren[1].getBoundingClientRect(), rootRect) });
        }
        addArrow("return", interaction, text, parts);
      }

      for (const interaction of root.querySelectorAll(".interaction.self, .interaction.self-invocation")) {
        const text = (interaction.querySelector(":scope > .message .absolute.text-xs, :scope > .self-invocation .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const arrowSvg = interaction.querySelector(":scope > .message > svg.arrow, :scope > .self-invocation > svg.arrow");
        if (!arrowSvg) continue;
        const parts = [];
        pushBox(parts, "loop", elementRect(arrowSvg.querySelector(":scope > path, :scope > polyline"), rootRect));
        pushBox(parts, "head", elementRect(arrowSvg.querySelector(":scope > g path, :scope > g polyline"), rootRect));
        if (parts.length === 0) {
          pushBox(parts, "loop", elementRect(arrowSvg, rootRect));
        }
        addArrow("self", interaction, text, parts);
      }

      return arrows;
    }

    function collectSvgArrows(root, rootRect) {
      const arrows = [];

      function addArrow(kind, group, text, parts) {
        if (!text || parts.length === 0) return;
        const box = unionRect(parts.map((part) => part.box));
        const labelText = (group.querySelector("text.message-label, text.return-label")?.textContent || "").trim();
        arrows.push({
          side: "svg",
          kind,
          text,
          pairText: text,
          box,
          ...arrowEndpointsFromBox(box),
          labelText,
        });
      }

      for (const group of root.querySelectorAll("g.message:not(.self-call)")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.message-label")?.textContent || "").trim();
        const parts = [];
        const lineEl = group.querySelector(":scope > line.message-line");
        const headEl = group.querySelector(":scope > svg.arrow-head");
        if (lineEl) parts.push({ part: "line", box: relRect(lineEl.getBoundingClientRect(), rootRect) });
        if (headEl) parts.push({ part: "head", box: relRect(headEl.getBoundingClientRect(), rootRect) });
        addArrow("message", group, text, parts);
      }

      for (const group of root.querySelectorAll("g.return")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.return-label")?.textContent || "").trim();
        const parts = [];
        const lineEl = group.querySelector(":scope > line.return-line");
        const headEl = group.querySelector(":scope > polyline.return-arrow");
        if (lineEl) parts.push({ part: "line", box: relRect(lineEl.getBoundingClientRect(), rootRect) });
        if (headEl) parts.push({ part: "head", box: relRect(headEl.getBoundingClientRect(), rootRect) });
        addArrow("return", group, text, parts);
      }

      for (const group of root.querySelectorAll("g.message.self-call")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.message-label")?.textContent || "").trim();
        const loopEl = group.querySelector(":scope > svg");
        if (!loopEl) continue;
        const parts = [];
        pushBox(parts, "loop", elementRect(loopEl.querySelector(":scope > path, :scope > polyline"), rootRect));
        pushBox(parts, "head", elementRect(loopEl.querySelector(":scope > g path, :scope > g polyline"), rootRect));
        if (parts.length === 0) {
          const loopRect = loopEl.getBoundingClientRect();
          const attrW = parseFloat(loopEl.getAttribute("width"));
          const attrH = parseFloat(loopEl.getAttribute("height"));
          const box = relRect(loopRect, rootRect);
          if (attrW && attrH) {
            box.w = attrW;
            box.h = attrH;
          }
          pushBox(parts, "loop", box);
        }
        addArrow("self", group, text, parts);
      }

      return arrows;
    }

    function collectHtmlNumbers(root, rootRect) {
      const numbers = [];
      const selectorPairs = [
        {
          kind: "message",
          selector:
            ".interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message > .absolute.text-xs",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base"),
        },
        {
          kind: "self",
          selector:
            ".interaction.self-invocation > .message .absolute.text-xs, .interaction.self > .self-invocation .absolute.text-xs",
          ownerText: (numberEl) =>
            textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base, :scope > .self-invocation .editable-span-base"),
        },
        {
          kind: "return",
          selector:
            ".interaction.return > .message > .absolute.text-xs",
          ownerText: (numberEl) =>
            textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base, :scope > .message .name"),
        },
        {
          kind: "fragment",
          selector:
            ".fragment > .header > .absolute.text-xs",
          ownerText: (numberEl) => fragmentOwnerText(numberEl.closest(".fragment")),
        },
      ];

      for (const pair of selectorPairs) {
        for (const numberEl of root.querySelectorAll(pair.selector)) {
          const text = (numberEl.textContent ?? "").trim();
          if (!text) continue;
          numbers.push({
            side: "html",
            kind: pair.kind,
            text,
            pairText: pair.ownerText ? pair.ownerText(numberEl) || text : text,
            ownerText: pair.ownerText ? pair.ownerText(numberEl) || null : null,
            box: relRect(numberEl.getBoundingClientRect(), rootRect),
            font: fontInfo(numberEl),
            letters: glyphBoxesForElement(numberEl, rootRect),
          });
        }
      }
      return numbers;
    }

    function collectSvgNumbers(root, rootRect) {
      const numbers = [];
      const pairs = [
        {
          selector: "g.message:not(.self-call) > text.seq-number",
          kind: "message",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.message"), ":scope > text.message-label"),
        },
        {
          selector: "g.message.self-call > text.seq-number",
          kind: "self",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.message"), ":scope > text.message-label"),
        },
        {
          selector: "g.return > text.seq-number",
          kind: "return",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.return"), ":scope > text.return-label"),
        },
        {
          selector: "g.fragment > text.seq-number",
          kind: "fragment",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.fragment"), ":scope > text.fragment-label"),
        },
      ];
      for (const pair of pairs) {
        for (const numberEl of root.querySelectorAll(pair.selector)) {
          const text = (numberEl.textContent ?? "").trim();
          if (!text) continue;
          // SVG <text> getBoundingClientRect returns glyph bounds (height ~14px for 12px font).
          // HTML <div> with line-height:16px adds 2px top padding ((16-12)/2).
          // Adjust SVG box Y by -1 to align with HTML's line-height-padded top edge.
          const rawBox = relRect(numberEl.getBoundingClientRect(), rootRect);
          const adjustedBox = { ...rawBox, y: rawBox.y - 1, h: rawBox.h + 2 };
          numbers.push({
            side: "svg",
            kind: pair.kind,
            text,
            pairText: pair.ownerText ? pair.ownerText(numberEl) || text : text,
            ownerText: pair.ownerText ? pair.ownerText(numberEl) || null : null,
            box: adjustedBox,
            font: fontInfo(numberEl),
            letters: glyphBoxesForElement(numberEl, rootRect),
          });
        }
      }
      return numbers;
    }

    function collectHtmlOccurrences(root, rootRect) {
      const occurrences = [];
      for (const el of root.querySelectorAll('[data-el-type="occurrence"]')) {
        const participant = (el.getAttribute("data-belongs-to") ?? "").trim();
        const box = boxOrNull(relRect(el.getBoundingClientRect(), rootRect));
        if (!box) continue;
        occurrences.push({
          side: "html",
          participant,
          idx: occurrences.length,
          box,
        });
      }
      return occurrences;
    }

    function collectSvgOccurrences(root, rootRect) {
      const occurrences = [];
      for (const el of root.querySelectorAll("rect.occurrence")) {
        const participant = (el.getAttribute("data-participant") ?? "").trim();
        const box = boxOrNull(strokedElementOuterRect(el, rootRect));
        if (!box) continue;
        occurrences.push({
          side: "svg",
          participant,
          idx: occurrences.length,
          box,
        });
      }
      return occurrences;
    }

    function collectHtmlFragmentDividers(root, rootRect) {
      const dividers = [];
      // Alt/tcf dividers: .segment.border-t
      for (const seg of root.querySelectorAll(".segment.border-t")) {
        const r = seg.getBoundingClientRect();
        const y = r.top - rootRect.top;
        const x = r.left - rootRect.left;
        const w = r.width;
        const label = (seg.querySelector(".text-skin-fragment")?.textContent ?? "").trim();
        dividers.push({ side: "html", idx: dividers.length, y, x, width: w, label, source: "segment" });
      }
      // Par dividers: .statement-container with computed border-top inside .par
      for (const sc of root.querySelectorAll(".par .statement-container")) {
        const style = getComputedStyle(sc);
        if (parseFloat(style.borderTopWidth) < 1) continue;
        const r = sc.getBoundingClientRect();
        const y = r.top - rootRect.top;
        const x = r.left - rootRect.left;
        const w = r.width;
        dividers.push({ side: "html", idx: dividers.length, y, x, width: w, label: "", source: "par" });
      }
      // Sort by Y position for consistent pairing
      dividers.sort((a, b) => a.y - b.y);
      dividers.forEach((d, i) => { d.idx = i; });
      return dividers;
    }

    function collectSvgFragmentDividers(root, rootRect) {
      const dividers = [];
      for (const line of root.querySelectorAll("line.fragment-separator")) {
        const lineRect = line.getBoundingClientRect();
        const strokeWidth = parseFloat(getComputedStyle(line).strokeWidth || "0") || 0;
        const half = strokeWidth / 2;
        // The painted top edge of the stroke = center - half.
        // This matches HTML border-top measurement (top edge of the 1px border).
        const y = (lineRect.top - rootRect.top) - half;
        const x = lineRect.left - rootRect.left;
        const w = lineRect.width;
        dividers.push({ side: "svg", idx: dividers.length, y, x, width: w, label: "" });
      }
      return dividers;
    }

    function collectHtmlDividers(root, rootRect) {
      const dividers = [];
      for (const el of root.querySelectorAll(".divider")) {
        const nameEl = el.querySelector(".name");
        if (!nameEl) continue;
        const r = el.getBoundingClientRect();
        const nr = nameEl.getBoundingClientRect();
        dividers.push({
          side: "html",
          idx: dividers.length,
          label: nameEl.textContent.trim(),
          y: Math.round((r.top - rootRect.top + r.bottom - rootRect.top) / 2),
          box: { x: Math.round(r.left - rootRect.left), y: Math.round(r.top - rootRect.top), w: Math.round(r.width), h: Math.round(r.height) },
          label_box: { x: Math.round(nr.left - rootRect.left), y: Math.round(nr.top - rootRect.top), w: Math.round(nr.width), h: Math.round(nr.height) },
        });
      }
      return dividers;
    }

    function collectSvgDividers(root, rootRect) {
      const dividers = [];
      for (const g of root.querySelectorAll("g.divider")) {
        const label = g.querySelector(".divider-label");
        const bg = g.querySelector(".divider-bg");
        if (!label) continue;
        const lr = label.getBoundingClientRect();
        const gr = bg ? bg.getBoundingClientRect() : lr;
        dividers.push({
          side: "svg",
          idx: dividers.length,
          label: label.textContent.trim(),
          y: Math.round(lr.top - rootRect.top + lr.height / 2),
          box: bg ? { x: Math.round(gr.left - rootRect.left), y: Math.round(gr.top - rootRect.top), w: Math.round(gr.width), h: Math.round(gr.height) } : null,
          label_box: { x: Math.round(lr.left - rootRect.left), y: Math.round(lr.top - rootRect.top), w: Math.round(lr.width), h: Math.round(lr.height) },
        });
      }
      return dividers;
    }

    const prepared = typeof window.prepareHtmlForCapture === "function"
      ? window.prepareHtmlForCapture()
      : null;
    const htmlOutput = document.getElementById("html-output");
    const htmlRoot = htmlOutput.querySelector(".frame") || htmlOutput.querySelector(".sequence-diagram") || htmlOutput;
    const svgRoot = document.querySelector("#svg-output > svg") || document.querySelector("#svg-output svg");
    const htmlRootRect = htmlRoot.getBoundingClientRect();
    const svgRootRect = svgRoot.getBoundingClientRect();
    const svgFrameBorderEl = svgRoot.querySelector("rect.frame-border-inner, rect.frame-border, rect.frame-box");

    return {
      caseName: new URLSearchParams(window.location.search).get("case") || "",
      htmlRootSelector: htmlOutput.querySelector(".frame") ? "#html-output .frame" : "#html-output .sequence-diagram",
      svgRootSelector: "#svg-output > svg",
      prepared: Boolean(prepared),
      htmlRoot: { width: htmlRootRect.width, height: htmlRootRect.height },
      svgRoot: { width: svgRootRect.width, height: svgRootRect.height },
      htmlRootBox: { x: 0, y: 0, w: htmlRootRect.width, h: htmlRootRect.height },
      svgRootBox: { x: 0, y: 0, w: svgRootRect.width, h: svgRootRect.height },
      svgFrameBorderBox: boxOrNull(strokedElementOuterRect(svgFrameBorderEl, svgRootRect)),
      htmlLabels: collectHtmlLabels(htmlRoot, htmlRootRect),
      svgLabels: collectSvgLabels(svgRoot, svgRootRect),
      htmlNumbers: collectHtmlNumbers(htmlRoot, htmlRootRect),
      svgNumbers: collectSvgNumbers(svgRoot, svgRootRect),
      htmlArrows: collectHtmlArrows(htmlRoot, htmlRootRect),
      svgArrows: collectSvgArrows(svgRoot, svgRootRect),
      htmlParticipants: collectHtmlParticipants(htmlRoot, htmlRootRect),
      svgParticipants: collectSvgParticipants(svgRoot, svgRootRect),
      htmlComments: collectHtmlComments(htmlRoot, htmlRootRect),
      svgComments: collectSvgComments(svgRoot, svgRootRect),
      htmlGroups: collectHtmlGroups(htmlRoot, htmlRootRect),
      svgGroups: collectSvgGroups(svgRoot, svgRootRect),
      htmlOccurrences: collectHtmlOccurrences(htmlRoot, htmlRootRect),
      svgOccurrences: collectSvgOccurrences(svgRoot, svgRootRect),
      htmlFragmentDividers: collectHtmlFragmentDividers(htmlRoot, htmlRootRect),
      svgFragmentDividers: collectSvgFragmentDividers(svgRoot, svgRootRect),
      htmlDividers: collectHtmlDividers(htmlRoot, htmlRootRect),
      svgDividers: collectSvgDividers(svgRoot, svgRootRect),
    };
  });
}
