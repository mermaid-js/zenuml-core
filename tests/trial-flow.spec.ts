import { expect, test } from "@playwright/test";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The public typing trial (trial.html, ADR 0009) against the real collector
// Worker running locally: `wrangler dev --local`, a local R2 store, and
// Cloudflare's always-pass Turnstile test keys. Nothing is deployed and the
// Cloudflare account API is not touched.
//
// The collector lives in PR #748 (`wrangler.trial.toml`, `workers/`), which
// this branch does not contain. Point TRIAL_COLLECTOR_DIR at a checkout of it:
// the directory that holds `wrangler.trial.toml`. Without it the spec skips,
// so CI on this branch alone stays green.
//
//   TRIAL_COLLECTOR_DIR=/path/to/collector PORT=14100 bun pw tests/trial-flow.spec.ts --workers=2
//
// Optional: TRIAL_WORKER_PORT (default 8787), TRIAL_E2E_OUT (a directory that
// receives the four stored recordings, for the G5 dry run).

const COLLECTOR_DIR = process.env.TRIAL_COLLECTOR_DIR;
const WORKER_PORT = Number(process.env.TRIAL_WORKER_PORT) || 8787;
const PAGE_PORT = Number(process.env.PORT) || 14000;
const PAGE_ORIGIN = `http://127.0.0.1:${PAGE_PORT}`;
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";
const BUCKET = "zenuml-writing-trial";

test.skip(!COLLECTOR_DIR, "set TRIAL_COLLECTOR_DIR to a checkout of PR #748");
test.describe.configure({ mode: "serial" });

let worker: ChildProcess | undefined;
let persist = "";
let workerLog = "";

test.beforeAll(async () => {
  if (!COLLECTOR_DIR) return;
  if (!fs.existsSync(path.join(COLLECTOR_DIR, "wrangler.trial.toml")))
    throw new Error(`no wrangler.trial.toml in ${COLLECTOR_DIR}`);
  persist = fs.mkdtempSync(path.join(os.tmpdir(), "trial-r2-"));
  // A fresh store each run, so "four objects" is exact.
  fs.writeFileSync(
    path.join(COLLECTOR_DIR, ".dev.vars"),
    `TURNSTILE_SECRET=${TURNSTILE_TEST_SECRET}\n`,
  );
  worker = spawn(
    path.resolve("node_modules/.bin/wrangler"),
    [
      "dev",
      "-c",
      "wrangler.trial.toml",
      "--local",
      "--port",
      String(WORKER_PORT),
      "--persist-to",
      persist,
      "--var",
      `ALLOWED_ORIGIN:${PAGE_ORIGIN}`,
    ],
    { cwd: COLLECTOR_DIR, env: { ...process.env, CI: "1" } },
  );
  worker.stdout?.on("data", (d) => (workerLog += String(d)));
  worker.stderr?.on("data", (d) => (workerLog += String(d)));
  const deadline = Date.now() + 90_000;
  for (;;) {
    try {
      // No Origin header: the Worker answers 403, which proves it is up.
      await fetch(`http://127.0.0.1:${WORKER_PORT}/collect`, {
        method: "POST",
      });
      break;
    } catch {
      if (Date.now() > deadline)
        throw new Error(`wrangler dev did not start:\n${workerLog}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
});

test.afterAll(() => {
  worker?.kill("SIGTERM");
  if (persist && !process.env.TRIAL_E2E_KEEP) {
    fs.rmSync(persist, { recursive: true, force: true });
  }
});

interface Header {
  start: string;
  task: string;
  arm: string;
  editor: string;
  paste: boolean;
  hiddenMs: number;
  durationMs: number;
  detect: { q: string; answer: string; correct: boolean }[];
}

const replay = (jsonl: string) => {
  const [head, ...events] = jsonl
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  let code: string = head.start;
  for (const e of events)
    code = code.slice(0, e.pos) + e.ins + code.slice(e.pos + e.del);
  return { head: head as Header, code, events: events.length };
};

test("the full desktop flow stores four recordings in the local R2 bucket", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const posts: { body: Record<string, unknown>; status: number }[] = [];
  page.on("response", (res) => {
    const req = res.request();
    if (req.method() === "POST" && res.url().endsWith("/collect"))
      posts.push({ body: req.postDataJSON(), status: res.status() });
  });

  const endpoint = `http://127.0.0.1:${WORKER_PORT}/collect`;
  // probe=0.3,0.6: the two questions come at 30 % and 60 % of the typed text.
  await page.goto(
    `${PAGE_ORIGIN}/trial.html?endpoint=${encodeURIComponent(endpoint)}&probe=0.3,0.6`,
  );
  const body = page.locator("body");
  await expect(body).toHaveAttribute("data-ready", "1");

  // Consent: plain text, Start locked until the box is ticked.
  await expect(page.locator("#screen-consent")).toContainText(
    "No IP address, no name, no email address",
  );
  await expect(page.locator("#screen-consent")).toContainText("90 days");
  await expect(page.locator("#begin")).toBeDisabled();
  await page.locator("#agree").check();
  await page.locator("#begin").click();

  // Warm-up in the smart editor.
  await expect(body).toHaveAttribute("data-screen", "warmup");
  await expect(body).toHaveAttribute("data-smart-ready", "1", {
    timeout: 30_000,
  });
  await page.locator(".cm-content").click();
  await page.keyboard.type("Alice.greet()", { delay: 20 });
  await expect(page.locator("#wdiagram .message").first()).toBeVisible();
  await page.locator("#wdone").click();
  await expect(body).toHaveAttribute("data-screen", "task");

  // Three copy tasks, with two click-the-newest questions each. First
  // question: a click on the newest element. Second: a timeout in task 1 (10 s,
  // the ADR limit), a click on empty space in tasks 2 and 3.
  const bar = page.locator("#probe-bar");
  for (let n = 0; n < 3; n++) {
    await expect(page.locator("#tnum")).toHaveText(`Task ${n + 1} of 3`);
    const text = (await page.locator("#ttask").textContent())!;
    await page.locator("#tstart").click();
    await expect(page.locator("#teditor")).toBeEnabled();
    let typed = 0;
    for (const share of [0.3, 0.6, 1]) {
      const upTo = Math.ceil(share * text.length);
      await page.keyboard.type(text.slice(typed, upTo), { delay: 2 });
      typed = upTo;
      if (share === 1) break;
      // Typing pauses, and the diagram is not covered.
      await expect(bar).toBeVisible();
      await expect(page.locator("#teditor")).toBeDisabled();
      await expect(page.locator("#tdiagram")).toBeVisible();
      if (share === 0.3) {
        // Let the diagram settle, then click the last message drawn: the
        // newest element, by an oracle that does not use the page's tracker.
        const last = page.locator("#tdiagram .message").last();
        await expect(last).toBeVisible({ timeout: 10_000 });
        await page.waitForTimeout(1800);
        const box = (await last.boundingBox())!;
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      } else if (n === 0) {
        // No click: the question times out after 10 s.
        await expect(bar).toBeHidden({ timeout: 15_000 });
      } else {
        const panel = (await page.locator("#tpanel").boundingBox())!;
        await page.mouse.click(
          panel.x + panel.width - 12,
          panel.y + panel.height - 12,
        );
      }
      await expect(bar).toBeHidden();
      await expect(page.locator("#teditor")).toBeEnabled();
    }
    await expect(page.locator("#tdone")).toBeEnabled();
    await page.locator("#tdone").click();
  }

  // Thank-you screen: the person's own WPM, and all four sends confirmed.
  await expect(body).toHaveAttribute("data-screen", "thanks");
  await expect(body).toHaveAttribute("data-sent", "4", { timeout: 60_000 });
  await expect(page.locator("#wpm")).toHaveText(/^\d+$/);
  await expect(page.locator("#fallback")).toBeHidden();

  // The four POSTs: 201 each, a fresh token each, one session, one order.
  expect(posts.map((p) => p.status)).toEqual([201, 201, 201, 201]);
  expect(posts.map((p) => p.body.taskId)).toEqual(["warmup", "t1", "t2", "t3"]);
  const tokens = posts.map((p) => p.body.turnstileToken as string);
  expect(tokens.every((t) => typeof t === "string" && t.length > 0)).toBe(true);
  const sessionId = posts[0].body.sessionId as string;
  const order = posts[0].body.order as string;
  expect(["ABC", "BCA", "CAB"]).toContain(order);
  for (const p of posts) {
    expect(p.body.sessionId).toBe(sessionId);
    expect(p.body.order).toBe(order);
    expect(p.body.device).toBe("desktop");
    expect(p.body.consent).toBe(true);
  }
  expect(posts.slice(1).map((p) => p.body.arm)).toEqual(order.split(""));

  // Read the stored objects back from the local R2 state.
  const day = new Date().toISOString().slice(0, 10);
  const out = process.env.TRIAL_E2E_OUT;
  if (out) fs.mkdirSync(out, { recursive: true });
  const stored: Record<string, ReturnType<typeof replay>> = {};
  for (const taskId of ["warmup", "t1", "t2", "t3"]) {
    const file = path.join(persist, `${taskId}.out`);
    execFileSync(
      path.resolve("node_modules/.bin/wrangler"),
      [
        "r2",
        "object",
        "get",
        `${BUCKET}/recordings/${day}/${sessionId}/${taskId}.jsonl`,
        "--local",
        "--persist-to",
        persist,
        "--file",
        file,
      ],
      { cwd: COLLECTOR_DIR, stdio: "pipe" },
    );
    const jsonl = fs.readFileSync(file, "utf8");
    if (out) fs.writeFileSync(path.join(out, `${taskId}.jsonl`), jsonl);
    stored[taskId] = replay(jsonl);
  }
  // Exactly four blobs in the bucket.
  const blobs = path.join(persist, "v3", "r2", BUCKET, "blobs");
  expect(fs.readdirSync(blobs)).toHaveLength(4);

  // Header fields and content.
  const warm = stored.warmup;
  expect(warm.head).toMatchObject({
    task: "warmup",
    editor: "smart",
    paste: false,
    detect: [],
  });
  expect(warm.code).toContain("Alice.greet()");
  const tasks = ["t1", "t2", "t3"];
  for (const [i, id] of tasks.entries()) {
    const r = stored[id];
    expect(r.head.editor).toBe("textarea");
    expect(r.head.arm).toBe(order[i]);
    expect(r.head.paste).toBe(false);
    expect(Number.isInteger(r.head.hiddenMs)).toBe(true);
    expect(r.head.hiddenMs).toBeLessThan(10_000);
    expect(Number.isInteger(r.head.durationMs)).toBe(true);
    expect(r.head.durationMs).toBeGreaterThan(0);
    expect(r.head.detect).toHaveLength(2);
    expect(r.code.length).toBeGreaterThan(100);
  }
  // One correct click then a miss in each task; the miss answers "none".
  for (const id of tasks) {
    const [hit, miss] = stored[id].head.detect;
    expect(hit).toMatchObject({ q: "click-newest", correct: true });
    expect(hit.answer).not.toBe("none");
    expect(miss).toEqual({ q: "click-newest", answer: "none", correct: false });
  }
});

test("a touch-only visitor gets the warm-up only, marked device touch", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();
  const posts: { body: Record<string, unknown>; status: number }[] = [];
  page.on("response", (res) => {
    const req = res.request();
    if (req.method() === "POST" && res.url().endsWith("/collect"))
      posts.push({ body: req.postDataJSON(), status: res.status() });
  });
  const endpoint = `http://127.0.0.1:${WORKER_PORT}/collect`;
  await page.goto(
    `${PAGE_ORIGIN}/trial.html?endpoint=${encodeURIComponent(endpoint)}`,
  );
  const body = page.locator("body");
  await expect(body).toHaveAttribute("data-ready", "1");
  // A tap comes before any key.
  await page.locator("#agree").tap();
  await page.locator("#begin").tap();
  await expect(body).toHaveAttribute("data-smart-ready", "1", {
    timeout: 30_000,
  });
  await page.locator(".cm-content").click();
  await page.keyboard.type("A.go()", { delay: 20 });
  await page.locator("#wdone").click();

  await expect(body).toHaveAttribute("data-screen", "thanks");
  await expect(page.locator("#thanks-touch")).toBeVisible();
  await expect(page.locator("#thanks-full")).toBeHidden();
  await expect(body).toHaveAttribute("data-sent", "1", { timeout: 60_000 });
  expect(posts).toHaveLength(1);
  expect(posts[0].status).toBe(201);
  expect(posts[0].body).toMatchObject({ taskId: "warmup", device: "touch" });
  await context.close();
});
