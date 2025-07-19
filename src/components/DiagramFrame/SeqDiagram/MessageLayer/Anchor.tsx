import { diagramElementAtom, dragAnchorAtom, scaleAtom } from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";

const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="life-line-anchor invisible"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z" />
  </svg>
);

export const Anchor = (props: {
  context: any;
  participant: string;
  index?: number;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const scale = useAtomValue(scaleAtom) || 0;
  const diagramElement = useAtomValue(diagramElementAtom);
  const setAnchor = useSetAtom(dragAnchorAtom);
  return (
    <div className="relative w-6 h-6 -my-1 -ml-[12.5px]">
      <div
        className="text-sky-500 cursor-pointer absolute w-6 h-6 inline-flex justify-center items-center pointer-events-auto [&:hover>svg]:visible  overflow-hidden"
        ref={elRef}
        onMouseDown={(e) => {
          e.stopPropagation();
          const {
            left = 0,
            top = 0,
            height = 0,
          } = elRef.current?.getBoundingClientRect() || {};
          const diagramRect = diagramElement?.getBoundingClientRect();
          setAnchor({
            context: props.context,
            index: props.index,
            participant: props.participant,
            x: (left - (diagramRect?.left || 0)) / scale,
            y: (top + height / 2 - (diagramRect?.top || 0)) / scale,
          });
        }}
      >
        {icon}
      </div>
    </div>
  );
};
