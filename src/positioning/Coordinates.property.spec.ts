import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import { ARROW_HEAD_WIDTH, OCCURRENCE_WIDTH } from "@/positioning/Constants";
import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "../../test/unit/parser/fixture/Fixture";
import { clearCache } from "@/utils/RenderingCache";

// Layout invariants of the positioning engine, checked over generated
// diagrams instead of hand-picked cases. Each invariant is one a past bug
// broke: #655 was a participant box wider than its slot, so neighbouring
// boxes overlapped. A slot is `half(name)` either side of the lifeline and
// already includes the margin, so "slots do not overlap" means "boxes keep
// their gap".
//
// The stub width provider measures the digits after a text's first
// character, so `A120` is 120px wide, `<<300x>>` is 300px and the message
// text `m80` is 80px.

const LETTERS = "ABCDEFGH";

type ParticipantSpec = {
  width: number;
  stereotype: number | null;
  icon: boolean;
  emoji: boolean;
};

const participantArb: fc.Arbitrary<ParticipantSpec> = fc.record({
  width: fc.integer({ min: 0, max: 400 }),
  stereotype: fc.option(fc.integer({ min: 0, max: 400 }), { nil: null }),
  icon: fc.boolean(),
  emoji: fc.boolean(),
});

const diagramArb = fc
  .array(participantArb, { minLength: 1, maxLength: LETTERS.length })
  .chain((participants) =>
    fc.record({
      participants: fc.constant(participants),
      messages: fc.array(
        fc.record({
          from: fc.nat(participants.length - 1),
          to: fc.nat(participants.length - 1),
          width: fc.integer({ min: 0, max: 600 }),
        }),
        { maxLength: 8 },
      ),
    }),
  );

type Diagram = typeof diagramArb extends fc.Arbitrary<infer T> ? T : never;

const nameOf = (i: number, p: ParticipantSpec) => `${LETTERS[i]}${p.width}`;

const toDsl = ({ participants, messages }: Diagram) => {
  const head = participants.map((p, i) =>
    [
      p.icon ? "@Actor" : "",
      p.stereotype === null ? "" : `<<${p.stereotype}x>>`,
      p.emoji ? "[lock]" : "",
      nameOf(i, p),
    ]
      .filter(Boolean)
      .join(" "),
  );
  const body = messages
    .filter((m) => m.from !== m.to)
    .map(
      (m) =>
        `${nameOf(m.from, participants[m.from])}->${nameOf(m.to, participants[m.to])}: m${m.width}`,
    );
  return [...head, ...body].join("\n");
};

const layout = (diagram: Diagram) => {
  clearCache();
  const code = toDsl(diagram);
  const coordinates = new Coordinates(RootContext(code), stubWidthProvider);
  // The engine also places the implicit starter; check the declared ones.
  const names = diagram.participants.map((p, i) => nameOf(i, p));
  return { code, coordinates, names };
};

const RUNS = { numRuns: 300 };

describe("Coordinates layout invariants (property-based)", () => {
  it("keeps declared participants in order with non-overlapping slots", () => {
    fc.assert(
      fc.property(diagramArb, (diagram) => {
        const { coordinates, names } = layout(diagram);
        for (let i = 1; i < names.length; i++) {
          const gap =
            coordinates.left(names[i]) - coordinates.right(names[i - 1]);
          // Sub-pixel tolerance: the solver works in floats.
          expect(gap).toBeGreaterThanOrEqual(-1e-6);
        }
      }),
      RUNS,
    );
  });

  it("reserves at least the stereotype's width for every participant", () => {
    fc.assert(
      fc.property(diagramArb, (diagram) => {
        const { coordinates, names } = layout(diagram);
        diagram.participants.forEach((p, i) => {
          const slot = coordinates.half(names[i]) * 2;
          expect(slot).toBeGreaterThanOrEqual(p.width);
          if (p.stereotype !== null)
            expect(slot).toBeGreaterThanOrEqual(p.stereotype);
        });
      }),
      RUNS,
    );
  });

  it("keeps every slot inside the diagram width", () => {
    fc.assert(
      fc.property(diagramArb, (diagram) => {
        const { coordinates, names } = layout(diagram);
        const width = coordinates.getWidth();
        for (const name of names) {
          expect(coordinates.left(name)).toBeGreaterThanOrEqual(-1e-6);
          expect(coordinates.right(name)).toBeLessThanOrEqual(width + 1e-6);
        }
      }),
      RUNS,
    );
  });

  it("leaves room for every message between its two lifelines", () => {
    fc.assert(
      fc.property(diagramArb, (diagram) => {
        const { coordinates, names } = layout(diagram);
        for (const m of diagram.messages) {
          if (m.from === m.to) continue;
          const distance = Math.abs(
            coordinates.distance(names[m.from], names[m.to]),
          );
          expect(distance).toBeGreaterThanOrEqual(
            m.width + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH - 1e-6,
          );
        }
      }),
      RUNS,
    );
  });
});
