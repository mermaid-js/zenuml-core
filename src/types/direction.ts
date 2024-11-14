export interface DirectionData {
  source: number;
  target: number;
}

export interface DirectionMethods {
  distance(source: number, target: number): number;
}

export interface DirectionComputed {
  rightToLeft: boolean;
}

// This type combines all the interfaces above for use in components
export type DirectionMixinType = DirectionData &
  DirectionMethods &
  DirectionComputed;
