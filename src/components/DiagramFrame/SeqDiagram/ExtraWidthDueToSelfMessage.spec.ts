import { TotalWidth} from "./ExtraWidthDueToSelfMessage";
import {Fixture} from "../../../../test/unit/parser/fixture/Fixture";
vi.mock("@/positioning/WidthProviderFunc", () => {
  return {
    default: (text: string) => {
      const number = parseInt(text.trim().substring(1) || '0');
      return isNaN(number) ? 0 : number;
    }
  }
});

describe('TotalWidth', function () {
  test('TotalWidth', () => {
    const ctx = Fixture.firstStatement('A.method');
    expect(TotalWidth(ctx, 'A', 'A', () => 0))
      .toBe(80);
  })

  test('TotalWidth with depth', () => {
    const ctx = Fixture.rootContext('if(x) {A.method}');
    expect(TotalWidth(ctx, 'A', 'A', () => 0))
      .toBe(100);
  })

  test('TotalWidth with distance', () => {
    const ctx = Fixture.rootContext('if(x) {A.method; B.method}');
    expect(TotalWidth(ctx, 'A', 'B', () => 20))
      .toBe(120);
  })

  test('TotalWidth with extra width from self message', () => {
    const ctx = Fixture.rootContext('if(x) {A.method; B.method { s100 }}');
    expect(TotalWidth(ctx, 'A', 'B', () => 20))
      .toBe(220);
  })
});
