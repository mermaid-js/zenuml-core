export enum OwnableMessageType {
  SyncMessage = 0,
  AsyncMessage = 1,
  CreationMessage = 2,
}

export interface OwnableMessage {
  from: string;
  to: string;
  signature: string;
  // The label in the rendered diagram.
  // `a->b.label`: `label`.
  // `a->b.label()`: `label`.
  // `a=b()`: `b`. Invocation.
  // `a=b`: `a=b`. Simple assignment.
  // `new A`: `«create»`.
  // `new A(1)`: `«1»`.
  label: string;
  type: OwnableMessageType;
}
