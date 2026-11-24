/**
 * Settings of the public trial page. The defaults suit a local run: the
 * collector from `bunx wrangler dev -c wrangler.trial.toml --local`, and
 * Cloudflare's published always-pass Turnstile test site key. Before launch,
 * set the real endpoint and site key here; the Clarity project id stays empty
 * until one exists, and while it is empty Clarity never loads.
 */
export const DEFAULT_ENDPOINT = "http://localhost:8787/collect";

/** Cloudflare's test key: invisible, always passes. Works on any host. */
export const TEST_TURNSTILE_SITE_KEY = "1x00000000000000000000BB";

export const CLARITY_PROJECT_ID = "";

export interface TrialConfig {
  endpoint: string;
  siteKey: string;
  clarityId: string;
  /**
   * When each change-detection question is asked, as the share of the copy
   * task text typed so far. Two values, increasing.
   */
  probeAt: [number, number] | null;
}

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * `?endpoint=` and `?probe=0.2,0.5` change the endpoint and the question
 * timing. They work on a loopback host only, so a link cannot redirect a
 * participant's recording or the trial's timing.
 */
export function readConfig(loc: {
  hostname: string;
  search: string;
}): TrialConfig {
  const config: TrialConfig = {
    endpoint: DEFAULT_ENDPOINT,
    siteKey: TEST_TURNSTILE_SITE_KEY,
    clarityId: CLARITY_PROJECT_ID,
    probeAt: null,
  };
  if (!LOOPBACK.has(loc.hostname)) return config;
  const q = new URLSearchParams(loc.search);
  const endpoint = q.get("endpoint");
  if (endpoint) config.endpoint = endpoint;
  const probe = q.get("probe")?.split(",").map(Number);
  if (
    probe?.length === 2 &&
    probe.every((p) => p > 0 && p <= 1) &&
    probe[0] < probe[1]
  )
    config.probeAt = [probe[0], probe[1]];
  return config;
}
