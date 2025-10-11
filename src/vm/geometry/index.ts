/**
 * Barrel file for VM geometry services. Concrete implementations will be
 * introduced in subsequent tasks as part of the IR–VM separation refactor.
 */
export {
  createArrowGeometryService,
  calculateArrowGeometry,
} from "./arrow";

export type { ArrowGeometryService, ArrowGeometryInput } from "./arrow";
