/**
 * Layout Models - Geometric representation for rendering
 * These models contain all positioning and sizing information needed for rendering,
 * computed from the domain models.
 */

export interface DiagramLayout {
  width: number;
  height: number;
  participants: ParticipantLayout[];
  lifelines: LifelineLayout[];
  interactions: InteractionLayout[];
  fragments: FragmentLayout[];
  activations: ActivationLayout[];
  dividers: DividerLayout[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParticipantLayout {
  participantId: string;
  bounds: BoundingBox;
  labelBounds: BoundingBox;
  lifelineX: number;  // Center X position for lifeline
  // Additional properties for rendering
  label: string;
  type?: string;
  stereotype?: string;
  isAssignee?: boolean;
  style?: {
    backgroundColor?: string;
    color?: string;
  };
  labelPositions?: [number, number][];
  assigneePositions?: [number, number][];
}

export interface LifelineLayout {
  participantId: string;
  x: number;
  startY: number;
  endY: number;
}

export interface InteractionLayout {
  interactionId: string;
  type: 'sync' | 'async' | 'create' | 'return';
  from: string;
  to: string;
  message: string;
  startPoint: Point;
  endPoint: Point;
  labelBounds: BoundingBox;
  arrowStyle: ArrowStyle;
  rightToLeft?: boolean;
  isSelfMessage?: boolean;
  assignee?: string;
  translateX?: number;
  width?: number;
  children?: InteractionLayout[];  // For nested calls
}

export interface Point {
  x: number;
  y: number;
}

export interface ArrowStyle {
  lineType: 'solid' | 'dashed';
  arrowHead: 'filled' | 'open';
  selfMessage?: {
    width: number;
    height: number;
  };
}

export interface FragmentLayout {
  fragmentId: string;
  type: string;
  bounds: BoundingBox;
  headerBounds: BoundingBox;
  sections: FragmentSectionLayout[];
  nestingLevel: number;  // For border calculation
  comment?: string;
  style?: {
    textStyle?: any;
    classNames?: string[];
  };
  paddingLeft?: number;  // Internal padding for content
  transform?: string;  // CSS transform for positioning
}

export interface FragmentSectionLayout {
  bounds: BoundingBox;
  labelBounds?: BoundingBox;
  contentOffset: Point;  // Offset for nested content
  label?: string;  // e.g., "else", "else if", "catch"
  condition?: string;  // Condition text for this section
}

export interface ActivationLayout {
  participantId: string;
  bounds: BoundingBox;
  level: number;  // Nesting level for stacked activations
}

export interface DividerLayout {
  bounds: BoundingBox;
  labelBounds: BoundingBox;
  text: string;
  style?: {
    textStyle?: any;
    classNames?: string[];
  };
}

/**
 * Layout constraints used during calculation
 */
export interface LayoutConstraints {
  minParticipantWidth: number;
  participantPadding: number;
  interactionHeight: number;
  fragmentPadding: number;
  activationWidth: number;
  selfMessageWidth: number;
}

/**
 * Layout calculation result with debugging info
 */
export interface LayoutResult {
  layout: DiagramLayout;
  constraints: ConstraintViolation[];
  warnings: LayoutWarning[];
}

export interface ConstraintViolation {
  type: 'overlap' | 'overflow' | 'underflow';
  message: string;
  elements: string[];  // IDs of affected elements
}

export interface LayoutWarning {
  type: 'truncated' | 'adjusted';
  message: string;
  elementId: string;
}