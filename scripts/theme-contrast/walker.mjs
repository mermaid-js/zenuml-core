// Browser-side walker: lists every text node, line and fill of a rendered
// diagram with its document rectangle, nominal colour and effective opacity.
// Runs inside page.evaluate(); must stay self-contained (no imports).

/**
 * @param {object} spec  { textRoles, lineRoles, fillRoles, rootSelector, mode }
 *   mode "dom"  — zenuml DOM renderer (roles from roles.mjs)
 *   mode "svg"  — any inline SVG: <text> as text, stroked shapes as lines,
 *                 filled rects as fills (used for the SVG renderer and for the
 *                 benchmark diagrams)
 */
export function walkDiagram(spec) {
  const rootSel = spec.rootSelector || ".zenuml";
  // Outermost matches only: the DOM renderer nests a `.zenuml` div inside the
  // `pre.zenuml` host, and walking both would list every item twice.
  const roots = Array.from(document.querySelectorAll(rootSel)).filter(
    (el) => !el.parentElement || !el.parentElement.closest(rootSel),
  );
  // The theme's surfaces, as the page paints them (first instance of each).
  const surfaceOf = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).backgroundColor : null;
  };
  const surfaces = {
    frame: surfaceOf(".frame") || surfaceOf(".frame-border-inner"),
    occurrence: surfaceOf(".occurrence"),
    header: surfaceOf(".fragment:not(.fragment-ref) > .header"),
    dividerBox: surfaceOf(".divider .name"),
  };
  if (spec.mode === "svg") {
    const fillOf = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fill : null;
    };
    surfaces.frame = fillOf(".frame-border-inner");
    surfaces.occurrence = fillOf(".occurrence");
    surfaces.header = fillOf(".fragment-header");
    surfaces.dividerBox = fillOf(".divider-bg");
    surfaces.headerOpacity = (() => { const el = document.querySelector(".fragment-header"); return el ? getComputedStyle(el).fillOpacity : null; })();
  }
  const items = [];
  const sx = window.scrollX;
  const sy = window.scrollY;

  const rectOf = (r) => ({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height });
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden";
  };
  const effectiveOpacity = (el, stop) => {
    let o = 1;
    for (let e = el; e && e !== stop.parentElement; e = e.parentElement) {
      const v = parseFloat(getComputedStyle(e).opacity);
      if (!Number.isNaN(v)) o *= v;
    }
    return o;
  };
  const hostOf = (root) => {
    const h = root.closest("[data-host]");
    return h ? h.getAttribute("data-host") : null;
  };
  // DSL styling (`A.m() [red]`, `@Actor X #ff0000`) lands as inline style on
  // the element or an ancestor; those colours are the author's, not the theme's.
  const userStyled = (el, stop) => {
    for (let e = el; e && e !== stop.parentElement; e = e.parentElement) {
      const st = e.getAttribute && e.getAttribute("style");
      if (st && /(^|;)\s*(color|background(-color)?)\s*:/i.test(st) && !/var\(--color-/.test(st)) return true;
    }
    return false;
  };
  const cssPath = (el, root) => {
    const parts = [];
    for (let e = el; e && e !== root; e = e.parentElement) {
      const cls = Array.from(e.classList).slice(0, 2).join(".");
      parts.unshift(e.tagName.toLowerCase() + (cls ? "." + cls : ""));
      if (parts.length > 4) break;
    }
    return parts.join(">");
  };

  for (const root of roots) {
    const host = hostOf(root);
    const rootRect = rectOf(root.getBoundingClientRect());

    if (spec.mode === "svg") {
      const svg = root.matches("svg") ? root : root.querySelector("svg");
      if (!svg) continue;
      for (const el of svg.querySelectorAll("text, tspan, line, path, polyline, polygon, rect, circle, ellipse")) {
        if (!visible(el)) continue;
        // Icons are decorative duplicates of their labels; their strokes are
        // too small to sample against anything but themselves.
        if (el.closest(".participant-icon, .fragment-icon")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const cs = getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        if (tag === "text" || tag === "tspan") {
          if (tag === "text" && el.querySelector("tspan")) continue; // measured per tspan
          const text = (el.textContent || "").trim();
          if (!text) continue;
          // An author colour lands as an inline style on the participant box
          // or the text itself (`"name" #FF0000`, `[red]`): the author's, not the theme's.
          const group = el.closest("g.participant, g.message, g.creation, g.divider") || el.parentElement;
          const styled = !!(el.getAttribute("style") || (group && group.querySelector("[style*=\"fill\"]")));
          items.push({
            kind: "text", role: "svg-text", host, path: cssPath(el, svg), text: text.slice(0, 40),
            rect: rectOf(r), color: cs.fill, opacity: effectiveOpacity(el, svg) * (parseFloat(cs.fillOpacity) || 1),
            fontSize: parseFloat(cs.fontSize) || 0, userStyled: styled,
          });
          continue;
        }
        const stroke = cs.stroke;
        const fill = cs.fill;
        const hasStroke = stroke && stroke !== "none" && parseFloat(cs.strokeWidth) > 0;
        const hasFill = fill && fill !== "none" && (tag === "rect" || tag === "polygon" || tag === "path" || tag === "circle" || tag === "ellipse");
        const rr = rectOf(r);
        if (hasStroke) {
          items.push({
            kind: "line", role: "svg-line", host, path: cssPath(el, svg), rect: rr, edge: "svg",
            color: stroke, opacity: effectiveOpacity(el, svg) * (parseFloat(cs.strokeOpacity) || 1),
            strokeWidth: parseFloat(cs.strokeWidth) || 1,
          });
        }
        if (hasFill && rr.w >= 6 && rr.h >= 6) {
          items.push({
            kind: "fill", role: "svg-fill", host, path: cssPath(el, svg), rect: rr,
            color: fill, opacity: effectiveOpacity(el, svg) * (parseFloat(cs.fillOpacity) || 1), gate: false,
          });
        }
      }
      continue;
    }

    // DOM mode. 1. Text nodes.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue.replace(/\s+/g, " ").trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || !visible(el)) continue;
      if (el.closest("script, style") || (spec.chromeSelector && el.closest(spec.chromeSelector))) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      let role = "text-other";
      for (const tr of spec.textRoles) {
        if (el.closest(tr.selector)) { role = tr.role; break; }
      }
      const cs = getComputedStyle(el);
      const opacity = effectiveOpacity(el, root);
      if (opacity < 0.05) continue; // hover-only controls, hidden placeholders
      items.push({
        kind: "text", role, host, path: cssPath(el, root), text: text.slice(0, 40),
        rect: rectOf(r), color: cs.color, opacity,
        fontSize: parseFloat(cs.fontSize) || 0,
        userStyled: userStyled(el, root),
      });
    }

    // 2. Lines.
    for (const lr of spec.lineRoles) {
      for (const el of root.querySelectorAll(lr.selector)) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const cs = getComputedStyle(el);
        let color = cs.getPropertyValue(lr.colorProp);
        let width = 1;
        if (lr.edge === "left") width = parseFloat(cs.borderLeftWidth) || 0;
        if (lr.edge === "top") width = parseFloat(cs.borderTopWidth) || 0;
        if (lr.edge === "bottom") width = parseFloat(cs.borderBottomWidth) || 0;
        if (lr.edge === "svg") width = parseFloat(cs.strokeWidth) || 1;
        if (lr.edge === "row") width = r.height;
        if (lr.edge === "column") width = r.width;
        if (lr.colorProp === "background-image") {
          // lifeline: linear-gradient(..., transparent 50%, <colour> 50%)
          const m = color.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8})\s*50%\)/i);
          color = m ? m[1] : cs.borderLeftColor;
        }
        if (lr.edge !== "row" && lr.edge !== "column" && lr.edge !== "svg" && width === 0) continue;
        if (color === "currentcolor") color = cs.color;
        const opacity = effectiveOpacity(el, root);
        if (opacity < 0.05) continue;
        items.push({
          kind: "line", role: lr.role, host, path: cssPath(el, root), rect: rectOf(r), edge: lr.edge,
          color, opacity, strokeWidth: width, userStyled: userStyled(el, root),
          dashed: lr.role === "lifeline" || lr.role === "group-outline" || !!(cs.strokeDasharray && cs.strokeDasharray !== "none" && el.getAttribute("stroke-dasharray")),
        });
      }
    }

    // 3. Fills (skipped in forced-colors mode, where the system paints them).
    for (const fr of spec.skipFills ? [] : spec.fillRoles) {
      for (const el of root.querySelectorAll(fr.selector)) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const cs = getComputedStyle(el);
        const opacity = effectiveOpacity(el, root);
        if (opacity < 0.05) continue;
        // An unpainted background is not a fill (theme-dark drops the number
        // badge and code span fills this way).
        if (/^rgba\(.*,\s*0\)$/.test(cs.backgroundColor) || cs.backgroundColor === "transparent") continue;
        items.push({
          kind: "fill", role: fr.role, host, path: cssPath(el, root), rect: rectOf(r),
          color: cs.backgroundColor, opacity, gate: fr.gate !== false, userStyled: userStyled(el, root),
        });
      }
    }
    items.push({ kind: "meta", role: "root", host, rect: rootRect });
  }
  return { items, surfaces, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight };
}
