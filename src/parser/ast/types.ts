// Core AST Types for ZenUML
// Decouples rendering logic from ANTLR context dependencies

export interface SourceRange {
  readonly start: Position;
  readonly end: Position;
  readonly text: string;
}

export interface Position {
  readonly line: number;
  readonly column: number;
  readonly offset: number;
}

// Base AST Node
export interface ASTNode {
  readonly type: string;
  readonly id: string;
  readonly sourceRange: SourceRange;
  readonly parent?: ASTNode;
}

// Assignment information for return values
export interface AssignmentInfo {
  readonly assignee: string;
  readonly dataType?: string;
}

// Message AST Node
export interface MessageNode extends ASTNode {
  readonly type: 'sync-message' | 'async-message' | 'creation' | 'return';
  readonly from: string;                  // Source participant name
  readonly to: string;                    // Target participant name
  readonly signature: string;             // Message signature/text
  readonly assignment?: AssignmentInfo;   // Return value assignment
  readonly statements?: MessageNode[];    // Nested messages (no separate block nodes)
  
  // Computed properties for rendering
  readonly isSelfMessage: boolean;        // from === to
  readonly origin: string;               // Originating participant context
}

// Error recovery node for malformed messages
export interface ErrorNode extends ASTNode {
  readonly type: 'error';
  readonly message: string;
  readonly originalError?: Error;
  readonly partialData?: {
    readonly rawText: string;
    readonly extractedSignature?: string;
    readonly extractedFrom?: string;
    readonly extractedTo?: string;
  };
}

// Union type for statements (for now just messages and errors)
export type StatementNode = MessageNode | ErrorNode;

// Document root (simplified for message-focused implementation)
export interface DocumentAST extends ASTNode {
  readonly type: 'document';
  readonly statements: StatementNode[];
}