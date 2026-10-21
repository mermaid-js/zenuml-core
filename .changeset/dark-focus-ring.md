---
"@zenuml/core": patch
---

theme-dark: the keyboard focus ring no longer draws a white halo on the dark frame. The gap between an element and its ring now takes the frame colour, and the ring is a light grey derived by `scripts/theme-contrast/derive-dark.mjs` that reads about 8.7:1 against the frame (WCAG 2 asks 3:1 for focus indicators). The theme-default ring is unchanged.
