---
"@zenuml/core": patch
---

The label of a ref fragment is drawn with its cut bottom-right corner (the UML pentagon) and a border in the frame colour again. The styles that draw it were in a stylesheet that was never loaded since the React migration, so the label showed as a plain rectangle. The fragment styles now live in one stylesheet instead of one copy per fragment kind.
