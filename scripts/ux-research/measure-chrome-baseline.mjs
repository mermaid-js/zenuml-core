#!/usr/bin/env node
// Measure a baseline of editor chrome motion / elevation / focus.
// Standalone (not under tests/), so `bun pw` does not pick it up.
//
// Usage: start the dev server (`bun run dev`, port 14000), then
//   node scripts/ux-research/measure-chrome-baseline.mjs [--base http://localhost:14000] [--out path.json]
//
// For each surface it records the computed motion/elevation styles of the
// root (and card / mask where the root is a transparent wrapper), every
// animation that document.getAnimations() reports during the first 600 ms
// after the trigger, and for every interactive control its size, rest and
// focused outline/box-shadow, and disabled state.

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "../..");
const BASE = argVal("--base", process.env.BASE_URL || "http://localhost:14000");
const OUT = resolve(
  argVal("--out", `${ROOT}/docs/ux-research/evidence/chrome-baseline-2026-10-19.json`),
);
const VIEWPORT = { width: 1200, height: 800 };
const POLL_MS = 600;

const STYLE_PROPS = [
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation-name",
  "animation-duration",
  "box-shadow",
  "border-radius",
  "background-color",
  "z-index",
  "opacity",
  "position",
];

// ---------- in-page helpers ----------

async function computed(page, selector, props = STYLE_PROPS, pseudo = null) {
  return page.evaluate(
    ({ selector, props, pseudo }) => {
      const el = document.querySelector(selector);
      if (!el) return { error: `not found: ${selector}` };
      const cs = getComputedStyle(el, pseudo);
      const r = el.getBoundingClientRect();
      const out = { selector, box: { w: r.width, h: r.height } };
      for (const p of props) out[p] = cs.getPropertyValue(p);
      return out;
    },
    { selector, props, pseudo },
  );
}

// Start a rAF loop that samples document.getAnimations() every frame. t0 is
// the first frame where `rootSelector` exists; frames are kept for POLL_MS
// after t0 (or after the start if the root never appears).
async function startAnimPoll(page, rootSelector, totalMs = 1500) {
  await page.evaluate(
    ({ rootSelector, totalMs, pollMs }) => {
      const log = { frames: 0, t0: null, rootSeen: false, anims: {} };
      window.__animLog = log;
      const start = performance.now();
      window.__animDone = new Promise((done) => {
        const tick = () => {
          const now = performance.now();
          if (!log.rootSeen && rootSelector && document.querySelector(rootSelector)) {
            log.rootSeen = true;
            log.t0 = now - start;
          }
          const ref = log.t0 ?? 0;
          const rel = now - start - ref;
          if (rel <= pollMs) {
            log.frames++;
            for (const a of document.getAnimations()) {
              const t = a.effect?.getTiming?.() ?? {};
              const target = a.effect?.target;
              const name = a.animationName || a.transitionProperty || a.id || "";
              const desc = target
                ? `${target.tagName.toLowerCase()}${target.dataset?.testid ? `[data-testid=${target.dataset.testid}]` : ""}${target.id ? `#${target.id}` : ""}.${String(target.className?.baseVal ?? target.className ?? "").split(/\s+/).slice(0, 4).join(".")}`
                : null;
              const key = `${a.constructor.name}|${name}|${t.duration}|${t.easing}|${t.delay}|${desc}|${a.effect?.pseudoElement ?? ""}`;
              const rec = (log.anims[key] ??= {
                kind: a.constructor.name,
                name,
                duration: t.duration,
                easing: t.easing,
                delay: t.delay,
                pseudoElement: a.effect?.pseudoElement ?? null,
                target: desc,
                firstSeenMs: Math.round(rel),
                lastSeenMs: Math.round(rel),
                playStates: [],
              });
              rec.lastSeenMs = Math.round(rel);
              if (!rec.playStates.includes(a.playState)) rec.playStates.push(a.playState);
            }
          }
          if (now - start < totalMs) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      });
    },
    { rootSelector, totalMs, pollMs: POLL_MS },
  );
}

async function finishAnimPoll(page) {
  return page.evaluate(async () => {
    await window.__animDone;
    const l = window.__animLog;
    return {
      windowMs: 600,
      framesSampled: l.frames,
      rootAppearedAtMs: l.t0 == null ? null : Math.round(l.t0),
      animations: Object.values(l.anims),
    };
  });
}

const CONTROL_SELECTOR =
  'button, [role="menuitem"], [role="option"], input, select, textarea, [tabindex]';

// Tag every interactive control under the given roots and return rest values.
async function stampControls(page, rootSelectors, prefix) {
  return page.evaluate(
    ({ rootSelectors, sel, prefix }) => {
      const seen = new Set();
      const out = [];
      let n = 0;
      for (const rs of rootSelectors) {
        for (const root of document.querySelectorAll(rs)) {
          const list = [root, ...root.querySelectorAll(sel)].filter((e) => e.matches(sel));
          for (const el of list) {
            if (seen.has(el)) continue;
            seen.add(el);
            const id = `${prefix}-${n++}`;
            el.setAttribute("data-measure-id", id);
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            out.push({
              id,
              tag: el.tagName.toLowerCase(),
              role: el.getAttribute("role"),
              ariaLabel: el.getAttribute("aria-label"),
              title: el.getAttribute("title"),
              text: (el.innerText || el.value || "").trim().slice(0, 40),
              tabIndex: el.tabIndex,
              box: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
              visibleOpacity: cs.opacity,
              disabledAttr: el.hasAttribute("disabled"),
              disabledProp: "disabled" in el ? el.disabled : null,
              ariaDisabled: el.getAttribute("aria-disabled"),
              pointerEvents: cs.pointerEvents,
              rest: {
                outlineStyle: cs.outlineStyle,
                outlineWidth: cs.outlineWidth,
                outlineColor: cs.outlineColor,
                outlineOffset: cs.outlineOffset,
                boxShadow: cs.boxShadow,
                borderColor: cs.borderTopColor,
                borderRadius: cs.borderRadius,
                transitionProperty: cs.transitionProperty,
                transitionDuration: cs.transitionDuration,
              },
            });
          }
        }
      }
      return out;
    },
    { rootSelectors, sel: CONTROL_SELECTOR, prefix },
  );
}

async function focusPass(page, cdp, controls) {
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  for (const c of controls) {
    try {
      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: `[data-measure-id="${c.id}"]`,
      });
      if (!nodeId) {
        c.focused = { error: "control gone (surface closed?)" };
        continue;
      }
      await cdp.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: ["focus", "focus-visible"],
      });
      c.focused = await page.evaluate((id) => {
        const el = document.querySelector(`[data-measure-id="${id}"]`);
        el.focus({ preventScroll: true });
        const cs = getComputedStyle(el);
        return {
          method: "CDP CSS.forcePseudoState(focus,focus-visible) + element.focus()",
          isActiveElement: document.activeElement === el,
          matchesFocusVisibleNatively: (() => {
            try {
              return el.matches(":focus-visible");
            } catch {
              return null;
            }
          })(),
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
          outlineColor: cs.outlineColor,
          outlineOffset: cs.outlineOffset,
          boxShadow: cs.boxShadow,
          borderColor: cs.borderTopColor,
          opacity: cs.opacity,
        };
      }, c.id);
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
    } catch (e) {
      c.focused = { error: String(e.message || e).split("\n")[0] };
    }
  }
  return controls;
}

function smallest(controls) {
  const sized = controls.filter((c) => c.box.w > 0 && c.box.h > 0);
  if (!sized.length) return null;
  const s = sized.reduce((a, b) => (a.box.w * a.box.h <= b.box.w * b.box.h ? a : b));
  return {
    w: s.box.w,
    h: s.box.h,
    control: s.ariaLabel || s.text || s.tag,
    opacityAtMeasure: s.visibleOpacity,
    meets24x24: s.box.w >= 24 && s.box.h >= 24,
    meets44x44: s.box.w >= 44 && s.box.h >= 44,
  };
}

// ---------- surface openers ----------

const participantCornerClick = async (page, id) => {
  const p = page.locator(`.participant[data-participant-id="${id}"]`);
  const box = await p.boundingBox();
  await p.click({ position: { x: 3, y: box.height - 3 } });
};
const clickMessageArrow = async (message) => {
  const box = await message.boundingBox();
  await message.click({ position: { x: box.width - 3, y: box.height - 2 } });
};
const PSP = '[data-testid="participant-style-panel"]';
const TYPE = '[role="dialog"][aria-label="Participant type"]';
const COLOR = '[role="dialog"][aria-label="Participant colour"]';

const SURFACES = [
  {
    name: "ParticipantStylePanel",
    url: "/e2e/fixtures/insert-participant.html",
    ready: ".participant[data-participant-id='A']",
    trigger: (page) => participantCornerClick(page, "A"),
    root: PSP,
    extras: {
      card: '[data-testid="participant-name-row"]',
      mask: '[data-testid="participant-editor-mask"]',
    },
    controlsUnder: [PSP],
  },
  {
    name: "TypePicker",
    url: "/e2e/fixtures/insert-participant.html",
    ready: ".participant[data-participant-id='A']",
    pre: async (page) => {
      await participantCornerClick(page, "A");
      await page.locator(PSP).waitFor();
    },
    trigger: (page) =>
      page.locator(PSP).getByRole("button", { name: /^Set icon/ }).click(),
    root: TYPE,
    controlsUnder: [TYPE],
    post: async (page, s) => {
      // Options appear only after a search; record them too.
      const search = page.locator(TYPE).getByRole("combobox", { name: "Search icons" });
      if (await search.count()) {
        await search.fill("s3");
        await page.locator(`${TYPE} [role="option"]`).first().waitFor({ timeout: 3000 }).catch(() => {});
        s.optionsAfterSearch = await stampControls(page, [`${TYPE} [role="option"]`], "typeopt");
        s.optionsAfterSearchSmallest = smallest(s.optionsAfterSearch);
      }
    },
  },
  {
    name: "ColorPicker",
    url: "/e2e/fixtures/insert-participant.html",
    ready: ".participant[data-participant-id='A']",
    pre: async (page) => {
      await participantCornerClick(page, "A");
      await page.locator(PSP).waitFor();
    },
    trigger: (page) =>
      page.locator(PSP).getByRole("button", { name: /^Set color/ }).click(),
    root: COLOR,
    controlsUnder: [COLOR],
  },
  {
    name: "MessageStylePanel",
    url: "/e2e/fixtures/editable-label.html",
    ready: ".interaction.async .message",
    trigger: (page) =>
      clickMessageArrow(
        page.locator(".interaction.async .message").filter({ hasText: "Hello Bob" }),
      ),
    root: "#style-panel",
    extras: { card: "#style-panel > div" },
    controlsUnder: ["#style-panel"],
  },
  {
    name: "GapHandleZoneMenu",
    url: "/e2e/fixtures/create-message.html",
    ready: '[data-testid="message-gap-hover-1"]',
    pre: async (page, s) => {
      // The create handle shows on hover; measure it first (smallest control).
      const gap = page.getByTestId("message-gap-hover-1").first();
      await gap.hover({ force: true });
      const handle = page.locator('[data-testid^="message-create-handle-1-"]').first();
      try {
        await handle.waitFor({ timeout: 3000 });
        const sel = await handle.evaluate((el) => `[data-testid="${el.dataset.testid}"]`);
        s.createHandle = {
          root: await computed(page, sel),
          controls: await stampControls(page, [sel], "handle"),
        };
      } catch (e) {
        s.createHandle = { error: String(e.message || e).split("\n")[0] };
      }
      await page.mouse.move(0, 0);
      await gap.focus();
    },
    // Real keyboard path: Shift+F10 on the focused gap opens the menu and
    // moves focus to its item.
    trigger: (page) => page.keyboard.press("Shift+F10"),
    root: '[data-testid="gap-insert-menu-1"]',
    controlsUnder: ['[data-testid="gap-insert-menu-1"]'],
    keyboardFocusProbe: '[data-testid="divider-insert-1"]',
  },
  {
    name: "ParticipantInsertControls",
    url: "/e2e/fixtures/insert-participant.html",
    ready: "#A .participant",
    pre: async (page, s) => {
      s.buttonAtRest = await computed(page, '[data-testid="participant-insert-button-0"]');
      s.hitWrapperAtRest = await computed(
        page,
        '[data-testid="participant-insert-button-0"]',
        ["width", "height"],
      ).then(async () =>
        page.evaluate(() => {
          const p = document.querySelector('[data-testid="participant-insert-button-0"]').parentElement;
          const r = p.getBoundingClientRect();
          return { w: r.width, h: r.height, className: p.className, pointerEvents: getComputedStyle(p).pointerEvents };
        }),
      );
    },
    trigger: async (page) => {
      const a = await page.locator("#A .participant").boundingBox();
      const c = await page.locator("#C .participant").boundingBox();
      await page.mouse.move((a.x + a.width + c.x) / 2, a.y + a.height / 2);
    },
    root: '[data-testid="participant-insert-button-0"]',
    // Opacity transition target; wait for it to settle before reading.
    settleMs: 400,
    controlsUnder: ['[data-cap="insertParticipant"]'],
    post: async (page, s) => {
      s.buttonAfterHover = await computed(page, '[data-testid="participant-insert-button-0"]');
    },
  },
];

// ---------- main ----------

async function measureSurface(browser, def) {
  const s = { name: def.name, url: def.url };
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${def.url}`);
    await page.locator(def.ready).first().waitFor({ timeout: 10000 });
    if (def.pre) await def.pre(page, s);
    await startAnimPoll(page, def.root);
    await def.trigger(page);
    await page.locator(def.root).first().waitFor({ timeout: 5000 });
    s.animationPoll = await finishAnimPoll(page);
    if (def.settleMs) await page.waitForTimeout(def.settleMs);
    if (def.keyboardFocusProbe) {
      s.keyboardFocus = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const cs = getComputedStyle(el);
        return {
          method: "real keyboard (focus gap, Shift+F10)",
          isActiveElement: document.activeElement === el,
          matchesFocusVisible: el.matches(":focus-visible"),
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
          boxShadow: cs.boxShadow,
          backgroundColor: cs.backgroundColor,
        };
      }, def.keyboardFocusProbe);
    }
    s.root = await computed(page, def.root);
    for (const [k, sel] of Object.entries(def.extras ?? {})) s[k] = await computed(page, sel);
    const controls = await stampControls(page, def.controlsUnder, def.name);
    const cdp = await context.newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    s.controls = await focusPass(page, cdp, controls);
    s.smallestHitArea = smallest(s.controls);
    if (def.post) await def.post(page, s);
    s.ok = true;
  } catch (e) {
    s.ok = false;
    s.error = String(e.message || e).split("\n")[0];
  } finally {
    await context.close();
  }
  return s;
}

const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const surfaces = [];
for (const def of SURFACES) {
  process.stdout.write(`measuring ${def.name}... `);
  const s = await measureSurface(browser, def);
  console.log(s.ok ? "ok" : `FAILED: ${s.error}`);
  surfaces.push(s);
}
await browser.close();

const result = {
  date: "2026-10-19",
  measuredAt: new Date().toISOString(),
  commit: execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(),
  baseUrl: BASE,
  viewport: VIEWPORT,
  browser: `chromium (playwright ${(await import("playwright/package.json", { with: { type: "json" } })).default.version})`,
  animationPollWindowMs: POLL_MS,
  surfaces,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log(`wrote ${OUT}`);
