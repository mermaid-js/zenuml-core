/**
 * ZenUML LSP server entry point (Node, stdio transport).
 *
 * Run: `node dist/lsp/main.js --stdio` (built via `bun run build:lsp`), or wire
 * it as the server command in a VS Code / editor language client for `.zenuml`
 * files. This is the side-car consumer of the Langium parser — it is never part
 * of the published `@zenuml/core` library bundle.
 */
import { startLanguageServer } from "langium/lsp";
import { NodeFileSystem } from "langium/node";
import {
  createConnection,
  ProposedFeatures,
} from "vscode-languageserver/node.js";
import { createZenUmlLspServices } from "./zenuml-lsp-module.js";

const connection = createConnection(ProposedFeatures.all);
const { shared } = createZenUmlLspServices({ connection, ...NodeFileSystem });
startLanguageServer(shared);
