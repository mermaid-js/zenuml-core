import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";
import { buildGeometry } from "./buildGeometry";

function getGeometry(code: string) {
  const rootContext = RootContext(code)!;
  const coordinates = new Coordinates(rootContext, WidthProviderOnCanvas);
  const verticalCoordinates = new VerticalCoordinates(rootContext);
  return buildGeometry({
    rootContext,
    coordinates,
    verticalCoordinates,
    title: undefined,
    measureText: WidthProviderOnCanvas,
  });
}

function getReturns(code: string) {
  const geometry = getGeometry(code);
  return geometry.returns;
}

describe("buildGeometry returns", () => {
  it("return-only-two: ret1 arrow should be 1px higher than current", () => {
    const code = `A B
A->B.method() {
  return ret1
  @return B->A: ret2
}`;
    const returns = getReturns(code);
    const ret1 = returns.find(r => r.label === "ret1")!;
    const ret2 = returns.find(r => r.label === "ret2")!;
    console.log(`ret1.y=${ret1.y} ret2.y=${ret2.y} gap=${ret2.y - ret1.y}`);

    // HTML: ret1=119, ret2=152 → gap=33; SVG now matches HTML exactly
    // (first return has engine height>0, no debt needed; second return has
    // height=0, gets debt=16 but at processing time totalDebt=0 so adjust=0)
    expect(ret2.y - ret1.y).toBe(33);
  });

  it("single return inside sync block also needs -1 correction", () => {
    const code = `A B
A->B.method() {
  return result
}`;
    const returns = getReturns(code);
    expect(returns).toHaveLength(1);
    const ret = returns[0];
    console.log(`single return: y=${ret.y}`);
    // The Y should be coord.top + 15 (not +16) for first return in block
  });

  it("root-level return should NOT get -1 correction", () => {
    const code = `A B
A->B.method()
@return B->A: result`;
    const returns = getReturns(code);
    expect(returns).toHaveLength(1);
    const ret = returns[0];
    console.log(`root-level return: y=${ret.y}`);
  });

  it("keeps cumulative numbering across alt and tcf sections", () => {
    const code = `if(cond) {
  A -> B: msg1
  try {
    B -> C: tryMsg
  } catch(e) {
    C -> B: catchMsg
  } finally {
    B -> A: finallyMsg
  }
} else if(cond2) {
  A -> B: elseIfMsg
} else {
  A -> B: elseMsg
}`;
    const geometry = getGeometry(code);
    const messageNumbers = Object.fromEntries(geometry.messages.map((m) => [m.label, m.number]));

    expect(messageNumbers.msg1).toBe("1.1");
    expect(messageNumbers.tryMsg).toBe("1.2.1");
    expect(messageNumbers.catchMsg).toBe("1.2.2");
    expect(messageNumbers.finallyMsg).toBe("1.2.3");
    expect(messageNumbers.elseIfMsg).toBe("1.3");
    expect(messageNumbers.elseMsg).toBe("1.4");
  });
});
