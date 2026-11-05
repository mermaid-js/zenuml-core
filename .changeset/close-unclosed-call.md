---
"@zenuml/core": patch
---

An unclosed call no longer breaks the message or absorbs the next line. `A.b(` is one message labelled `b()`, `A.b(x` is one message labelled `b(x)`, `new B(` creates `B`, and a statement on the next line stays a statement. A chain that ends in a dot, such as `A.b().`, keeps its message when nothing can continue the chain. The missing paren and the extra dot are still reported as syntax errors.
