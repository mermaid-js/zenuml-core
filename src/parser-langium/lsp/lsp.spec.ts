/**
 * End-to-end LSP feature tests, driven by Langium's own test harness (no editor
 * needed). Exercises validation diagnostics, completion, and hover against the
 * real ZenUML LSP services built on the Langium side-car parser.
 */
import { EmptyFileSystem } from "langium";
import {
  clearDocuments,
  expectCompletion,
  expectHover,
  expectNoIssues,
  expectWarning,
  validationHelper,
} from "langium/test";
import { afterEach, describe, expect, test } from "vitest";
import type { Prog } from "../generated/ast";
import { createZenUmlLspServices } from "./zenuml-lsp-module";

const services = createZenUmlLspServices(EmptyFileSystem);
const validate = validationHelper<Prog>(services.ZenUml);
const completion = expectCompletion(services.ZenUml);
const hover = expectHover(services.ZenUml);

describe("ZenUML LSP", () => {
  afterEach(async () => {
    await clearDocuments(services.shared);
  });

  describe("validation", () => {
    test("clean DSL has no issues", async () => {
      const result = await validate("Alice->Bob: hello");
      expectNoIssues(result);
    });

    test("duplicate explicit participant declaration warns", async () => {
      const result = await validate("Alice\nAlice\nAlice->Bob: hi");
      expectWarning(result, /Duplicate participant declaration: 'Alice'/, {
        property: "name",
      });
    });

    test("distinct participants do not warn", async () => {
      const result = await validate("Alice\nBob\nAlice->Bob: hi");
      expectNoIssues(result);
    });
  });

  describe("completion", () => {
    test("offers known participant names anywhere", async () => {
      await completion({
        text: "Alice->Bob: hi\n<|>",
        index: 0,
        assert: (completions) => {
          const labels = completions.items.map((i) => i.label);
          expect(labels).toContain("Alice");
          expect(labels).toContain("Bob");
        },
      });
    });

    test("completion reflects the document's participants dynamically", async () => {
      await completion({
        text: "Alice->Bob: hi\nBob->Charlie: ok\n<|>",
        index: 0,
        assert: (completions) => {
          const participants = completions.items
            .filter((i) => i.detail === "participant")
            .map((i) => i.label);
          expect(participants).toEqual(["Alice", "Bob", "Charlie"]);
        },
      });
    });

    test("empty document offers no participant suggestions", async () => {
      await completion({
        text: "<|>",
        index: 0,
        assert: (completions) => {
          const participants = completions.items.filter(
            (i) => i.detail === "participant",
          );
          expect(participants).toHaveLength(0);
        },
      });
    });
  });

  describe("hover", () => {
    test("hovering a message endpoint shows the participant", async () => {
      await hover({
        text: "<|>Alice->Bob: hi",
        index: 0,
        hover: /\*\*Participant\*\* `Alice`/,
      });
    });

    test("hovering an explicit participant shows its type", async () => {
      await hover({
        text: "@Actor <|>Admin\nAdmin->DB: query",
        index: 0,
        hover: /\*\*Participant\*\* `@Actor` `Admin`/,
      });
    });
  });
});
