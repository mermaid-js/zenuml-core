---
"@zenuml/core": patch
---

Participant spacing now accounts for the «stereotype» row. A stereotype wider than the participant name (for example `<<alongstereotype_aaaaa>> a`) used to overlap the neighbouring participant box and be clipped by the diagram frame; the positioning engine now reserves the wider of the name row and the stereotype, so the boxes keep their normal gap and the frame grows to fit them.
