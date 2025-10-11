import { FragmentLoop } from "./Fragment/FragmentLoop";
import { FragmentAlt } from "./Fragment/FragmentAlt";
import { FragmentPar } from "./Fragment/FragmentPar";
import { FragmentOpt } from "./Fragment/FragmentOpt";
import { FragmentSection } from "./Fragment/FragmentSection";
import { FragmentCritical } from "./Fragment/FragmentCritical";
import { FragmentTryCatchFinally } from "./Fragment/FragmentTryCatchFinally";
import { FragmentRef } from "./Fragment/FragmentRef";
import { Creation } from "./Creation/Creation";
import { Interaction } from "./Interaction/Interaction";
import { InteractionAsync } from "./InteractionAsync/Interaction-async";
import { Divider } from "./Divider/Divider";
import { Return } from "./Return/Return";
import Comment from "../../../../../Comment/Comment";
import { cn } from "@/utils";
import type { StatementVM } from "@/vm/types";
import { StatementKind } from "@/ir/tree-types";

export const Statement = (props: {
  vm: StatementVM;
  number?: string;
  collapsed?: boolean;
}) => {
  const vm = props.vm;
  // console.log("Statement", vm);
  const comment = vm.comment || "";
  const commentObj = new Comment(comment);

  const subProps = {
    className: cn("text-left text-sm text-skin-message", {
      hidden: props.collapsed && vm.kind !== StatementKind.Return,
    }),
    comment: comment,
    commentObj: commentObj,
    number: props.number,
  };

  switch (vm.kind) {
    case StatementKind.Loop:
      return <FragmentLoop    {...subProps} vm={vm} />;
    case StatementKind.Alt:
      return <FragmentAlt     {...subProps} vm={vm} />;
    case StatementKind.Par:
      return <FragmentPar     {...subProps} vm={vm} />;
    case StatementKind.Opt:
      return <FragmentOpt     {...subProps} vm={vm} />;
    case StatementKind.Section:
      return <FragmentSection {...subProps} vm={vm} />;
    case StatementKind.Critical:
      return <FragmentCritical {...subProps} vm={vm} />;
    case StatementKind.Tcf:
      return <FragmentTryCatchFinally {...subProps} vm={vm} />;
    case StatementKind.Ref:
      return <FragmentRef     {...subProps} vm={vm} />;
    case StatementKind.Creation:
      return <Creation        {...subProps} vm={vm} />;
    case StatementKind.Message:
      return <Interaction     {...subProps} vm={vm} />;
    case StatementKind.Async:
      return <InteractionAsync {...subProps} vm={vm} />;
    case StatementKind.Divider:
      return <Divider         {...subProps} vm={vm} />;
    case StatementKind.Return:
      return <Return          {...subProps} vm={vm} />;
  }
};
