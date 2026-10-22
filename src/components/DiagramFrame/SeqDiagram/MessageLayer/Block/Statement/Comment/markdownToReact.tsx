import { Fragment, type ReactNode } from "react";
import type { marked } from "marked";
import { lexComment } from "@/parser/commentMarkdown";

// Import ONLY the core (no languages) - reduces from 2.6 MB to ~30 KB!
import highlightjs from "highlight.js/lib/core";

// Languages import - only ~5-10 KB each
import plaintext from "highlight.js/lib/languages/plaintext";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";

highlightjs.registerLanguage("plaintext", plaintext);
highlightjs.registerLanguage("javascript", javascript);
highlightjs.registerLanguage("bash", bash);
highlightjs.registerLanguage("yaml", yaml);

const ENDPOINT_PATTERN =
  /(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH)\s+(.+)/i;

const SAFE_HREF = /^(https?:|mailto:)/i;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

// marked v4 HTML-escapes inline token text; React escapes again, so undo it.
export function unescapeHtml(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m]);
}

/**
 * Turn highlight.js output into React elements. highlight.js escapes all
 * source text and only emits `<span class="...">` / `</span>` tags, so we
 * rebuild that tree instead of injecting the HTML.
 */
function highlightedToReact(html: string): ReactNode[] {
  const root: ReactNode[] = [];
  const stack: { className: string; children: ReactNode[] }[] = [];
  const current = () =>
    stack.length ? stack[stack.length - 1].children : root;
  let key = 0;
  for (const part of html.split(/(<span class="[^"]*">|<\/span>)/)) {
    if (!part) continue;
    const open = /^<span class="([^"]*)">$/.exec(part);
    if (open) {
      stack.push({ className: open[1], children: [] });
    } else if (part === "</span>") {
      const node = stack.pop();
      if (node) {
        current().push(
          <span key={key++} className={node.className}>
            {node.children}
          </span>,
        );
      }
    } else {
      current().push(unescapeHtml(part));
    }
  }
  return root;
}

function highlight(code: string, language?: string): ReactNode[] {
  const html = !language
    ? highlightjs.highlightAuto(code).value
    : highlightjs.highlight(code, {
        language: highlightjs.getLanguage(language) ? language : "plaintext",
      }).value;
  return highlightedToReact(html);
}

function renderCodespan(text: string, key: number): ReactNode {
  const code = unescapeHtml(text);
  const found = ENDPOINT_PATTERN.exec(code);
  if (found?.length === 3) {
    return (
      <code key={key} className="rest-api">
        {" "}
        <span className={`http-method-${found[1].toLowerCase()}`}>
          {found[1]}
        </span>{" "}
        <span className="http-path">{found[2]}</span>{" "}
      </code>
    );
  }
  return <code key={key}>{code}</code>;
}

function renderTokens(tokens: marked.Token[] | undefined): ReactNode[] {
  return (tokens ?? []).map(renderToken);
}

function renderToken(token: marked.Token, key: number): ReactNode {
  switch (token.type) {
    case "paragraph":
      return <p key={key}>{renderTokens(token.tokens)}</p>;
    case "text":
      if ("tokens" in token && token.tokens) {
        return <Fragment key={key}>{renderTokens(token.tokens)}</Fragment>;
      }
      return unescapeHtml(token.text);
    case "escape":
      return unescapeHtml(token.text);
    case "codespan":
      return renderCodespan(token.text, key);
    case "code":
      return (
        <pre key={key}>
          <code className={token.lang ? `language-${token.lang}` : undefined}>
            {highlight(token.text, token.lang || undefined)}
          </code>
        </pre>
      );
    case "strong":
      return <strong key={key}>{renderTokens(token.tokens)}</strong>;
    case "em":
      return <em key={key}>{renderTokens(token.tokens)}</em>;
    case "del":
      return <del key={key}>{renderTokens(token.tokens)}</del>;
    case "br":
      return <br key={key} />;
    case "link":
      if (SAFE_HREF.test(token.href)) {
        return (
          <a key={key} href={token.href} title={token.title ?? undefined}>
            {renderTokens(token.tokens)}
          </a>
        );
      }
      return <Fragment key={key}>{renderTokens(token.tokens)}</Fragment>;
    case "list": {
      const items = token.items.map((item, i) => (
        <li key={i}>{renderTokens(item.tokens)}</li>
      ));
      return token.ordered ? (
        <ol key={key} start={token.start === "" ? undefined : token.start}>
          {items}
        </ol>
      ) : (
        <ul key={key}>{items}</ul>
      );
    }
    case "heading": {
      const Tag = `h${token.depth}` as "h1";
      return <Tag key={key}>{renderTokens(token.tokens)}</Tag>;
    }
    case "blockquote":
      return <blockquote key={key}>{renderTokens(token.tokens)}</blockquote>;
    case "hr":
      return <hr key={key} />;
    case "space":
      return null;
    case "html":
      // Raw HTML is shown as inert text, never parsed.
      return token.text;
    default:
      return "raw" in token ? token.raw : null;
  }
}

/** Render comment markdown as React elements; no HTML is ever injected. */
export function markdownToReact(text: string): ReactNode[] {
  return renderTokens(lexComment(text));
}
