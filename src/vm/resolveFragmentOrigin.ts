import { getLocalParticipantNames } from "@/positioning/LocalParticipants";

export const resolveFragmentOrigin = (
  statement: any,
  fallbackOrigin: string,
): string => {
  try {
    const participants = getLocalParticipantNames(statement) || [];
    return participants[0] || fallbackOrigin;
  } catch (error) {
    console.warn("Failed to resolve fragment origin", error);
    return fallbackOrigin;
  }
};
