/**
 * Adapter between a Web Worker and `@codemirror/lsp-client`'s `Transport`.
 *
 * The client speaks JSON text; the worker (vscode-languageserver's
 * `BrowserMessageReader`/`Writer`) speaks message objects over `postMessage`.
 * So `send` parses and `subscribe` stringifies.
 */
import type { Transport } from "@codemirror/lsp-client";

/** The slice of `Worker` the adapter needs; tests pass a fake. */
export interface WorkerLike {
  postMessage(message: unknown): void;
  addEventListener(
    type: "message",
    listener: (event: { data: unknown }) => void,
  ): void;
  removeEventListener(
    type: "message",
    listener: (event: { data: unknown }) => void,
  ): void;
}

export function createWorkerTransport(worker: WorkerLike): Transport {
  // One worker listener per subscribed handler, so `unsubscribe` can find it.
  const listeners = new Map<
    (value: string) => void,
    (event: { data: unknown }) => void
  >();
  return {
    send(message) {
      worker.postMessage(JSON.parse(message));
    },
    subscribe(handler) {
      const listener = (event: { data: unknown }) =>
        handler(JSON.stringify(event.data));
      listeners.set(handler, listener);
      worker.addEventListener("message", listener);
    },
    unsubscribe(handler) {
      const listener = listeners.get(handler);
      if (!listener) return;
      listeners.delete(handler);
      worker.removeEventListener("message", listener);
    },
  };
}
