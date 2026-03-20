import { describe, it, expect } from "bun:test";
import { scoreGeometry } from "./geometry-scorer";
import type { GeometryFixture } from "./geometry-fixture";
import * as fs from "fs";
import * as path from "path";

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__");
const BASELINES_PATH = path.join(FIXTURES_DIR, "baselines.json");

function loadFixtures(): GeometryFixture[] {
  const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith(".json") && f !== "baselines.json");
  return files.map(f => JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf-8")));
}

function loadBaselines(): Record<string, number> {
  if (!fs.existsSync(BASELINES_PATH)) return {};
  return JSON.parse(fs.readFileSync(BASELINES_PATH, "utf-8"));
}

describe("Geometry Scoring — All Fixtures", () => {
  const fixtures = loadFixtures();
  const baselines = loadBaselines();

  it("has at least one fixture loaded", () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  for (const fixture of fixtures) {
    it(`${fixture.case}: score >= baseline`, () => {
      const result = scoreGeometry(fixture);
      const baseline = baselines[fixture.case] || 0;
      console.log(`[GEOM] ${fixture.case}: ${result.score}% (${result.matched}/${result.total}) baseline=${baseline}%`);
      if (result.mismatches.length > 0) {
        console.log(`  By type: ${Object.entries(result.byType).map(([t, s]) => `${t}:${s.matched}/${s.total}`).join(", ")}`);
        console.log(`  All mismatches:`);
        for (const m of result.mismatches) {
          const sign = m.actual > m.expected ? "+" : "-";
          console.log(`    ${m.elementType}.${m.label}.${m.property}: expected=${m.expected} actual=${m.actual} (${sign}${m.delta}px)`);
        }
      }
      expect(result.score).toBeGreaterThanOrEqual(baseline);
    });
  }

  it("aggregate average", () => {
    const scores = fixtures.map(f => scoreGeometry(f).score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`\n[GEOM] ===== Average: ${Math.round(avg * 10) / 10}% across ${scores.length} cases =====`);
    expect(avg).toBeGreaterThanOrEqual(0);
  });
});
