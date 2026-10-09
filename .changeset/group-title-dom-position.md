---
"@zenuml/core": patch
---

Fix the participant group title in the HTML renderer: centre it over the rendered participant boxes (it drifted left when a group started with an `@Actor`), stop it hiding the top border of the participant boxes and of the dashed group outline, and re-measure the outline when a hidden diagram becomes visible.
