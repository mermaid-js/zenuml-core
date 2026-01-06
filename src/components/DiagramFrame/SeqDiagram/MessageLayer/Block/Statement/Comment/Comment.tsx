import { marked } from "marked";
import DOMPurify from "dompurify";

// Import ONLY the core (no languages) - reduces from 2.6 MB to ~30 KB!
import highlightjs from "highlight.js/lib/core";

// Languages import - only ~5-10 KB each
import plaintext from "highlight.js/lib/languages/plaintext";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
// Add more languages as needed:
// import python from "highlight.js/lib/languages/python";
// import java from "highlight.js/lib/languages/java";
// import json from "highlight.js/lib/languages/json";

import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";

// Register languages
highlightjs.registerLanguage("plaintext", plaintext);
highlightjs.registerLanguage("javascript", javascript);
highlightjs.registerLanguage("bash", bash);
highlightjs.registerLanguage("yaml", yaml);
// highlightjs.registerLanguage("python", python);
// highlightjs.registerLanguage("java", java);
// highlightjs.registerLanguage("json", json);

// Override function
const renderer = {
  codespan(code: string) {
    const endpointPattern =
      /(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH)\s+(.+)/gi;
    // let found = code.match(endpointPattern)
    const found = endpointPattern.exec(code);
    if (found?.length === 3) {
      return `
          <code class="rest-api">
          <span class="http-method-${found[1].toLowerCase()}">${found[1]}</span>
          <span class="http-path">${found[2]}</span>
          </code>
        `;
    }
    return `<code>${code}</code>`;
  },
};

marked.setOptions({
  highlight: function (code, language) {
    if (!language) {
      return highlightjs.highlightAuto(code).value;
    }
    const validLanguage = highlightjs.getLanguage(language)
      ? language
      : "plaintext";
    return highlightjs.highlight(validLanguage, code).value;
  },
  breaks: true,
});

marked.use({ renderer });

export const Comment = (props: {
  comment?: any;
  commentObj?: CommentClass;
  className?: string;
}) => {
  const markedComment = DOMPurify.sanitize(
    (props.commentObj?.text && marked.parse(props.commentObj?.text)) ||
    (props.comment && marked.parse(props.comment)),
  );

  return (
    <div
      className={cn(
        "comments text-skin-comment min-w-[100px] flex text-left opacity-50 hover:opacity-100",
        props.className,
      )}
    >
      <div
        dangerouslySetInnerHTML={{ __html: markedComment }}
        className={cn(props.commentObj?.commentClassNames)}
        style={props.commentObj?.commentStyle}
      ></div>
    </div>
  );
};
