import { describe, expect, test } from "bun:test";
import { createWorkerTransport } from "./transport";

type Listener = (event: { data: unknown }) => void;

function fakeWorker() {
  const listeners = new Set<Listener>();
  const posted: unknown[] = [];
  return {
    posted,
    listeners,
    postMessage: (message: unknown) => void posted.push(message),
    addEventListener: (_type: "message", l: Listener) => void listeners.add(l),
    removeEventListener: (_type: "message", l: Listener) =>
      void listeners.delete(l),
    emit: (data: unknown) => listeners.forEach((l) => l({ data })),
  };
}

describe("createWorkerTransport", () => {
  test("send parses the JSON string and posts the message object", () => {
    const worker = fakeWorker();
    const transport = createWorkerTransport(worker);
    transport.send(
      JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }),
    );
    expect(worker.posted).toEqual([
      { jsonrpc: "2.0", id: 1, method: "initialize" },
    ]);
  });

  test("send throws on text that is not JSON, so a broken client is loud", () => {
    const transport = createWorkerTransport(fakeWorker());
    expect(() => transport.send("not json")).toThrow();
  });

  test("subscribe hands the handler each worker message as a JSON string", () => {
    const worker = fakeWorker();
    const transport = createWorkerTransport(worker);
    const seen: string[] = [];
    transport.subscribe((value) => seen.push(value));
    worker.emit({ jsonrpc: "2.0", id: 1, result: { ok: true } });
    expect(seen).toEqual(['{"jsonrpc":"2.0","id":1,"result":{"ok":true}}']);
  });

  test("every subscribed handler receives the message", () => {
    const worker = fakeWorker();
    const transport = createWorkerTransport(worker);
    let a = 0;
    let b = 0;
    transport.subscribe(() => a++);
    transport.subscribe(() => b++);
    worker.emit({ jsonrpc: "2.0", method: "x" });
    expect([a, b]).toEqual([1, 1]);
  });

  test("unsubscribe stops delivery and removes the worker listener", () => {
    const worker = fakeWorker();
    const transport = createWorkerTransport(worker);
    const seen: string[] = [];
    const handler = (value: string) => seen.push(value);
    transport.subscribe(handler);
    transport.unsubscribe(handler);
    worker.emit({ jsonrpc: "2.0", method: "x" });
    expect(seen).toEqual([]);
    expect(worker.listeners.size).toBe(0);
  });
});
