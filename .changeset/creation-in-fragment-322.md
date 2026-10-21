---
"@zenuml/core": patch
---

A creation message inside a fragment now starts at its creator. Before, it started at the fragment's left-most participant: when the created participant sat left of the creator the arrow collapsed and the «create» label was clipped, and when the creator was not the left-most participant the arrow started at the wrong lifeline.
