export enum OwnableMessageType {
  SyncMessage = 0,
  AsyncMessage = 1,
  CreationMessage = 2,
  ReturnMessage = 3,
}

export interface OwnableMessage {
  from: string;
  to: string;
  signature: string;
  type: OwnableMessageType;
}
