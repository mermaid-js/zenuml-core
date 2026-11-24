import { describe, expect, it } from "vitest";
import { createSender, type SendPayload } from "./trial-send";

const payload: SendPayload = {
  sessionId: "k3J9xQ2mZpT7vLw4Nb8Rc1",
  taskId: "t1",
  arm: "A",
  order: "ABC",
  device: "desktop",
  consent: true,
  jsonl: '{"start":""}\n{"t":1,"pos":0,"del":0,"ins":"a"}\n',
};

function setup(responses: (Response | Error)[]) {
  const log: string[] = [];
  const bodies: Record<string, unknown>[] = [];
  let n = 0;
  const sender = createSender({
    endpoint: "http://localhost:8787/collect",
    tokens: {
      get: async () => {
        log.push("token");
        return `tok${++n}`;
      },
      reset: () => log.push("reset"),
    },
    fetch: (async (_url: string, init: RequestInit) => {
      log.push("post");
      bodies.push(JSON.parse(String(init.body)));
      const r = responses.shift()!;
      if (r instanceof Error) throw r;
      return r;
    }) as unknown as typeof fetch,
  });
  return { sender, log, bodies };
}

describe("createSender", () => {
  it("gets a fresh token for every post and resets the widget after each", async () => {
    const { sender, log, bodies } = setup([
      new Response("{}", { status: 201 }),
      new Response("{}", { status: 201 }),
    ]);
    expect((await sender.send(payload)).ok).toBe(true);
    expect((await sender.send({ ...payload, taskId: "t2" })).ok).toBe(true);
    expect(log).toEqual(["token", "post", "reset", "token", "post", "reset"]);
    expect(bodies.map((b) => b.turnstileToken)).toEqual(["tok1", "tok2"]);
    expect(bodies[0]).toMatchObject({ consent: true, taskId: "t1" });
  });

  it("serialises sends so two tokens are never in flight", async () => {
    const { sender, log } = setup([
      new Response("{}", { status: 201 }),
      new Response("{}", { status: 201 }),
    ]);
    await Promise.all([sender.send(payload), sender.send(payload)]);
    expect(log).toEqual(["token", "post", "reset", "token", "post", "reset"]);
  });

  it("treats 409 (already recorded) as sent", async () => {
    const { sender } = setup([new Response("{}", { status: 409 })]);
    expect((await sender.send(payload)).ok).toBe(true);
  });

  it("reports a rejected post with its status and still resets", async () => {
    const { sender, log } = setup([
      new Response('{"error":"turnstile check failed"}', { status: 403 }),
    ]);
    const r = await sender.send(payload);
    expect(r).toEqual({ ok: false, message: "turnstile check failed (403)" });
    expect(log.at(-1)).toBe("reset");
  });

  it("reports a network error as a failure, not a throw", async () => {
    const { sender } = setup([new TypeError("Failed to fetch")]);
    const r = await sender.send(payload);
    expect(r.ok).toBe(false);
  });

  it("reports a token failure as a failure and does not post", async () => {
    const log: string[] = [];
    const sender = createSender({
      endpoint: "http://localhost:8787/collect",
      tokens: {
        get: async () => {
          throw new Error("no token");
        },
        reset: () => log.push("reset"),
      },
      fetch: (async () => {
        log.push("post");
        return new Response("{}", { status: 201 });
      }) as unknown as typeof fetch,
    });
    expect((await sender.send(payload)).ok).toBe(false);
    expect(log).toEqual(["reset"]);
  });
});
