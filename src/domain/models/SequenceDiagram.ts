/**
 * Domain Models for Sequence Diagrams
 * These models represent the conceptual structure of a sequence diagram,
 * independent of parsing or rendering concerns.
 */

export interface SequenceDiagram {
  title?: string;
  participants: Map<string, Participant>;
  interactions: Interaction[];
  fragments: Fragment[];
  rootBlock: Block;
}

export interface Participant {
  id: string;
  name: string;
  label?: string;
  type: ParticipantType;
  stereotype?: string;
  width?: number;
  color?: string;
  group?: string;
  order: number;  // Explicit ordering
  style?: {
    backgroundColor?: string;
    color?: string;
  };
}

export enum ParticipantType {
  PARTICIPANT = 'participant',
  ACTOR = 'actor',
  BOUNDARY = 'boundary',
  CONTROL = 'control',
  ENTITY = 'entity',
  DATABASE = 'database',
  COLLECTIONS = 'collections',
  QUEUE = 'queue'
}

export interface Interaction {
  id: string;
  type: InteractionType;
  from: string;  // Participant ID
  to: string;    // Participant ID
  message: string;
  signature?: MethodSignature;
  returnValue?: string;
  children?: Interaction[];  // Nested interactions
  parent?: string;  // Parent interaction ID
}

export enum InteractionType {
  SYNC = 'sync',
  ASYNC = 'async',
  CREATE = 'create',
  RETURN = 'return'
}

export interface MethodSignature {
  name: string;
  parameters: Parameter[];
  isStatic?: boolean;
  isAsync?: boolean;
}

export interface Parameter {
  name?: string;
  type?: string;
  value?: string;
}

export interface Fragment {
  id: string;
  type: FragmentType;
  condition?: string;  // For alt, opt, loop
  sections: FragmentSection[];
  parent?: string;  // Parent fragment ID for nesting
  comment?: string;  // Comment text for the fragment
  style?: MessageStyle;  // Style for the fragment
}

export enum FragmentType {
  ALT = 'alt',
  OPT = 'opt',
  LOOP = 'loop',
  PAR = 'par',
  CRITICAL = 'critical',
  SECTION = 'section',
  REF = 'ref',
  TRY_CATCH = 'try-catch'
}

export interface FragmentSection {
  label?: string;  // e.g., "else", "catch", "finally"
  condition?: string;
  block: Block;
}

export interface Block {
  id: string;
  statements: Statement[];
}

export type Statement = 
  | InteractionStatement
  | FragmentStatement
  | DividerStatement
  | CommentStatement;

export interface InteractionStatement {
  type: 'interaction';
  interactionId: string;
}

export interface FragmentStatement {
  type: 'fragment';
  fragmentId: string;
}

export interface DividerStatement {
  type: 'divider';
  text: string;
  style?: MessageStyle;
}

export interface MessageStyle {
  textStyle?: any;
  classNames?: string[];
}

export interface CommentStatement {
  type: 'comment';
  text: string;
  style?: any;
}