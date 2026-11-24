/**
 * Worker entry. A Workers module may export only handlers, so the constants
 * and the testable handler live in `handler.ts`.
 */
import { handleRequest, type CollectorEnv } from "./handler";

export default {
  fetch: (request: Request, env: CollectorEnv) => handleRequest(request, env),
};
