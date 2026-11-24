/**
 * Collector for the public typing trial (ADR 0009, gates G5 and G6).
 *
 * One route: `POST /collect`. It checks consent, a Turnstile token and the
 * recording schema, then stores the JSONL in R2. There is no read endpoint.
 * The handler never reads or stores the IP address, user agent, headers or
 * cookies of the request.
 */

/** The part of an R2 bucket this Worker uses. */
export interface RecordingsBucket {
  head(key: string): Promise<unknown | null>;
  put(
    key: string,
    value: string,
    options?: {
      customMetadata?: Record<string, string>;
      httpMetadata?: { contentType?: string };
    },
  ): Promise<unknown>;
}

export interface CollectorEnv {
  RECORDINGS: RecordingsBucket;
  ALLOWED_ORIGIN: string;
  TURNSTILE_SECRET: string;
}

export interface CollectorDeps {
  fetch: typeof fetch;
  now: () => Date;
}

/** The part of a Request this Worker reads. */
export type CollectorRequest = Pick<
  Request,
  "url" | "method" | "headers" | "text"
>;

export const MAX_BYTES = 512 * 1024;
export const TURNSTILE_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const TASK_IDS = ["warmup", "t1", "t2", "t3"];
const ARMS = ["A", "B", "C"];
const DEVICES = ["desktop", "touch"];
const SESSION_ID = /^[A-Za-z0-9_-]{16,64}$/;
const HEADER_KEYS = [
  "start",
  "task",
  "arm",
  "participant",
  "editor",
  "paste",
  "hiddenMs",
  "durationMs",
  "detect",
];
const DETECT_KEYS = ["answer", "correct", "q"];
const MAX_DETECT = 4;
const ROW_KEYS = ["del", "ins", "pos", "t"];

const defaultDeps: CollectorDeps = {
  fetch: (input, init) => fetch(input, init),
  now: () => new Date(),
};

const text = (status: number, message: string, cors: Record<string, string>) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNonNegInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0;

const byteLength = (s: string) => new TextEncoder().encode(s).length;

const sameKeys = (o: Record<string, unknown>, allowed: string[]) =>
  Object.keys(o).every((k) => allowed.includes(k));

/** Returns an error message, or null when the JSONL is a valid recording. */
function checkJsonl(jsonl: string, taskId: string, arm: string): string | null {
  const lines = jsonl.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  if (lines.length < 2) return "jsonl needs a header and at least one event";
  let header: unknown;
  try {
    header = JSON.parse(lines[0]);
  } catch {
    return "jsonl header is not JSON";
  }
  if (!isObject(header) || typeof header.start !== "string")
    return "jsonl header needs a string start";
  if (!sameKeys(header, HEADER_KEYS)) return "jsonl header has unknown keys";
  if (header.task !== undefined && header.task !== taskId)
    return "jsonl header task does not match taskId";
  if (header.arm !== undefined && header.arm !== arm)
    return "jsonl header arm does not match arm";
  if (header.participant !== undefined && !isNonNegInt(header.participant))
    return "jsonl header participant must be a non-negative integer";
  if (header.editor !== undefined && typeof header.editor !== "string")
    return "jsonl header editor must be a string";
  if (header.paste !== undefined && typeof header.paste !== "boolean")
    return "jsonl header paste must be a boolean";
  if (header.hiddenMs !== undefined && !isNonNegInt(header.hiddenMs))
    return "jsonl header hiddenMs must be a non-negative integer";
  if (header.durationMs !== undefined && !isNonNegInt(header.durationMs))
    return "jsonl header durationMs must be a non-negative integer";
  if (header.detect !== undefined) {
    const d = header.detect;
    if (!Array.isArray(d) || d.length > MAX_DETECT)
      return `jsonl header detect must be an array of at most ${MAX_DETECT}`;
    for (const item of d) {
      if (
        !isObject(item) ||
        Object.keys(item).sort().join() !== DETECT_KEYS.join() ||
        typeof item.q !== "string" ||
        typeof item.answer !== "string" ||
        typeof item.correct !== "boolean"
      )
        return "jsonl header detect items need { q, answer, correct }";
    }
  }
  let last = 0;
  for (let i = 1; i < lines.length; i++) {
    let row: unknown;
    try {
      row = JSON.parse(lines[i]);
    } catch {
      return `jsonl line ${i + 1} is not JSON`;
    }
    if (
      !isObject(row) ||
      Object.keys(row).sort().join() !== ROW_KEYS.join() ||
      !isNonNegInt(row.t) ||
      !isNonNegInt(row.pos) ||
      !isNonNegInt(row.del) ||
      typeof row.ins !== "string"
    )
      return `jsonl line ${i + 1} is not a { t, pos, del, ins } event`;
    if (row.t < last) return `jsonl line ${i + 1} goes back in time`;
    last = row.t;
  }
  return null;
}

async function turnstileOk(
  token: string,
  env: CollectorEnv,
  deps: CollectorDeps,
): Promise<boolean> {
  // Only the secret and the token go out. The visitor's IP is not forwarded.
  const form = new URLSearchParams({
    secret: env.TURNSTILE_SECRET,
    response: token,
  });
  try {
    const res = await deps.fetch(TURNSTILE_URL, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: unknown };
    return data.success === true;
  } catch (error) {
    console.error("turnstile verification request failed", String(error));
    return false;
  }
}

export async function handleRequest(
  request: CollectorRequest,
  env: CollectorEnv,
  deps: CollectorDeps = defaultDeps,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/collect") return text(404, "not found", {});
  if (request.method !== "POST" && request.method !== "OPTIONS")
    return text(404, "not found", {});

  const originOk = request.headers.get("origin") === env.ALLOWED_ORIGIN;
  if (!originOk) return text(403, "origin not allowed", {});
  const cors = {
    "access-control-allow-origin": env.ALLOWED_ORIGIN,
    vary: "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
      },
    });
  }

  // The body carries a 512 KB recording plus a small envelope.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + 4096) return text(413, "too large", cors);
  const raw = await request.text();
  if (byteLength(raw) > MAX_BYTES + 4096) return text(413, "too large", cors);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return text(400, "body is not JSON", cors);
  }
  if (!isObject(body)) return text(400, "body must be an object", cors);

  if (body.consent !== true) return text(400, "consent is required", cors);

  const { sessionId, taskId, arm, order, device, turnstileToken, jsonl } = body;
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId))
    return text(400, "invalid sessionId", cors);
  if (typeof taskId !== "string" || !TASK_IDS.includes(taskId))
    return text(400, "invalid taskId", cors);
  if (typeof arm !== "string" || !ARMS.includes(arm))
    return text(400, "invalid arm", cors);
  if (
    typeof order !== "string" ||
    !/^[ABC]{3}$/.test(order) ||
    new Set(order).size !== 3
  )
    return text(400, "invalid order", cors);
  if (typeof device !== "string" || !DEVICES.includes(device))
    return text(400, "invalid device", cors);
  if (typeof turnstileToken !== "string" || !turnstileToken)
    return text(400, "missing turnstileToken", cors);
  if (typeof jsonl !== "string" || !jsonl)
    return text(400, "missing jsonl", cors);
  if (byteLength(jsonl) > MAX_BYTES) return text(413, "too large", cors);
  const problem = checkJsonl(jsonl, taskId, arm);
  if (problem) return text(400, problem, cors);

  if (!(await turnstileOk(turnstileToken, env, deps)))
    return text(403, "turnstile check failed", cors);

  const day = deps.now().toISOString().slice(0, 10);
  const key = `recordings/${day}/${sessionId}/${taskId}.jsonl`;
  if (await env.RECORDINGS.head(key))
    return text(409, "already recorded", cors);
  await env.RECORDINGS.put(key, jsonl, {
    customMetadata: { arm, order, device },
    httpMetadata: { contentType: "application/x-ndjson" },
  });
  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { "content-type": "application/json", ...cors },
  });
}
