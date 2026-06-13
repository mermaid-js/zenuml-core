/**
 * ZenUML LSP server — browser Web Worker entry (serverless).
 *
 * Runs the SAME Langium services as the Node server (`main.ts`) but over the
 * browser message transport, so the language server lives entirely in a Web
 * Worker — no backend process. A browser editor (CodeMirror, Monaco, …) talks
 * LSP to this worker over `postMessage`.
 *
 * Build: `bun run build:lsp:worker` → `dist/lsp/zenuml-server.worker.js`.
 * Use:   `new Worker(new URL('@zenuml/core/lsp-worker', import.meta.url), { type: 'module' })`
 *        then bridge the worker to the editor with an LSP client (e.g.
 *        `codemirror-languageserver` over a worker transport).
 *
 * The Langium parser (Chevrotain) is pure JS and runs in-browser; this entry
 * pulls in NO Node APIs (contrast `main.ts`, which uses NodeFileSystem).
 */
import { EmptyFileSystem } from "langium";
import { startLanguageServer } from "langium/lsp";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
} from "vscode-languageserver/browser.js";
import { createZenUmlLspServices } from "./zenuml-lsp-module.js";

const reader = new BrowserMessageReader(self as unknown as Worker);
const writer = new BrowserMessageWriter(self as unknown as Worker);
const connection = createConnection(reader, writer);

const { shared } = createZenUmlLspServices({ connection, ...EmptyFileSystem });
startLanguageServer(shared);
