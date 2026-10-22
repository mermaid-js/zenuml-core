---
"@zenuml/core": patch
---

The `zenuml` CLI no longer fails now and then with "Unable to capture screenshot" when it writes PNG output on a busy machine. It now waits for the browser to paint the diagram before it takes the image.
