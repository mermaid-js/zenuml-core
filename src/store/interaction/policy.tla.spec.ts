import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CAPABILITIES, INTERACTION_KINDS, POLICY } from "./policy";

// docs/tla/InteractionPolicy.tla models ADR 0002 with its own copy of the
// capability table. Keep the two equal so the model checks the policy the
// code runs, not an older one.

const TLA = path.resolve(__dirname, "../../../docs/tla/InteractionPolicy.tla");

const parseSet = (text: string): string[] =>
  [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const readModel = () => {
  const source = fs.readFileSync(TLA, "utf8");
  const between = (start: string, end: string) => {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from);
    if (from < 0 || to < 0) throw new Error(`${start} not found in ${TLA}`);
    return source.slice(from, to);
  };
  const caps = parseSet(between("Caps ==", "}"));
  const states = parseSet(between("States ==", "}"));
  const block = between("Policy == [", "\\* END POLICY");
  const policy: Record<string, string[]> = {};
  for (const [, kind, value] of block.matchAll(
    /(\w+)\s*\|->\s*(Caps|\{[^}]*\})/g,
  ))
    policy[kind] = value === "Caps" ? caps : parseSet(value);
  return { caps, states, policy };
};

const allowed = (row: Record<string, boolean>) =>
  Object.entries(row)
    .filter(([, on]) => on)
    .map(([cap]) => cap)
    .sort();

describe("TLA+ model matches policy.ts", () => {
  const model = readModel();

  it("lists the same capabilities and states", () => {
    expect([...model.caps].sort()).toEqual([...CAPABILITIES].sort());
    expect([...model.states].sort()).toEqual([...INTERACTION_KINDS].sort());
  });

  it.each(INTERACTION_KINDS)("allows the same capabilities in %s", (kind) => {
    expect([...(model.policy[kind] ?? [])].sort()).toEqual(
      allowed(POLICY[kind]),
    );
  });
});
