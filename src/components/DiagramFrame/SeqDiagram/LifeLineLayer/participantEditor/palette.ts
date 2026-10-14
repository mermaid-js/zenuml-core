// Shared by the participant colour and type pickers. Hexes and names come from
// the Split-3-Color canvas: top row is light (black text), bottom row is dark
// (white text). No "Default" / "None" entries; clearing is a separate action.
export const PRESET_COLORS: { hex: string; name: string }[] = [
  { hex: "#fda4af", name: "Rose" },
  { hex: "#fcd34d", name: "Amber" },
  { hex: "#6ee7b7", name: "Emerald" },
  { hex: "#93c5fd", name: "Blue" },
  { hex: "#c4b5fd", name: "Violet" },
  { hex: "#be123c", name: "Deep rose" },
  { hex: "#92400e", name: "Brown" },
  { hex: "#047857", name: "Deep emerald" },
  { hex: "#1d4ed8", name: "Deep blue" },
  { hex: "#6d28d9", name: "Deep violet" },
];

// The UML archetypes get a one-click chip; every other icon key (cloud
// providers etc.) is reachable through the search box.
export const ARCHETYPES: { key: string; label: string }[] = [
  { key: "Actor", label: "Actor" },
  { key: "Boundary", label: "Boundary" },
  { key: "Control", label: "Control" },
  { key: "Entity", label: "Entity" },
  { key: "Database", label: "Database" },
  { key: "Queue", label: "Queue" },
];
