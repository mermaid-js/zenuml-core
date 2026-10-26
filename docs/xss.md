In this document we are disclosing a cross-site scripting vulnerability in the
[@zenuml/core](https://www.npmjs.com/package/@zenuml/core) package.
XSS is a type of security vulnerability that allows an attacker to inject
malicious code into a web page viewed by other users.

# How to reproduce

ZenUML generates sequence diagrams from text. If the text contains a
malicious script, it will be executed when the diagram is rendered.

The following content is known to pop an alert box:

```
"><img src=x onerror=alert(1)>ent #FFEBE6
```

# Regression test

The payload above, plus `<script>`, `<svg onload>` and `javascript:` variants, is placed as a participant
name, a message label, a diagram title, `if` and `loop` conditions, a `ref` label,
a group name, a stereotype, a divider, a participant alias, an assignee and
creation arguments, and checked for both renderers:

- SVG: [`src/svg/renderToSvg.xss.spec.ts`](../src/svg/renderToSvg.xss.spec.ts)
- HTML: [`src/core.xss.spec.ts`](../src/core.xss.spec.ts)

Both specs import the same payloads, position builders and forbidden-element
list from [`test/unit/xss/fixtures.ts`](../test/unit/xss/fixtures.ts). Each case
compares the element set with a benign diagram, rejects executable elements and
event/URL attributes, and requires the payload to appear as text. This also
prevents a dropped or incorrectly parsed label from passing vacuously.

Positions using a quoted grammar string drop double quotes from the payload so
it remains inside one string token. Markup, event-handler and URL characters
remain intact. The fixture records renderer-specific text decoration where the
renderers differ: stereotypes and SVG creation labels use guillemets, while SVG
`ref` labels include the complete invocation.

# Known affected products

| Product           | Severity | Comment                                                             |
| ----------------- | -------- | ------------------------------------------------------------------- |
| Confluence plugin | P3       | Content must be create by registered users; scripts run in sandbox. |
| Web App           | P3       | Only the current user can view content created by themselves.       |
| Chrome Extension  | P3       | Only the current user can view content created by themselves.       |
| Desktop (Win/Mac) | P3       | Only the current user can view content created by themselves.       |
| JetBrains plugin  | P3       | Scripts run inside sandbox.                                         |

# What is the cause of the vulnerability?

The cause of the XSS vulnerability in @zenuml/core is due to accepting an arbitrary text as `innerHTML` in the
WidthProviderFunc.ts file. Specifically, the vulnerability is located in the code that measures the width
of the message or participant element in the library. The issue is present in line 29 of the file, which
can be found at [this URL](https://github.com/ZenUml/core/blob/577f2a550a0b82a392215875298bc358a8feff0d/src/positioning/WidthProviderFunc.ts#L29).
In this line, the code uses unsanitized user input which is passed as an argument in the function, this
allows an attacker to inject malicious JavaScript code into the web page viewed potentially by other users.

```
  let hiddenDiv = document.querySelector('.textarea-hidden-div') as HTMLDivElement;
  if (!hiddenDiv) {
    const newDiv = document.createElement('div');
    ...
    document.body.appendChild(newDiv);
    hiddenDiv = newDiv;
  }
  hiddenDiv.innerHTML = text;
  const scrollWidth = hiddenDiv.scrollWidth;
  return scrollWidth;
```

# Fix of the vulnerability

The fix is to replace the `innerHTML` with `textContent` in the code. This will prevent the browser from
interpreting the text as HTML and will treat it as plain text.

```
  ...
  hiddenDiv.textContent = text;
  const scrollWidth = hiddenDiv.scrollWidth;
  return scrollWidth;
```
