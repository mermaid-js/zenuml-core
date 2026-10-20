module.exports = {
  important: ".zenuml",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  safelist: [
    // add classes from tailwind.css
    "theme-default",
    "theme-mermaid",
    "theme-darcula",
    "theme-dark",
    "theme-clean-dark",
    "theme-clean-light",
    "theme-neon",
    "theme-sky",
    "theme-idle-afternoon",
    "theme-coles",
    "theme-woolworths",
    "theme-anz",
    "theme-nab",
    "theme-google",
    "theme-diagramly",
    "theme-creately",
    "theme-purple",
    {
      pattern: /(bg|text|outline)-.*/,
    },
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          frame: "var(--color-bg-frame)", // it will generate from/via/to-skin-frame. see lifeline layer
        },
      },
      textColor: {
        skin: {
          title:
            "var(--color-text-title, var(--color-text-message, var(--color-text-base, #000)))",
          participant:
            "var(--color-text-participant, var(--color-text-message, var(--color-text-base, #000)))",
          "lifeline-group-name":
            "var(--color-text-message, var(--color-text-base, #000))",
          message: "var(--color-text-message, var(--color-text-base, #000))",
          "message-arrow":
            "var(--color-message-arrow, var(--color-border-frame, var(--color-border-base, #000)))", // message arrow head
          comment:
            "var(--color-text-comment, var(--color-text-secondary, var(--color-text-base, #000)))",
          "fragment-header":
            "var(--color-text-fragment-header, var(--color-text-message, #000))",
          fragment:
            "var(--color-text-fragment, var(--color-text-message, #000))",
          base: "var(--color-text-base)",
          header: "var(--color-text-header)",
          secondary: "var(--color-text-secondary)",
          control:
            "var(--color-text-control, var(--color-text-secondary, var(--color-text-base, #000)))",
          muted: "var(--color-text-muted)",
          hover: "var(--color-text-hover)",
          link: "var(--color-text-link, var(--color-text-secondary, var(--color-text-base, #000)))",
          fill: "var(--color-text-fill)",
          // Sequence number badge text and the guard keyword (`if`, `else`,
          // `while`). Fallbacks are the pre-slot literals (Tailwind gray-500).
          number: "var(--color-text-number, #6b7280)",
          // A fragment's number sits inside its header band, so it can take
          // the band's text colour when a theme sets one.
          "fragment-number":
            "var(--color-text-fragment-number, var(--color-text-number, #6b7280))",
          guard: "var(--color-text-guard, var(--color-text-number, #6b7280))",
          divider: "var(--color-text-divider, #333)",
          // HTTP verbs inside comment code spans (src/components/Cosmetic.scss).
          "http-get": "var(--color-text-http-get, #2f3d89)",
          "http-post": "var(--color-text-http-post, #0d4b3b)",
          "http-delete": "var(--color-text-http-delete, #7e1e23)",
        },
      },
      backgroundColor: {
        skin: {
          canvas:
            "var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff)))",
          frame:
            "var(--color-bg-frame, var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff))))",
          title:
            "var(--color-bg-title, var(--color-bg-frame, var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff)))))",
          participant:
            "var(--color-bg-participant, var(--color-bg-frame, var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff)))))",
          // The lifeline is drawn by LifeLine.tsx as a gradient of
          // --color-border-base; this chain records that so the SVG palette can
          // resolve the same value (src/svg/themes.spec.ts).
          lifeline: "var(--color-border-base, #000)",
          // Divider note box and its rule lines (Divider.tsx keeps the same
          // chains inline, so bracket styles keep their precedence).
          divider: "var(--color-bg-divider, #fff5ad)",
          "divider-line": "var(--color-border-divider, #aaaa33)",
          // Sequence number badge (was Tailwind gray-500/10).
          number: "var(--color-bg-number, rgb(107 114 128 / 0.1))",
          // Comment markdown: code spans and table header (Cosmetic.scss).
          "comment-code": "var(--color-bg-comment-code, #f9f2f4)",
          "comment-table-head": "var(--color-bg-comment-table-head, #e0e0e0)",
          "fragment-header":
            "var(--color-bg-fragment-header, var(--color-bg-frame, var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff)))))",
          occurrence:
            "var(--color-bg-occurrence, var(--color-bg-participant, var(--color-bg-frame, var(--color-bg-canvas, var(--color-bg-base, var(--color-backup-white, #ffffff))))))",
          base: "var(--color-bg-base)",
          secondary: "var(--color-bg-secondary)",
          hover: "var(--color-bg-hover)",
          fill: "var(--color-bg-fill)",
        },
      },
      borderColor: {
        primary: "var(--color-border-primary)",
        "zu-line-5": "var(--zu-line-5)",
        "zu-line-10": "var(--zu-line-10)",
        "zu-line-20": "var(--zu-line-20)",
        "zu-line-35": "var(--zu-line-35)",
        skin: {
          frame: "var(--color-border-frame, var(--color-border-base, #000))",
          participant:
            "var(--color-border-participant, var(--color-border-frame, var(--color-border-base, #000)))",
          "message-arrow":
            "var(--color-message-arrow, var(--color-border-frame,  var(--color-border-base, #000)))", // message arrow line
          fragment:
            "var(--color-border-fragment, var(--color-border-frame,  var(--color-border-base, #000)))",
          occurrence:
            "var(--color-border-occurrence, var(--color-border-frame,  var(--color-border-base, #000)))",
          base: "var(--color-border-base)",
          secondary: "var(--color-border-secondary)",
          // Dashed outline around a participant group (LifeLineGroup.tsx).
          group: "var(--color-border-group, #666)",
          divider: "var(--color-border-divider, #aaaa33)",
          // Rule between fragment sections and under the fragment header name
          // (was Tailwind's default border colour, gray-200).
          "fragment-separator":
            "var(--color-border-fragment-separator, #e5e7eb)",
          // Rule under the fragment header name; sits on the header band.
          "fragment-header-rule":
            "var(--color-border-fragment-header-rule, var(--color-border-fragment-separator, #e5e7eb))",
          "comment-table": "var(--color-border-comment-table, #cbcbcb)",
        },
      },
      stroke: {
        skin: {
          group: "var(--color-border-group, #666)",
        },
      },
      opacity: {
        // Comments and guard text are de-emphasised by opacity in
        // theme-default; a dark theme carries that hierarchy in lightness
        // instead (ADR 0004), so the opacity is a slot.
        "skin-comment": "var(--opacity-comment, 0.5)",
        "skin-guard": "var(--opacity-guard, 0.65)",
      },
      outlineColor: {
        skin: {
          primary: "var(--color-outline-primary)",
        },
      },
      gradientColorStops: {
        skin: {
          base: "var(--color-bg-base)",
          secondary: "var(--color-bg-secondary)",
        },
      },
      boxShadow: {
        participant: "var(--color-shadow-participant, 0 0 #0000)",
        occurrence: "var(--color-shadow-occurrence, 0 0 #0000)",
        // --zu-* chrome tokens, declared on .zenuml in src/assets/tailwind.css
        "zu-sm": "var(--zu-shadow-sm)",
        "zu-md": "var(--zu-shadow-md)",
        "zu-pop": "var(--zu-shadow-pop)",
        "zu-pop-ring": "var(--zu-shadow-pop), var(--zu-hairline)",
        "zu-hairline": "var(--zu-hairline)",
        "zu-pop-error": "var(--zu-shadow-pop), 0 0 0 1px rgba(220, 38, 38, 0.35)", // zenuml-owned
        "zu-selected": "0 0 0 1px #0ea5e9", // zenuml-owned, selection ring until P3
      },
      borderRadius: {
        "zu-xs": "var(--zu-radius-xs)",
        "zu-sm": "var(--zu-radius-sm)",
        "zu-md": "var(--zu-radius-md)",
        "zu-lg": "var(--zu-radius-lg)",
        "zu-panel": "var(--zu-radius-panel)",
        "zu-dialog": "var(--zu-radius-dialog)",
      },
      spacing: {
        "zu-control": "var(--zu-h-control)",
        "zu-control-nested": "var(--zu-h-control-nested)",
        "zu-gap-xs": "var(--zu-gap-xs)",
        "zu-gap-sm": "var(--zu-gap-sm)",
        "zu-gap-md": "var(--zu-gap-md)",
      },
      transitionDuration: {
        "zu-fast": "var(--zu-dur-fast)",
        "zu-snap": "var(--zu-dur-snap)",
        "zu-base": "var(--zu-dur-base)",
        "zu-sheet": "var(--zu-dur-sheet)",
        "zu-slow": "var(--zu-dur-slow)",
      },
      transitionTimingFunction: {
        "zu-out": "var(--zu-ease-out)",
        "zu-snap": "var(--zu-ease-snap)",
        "zu-overshoot": "var(--zu-ease-overshoot)",
        "zu-spring": "var(--zu-ease-spring)",
        "zu-standard": "var(--zu-ease-standard)",
      },
      ringColor: {
        "zu-ring": "var(--zu-ring-color)",
      },
    },
  },
  variants: {
    extend: {
      overflow: ["hover", "focus"],
      whitespace: ["hover", "focus"],
      display: ["group-hover"],
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [require("@headlessui/tailwindcss")],
};
