import { describe, expect, it } from "vitest";
import {
  handleRequest,
  MAX_BYTES,
  type CollectorEnv,
  type CollectorDeps,
} from "../../workers/writing-trial/src/handler";

const ORIGIN = "https://core.example.test";
const SESSION = "k3J9xQ2mZpT7vLw4Nb8Rc1";

interface Stored {
  body: string;
  customMetadata?: Record<string, string>;
}

function fakeBucket() {
  const objects = new Map<string, Stored>();
  return {
    objects,
    async head(key: string) {
      return objects.has(key) ? { key } : null;
    },
    async put(
      key: string,
      body: string,
      options?: { customMetadata?: Record<string, string> },
    ) {
      objects.set(key, { body, customMetadata: options?.customMetadata });
      return { key };
    },
  };
}

function setup(turnstileOk = true) {
  const bucket = fakeBucket();
  const calls: { url: string; init?: RequestInit }[] = [];
  const deps: CollectorDeps = {
    fetch: (async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ success: turnstileOk }), {
        status: 200,
      });
    }) as unknown as typeof fetch,
    now: () => new Date("2026-11-24T10:00:00Z"),
  };
  const env: CollectorEnv = {
    RECORDINGS: bucket,
    ALLOWED_ORIGIN: ORIGIN,
    TURNSTILE_SECRET: "1x0000000000000000000000000000000AA",
  };
  return { bucket, calls, deps, env };
}

const jsonl = (extra: Record<string, unknown> = {}) =>
  [
    JSON.stringify({
      start: "",
      task: "t1",
      arm: "A",
      participant: 1,
      editor: "textarea",
      ...extra,
    }),
    JSON.stringify({ t: 120, pos: 0, del: 0, ins: "t" }),
    JSON.stringify({ t: 210, pos: 1, del: 0, ins: "i" }),
  ].join("\n") + "\n";

const payload = (over: Record<string, unknown> = {}) => ({
  sessionId: SESSION,
  taskId: "t1",
  arm: "A",
  order: "ABC",
  device: "desktop",
  consent: true,
  turnstileToken: "tok",
  jsonl: jsonl(),
  ...over,
});

// The Bun test preload registers happy-dom, whose Request drops forbidden
// headers such as Origin. The handler reads only these four members, so tests
// pass a plain object.
const req = (
  path: string,
  method: string,
  headers: Record<string, string>,
  body = "",
) => ({
  url: `https://collector.test${path}`,
  method,
  headers: new Headers(headers),
  text: async () => body,
});

const post = (body: unknown, headers: Record<string, string> = {}) =>
  req(
    "/collect",
    "POST",
    {
      "content-type": "application/json",
      origin: ORIGIN,
      "user-agent": "Mozilla/5.0 SECRET-UA",
      "cf-connecting-ip": "203.0.113.9",
      cookie: "a=b",
      ...headers,
    },
    typeof body === "string" ? body : JSON.stringify(body),
  );

describe("writing trial collector", () => {
  it("accepts a valid recording and stores it under the dated key", async () => {
    const { bucket, deps, env } = setup();
    const res = await handleRequest(post(payload()), env, deps);
    expect(res.status).toBe(201);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const key = `recordings/2026-11-24/${SESSION}/t1.jsonl`;
    expect([...bucket.objects.keys()]).toEqual([key]);
    const obj = bucket.objects.get(key)!;
    expect(obj.body).toBe(jsonl());
    expect(obj.customMetadata).toEqual({
      arm: "A",
      order: "ABC",
      device: "desktop",
    });
  });

  it("verifies the Turnstile token with the secret and token only", async () => {
    const { calls, deps, env } = setup();
    await handleRequest(post(payload()), env, deps);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    const sent = String(calls[0].init?.body);
    expect(sent).toContain("secret=");
    expect(sent).toContain("response=tok");
    expect(sent).not.toContain("remoteip");
    expect(sent).not.toContain("203.0.113.9");
  });

  it("rejects a missing or false consent without calling Turnstile", async () => {
    for (const consent of [undefined, false, "true", 1]) {
      const { bucket, calls, deps, env } = setup();
      const body = payload({ consent });
      if (consent === undefined)
        delete (body as Record<string, unknown>).consent;
      const res = await handleRequest(post(body), env, deps);
      expect(res.status).toBe(400);
      expect(bucket.objects.size).toBe(0);
      expect(calls).toHaveLength(0);
    }
  });

  it("rejects a failed Turnstile check and stores nothing", async () => {
    const { bucket, deps, env } = setup(false);
    const res = await handleRequest(post(payload()), env, deps);
    expect(res.status).toBe(403);
    expect(bucket.objects.size).toBe(0);
  });

  it("rejects bad schema", async () => {
    const row = (o: Record<string, unknown>) => JSON.stringify(o) + "\n";
    const bad: Record<string, unknown>[] = [
      { sessionId: "short" },
      { sessionId: "has spaces and ../ slashes!!" },
      { taskId: "t4" },
      { taskId: "../t1" },
      { arm: "D" },
      { order: "AAB" },
      { order: "ABCD" },
      { device: "phone-model-x" },
      { turnstileToken: "" },
      { jsonl: "" },
      { jsonl: "not json\n" },
      { jsonl: jsonl() + "{bad\n" },
      { jsonl: jsonl() + row({ t: 1, pos: 0, del: 0 }) },
      { jsonl: jsonl() + row({ t: -1, pos: 0, del: 0, ins: "" }) },
      { jsonl: jsonl() + row({ t: 400, pos: 0, del: 0, ins: "", ua: "x" }) },
      { jsonl: jsonl() + row({ t: 1, pos: 0, del: 0, ins: "" }) },
      { jsonl: jsonl({ userAgent: "Mozilla" }) },
      { jsonl: jsonl({ arm: "B" }) },
      { jsonl: jsonl({ task: "t2" }) },
      { jsonl: jsonl({ start: 5 }) },
    ];
    for (const over of bad) {
      const { bucket, deps, env } = setup();
      const res = await handleRequest(post(payload(over)), env, deps);
      expect(res.status, JSON.stringify(over).slice(0, 80)).toBe(400);
      expect(bucket.objects.size).toBe(0);
    }
    const { deps, env } = setup();
    expect((await handleRequest(post("{not json"), env, deps)).status).toBe(
      400,
    );
  });

  it("accepts the exclusion and change-detection header fields", async () => {
    const detect = [
      { q: "Did a box appear?", answer: "yes", correct: true },
      { q: "Did a line move?", answer: "no", correct: false },
    ];
    const { bucket, deps, env } = setup();
    const res = await handleRequest(
      post(
        payload({
          jsonl: jsonl({
            paste: false,
            hiddenMs: 0,
            durationMs: 61234,
            detect,
          }),
        }),
      ),
      env,
      deps,
    );
    expect(res.status).toBe(201);
    expect(bucket.objects.size).toBe(1);
    // An empty detect list and four entries are both fine.
    for (const d of [[], [...detect, ...detect]]) {
      const s = setup();
      const r = await handleRequest(
        post(payload({ jsonl: jsonl({ detect: d }) })),
        s.env,
        s.deps,
      );
      expect(r.status, JSON.stringify(d).slice(0, 40)).toBe(201);
    }
  });

  it("rejects malformed exclusion and change-detection header fields", async () => {
    const ok = { q: "q", answer: "a", correct: true };
    const bad: Record<string, unknown>[] = [
      { paste: "yes" },
      { paste: 1 },
      { hiddenMs: -1 },
      { hiddenMs: 1.5 },
      { hiddenMs: "10" },
      { durationMs: -5 },
      { durationMs: 2.2 },
      { durationMs: null },
      { detect: "yes" },
      { detect: {} },
      { detect: [ok, ok, ok, ok, ok] },
      { detect: [{ q: "q", answer: "a" }] },
      { detect: [{ q: 1, answer: "a", correct: true }] },
      { detect: [{ q: "q", answer: 2, correct: true }] },
      { detect: [{ q: "q", answer: "a", correct: "true" }] },
      { detect: [{ ...ok, extra: "x" }] },
      { detect: [null] },
      { detect: ["q"] },
      { detect: [[ok]] },
    ];
    for (const extra of bad) {
      const { bucket, deps, env } = setup();
      const res = await handleRequest(
        post(payload({ jsonl: jsonl(extra) })),
        env,
        deps,
      );
      expect(res.status, JSON.stringify(extra).slice(0, 80)).toBe(400);
      expect(bucket.objects.size).toBe(0);
    }
  });

  it("rejects oversize bodies", async () => {
    const { bucket, deps, env } = setup();
    const row = JSON.stringify({
      t: 500,
      pos: 0,
      del: 0,
      ins: "x".repeat(1000),
    });
    const big = jsonl() + (row + "\n").repeat(Math.ceil(MAX_BYTES / 1000));
    const res = await handleRequest(post(payload({ jsonl: big })), env, deps);
    expect(res.status).toBe(413);
    expect(bucket.objects.size).toBe(0);
  });

  it("rejects the wrong origin and sets no CORS header", async () => {
    const { bucket, calls, deps, env } = setup();
    const res = await handleRequest(
      post(payload(), { origin: "https://evil.test" }),
      env,
      deps,
    );
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(bucket.objects.size).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it("answers OPTIONS preflight only for the allowed origin", async () => {
    const { deps, env } = setup();
    const ok = await handleRequest(
      req("/collect", "OPTIONS", { origin: ORIGIN }),
      env,
      deps,
    );
    expect(ok.status).toBe(204);
    expect(ok.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(ok.headers.get("access-control-allow-methods")).toContain("POST");
    const no = await handleRequest(
      req("/collect", "OPTIONS", { origin: "https://evil.test" }),
      env,
      deps,
    );
    expect(no.status).toBe(403);
    expect(no.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("returns 404 for every other route and method, with no read endpoint", async () => {
    const { deps, env } = setup();
    const cases: [string, string][] = [
      ["GET", "/"],
      ["GET", "/collect"],
      ["GET", `/recordings/2026-11-24/${SESSION}/t1.jsonl`],
      ["POST", "/"],
      ["PUT", "/collect"],
      ["DELETE", "/collect"],
    ];
    for (const [method, path] of cases) {
      const res = await handleRequest(
        req(path, method, { origin: ORIGIN }),
        env,
        deps,
      );
      expect(res.status, `${method} ${path}`).toBe(404);
    }
  });

  it("does not overwrite an existing recording", async () => {
    const { bucket, deps, env } = setup();
    expect((await handleRequest(post(payload()), env, deps)).status).toBe(201);
    const res = await handleRequest(post(payload()), env, deps);
    expect(res.status).toBe(409);
    expect(bucket.objects.size).toBe(1);
  });

  it("never lets an IP, user agent, header or cookie reach storage", async () => {
    const { bucket, deps, env } = setup();
    await handleRequest(post(payload()), env, deps);
    const dump = JSON.stringify([...bucket.objects.entries()]);
    for (const secret of [
      "203.0.113.9",
      "SECRET-UA",
      "Mozilla",
      "a=b",
      "cookie",
    ]) {
      expect(dump).not.toContain(secret);
    }
    const [obj] = [...bucket.objects.values()];
    expect(Object.keys(obj.customMetadata ?? {}).sort()).toEqual([
      "arm",
      "device",
      "order",
    ]);
  });
});
