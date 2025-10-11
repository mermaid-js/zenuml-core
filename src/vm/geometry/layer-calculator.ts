/**
 * Shared layer calculation utility for arrow and fragment geometry
 */

import { StatementKind } from "@/ir/tree-types";

/**
 * Calculate layers by traversing up the statement hierarchy
 * This counts how many messages target the participant starting from the given statement
 */
export const calculateLayersFromStatement = (statement: any, participant: string): number => {
  if (!statement || !participant) return 0;
  
  let layers = 0;
  let currentStatement = statement;
  
  // Traverse up the parent chain
  while (currentStatement) {
    // Check if this statement is a message targeting the participant
    // only when it is a message or creation
    if (currentStatement.kind === StatementKind.Message || currentStatement.kind === StatementKind.Creation) {
      if (currentStatement.to === participant) {
        layers++;
      }
    }
    // Move to parent
    currentStatement = currentStatement.parent;
  }
  
  return layers;
};
