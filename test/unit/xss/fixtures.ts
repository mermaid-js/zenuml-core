export const PAYLOADS = [
  // The payload from docs/xss.md
  `"><img src=x onerror=alert(1)>ent #FFEBE6`,
  `<script>alert(1)</script>`,
  `"><svg onload=alert(1)>`,
  `javascript:alert(1)`,
];

// Keep the payload inside one grammar string token. Removing only double quotes
// preserves the markup, event-handler and URL attack characters being tested.
export const forQuotedName = (payload: string) => payload.replace(/"/g, "");

export const FORBIDDEN_ELEMENTS = [
  "script",
  "img",
  "iframe",
  "foreignObject",
  "a",
];
export const FORBIDDEN_SELECTOR = FORBIDDEN_ELEMENTS.join(", ");

export const POSITIONS: {
  position: string;
  build: (label: string) => string;
  adapt: (payload: string) => string;
  htmlText?: (label: string) => string;
  svgText?: (label: string) => string;
}[] = [
  {
    position: "participant name",
    build: (label) => `"${label}"->B: hi`,
    adapt: forQuotedName,
  },
  {
    position: "message label",
    build: (label) => `A->B: ${label}`,
    adapt: (payload) => payload,
  },
  {
    position: "diagram title",
    build: (label) => `title ${label}\nA->B: hi`,
    adapt: (payload) => payload,
  },
  {
    position: "if condition",
    build: (label) => `if("${label}") {\nA->B: hi\n}`,
    adapt: forQuotedName,
  },
  {
    position: "loop condition",
    build: (label) => `loop("${label}") {\nA->B: hi\n}`,
    adapt: forQuotedName,
  },
  {
    position: "ref label",
    build: (label) => `A\nB\nref("${label}", A, B)`,
    adapt: forQuotedName,
    // SVG displays the whole ref invocation; HTML displays just its label.
    svgText: (label) => `ref("${label}",A,B)`,
  },
  {
    position: "group name",
    build: (label) => `group "${label}" { A B }\nA->B: hi`,
    adapt: forQuotedName,
  },
  {
    position: "stereotype",
    build: (label) => `<<"${label}">> A\nA->B: hi`,
    adapt: forQuotedName,
    htmlText: (label) => `«${label}»`,
    svgText: (label) => `«${label}»`,
  },
  {
    position: "divider text",
    build: (label) => `A->B: first\n== ${label} ==\nA->B: second`,
    adapt: (payload) => payload,
  },
  {
    position: "participant alias",
    build: (label) => `A as "${label}"\nA->B: hi`,
    adapt: forQuotedName,
  },
  {
    position: "assignee",
    build: (label) => `"${label}" = A.m()`,
    adapt: forQuotedName,
  },
  {
    position: "creation arguments",
    build: (label) => `A.m() {\nnew B("${label}")\n}`,
    adapt: forQuotedName,
    // HTML uses separate guillemet spans; SVG has one text element with tspans.
    svgText: (label) => `«${label}»`,
  },
];
