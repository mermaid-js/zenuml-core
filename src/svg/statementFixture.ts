/**
 * Test fixture: parses a DSL snippet and exposes the per-statement inputs the
 * geometry builders take (StatementInfo + StatementContext), built the same way
 * buildMessages builds them.
 */
import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";
import { OrderedParticipants } from "@/parser/OrderedParticipants";
import { buildParticipants } from "./buildParticipantGeometry";
import { computeReturnDebt } from "./computeReturnDebt";
import type { StatementContext } from "./statementContext";
import { walkStatements } from "./walkStatements";
import type { StatementInfo } from "./walkStatements";

export function statementFixture(code: string) {
  const rootContext = RootContext(code)!;
  const coordinates = new Coordinates(rootContext, WidthProviderOnCanvas);
  const verticalCoordinates = new VerticalCoordinates(rootContext);
  const participants = buildParticipants(
    OrderedParticipants(rootContext),
    coordinates,
    verticalCoordinates,
    WidthProviderOnCanvas,
  );
  const statements = walkStatements(rootContext);
  const adjustMap = computeReturnDebt(statements, verticalCoordinates, 16);

  /** Context for one statement, with the same fields buildMessages passes. */
  function contextFor(
    info: StatementInfo,
    overrides: Partial<StatementContext> = {},
  ): StatementContext {
    return {
      coord: verticalCoordinates.getStatementCoordinate(info.key)!,
      adjust: adjustMap.get(info.key) || 0,
      messageStyle: undefined,
      commentHeight: 0,
      coordinates,
      participants,
      measureText: WidthProviderOnCanvas,
      diagramWidth: coordinates.getWidth(),
      adjustMap,
      blockChildCount: new Map(),
      ...overrides,
    };
  }

  return { rootContext, coordinates, participants, statements, contextFor };
}
