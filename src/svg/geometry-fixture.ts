// src/svg/geometry-fixture.ts

export interface FixtureParticipant {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FixtureMessage {
  label: string;
  fromX: number;
  toX: number;
  y: number;
}

export interface FixtureSelfCall {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FixtureOccurrence {
  participant: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FixtureReturn {
  label: string;
  fromX: number;
  toX: number;
  y: number;
}

export interface FixtureCreation {
  participantName: string;
  px: number;
  py: number;
  pw: number;
  ph: number;
  msgFromX: number;
  msgToX: number;
  msgY: number;
}

export interface FixtureFragment {
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Condition label (e.g. "[true]") position — x/y relative to container */
  conditionLabel?: string;
  conditionX?: number;
  conditionY?: number;
  /** Rendered width of the full condition text (e.g., "[true]") in px */
  conditionTextWidth?: number;
  sections: { label: string; y: number; height: number }[];
}

export interface FixtureDivider {
  y: number;
  label: string;
}

export interface FixtureComment {
  text: string;
  x: number;
  y: number;
}

export interface FixtureLifeline {
  participant: string;
  x: number;
  y1: number;
  y2: number;
}

export interface GeometryFixture {
  case: string;
  code: string;
  anchor: { participant: string; bottom: number };
  frameHeight?: number;
  participants: FixtureParticipant[];
  messages: FixtureMessage[];
  selfCalls: FixtureSelfCall[];
  occurrences: FixtureOccurrence[];
  returns: FixtureReturn[];
  creations: FixtureCreation[];
  fragments: FixtureFragment[];
  dividers: FixtureDivider[];
  comments: FixtureComment[];
  lifelines: FixtureLifeline[];
}
