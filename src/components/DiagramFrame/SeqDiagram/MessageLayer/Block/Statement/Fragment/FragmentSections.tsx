import { useMemo } from "react";
import type { FragmentSection } from "@/parser/fragmentOf";
import { blockLength } from "@/utils/Numbering";
import { Block } from "../../Block";
import { ConditionLabel } from "./ConditionLabel";
import type { FragmentFrameLayout } from "./FragmentFrame";

const SEPARATOR = "border-t border-solid border-skin-fragment-separator mt-2";

/** The guard row above a section's block; `try` has none. */
const SectionGuard = (props: { section: FragmentSection }) => {
  const { guardKeyword, condition, conditionContext } = props.section;
  switch (guardKeyword) {
    case "try":
      return null;
    case "catch":
      return (
        <div className="header inline-block bg-skin-frame opacity-skin-guard">
          <label className="keyword catch p-1 [font-variant-caps:all-small-caps]">
            catch
          </label>
          <label className="exception p-1">{condition}</label>
        </div>
      );
    case "finally":
      return (
        <div className="header flex text-skin-fragment finally">
          <label className="keyword finally bg-skin-frame opacity-skin-guard px-1 inline-block [font-variant-caps:all-small-caps]">
            finally
          </label>
        </div>
      );
    default:
      return (
        <div className="text-skin-fragment">
          <ConditionLabel keyword={guardKeyword} condition={conditionContext} />
        </div>
      );
  }
};

/**
 * One `segment` per fragment section (if / else if / else, try / catch /
 * finally): a separator from the second section on, the guard row, then the
 * section's block. Nested messages are numbered `<number>.<n>`, where `n`
 * continues from the statements of the sections before it.
 */
export const FragmentSections = (props: {
  sections: FragmentSection[];
  number?: string;
  layout: FragmentFrameLayout;
}) => {
  const { sections, number, layout } = props;
  const firstIndexes = useMemo(() => {
    let next = 1;
    return sections.map((section) => {
      const first = next;
      next += blockLength(section.block);
      return first;
    });
  }, [sections]);

  return (
    <>
      {sections.map((section, index) => {
        const { guardKeyword, block, isLeading } = section;
        // A bare `else` / `finally` without a block draws nothing.
        if (!block && (guardKeyword === "else" || guardKeyword === "finally")) {
          return null;
        }
        return (
          <div
            key={index}
            className={isLeading ? "segment" : `segment ${SEPARATOR}`}
          >
            <SectionGuard section={section} />
            {(block || !isLeading) && (
              <Block
                origin={layout.leftParticipant}
                style={{ paddingLeft: `${layout.paddingLeft}px` }}
                context={block}
                number={`${number}.${firstIndexes[index]}`}
                incremental
              />
            )}
          </div>
        );
      })}
    </>
  );
};
