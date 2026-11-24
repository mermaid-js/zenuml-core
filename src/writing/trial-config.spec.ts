import { describe, expect, it } from "vitest";
import {
  CLARITY_PROJECT_ID,
  DEFAULT_ENDPOINT,
  readConfig,
  TEST_TURNSTILE_SITE_KEY,
} from "./trial-config";

describe("readConfig", () => {
  it("defaults to the local collector and the Turnstile test key", () => {
    const c = readConfig({ hostname: "localhost", search: "" });
    expect(c.endpoint).toBe(DEFAULT_ENDPOINT);
    expect(DEFAULT_ENDPOINT).toBe("http://localhost:8787/collect");
    expect(c.siteKey).toBe(TEST_TURNSTILE_SITE_KEY);
    expect(c.probeAt).toBeNull();
  });

  it("keeps Clarity off: no project id exists yet", () => {
    expect(CLARITY_PROJECT_ID).toBe("");
    expect(readConfig({ hostname: "localhost", search: "" }).clarityId).toBe(
      "",
    );
  });

  it("lets a loopback host override the endpoint and the question timing", () => {
    const c = readConfig({
      hostname: "127.0.0.1",
      search: "?endpoint=http://127.0.0.1:9000/collect&probe=0.2,0.5",
    });
    expect(c.endpoint).toBe("http://127.0.0.1:9000/collect");
    expect(c.probeAt).toEqual([0.2, 0.5]);
  });

  it("ignores the overrides on any other host", () => {
    const c = readConfig({
      hostname: "core.example.com",
      search: "?endpoint=https://evil.example/collect&probe=0.1,0.2",
    });
    expect(c.endpoint).toBe(DEFAULT_ENDPOINT);
    expect(c.probeAt).toBeNull();
  });

  it("ignores a probe value that is not two increasing shares", () => {
    for (const probe of ["0.5", "0.5,0.2", "0,0.5", "0.2,2", "a,b"]) {
      expect(
        readConfig({ hostname: "localhost", search: `?probe=${probe}` })
          .probeAt,
      ).toBeNull();
    }
  });
});
