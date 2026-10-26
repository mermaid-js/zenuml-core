import { describe, expect, it } from "vitest";
import type { ParticipantGeometry } from "../geometry";
import { buildThemeStyles, resolvePalette } from "../themes";
import { renderParticipant } from "./participant";

const participant: ParticipantGeometry = {
  name: "Alice",
  label: "Alice",
  x: 100,
  y: 20,
  width: 80,
  height: 40,
  isStarter: false,
};

const box = (svg: string) => {
  const rect = svg.match(
    /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" rx="([^"]+)" class="participant-box"/,
  );
  expect(rect).not.toBeNull();
  return rect!.slice(1).map(Number);
};

describe("participant box paint geometry", () => {
  it("uses a 1px stroke at the same outer bounds for regular and starter boxes", () => {
    const strokeWidth = Number(
      buildThemeStyles(resolvePalette()).match(
        /\.participant-box \{[^}]*stroke-width: ([\d.]+);/,
      )?.[1],
    );
    expect(strokeWidth).toBe(1);

    for (const svg of [
      renderParticipant(participant),
      renderParticipant({ ...participant, isStarter: true }),
    ]) {
      const [x, y, width, height] = box(svg);
      expect([x - strokeWidth / 2, y - strokeWidth / 2]).toEqual([
        60,
        participant.y,
      ]);
      expect([
        x + width + strokeWidth / 2,
        y + height + strokeWidth / 2,
      ]).toEqual([140, participant.y + 40]);
    }
  });
});
