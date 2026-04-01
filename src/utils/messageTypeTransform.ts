export type MessageArrowType = "sync" | "async" | "return";

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
    if (targetType === "async") {
      return true;
    }
    return Boolean(source && source !== STARTER);
  }
  if (targetType === "sync") {
    return false;
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
    return `${indent}${source}-->${target}: ${signature}${semicolon}`;
  }

  const colonParts = colonMessageParts(line);
  if (!colonParts) {
    return null;
  }
  const arrow = targetType === "return" ? "-->" : "->";
  return `${colonParts.indent}${colonParts.from}${arrow}${colonParts.to}:${colonParts.content}${colonParts.semicolon}`;
};
