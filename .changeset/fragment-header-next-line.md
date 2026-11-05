---
"@zenuml/core": patch
---

An incomplete fragment header no longer swallows the next statement. A header that never closes (`if`, `if(a ==`, `while(`, `opt(`, `try`, `ref`, `ref(x,` and the same forms of `par`, `critical`, `section`, `catch` and `finally`) now ends at the end of its line, so the next line stays a message. Multi-line headers that do close, such as `if(a ==` followed by `b) {`, parse as before.
