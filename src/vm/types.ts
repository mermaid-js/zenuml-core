import type { CodeRange } from "@/parser/CodeRange";
import FrameBorder from "@/positioning/FrameBorder";
import type { FragmentData } from "@/ir/enrichment";
import type { DividerVM } from "./divider";
import { StatementKind } from "@/ir/tree-types";

/**
 * Arrow geometry that is attached to message view models. All values are
 * deterministic and produced by pure geometry services.
 */
export interface ArrowGeometry {
  translateX: number;
  interactionWidth: number;
  rightToLeft: boolean;
  originLayers?: number;
  sourceLayers?: number;
  targetLayers?: number;
}

/**
 * Parser-free statement references maintained by BlockVMs. They provide enough
 * metadata to resolve child view models without walking parser contexts.
 */
export interface BlockVM {
  statements: Array<{
    kind: StatementKind;
    rangeStart: number;
    frameId?: string;
  }>;
  /** Origin participant for this block context */
  origin: string;
}

/**
 * Occurrence extras capture metadata that used to live on parser contexts.
 * They are attached to messages during IR enrichment so the VM layer stays
 * parser-free.
 */
export interface RefVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface ConditionVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface AltVM {
  conditions: ConditionVM[];
  blockVMs: BlockVM[];
}

export interface LoopVM {
  condition: ConditionVM;
  blockVM: BlockVM;
}

export interface OptVM {
  condition: ConditionVM;
  blockVM: BlockVM;
}

export interface ParVM {
  conditions: ConditionVM[];
  blockVMs: BlockVM[];
}

export interface CriticalVM {
  condition?: ConditionVM;
  blockVM: BlockVM;
}

export interface SectionVM {
  condition: ConditionVM;
  blockVM: BlockVM;
}

export interface TcfVM {
  conditions: ConditionVM[];
  blockVMs: BlockVM[];
}

export type FragmentContentVM =
  | { kind: StatementKind.Alt; vm: AltVM }
  | { kind: StatementKind.Loop; vm: LoopVM }
  | { kind: StatementKind.Opt; vm: OptVM }
  | { kind: StatementKind.Par; vm: ParVM }
  | { kind: StatementKind.Critical; vm: CriticalVM }
  | { kind: StatementKind.Section; vm: SectionVM }
  | { kind: StatementKind.Tcf; vm: TcfVM }
  | { kind: StatementKind.Ref; vm: RefVM };

type FrameBorderValue = ReturnType<typeof FrameBorder>;

/**
 * Geometry and styling values used when rendering a fragment container.
 */
export interface FragmentPositioningVM {
  offsetX: number;
  paddingLeft: number;
  width: number;
  border: FrameBorderValue;
  halfLeftParticipant?: number;
  leftParticipant?: string;
}

/**
 * Normalized Message VM with computed geometry and parser-free metadata.
 */
export interface MessageVM {
  type: StatementKind;
  from?: string;
  to?: string;
  providedFrom?: string | null;
  signature: string;
  labelRange?: [number, number] | null;
  range?: [number, number] | null;
  codeRange?: CodeRange | null;
  comment?: string | null;
  isSelf: boolean;
  canEditLabel?: boolean;
  assignee?: string | null;
  statementsCount: number;
  arrow?: ArrowGeometry;
  /** Origin participant for this message context */
  origin: string;
}

export type StatementVM =
  | {
      kind: StatementKind.Message;
      comment?: string;
      data: MessageVM;
      origin: string;
    }
  | {
      kind: StatementKind.Async;
      comment?: string;
      data: MessageVM;
      origin: string;
    }
  | {
      kind: StatementKind.Creation;
      comment?: string;
      data: MessageVM;
      origin: string;
    }
  | {
      kind: StatementKind.Return;
      comment?: string;
      data: MessageVM;
      origin: string;
    }
  | {
      kind: StatementKind.Divider;
      comment?: string;
      data: DividerVM;
      origin: string;
    }
  | {
      kind: StatementKind.Alt;
      comment?: string;
      data: AltVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Loop;
      comment?: string;
      data: LoopVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Opt;
      comment?: string;
      data: OptVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Par;
      comment?: string;
      data: ParVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Critical;
      comment?: string;
      data: CriticalVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Section;
      comment?: string;
      data: SectionVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Tcf;
      comment?: string;
      data: TcfVM;
      fragmentData: FragmentData;
      origin: string;
    }
  | {
      kind: StatementKind.Ref;
      comment?: string;
      data: RefVM;
      fragmentData: FragmentData;
      origin: string;
    };

/**
 * Convenience structure when both content and positioning VMs are required for
 * fragment rendering.
 */
export interface FragmentVM {
  fragmentData: FragmentData;
  content: FragmentContentVM;
  positioning: FragmentPositioningVM;
}

/** Map helpers for quick lookup by range identifiers. */
export type MessageVMMap = Record<number, MessageVM>;
export type DividerVMMap = Record<number, DividerVM>;
export type FragmentVMMap = Record<string, FragmentVM>;

export type { FragmentData } from "@/ir/enrichment";
