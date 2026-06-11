/**
 * Rendering performance benchmark. NOT part of CI (`bun run test` only runs
 * src/ and test/unit). Run explicitly with:
 *
 *   bun test scripts/benchmark/render-benchmark.spec.tsx
 *
 * Measures two layers on a large generated diagram, simulating a user editing
 * code (each iteration uses a distinct code string so string-level memoization
 * cannot short-circuit the work):
 *   A. parse + layout pipeline (RootContext + Coordinates + VerticalCoordinates)
 *   B. full React render of SeqDiagram via the jotai store
 */
import { test } from "bun:test";
import { act } from "react";
import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";
import { codeAtom } from "@/store/Store";
import { SeqDiagram } from "@/components/DiagramFrame/SeqDiagram/SeqDiagram";

function genCode(seed: number): string {
  const lines: string[] = [];
  lines.push(`title Benchmark run ${seed}`);
  lines.push("@Actor Customer");
  lines.push("@Boundary WebApp");
  lines.push("@EC2 OrderService");
  lines.push("@Database OrderDb");
  lines.push("participant PaymentService");
  lines.push("participant InventoryService");
  lines.push("participant ShippingService");
  lines.push("participant NotificationService");
  for (let i = 0; i < 10; i++) {
    lines.push(`// browse round ${i} (${seed})
Customer->WebApp.browseProducts${i}_${seed}() {
  WebApp->OrderService.search("query ${i}") {
    OrderService->OrderDb.query("products ${i}")
    OrderDb->OrderService: rows ${i}
    if (cached${i}) {
      OrderService->OrderService.readCache()
    } else {
      OrderService->OrderDb.refreshCache${i}()
      while (stale) {
        OrderService->OrderDb.retry${i}()
        OrderDb->OrderService: page
      }
    }
    return results${i}
  }
}`);
    lines.push(`Customer->WebApp.checkout${i}_${seed}() {
  WebApp->OrderService.placeOrder(order${i}) {
    par {
      OrderService->InventoryService.reserve${i}()
      OrderService->PaymentService.charge${i}() {
        try {
          PaymentService->PaymentService.validateCard()
          return receipt${i}
        } catch {
          return declined${i}
        }
      }
    }
    opt {
      OrderService->ShippingService.schedule${i}()
      ShippingService->NotificationService: notify shipment ${i}
    }
  }
  WebApp->Customer: confirmation ${i}
}`);
  }
  return lines.join("\n");
}

function stats(samples: number[]) {
  const sorted = [...samples].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { median, mean, min: sorted[0], max: sorted[sorted.length - 1] };
}

function report(label: string, samples: number[]) {
  const { median, mean, min, max } = stats(samples);
  console.log(
    `[bench] ${label}: median=${median.toFixed(1)}ms mean=${mean.toFixed(1)}ms min=${min.toFixed(1)}ms max=${max.toFixed(1)}ms (n=${samples.length})`,
  );
}

const WARMUP = 3;
const ITERATIONS = 15;

test("A. parse + layout pipeline", () => {
  const codes = Array.from({ length: WARMUP + ITERATIONS }, (_, i) =>
    genCode(i),
  );
  const samples: number[] = [];
  codes.forEach((code, i) => {
    const t0 = performance.now();
    const ctx = RootContext(code);
    const coordinates = new Coordinates(ctx, WidthProviderOnCanvas);
    coordinates.getWidth();
    new VerticalCoordinates(ctx).getTotalHeight();
    const dt = performance.now() - t0;
    if (i >= WARMUP) samples.push(dt);
  });
  report("parse+layout", samples);
}, 120000);

test("B. full React render via store", () => {
  const codes = Array.from({ length: WARMUP + ITERATIONS }, (_, i) =>
    genCode(1000 + i),
  );
  const store = createStore();
  act(() => {
    store.set(codeAtom, genCode(999999));
  });
  const { unmount } = render(
    <Provider store={store}>
      <SeqDiagram />
    </Provider>,
  );

  const samples: number[] = [];
  codes.forEach((code, i) => {
    const t0 = performance.now();
    act(() => {
      store.set(codeAtom, code);
    });
    const dt = performance.now() - t0;
    if (i >= WARMUP) samples.push(dt);
  });
  report("react-render", samples);
  unmount();
}, 240000);
