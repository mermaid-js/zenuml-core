export type MessageArrowType = "sync" | "async" | "return" | "creation";

type TransformMessageTypeInput = {
  line: string;
  currentType: MessageArrowType;
  targetType: MessageArrowType;
  source?: string;
  target?: string;
  signature?: string;
};

const STARTER = "_STARTER_";

const splitLine = (line: string) => {
  const indent = line.match(/^\s*/)?.[0] || "";
  const content = line.slice(indent.length);
  const semicolon = content.endsWith(";") ? ";" : "";
  const body = semicolon ? content.slice(0, -1) : content;
  return { indent, body, semicolon };
};

const hasInlineBlock = (line: string) => /\{\s*$/.test(line.trimEnd());

const colonMessageParts = (line: string) => {
  const { indent, body, semicolon } = splitLine(line);
  const match = body.match(/^(.*?)\s*(-->|->)\s*(.*?)\s*:(.*)$/);
  if (!match) {
    return null;
  }
  return {
    indent,
    from: match[1].trim(),
    arrow: match[2],
    to: match[3].trim(),
    content: match[4],
    semicolon,
  };
};

const creationLineParts = (line: string) => {
  const { indent, body, semicolon } = splitLine(line);
  const match = body.match(/^new\s+(\w+)\s*\(([^)]*)\)$/);
  if (!match) return null;
  return { indent, target: match[1], args: match[2].trim(), semicolon };
};

const isSyncableContent = (content: string): boolean => {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const methodName = trimmed.replace(/\(.*\)$/, "");
  return methodName.length > 0 && !/\s/.test(methodName);
};

export const canTransformMessageType = ({
  line,
  currentType,
  targetType,
  source,
  target,
  signature,
}: TransformMessageTypeInput): boolean => {
  if (currentType === targetType) {
    return false;
  }
  if (hasInlineBlock(line)) {
    return false;
  }
  if (!target) {
    return false;
  }
  if (currentType === "sync") {
    if (!signature) {
      return false;
    }
    if (targetType === "async" || targetType === "creation") {
      return true;
    }
    return Boolean(source && source !== STARTER);
  }
  if (currentType === "creation" && targetType === "sync") {
    const parts = creationLineParts(line);
    if (!parts || !source || source === STARTER) return false;
    // args must be a valid method name (identifier, no spaces)
    return parts.args.length > 0 && /^\w+$/.test(parts.args);
  }
  if (targetType === "sync") {
    const parts = colonMessageParts(line);
    if (!parts) return false;
    return isSyncableContent(parts.content);
  }
  return Boolean(
    source &&
      source !== STARTER &&
      target &&
      colonMessageParts(line),
  );
};

export const transformMessageType = ({
  line,
  currentType,
  targetType,
  source,
  target,
  signature,
}: TransformMessageTypeInput): string | null => {
  if (
    !canTransformMessageType({
      line,
      currentType,
      targetType,
      source,
      target,
      signature,
    })
  ) {
    return null;
  }

  if (currentType === "sync") {
    const { indent, semicolon } = splitLine(line);
    if (targetType === "async") {
      const prefix = source && source !== STARTER ? `${source}->${target}` : target;
      return `${indent}${prefix}: ${signature}${semicolon}`;
    }
    if (targetType === "creation") {
      return `${indent}new ${target}(${signature})${semicolon}`;
    }
    return `${indent}${source}-->${target}: ${signature}${semicolon}`;
  }

  if (currentType === "creation" && targetType === "sync") {
    const parts = creationLineParts(line);
    if (!parts || !source) return null;
    return `${parts.indent}${source}->${parts.target}.${parts.args}()${parts.semicolon}`;
  }

  const colonParts = colonMessageParts(line);
  if (!colonParts) {
    return null;
  }

  if (targetType === "sync") {
    const content = colonParts.content.trim();
    const methodCall = content.endsWith(")") ? content : `${content}()`;
    const prefix = colonParts.from
      ? `${colonParts.from}->${colonParts.to}`
      : colonParts.to;
    return `${colonParts.indent}${prefix}.${methodCall}${colonParts.semicolon}`;
  }

  const arrow = targetType === "return" ? "-->" : "->";
  return `${colonParts.indent}${colonParts.from}${arrow}${colonParts.to}:${colonParts.content}${colonParts.semicolon}`;
};
