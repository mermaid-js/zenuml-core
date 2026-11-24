/**
 * Rewrite parser error messages in plain words for people who have never seen
 * ZenUML. Langium's messages name token types ('CPAR') and say "end of file";
 * a newcomer reads neither. Messages that are already plain pass through.
 */

const MISSING: Record<string, string> = {
  CPAR: "A closing ) is missing here.",
  CBRACE: "A closing } is missing. Every { needs a matching }.",
  OPAR: "An opening ( is missing here.",
  OBRACE: "An opening { is missing here.",
};

export function plainWords(message: string): string {
  const missing = /^Expecting token of type '([A-Z_]+)' but found/.exec(
    message,
  );
  if (missing) return MISSING[missing[1]] ?? "Something is missing here.";

  const stray = /^Expecting end of file but found `([^`]*)`/.exec(message);
  if (stray) {
    const found = stray[1];
    if (found === "}") {
      return "This } has no matching {. Remove it, or add the { it belongs to.";
    }
    if (found === "else") {
      return "`else` only works right after an if { ... } block.";
    }
    return `I did not expect \`${found}\` here. Check the line above, or delete it.`;
  }

  return message;
}
