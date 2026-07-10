import type { Participants } from "./Participants";

/**
 * ToCollector.js exports a `sequenceParserListener` instance with one expando
 * method (`getParticipants`) attached after construction (see ToCollector.js,
 * bottom of file). TS's JS inference does not pick up properties assigned to
 * an instance of an imported class outside its constructor, so this
 * hand-written declaration file — co-located next to the .js file — is the
 * module's authoritative type for TS purposes.
 */
declare const ToCollector: {
  getParticipants(context: unknown): Participants;
};

export default ToCollector;
