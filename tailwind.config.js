module.exports = {
  important: ".zenuml",
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}", "./index.html"],
  safelist: [
    // add classes from tailwind.css
    "theme-default",
    "theme-mermaid",
    "theme-darcula",
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
      pattern: /(bg|text)-.*/,
    },
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          base: "rgb(var(--color-bg-base-rgb))",
          "text-base": "var(--color-text-base)",
          "text-secondary": "var(--color-text-secondary)",
          "border-base": "var(--color-border-base)",
          "border-primary": "var(--color-border-primary)",
          "frame-border": "var(--color-border-frame)",
          "frame-bg":
            "rgb(var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb)))))",
          "canvas-bg":
            "rgb(var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))",
          "title-bg":
            "rgb(var(--color-bg-title-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))))",
          "title-text": "var(--color-text-title)",
          "participant-bg":
            "rgb(var(--color-bg-participant-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))))",
          "participant-text": "var(--color-text-participant)",
          "participant-border": "var(--color-border-participant)",
          "participant-shadow": "var(--color-shadow-participant)",
          "message-text": "var(--color-text-message)",
          "message-arrow": "var(--color-message-arrow)",
          "message-hover-bg": "var(--color-bg-message-hover)",
          "message-hover-text":
            "rgb(var(--color-text-message-hover-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))",
          "comment-text": "var(--color-text-comment)",
          "fragment-header-bg":
            "rgb(var(--color-bg-fragment-header-rgb, var(--color-bg-participant-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb)))))))",
          "fragment-text": "var(--color-text-fragment)",
          "fragment-border": "var(--color-border-fragment)",
          "occurrence-bg":
            "rgb(var(--color-bg-occurrence-rgb, var(--color-bg-participant-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb)))))))",
          "occurrence-border": "var(--color-border-occurrence)",
          "occurrence-shadow": "var(--color-shadow-occurrence)",
          "note-text": "var(--color-text-note)",
          "note-bg": "var(--color-bg-note)",
          "note-border": "var(--color-border-note)",
          "link-text": "var(--color-text-link)",
          "control-text": "var(--color-text-control)",
        },
      },
      textColor: {
        skin: {
          title:
            "var(--color-text-title, var(--color-text-message, var(--color-text-base, #000)))",
          participant:
            "var(--color-text-participant, var(--color-text-message, var(--color-text-base, #000)))",
          message: "var(--color-text-message, var(--color-text-base, #000))",
          "message-arrow":
            "var(--color-message-arrow, var(--color-border-frame, var(--color-border-base, #000)))", // message arrow head
          "message-hover":
            "rgb(var(--color-text-message-hover-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))",
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
        },
      },
      backgroundColor: {
        skin: {
          canvas:
            "rgb(var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))",
          frame:
            "rgba(var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb)))), <alpha-value>)",
          title:
            "rgb(var(--color-bg-title-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))))",
          participant:
            "rgb(var(--color-bg-participant-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb))))))",
          lifeline:
            "var(--color-border-participant, var(--color-border-participant, var(--color-border-frame, var(--color-border-base, #000))))",
          divider:
            "var(--color-border-participant, var(--color-border-frame, var(--color-border-base, #000)))",
          "message-hover":
            "var(--color-bg-message-hover, var(--color-text-base, #000))",
          "fragment-header": "var(--color-bg-fragment-header, transparent)",
          occurrence:
            "rgb(var(--color-bg-occurrence-rgb, var(--color-bg-participant-rgb, var(--color-bg-frame-rgb, var(--color-bg-canvas-rgb, var(--color-bg-base-rgb, var(--color-backup-white-rgb)))))))",
          base: "rgb(var(--color-bg-base-rgb))",
          secondary: "var(--color-bg-secondary)",
          hover: "var(--color-bg-hover)",
          fill: "var(--color-bg-fill)",
        },
      },
      borderColor: {
        primary: "var(--color-border-primary)",
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
        },
      },
      gradientColorStops: {
        skin: {
          base: "rgb(var(--color-bg-base-rgb))",
          secondary: "var(--color-bg-secondary)",
        },
      },
      boxShadow: {
        participant: "var(--color-shadow-participant, transparent)",
        occurrence: "var(--color-shadow-occurrence, transparent)",
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
