import type { InjectionKey } from "vue";

export type NodeEdge = `${string}.${"top" | "bottom" | "left" | "right"}`;

export type NodeEdges = {
  sourceEdges: Set<NodeEdge>;
  targetEdges: Set<NodeEdge>;
};

export type MountRegistration = (id: string) => void;
export type MountUnregistration = (id: string) => void;

export const RegisterMountKey: InjectionKey<MountRegistration> =
  Symbol("registerMount");
export const UnregisterMountKey: InjectionKey<MountUnregistration> =
  Symbol("unregisterMount");
