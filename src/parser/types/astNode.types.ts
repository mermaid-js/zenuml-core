export interface ASTNode {
  type: string;
  range: [number, number];
  parent?: ASTNode;
  children: ASTNode[];
}

export interface SequenceASTNode extends ASTNode {
  // // Core sequence diagram node types
  // isProgram(): boolean;
  // isParticipant(): boolean;
  // isMessage(): boolean;
  // isCreation(): boolean;
  // isAsyncMessage(): boolean;
  // isReturn(): boolean;
  // isFragment(): boolean;

  // Navigation methods
  getType(): string;
  getParent(): ASTNode | null;
  getChildren(): ASTNode[];
  // findAncestor(predicate: (node: ASTNode) => boolean): ASTNode | null;

  // Content access
  getRange(): [number, number];
  getText(): string;
  // getFormattedText(): string;
}

// Specific node types
export interface MessageNode extends SequenceASTNode {
  getFrom(): string | null;
  getTo(): string | null;
  getSignature(): string;
  getOwner(): string | null;
  getOrigin(): string | null;
  hasAssignment(): boolean;
  getAssignment(): string | null;
  isCurrent(cursor: number): boolean;
  getStatements(): SequenceASTNode[];
}

export interface ToNode extends SequenceASTNode {}

export interface FromNode extends SequenceASTNode {}


export interface FromNode extends SequenceASTNode {}

export interface RefNode extends SequenceASTNode {}


export interface ParameterNode extends SequenceASTNode {}

export interface ConditionNode extends SequenceASTNode {}

export interface GroupNode extends SequenceASTNode {}

export interface RetNode extends SequenceASTNode {}

export interface ToNode extends SequenceASTNode {}

export interface ParametersNode extends SequenceASTNode {}


export interface CreationNode extends SequenceASTNode {
  getConstructor(): string;
  getAssignee(): string | null;
  getAssigneePosition(): [number, number] | null;
  getOwner(): string;
  getFrom(): string | null;
  getSignature(): string;
  isCurrent(cursor: number): boolean;
  getStatements(): SequenceASTNode[];
}

export interface ParticipantNode extends SequenceASTNode {
  getName(): string;
  getStereotype(): string | null;
  getLabel(): string | null;
  getWidth(): number | null;
  getColor(): string | null;
  getGroupId(): string | null;
  getComment():  string | null;
  isExplicit(): boolean;
  isStarter(): boolean;
}

export interface AsyncMessageNode extends SequenceASTNode {
  getFrom(): string | null;
  getTo(): string | null;
  getContent(): string;
  getSignature(): string;
  getProvidedFrom(): string | null;
  isCurrent(cursor: number): boolean;
}

export interface FragmentNode extends SequenceASTNode {
  getFragmentType():
    | "alt"
    | "opt"
    | "loop"
    | "par"
    | "critical"
    | "section"
    | "tcf"
    | "ref";
  getCondition(): string | null;
  getStatements(): SequenceASTNode[];
  getBraceBlock(): SequenceASTNode | null;
}

export interface DividerNode extends SequenceASTNode {
  getNote(): string | null;
  isCurrent(cursor: number): boolean;
}

export interface RetNode extends SequenceASTNode {
  getFrom(): string | null;
  getTo(): string | null;
  getExpression(): string | null;
  getAsyncMessage(): string | null;
  isCurrent(cursor: number): boolean;
}

export type ASTNodeType = 'MessageNode' | 'ToNode' | 'FromNode' | 'ParticipantNode' | 'CreationNode' | 'AsyncMessageNode' | 'FragmentNode' | 'DividerNode' | 'RetNode' | 'GroupNode' | 'RefNode' | 'ParameterNode' | 'ConditionNode' | 'ParametersNode'
