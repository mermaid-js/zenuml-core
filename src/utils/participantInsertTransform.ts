import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { specialCharRegex } from "@/utils/messageNormalizers";

export type ParticipantInsertType =
  | "default"
  | "Actor"
  | "Boundary"
  | "Control"
  | "Entity"
  | "Database"
  | "Queue";

type InsertParticipantInput = {
  code: string;
  rootContext: any;
  insertIndex: number;
  name: string;
  type: ParticipantInsertType;
  /** Style an already inferred participant while materializing the header. */
  materializeExisting?: boolean;
  color?: string | null;
};

const normalizeName = (text: string) => {
  let next = text.trim().replace(/\s+/g, " ");
  if (specialCharRegex.test(next)) {
    next = next.replace(/"/g, "");
    next = `"${next}"`;
    specialCharRegex.lastIndex = 0;
  }
  return next;
};

const formatParticipantDeclaration = (participant: {
  name: string;
  label?: string;
  type?: string;
  stereotype?: string;
  color?: string;
  emoji?: string;
}) => {
  const parts: string[] = [];
  if (participant.type) {
    parts.push(`@${participant.type}`);
  }
  if (participant.stereotype) {
    parts.push(`<<${participant.stereotype}>>`);
  }
  if (participant.emoji) {
    parts.push(`[${participant.emoji}]`);
  }
  parts.push(normalizeName(participant.name));
  if (participant.label && participant.label !== participant.name) {
    parts.push(`as ${normalizeName(participant.label)}`);
  }
  if (participant.color) {
    parts.push(participant.color);
  }
  return parts.join(" ");
};

const buildParticipantLines = (
  rootContext: any,
  insertIndex: number,
  name: string,
  type: ParticipantInsertType,
  materializeExisting: boolean,
  color?: string | null,
) => {
  const current = OrderedParticipants(rootContext)
    .filter((participant) => participant.name !== _STARTER_)
    .map((participant) => ({
      name: participant.name,
      label: participant.label,
      type: participant.type,
      stereotype: participant.stereotype,
      color: participant.color,
      emoji: participant.emoji,
    }));

  const declaration = {
    name,
    label: undefined,
    type: type === "default" ? undefined : type,
    stereotype: undefined,
    color: color ?? undefined,
    emoji: undefined,
  };
  if (materializeExisting) {
    const index = current.findIndex((participant) => participant.name === name);
    if (index >= 0) {
      current[index] = {
        ...current[index],
        type: declaration.type,
        color: declaration.color,
      };
    }
  } else {
    current.splice(insertIndex, 0, declaration);
  }

  return current.map(formatParticipantDeclaration).join("\n");
};

export const insertParticipantIntoDsl = ({
  code,
  rootContext,
  insertIndex,
  name,
  type,
  materializeExisting = false,
  color,
}: InsertParticipantInput) => {
  const participantLines = buildParticipantLines(
    rootContext,
    insertIndex,
    name,
    type,
    materializeExisting,
    color,
  );
  const head = rootContext?.head?.();
  const block = rootContext?.block?.();
  const title = rootContext?.title?.();

  if (head) {
    const headStart = head.start.start;
    const headEnd = head.stop.stop + 1;
    const starter = head.starterExp?.();
    const starterText = starter
      ? code.slice(starter.start.start, starter.stop.stop + 1)
      : "";
    const nextHead = starterText
      ? `${participantLines}\n${starterText}`
      : participantLines;
    return code.slice(0, headStart) + nextHead + code.slice(headEnd);
  }

  const insertionPoint = block
    ? block.start.start
    : title
      ? title.stop.stop + 1
      : 0;
  const prefix = code.slice(0, insertionPoint);
  const suffix = code.slice(insertionPoint);
  const separator = prefix.length > 0 && !prefix.endsWith("\n") ? "\n" : "";
  return `${prefix}${separator}${participantLines}\n${suffix}`;
};
