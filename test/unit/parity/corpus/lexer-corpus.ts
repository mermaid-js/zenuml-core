/**
 * Lexer parity corpus — every case from docs/langium-migration/01-lexer-analysis.md §9,
 * every input string used by the existing lexer-level specs
 * (src/parser/Atom/Money.spec.ts, src/parser/Atom/NumberUnit.spec.ts,
 * test/unit/parser/digit-leading-name.spec.ts), plus the tricky cases called out
 * in 01 §2/§6/§7 (maximal munch, predicates, modes, odd quotes, CRLF, emoji).
 *
 * `id` doubles as the golden filename: test/unit/parity/__golden__/lexer/<id>.json
 */
export interface LexerCorpusCase {
  id: string;
  code: string;
}

export const lexerCorpus: LexerCorpusCase[] = [
  // --- title variants (01 §9, §2.1, §7.3) ---
  { id: "title-simple", code: "title Order Flow" },
  { id: "title-after-comment", code: "// c\ntitle X" },
  { id: "title-method-call", code: "title.method()" },
  { id: "title-assignment", code: "title = 1" },
  { id: "title-call-paren", code: "title(x)" },
  { id: "title-plural-word", code: "titles" },

  // --- EVENT-mode payloads (01 §4, §7.2) ---
  { id: "payload-with-comment-chars", code: "A->B: hello world // not a comment" },
  { id: "payload-colon-at-eof", code: "A->B:" },
  { id: "payload-colon-then-newline", code: "A->B:\n" },
  { id: "colon-then-newline", code: ":\n" },
  { id: "payload-crlf", code: "A->B: hello\r\nB->C: world\r\n" },

  // --- divider matrix (01 §2.3, §7.5) ---
  { id: "divider-standard", code: "== divider ==" },
  { id: "divider-indented", code: "  == d" },
  { id: "divider-bare-eq-line", code: "==" },
  { id: "divider-bare-eq-line-leading-space", code: " ==" },
  { id: "eq-mid-expression", code: "a == b" },
  { id: "divider-mid-document", code: "A.m()\n== phase two ==\nB.n()" },

  // --- modifiers / MODIFIER_CHANNEL (01 §3.3) ---
  { id: "modifier-await-call", code: "await A.m()" },
  { id: "modifier-const-assign", code: "const x = 1" },
  { id: "modifier-readonly", code: "readonly" },
  { id: "modifier-static", code: "static" },
  { id: "word-constant", code: "constant" },
  { id: "word-awaits", code: "awaits" },

  // --- units / money (01 §3.8, §9) ---
  { id: "unit-300ms", code: "300ms" },
  { id: "unit-1-5h", code: "1.5h" },
  { id: "unit-dot5px", code: ".5px" },
  { id: "unit-3s", code: "3s" },
  { id: "word-3sx", code: "3sx" },
  { id: "cjk-3-seconds", code: "3秒" },
  { id: "word-2fa", code: "2fa" },
  { id: "money-5", code: "$5" },
  { id: "money-dot5", code: "$.5" },
  { id: "money-1-99", code: "$1.99" },

  // --- floats, dots, maximal munch (01 §2.2, §7.4, §9 x.5 case) ---
  { id: "float-dot5", code: ".5" },
  { id: "word-dot5x", code: ".5x" },
  { id: "word-dot5abc", code: ".5abc" },
  { id: "float-1-dot", code: "1." },
  { id: "id-dot-id", code: "a.b" },
  { id: "id-x-dot-5", code: "x.5" },
  { id: "digit-leading-3dservice", code: "3DService" },
  { id: "int-underscore-1000", code: "1_000" },

  // --- strings incl. odd-quote longest-match (01 §3.9, §7.6) ---
  { id: "string-simple", code: '"a"' },
  { id: "string-unterminated", code: '"a' },
  { id: "string-two-adjacent", code: '"a""b"' },
  { id: "string-odd-quote", code: '"a""' },
  { id: "string-abc-odd-quote", code: '"abc""' },
  { id: "string-empty", code: '""' },
  { id: "string-three-quotes", code: '"""' },
  { id: "string-cjk", code: '"中文"' },

  // --- CJK / unicode names (01 §3.8, §7.10) ---
  { id: "cjk-message", code: "用户->订单服务: 下单" },
  { id: "cjk-digit-leading", code: "1号机" },
  { id: "cjk-participant-call", code: "订单服务.创建订单()" },

  // --- emoji (01 §9 stray chars) ---
  { id: "emoji-in-name", code: "🤖Bot.run()" },
  { id: "emoji-in-message", code: "A->B: deploy 🚀 now" },
  { id: "emoji-stray", code: "😀" },

  // --- annotations (01 §3.7) ---
  { id: "annotation-starter", code: "@Starter(A)" },
  { id: "annotation-starter-lower", code: "@starter" },
  { id: "annotation-starters", code: "@Starters" },
  { id: "annotation-return", code: "@Return" },
  { id: "annotation-reply", code: "@reply" },
  { id: "annotation-custom", code: "@custom" },
  { id: "bare-at", code: "@" },

  // --- colors (01 §3.5 COLOR) ---
  { id: "color-hex", code: "#FF0000" },
  { id: "color-invalid", code: "#xyz" },

  // --- stray chars → OTHER (01 §3.10, §7.7) ---
  { id: "stray-question", code: "?" },
  { id: "stray-pipe", code: "|" },
  { id: "stray-ampersand", code: "&" },
  { id: "stray-backtick", code: "`" },

  // --- comment attachment shapes (01 §7.1) ---
  { id: "comment-run-before-message", code: "// first\n// second\nA.method()" },
  { id: "comment-before-closing-brace", code: "if (x) {\n  A.m()\n  // trailing\n}" },

  // --- keywords-as-prefix words (01 §6 longer_alt) ---
  { id: "word-form", code: "form" },
  { id: "word-loopx", code: "loopX" },
  { id: "word-newish", code: "newish" },
  { id: "word-returner", code: "returner" },

  // --- half arrows (01 §9 / G7 malformed) ---
  { id: "half-arrow-minus", code: "A -" },
  { id: "half-arrow-full", code: "A ->" },

  // --- inputs from src/parser/Atom/Money.spec.ts ---
  { id: "money-100", code: "$100" },
  { id: "money-0", code: "$0" },
  { id: "money-1000000", code: "$1000000" },
  { id: "money-01", code: "$01" },
  { id: "money-1-50", code: "$1.50" },
  { id: "money-0-50", code: "$0.50" },
  { id: "money-dot50", code: "$.50" },

  // --- inputs from src/parser/Atom/NumberUnit.spec.ts ---
  { id: "unit-1kg", code: "1kg" },
  { id: "unit-0kg", code: "0kg" },
  { id: "unit-100day", code: "100day" },
  { id: "unit-5km", code: "5km" },
  { id: "word-kg", code: "kg" },
  { id: "unit-01h", code: "01h" },
  { id: "unit-010hours", code: "010hours" },
  { id: "unit-1-5kg", code: "1.5kg" },
  { id: "unit-0-5h", code: "0.5h" },
  { id: "unit-dot5m", code: ".5m" },

  // --- inputs from test/unit/parser/digit-leading-name.spec.ts ---
  {
    id: "digit-leading-if-condition",
    code: "\n      if(5xx_error) {\n        A.method()\n      }\n    ",
  },
  { id: "digit-leading-participant-method", code: "2FAService.3DSecure()" },
  { id: "digit-leading-async-message", code: "API->5xx_error: retry" },
  { id: "digit-leading-return", code: "return 5xx_error" },
  { id: "units-mixed-line", code: "1kg 100day 0.5h .5m 10ms" },
  { id: "digit-leading-mixed-line", code: "5xx 5xx_error 2FAService 404Page" },

  // --- mixed full-diagram sample exercising several channels at once ---
  {
    id: "full-mixed-sample",
    code: "title Demo\n// note\n@Starter(A)\nA->B: hi\nif (x) { B.m() }\n",
  },
];

export function assertUniqueCorpusIds(cases: LexerCorpusCase[]): void {
  const seen = new Set<string>();
  for (const { id } of cases) {
    if (seen.has(id)) {
      throw new Error(`Duplicate lexer corpus id: ${id}`);
    }
    seen.add(id);
  }
}
