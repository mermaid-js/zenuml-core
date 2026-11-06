/**
 * Everything a per-statement geometry builder reads: the statement's vertical
 * coordinate, its return-debt adjustment, its styling-comment output, and the
 * diagram-wide lookups. buildMessages builds one per statement; the builders
 * return their geometry instead of pushing into shared arrays.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { TextType } from "@/positioning/Coordinate";
import type { ParticipantGeometry } from "./geometry";

export interface StatementContext {
  coord: StatementCoordinate;
  /** Return-debt shift added to coord.top (see computeReturnDebt). */
  adjust: number;
  /** Message-label style from a styling comment (e.g. // [red] text). */
  messageStyle: Record<string, string> | undefined;
  /** Height of the inline comment rendered above the statement (0 if none). */
  commentHeight: number;
  coordinates: Coordinates;
  participants: ParticipantGeometry[];
  measureText?: (text: string, type: TextType) => number;
  diagramWidth: number;
  /** Return-debt map from computeReturnDebt (statement key and "inner:key"). */
  adjustMap: Map<string, number>;
  /** Direct child count per parent number, for assignment-return numbers. */
  blockChildCount: Map<string, number>;
}
