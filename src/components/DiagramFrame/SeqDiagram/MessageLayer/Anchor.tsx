import { diagramElementAtom, dragAnchorAtom, scaleAtom } from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";

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
    <div
      className="inline-block text-sky-500 -ml-3"
      ref={elRef}
      onMouseDown={(e) => {
        e.stopPropagation();
        const {
          left = 0,
          top = 0,
          width = 0,
          height = 0,
        } = elRef.current?.getBoundingClientRect() || {};
        const diagramRect = diagramElement?.getBoundingClientRect();
        setAnchor({
          context: props.context,
          index: props.index,
          participant: props.participant,
          x: (left + width / 2 - (diagramRect?.left || 0)) / scale,
          y: (top + height / 2 - (diagramRect?.top || 0)) / scale,
        });
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="pointer-events-auto life-line-anchor"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z" />
      </svg>
    </div>
  );
};
