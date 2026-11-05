---
"@zenuml/core": patch
---

Stop drawing placeholder participants while a declaration is still being typed. A participant with a stereotype, type or icon but no name yet, and a `new` with no class name yet, no longer add a box labelled with internal placeholder text, and an unfinished `new` no longer draws a creation arrow. The diagram looks the same as an empty one until the name exists.
