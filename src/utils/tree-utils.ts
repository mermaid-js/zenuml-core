/**
 * Tree Structure Utility Functions
 *
 * Provides utilities for traversal, manipulation, and analysis of tree IR structures
 */

import {
  IRTree,
  IRStatement,
  IRBlock,
  IRMessage,
  IRFragment,
  StatementKind,
  StatementData,
} from '@/ir/tree-types';

// ============================================================================
// Tree Traversal Utilities
// ============================================================================

/**
 * Traverse tree in depth-first order, calling visitor for each statement
 */
export function traverseTree(
  tree: IRTree,
  visitor: (statement: IRStatement, depth: number, path: string) => void
): void {
  traverseBlock(tree.root, visitor, 0, 'root');
}

/**
 * Traverse block in depth-first order
 */
export function traverseBlock(
  block: IRBlock,
  visitor: (statement: IRStatement, depth: number, path: string) => void,
  depth: number = 0,
  basePath: string = ''
): void {
  block.statements.forEach((statement, index) => {
    const path = `${basePath}.statements[${index}]`;
    visitor(statement, depth, path);

    // Traverse children if present
    if (statement.children) {
      traverseBlock(statement.children, visitor, depth + 1, `${path}.children`);
    }

    // Traverse fragment blocks if present
    if (statement.kind === StatementKind.Fragment) {
      const fragment = statement.data as IRFragment;
      fragment.blocks.forEach((fragmentBlock, blockIndex) => {
        traverseBlock(
          fragmentBlock,
          visitor,
          depth + 1,
          `${path}.data.blocks[${blockIndex}]`
        );
      });
    }
  });
}

/**
 * Find all statements matching a predicate
 */
export function findStatements(
  tree: IRTree,
  predicate: (statement: IRStatement) => boolean
): IRStatement[] {
  const results: IRStatement[] = [];

  traverseTree(tree, (statement) => {
    if (predicate(statement)) {
      results.push(statement);
    }
  });

  return results;
}

/**
 * Find the first statement matching a predicate
 */
export function findStatement(
  tree: IRTree,
  predicate: (statement: IRStatement) => boolean
): IRStatement | undefined {
  let result: IRStatement | undefined;

  traverseTree(tree, (statement) => {
    if (!result && predicate(statement)) {
      result = statement;
    }
  });

  return result;
}

// ============================================================================
// Statement Type Predicates
// ============================================================================

/**
 * Check if statement is a message type
 */
export function isMessageStatement(statement: IRStatement): statement is IRStatement & { data: IRMessage } {
  return [StatementKind.Message, StatementKind.Async, StatementKind.Creation, StatementKind.Return].includes(statement.kind);
}

/**
 * Check if statement is a fragment
 */
export function isFragmentStatement(statement: IRStatement): statement is IRStatement & { data: IRFragment } {
  return statement.kind === StatementKind.Fragment;
}

/**
 * Check if statement is a divider
 */
export function isDividerStatement(statement: IRStatement): boolean {
  return statement.kind === StatementKind.Divider;
}

/**
 * Check if statement has nested content
 */
export function hasNestedContent(statement: IRStatement): boolean {
  return !!statement.children || isFragmentStatement(statement);
}

// ============================================================================
// Tree Analysis Utilities
// ============================================================================

/**
 * Get maximum nesting depth of the tree
 */
export function getMaxDepth(tree: IRTree): number {
  let maxDepth = 0;

  traverseTree(tree, (_, depth) => {
    maxDepth = Math.max(maxDepth, depth);
  });

  return maxDepth;
}

/**
 * Count total number of statements in tree
 */
export function countStatements(tree: IRTree): number {
  let count = 0;

  traverseTree(tree, () => {
    count++;
  });

  return count;
}

/**
 * Count statements by kind
 */
export function countStatementsByKind(tree: IRTree): Record<StatementKind, number> {
  const counts: Record<StatementKind, number> = {
    message: 0,
    async: 0,
    creation: 0,
    return: 0,
    fragment: 0,
    divider: 0,
  };

  traverseTree(tree, (statement) => {
    counts[statement.kind]++;
  });

  return counts;
}

/**
 * Get all participants referenced in messages
 */
export function getReferencedParticipants(tree: IRTree): Set<string> {
  const participants = new Set<string>();

  traverseTree(tree, (statement) => {
    if (isMessageStatement(statement)) {
      const message = statement.data;
      if (message.from) participants.add(message.from);
      if (message.to) participants.add(message.to);
    }
  });

  return participants;
}

/**
 * Find all messages between specific participants
 */
export function findMessagesBetween(
  tree: IRTree,
  participant1: string,
  participant2: string
): IRStatement[] {
  return findStatements(tree, (statement) => {
    if (!isMessageStatement(statement)) return false;
    const message = statement.data;
    return (message.from === participant1 && message.to === participant2) ||
           (message.from === participant2 && message.to === participant1);
  });
}

/**
 * Find all fragments of a specific type
 */
export function findFragmentsByType(
  tree: IRTree,
  fragmentType: string
): IRStatement[] {
  return findStatements(tree, (statement) => {
    return isFragmentStatement(statement) && statement.data.type === fragmentType;
  });
}

// ============================================================================
// Tree Manipulation Utilities
// ============================================================================

/**
 * Deep clone a tree structure
 */
export function cloneTree(tree: IRTree): IRTree {
  return {
    title: tree.title,
    participants: tree.participants.map(p => ({ ...p })),
    groups: tree.groups.map(g => ({ ...g, participants: [...g.participants] })),
    root: cloneBlock(tree.root),
  };
}

/**
 * Deep clone a block structure
 */
export function cloneBlock(block: IRBlock): IRBlock {
  return {
    statements: block.statements.map(cloneStatement),
  };
}

/**
 * Deep clone a statement structure
 */
export function cloneStatement(statement: IRStatement): IRStatement {
  const cloned: IRStatement = {
    kind: statement.kind,
    data: cloneStatementData(statement.data),
  };

  if (statement.range) {
    cloned.range = [...statement.range] as [number, number];
  }

  if (statement.codeRange) {
    cloned.codeRange = {
      start: { ...statement.codeRange.start },
      end: { ...statement.codeRange.end },
    };
  }

  if (statement.comment) {
    cloned.comment = statement.comment;
  }

  if (statement.children) {
    cloned.children = cloneBlock(statement.children);
  }

  return cloned;
}

/**
 * Deep clone statement data
 */
function cloneStatementData(data: StatementData): StatementData {
  if ('signature' in data) {
    // Message data
    const message = data as IRMessage;
    return {
      from: message.from,
      to: message.to,
      signature: message.signature,
      type: message.type,
      labelRange: message.labelRange ? [...message.labelRange] as [number, number] : undefined,
      providedFrom: message.providedFrom,
      assignee: message.assignee,
      statementsCount: message.statementsCount,
    };
  } else if ('blocks' in data) {
    // Fragment data
    const fragment = data as IRFragment;
    return {
      type: fragment.type,
      condition: fragment.condition,
      blocks: fragment.blocks.map(cloneBlock),
    };
  } else {
    // Divider data
    return { ...data };
  }
}

/**
 * Filter statements in tree based on predicate
 */
export function filterStatements(
  tree: IRTree,
  predicate: (statement: IRStatement) => boolean
): IRTree {
  const filtered = cloneTree(tree);
  filtered.root = filterStatementsInBlock(filtered.root, predicate);
  return filtered;
}

/**
 * Filter statements in block based on predicate
 */
function filterStatementsInBlock(
  block: IRBlock,
  predicate: (statement: IRStatement) => boolean
): IRBlock {
  return {
    statements: block.statements
      .filter(predicate)
      .map(statement => {
        const filtered = { ...statement };

        if (filtered.children) {
          filtered.children = filterStatementsInBlock(filtered.children, predicate);
        }

        if (isFragmentStatement(filtered)) {
          const fragment = filtered.data;
          filtered.data = {
            ...fragment,
            blocks: fragment.blocks.map(b => filterStatementsInBlock(b, predicate)),
          };
        }

        return filtered;
      }),
  };
}

// ============================================================================
// Tree Comparison Utilities
// ============================================================================

/**
 * Compare two trees for structural equality
 */
export function treesEqual(tree1: IRTree, tree2: IRTree): boolean {
  // Compare basic properties
  if (tree1.title !== tree2.title) return false;
  if (tree1.participants.length !== tree2.participants.length) return false;
  if (tree1.groups.length !== tree2.groups.length) return false;

  // Compare participants
  for (let i = 0; i < tree1.participants.length; i++) {
    if (!participantsEqual(tree1.participants[i], tree2.participants[i])) {
      return false;
    }
  }

  // Compare groups
  for (let i = 0; i < tree1.groups.length; i++) {
    if (!groupsEqual(tree1.groups[i], tree2.groups[i])) {
      return false;
    }
  }

  // Compare root blocks
  return blocksEqual(tree1.root, tree2.root);
}

/**
 * Compare two blocks for structural equality
 */
export function blocksEqual(block1: IRBlock, block2: IRBlock): boolean {
  if (block1.statements.length !== block2.statements.length) return false;

  for (let i = 0; i < block1.statements.length; i++) {
    if (!statementsEqual(block1.statements[i], block2.statements[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Compare two statements for structural equality
 */
export function statementsEqual(stmt1: IRStatement, stmt2: IRStatement): boolean {
  if (stmt1.kind !== stmt2.kind) return false;
  if (stmt1.comment !== stmt2.comment) return false;

  // Compare ranges
  if (stmt1.range && stmt2.range) {
    if (stmt1.range[0] !== stmt2.range[0] || stmt1.range[1] !== stmt2.range[1]) {
      return false;
    }
  } else if (stmt1.range !== stmt2.range) {
    return false;
  }

  // Compare data (simplified - would need detailed comparison for each type)
  if (!dataEqual(stmt1.data, stmt2.data)) return false;

  // Compare children
  if (stmt1.children && stmt2.children) {
    return blocksEqual(stmt1.children, stmt2.children);
  } else if (stmt1.children !== stmt2.children) {
    return false;
  }

  return true;
}

// Helper functions for comparison
function participantsEqual(p1: any, p2: any): boolean {
  return p1.name === p2.name && p1.displayName === p2.displayName && p1.stereotype === p2.stereotype;
}

function groupsEqual(g1: any, g2: any): boolean {
  return g1.name === g2.name &&
         g1.participants.length === g2.participants.length &&
         g1.participants.every((p: string, i: number) => p === g2.participants[i]);
}

function dataEqual(data1: StatementData, data2: StatementData): boolean {
  // Simplified comparison - in practice, would need detailed type-specific comparison
  return JSON.stringify(data1) === JSON.stringify(data2);
}

// ============================================================================
// Tree Debugging Utilities
// ============================================================================

/**
 * Generate a human-readable representation of the tree structure
 */
export function treeToString(tree: IRTree, includeData = false): string {
  const lines: string[] = [];

  lines.push(`IRTree (${tree.participants.length} participants, ${tree.groups.length} groups)`);
  if (tree.title) {
    lines.push(`  Title: ${tree.title}`);
  }

  lines.push(`  Participants: ${tree.participants.map(p => p.name).join(', ')}`);

  if (tree.groups.length > 0) {
    lines.push(`  Groups: ${tree.groups.map(g => g.name).join(', ')}`);
  }

  lines.push('  Root:');
  lines.push(...blockToStringLines(tree.root, 2, includeData));

  return lines.join('\n');
}

/**
 * Generate string lines for a block
 */
function blockToStringLines(block: IRBlock, indent: number, includeData: boolean): string[] {
  const lines: string[] = [];
  const prefix = ' '.repeat(indent);

  if (block.statements.length === 0) {
    lines.push(`${prefix}(empty block)`);
  } else {
    block.statements.forEach((statement, index) => {
      lines.push(`${prefix}[${index}] ${statement.kind}`);

      if (includeData) {
        if (isMessageStatement(statement)) {
          const msg = statement.data;
          lines.push(`${prefix}    ${msg.from || '?'} -> ${msg.to || '?'}: ${msg.signature}`);
        } else if (isFragmentStatement(statement)) {
          const frag = statement.data;
          lines.push(`${prefix}    ${frag.type}${frag.condition ? ` (${frag.condition})` : ''} - ${frag.blocks.length} blocks`);
        }
      }

      if (statement.children) {
        lines.push(`${prefix}  children:`);
        lines.push(...blockToStringLines(statement.children, indent + 4, includeData));
      }

      if (isFragmentStatement(statement)) {
        const fragment = statement.data;
        fragment.blocks.forEach((fragBlock, blockIndex) => {
          lines.push(`${prefix}  block[${blockIndex}]:`);
          lines.push(...blockToStringLines(fragBlock, indent + 4, includeData));
        });
      }
    });
  }

  return lines;
}

/**
 * Convert tree to JSON with circular reference handling
 */
export function treeToJSON(tree: IRTree): string {
  return JSON.stringify(tree, null, 2);
}

/**
 * Get tree statistics
 */
export function getTreeStats(tree: IRTree): {
  totalStatements: number;
  maxDepth: number;
  statementCounts: Record<StatementKind, number>;
  participantCount: number;
  groupCount: number;
  referencedParticipants: number;
} {
  return {
    totalStatements: countStatements(tree),
    maxDepth: getMaxDepth(tree),
    statementCounts: countStatementsByKind(tree),
    participantCount: tree.participants.length,
    groupCount: tree.groups.length,
    referencedParticipants: getReferencedParticipants(tree).size,
  };
}