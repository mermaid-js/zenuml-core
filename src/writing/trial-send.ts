/**
 * Sends one recording to the collector Worker (`workers/writing-trial`). Every
 * POST carries its own Turnstile token: a token works once, so the widget is
 * reset after each send and the next send asks for a new one.
 */

export interface SendPayload {
  sessionId: string;
  taskId: "warmup" | "t1" | "t2" | "t3";
  arm: "A" | "B" | "C";
  order: string;
  device: "desktop" | "touch";
  consent: true;
  jsonl: string;
}

export interface SendResult {
  ok: boolean;
  message?: string;
}

export interface TokenSource {
  /** Resolves with a fresh, unused token. */
  get(): Promise<string>;
  /** Discards the used token and readies the widget for the next one. */
  reset(): void;
}

export function createSender(options: {
  endpoint: string;
  tokens: TokenSource;
  fetch?: typeof fetch;
}) {
  const doFetch = options.fetch ?? ((i, init) => fetch(i, init));
  let queue: Promise<unknown> = Promise.resolve();

  async function sendOne(payload: SendPayload): Promise<SendResult> {
    try {
      const turnstileToken = await options.tokens.get();
      const res = await doFetch(options.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, turnstileToken }),
      });
      // 409: the collector already holds this recording (a retry after a lost reply).
      if (res.ok || res.status === 409) return { ok: true };
      let detail = "";
      try {
        detail = ((await res.json()) as { error?: string }).error ?? "";
      } catch {
        // The body is only a hint.
      }
      return { ok: false, message: `${detail || "rejected"} (${res.status})` };
    } catch (error) {
      return { ok: false, message: String(error) };
    } finally {
      options.tokens.reset();
    }
  }

  return {
    /** Sends run one at a time, so two tokens are never in flight. */
    send(payload: SendPayload): Promise<SendResult> {
      const run = queue.then(() => sendOne(payload));
      queue = run.catch(() => undefined);
      return run;
    },
  };
}

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: Record<string, unknown>,
  ): string | undefined;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
}

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstile(): Promise<TurnstileApi> {
  const w = window as unknown as { turnstile?: TurnstileApi };
  // An element with id="turnstile" would shadow the global: check for render().
  const ready = () => typeof w.turnstile?.render === "function";
  if (ready()) return Promise.resolve(w.turnstile!);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.onload = () =>
      ready()
        ? resolve(w.turnstile!)
        : reject(new Error("Turnstile did not start"));
    s.onerror = () => reject(new Error("Turnstile script did not load"));
    document.head.appendChild(s);
  });
}

/**
 * A Turnstile widget that runs only when a token is asked for. Use
 * Cloudflare's published test site key for local runs.
 */
export function turnstileTokens(
  container: HTMLElement,
  siteKey: string,
  timeoutMs = 30000,
): TokenSource {
  let widget: Promise<{ api: TurnstileApi; id: string }> | null = null;
  let waiting: {
    resolve: (t: string) => void;
    reject: (e: Error) => void;
  } | null = null;

  const ensure = () =>
    (widget ??= loadTurnstile().then((api) => {
      const id = api.render(container, {
        sitekey: siteKey,
        execution: "execute",
        appearance: "interaction-only",
        callback: (token: string) => waiting?.resolve(token),
        "error-callback": (code: unknown) =>
          waiting?.reject(new Error(`Turnstile error ${String(code)}`)),
        "expired-callback": () =>
          waiting?.reject(new Error("Turnstile token expired")),
      });
      if (!id) throw new Error("Turnstile widget did not render");
      return { api, id };
    }));

  return {
    async get() {
      const { api, id } = await ensure();
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Turnstile timed out")),
          timeoutMs,
        );
        waiting = {
          resolve: (t) => {
            clearTimeout(timer);
            resolve(t);
          },
          reject: (e) => {
            clearTimeout(timer);
            reject(e);
          },
        };
        api.execute(id);
      });
    },
    reset() {
      waiting = null;
      if (!widget) return;
      void widget.then(({ api, id }) => api.reset(id)).catch(() => undefined);
    },
  };
}
