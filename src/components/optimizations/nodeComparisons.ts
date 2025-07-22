// src/components/optimizations/nodeComparisons.ts
import {
  SequenceASTNode,
  MessageNode,
  CreationNode,
} from "@/parser/types/astNode.types";

/**
 * Custom comparison function for React.memo with AST nodes
 * Compares nodes based on their identity and key properties
 */
export function areNodesEqual<T extends { node: SequenceASTNode }>(
  prevProps: T,
  nextProps: T,
): boolean {
  // If the node instances are the same, no re-render needed
  if (prevProps.node === nextProps.node) {
    return true;
  }

  // Compare key properties that would affect rendering
  const prevNode = prevProps.node;
  const nextNode = nextProps.node;

  // Check if types match
  if (prevNode.getType() !== nextNode.getType()) {
    return false;
  }

  // Check if text content matches
  if (prevNode.getText() !== nextNode.getText()) {
    return false;
  }

  // Check if range matches (position in source)
  const [prevStart, prevEnd] = prevNode.getRange();
  const [nextStart, nextEnd] = nextNode.getRange();
  if (prevStart !== nextStart || prevEnd !== nextEnd) {
    return false;
  }

  // For other props, do shallow comparison
  for (const key in prevProps) {
    if (key !== "node" && prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Specialized comparison for message nodes
 */
export function areMessageNodesEqual<T extends { node: MessageNode }>(
  prevProps: T,
  nextProps: T,
): boolean {
  // First do basic node comparison
  if (!areNodesEqual(prevProps, nextProps)) {
    return false;
  }

  const prevMsg = prevProps.node;
  const nextMsg = nextProps.node;

  // Compare message-specific properties
  return (
    prevMsg.getFrom() === nextMsg.getFrom() &&
    prevMsg.getTo() === nextMsg.getTo() &&
    prevMsg.getSignature() === nextMsg.getSignature()
  );
}

/**
 * Specialized comparison for creation nodes
 */
export function areCreationNodesEqual<T extends { node: CreationNode }>(
  prevProps: T,
  nextProps: T,
): boolean {
  // First do basic node comparison
  if (!areNodesEqual(prevProps, nextProps)) {
    return false;
  }

  const prevCreation = prevProps.node;
  const nextCreation = nextProps.node;

  // Compare creation-specific properties
  return (
    prevCreation.getOwner() === nextCreation.getOwner() &&
    prevCreation.getConstructor() === nextCreation.getConstructor() &&
    prevCreation.getAssignee() === nextCreation.getAssignee()
  );
}

/**
 * Create a custom comparison function that checks node identity first
 */
export function createNodeComparison<T extends { node: SequenceASTNode }>(
  additionalChecks?: (prevProps: T, nextProps: T) => boolean,
) {
  return (prevProps: T, nextProps: T): boolean => {
    // Identity check - if same instance, definitely equal
    if (prevProps.node === nextProps.node) {
      return true;
    }

    // Basic equality check
    if (!areNodesEqual(prevProps, nextProps)) {
      return false;
    }

    // Additional checks if provided
    if (additionalChecks) {
      return additionalChecks(prevProps, nextProps);
    }

    return true;
  };
}
