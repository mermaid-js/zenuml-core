export interface ParticipantDepth {
  participant: string;
  depth: number;
  layers: number;
}

export interface ParticipantDepthInfo {
  origin: ParticipantDepth;
  source: ParticipantDepth;
  target: ParticipantDepth;
}
