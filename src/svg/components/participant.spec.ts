import { describe, expect, it } from "vitest";
import type { ParticipantGeometry } from "../geometry";
import { buildThemeStyles, resolvePalette } from "../themes";
import { renderParticipant, renderParticipantBottom } from "./participant";

const participant: ParticipantGeometry = {
  name: "Alice",
  label: "Alice",
  x: 100,
  y: 20,
  width: 80,
  height: 40,
  isStarter: false,
  showBottom: true,
};

const box = (svg: string) => {
  const rect = svg.match(
    /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" rx="([^"]+)" class="participant-box"/,
  );
  expect(rect).not.toBeNull();
  return rect!.slice(1).map(Number);
};

describe("participant box paint geometry", () => {
  it("uses a 1px stroke at the same outer bounds for top, bottom, and starter boxes", () => {
    const strokeWidth = Number(
      buildThemeStyles(resolvePalette()).match(
        /\.participant-box \{[^}]*stroke-width: ([\d.]+);/,
      )?.[1],
    );
    expect(strokeWidth).toBe(1);

    for (const svg of [
      renderParticipant(participant),
      renderParticipantBottom(participant, 120),
      renderParticipant({ ...participant, isStarter: true }),
    ]) {
      const [x, y, width, height] = box(svg);
      const expectedTop = svg.includes("participant-bottom")
        ? 120
        : participant.y;
      expect([x - strokeWidth / 2, y - strokeWidth / 2]).toEqual([
        60,
        expectedTop,
      ]);
      expect([
        x + width + strokeWidth / 2,
        y + height + strokeWidth / 2,
      ]).toEqual([140, expectedTop + 40]);
    }
  });
});

describe("explicit participant background contrast", () => {
  it.each([
    { color: "#112233", text: "#fff" },
    { color: "FFEEDD", text: "#000" },
  ])(
    "uses $text on $color for top and bottom labels, stereotype, and a monochrome icon",
    ({ color, text }) => {
      const p = { ...participant, color, type: "actor", stereotype: "service" };
      const top = renderParticipant(p);
      const bottom = renderParticipantBottom(p, 120);
      const normalizedColor = color.startsWith("#") ? color : `#${color}`;

      for (const svg of [top, bottom]) {
        expect(svg).toContain(
          `class="participant-box" style="fill:${normalizedColor};"`,
        );
        expect(svg).toMatch(
          new RegExp(`class="participant-label"[^>]*style="fill:${text};"`),
        );
      }
      expect(top).toMatch(
        new RegExp(`class="stereotype-label"[^>]*style="fill:${text};"`),
      );
      expect(top).toMatch(
        new RegExp(`class="participant-icon"[^>]*style="color:${text};"`),
      );
      expect(top).toContain('stroke="currentColor"');
    },
  );

  it("retains theme styling without an explicit color", () => {
    const svg = renderParticipant({
      ...participant,
      type: "actor",
      stereotype: "service",
    });
    expect(svg).not.toMatch(/class="participant-label"[^>]*style=/);
    expect(svg).not.toMatch(/class="stereotype-label"[^>]*style=/);
    expect(svg).not.toMatch(/class="participant-icon"[^>]*style=/);
  });

  it("keeps fixed brand icon colors on a dark participant", () => {
    const svg = renderParticipant({
      ...participant,
      color: "#112233",
      type: "ec2",
    });
    expect(svg).toMatch(/class="participant-icon"[^>]*style="color:#fff;"/);
    expect(svg).toContain('fill="#ED7100"');
  });
});
