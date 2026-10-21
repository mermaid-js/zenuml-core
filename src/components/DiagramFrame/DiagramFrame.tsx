import {
  paletteAtom,
  rootContextAtom,
  scaleAtom,
  themeAtom,
} from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";
import {
  PropsWithChildren,
  RefObject,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "@/utils";
import { DIAGRAM_HEADER_HEIGHT } from "@/positioning/Constants";
import { paletteCssVariables } from "@/surface";
import { exportCanvas, exportSvg } from "@/exportBackground";
import type { ExportOptions } from "@/exportBackground";
import { Debug } from "./Debug";
import { DiagramTitle } from "./DiagramTitle";
import { SeqDiagram } from "./SeqDiagram/SeqDiagram";

export const DiagramFrame = ({
  ref,
  children,
}: PropsWithChildren<{
  ref?: RefObject<{
    toPng: (options?: ExportOptions) => Promise<string | undefined>;
    toSvg: (options?: ExportOptions) => Promise<string | undefined>;
    toBlob: (options?: ExportOptions) => Promise<Blob | null | undefined>;
    toJpeg: (options?: ExportOptions) => Promise<string | undefined>;
    zoomIn: () => void;
    zoomOut: () => void;
  }>;
}>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootContext = useAtomValue(rootContextAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const palette = useAtomValue(paletteAtom);
  const title = rootContext?.title();

  const toPng = async (options?: ExportOptions) => {
    if (!containerRef.current) return;
    return (await exportCanvas(containerRef.current, options)).toDataURL(
      "image/png",
    );
  };
  const toSvg = async (options?: ExportOptions) => {
    if (!containerRef.current) return;
    return exportSvg(containerRef.current, options);
  };
  const toBlob = async (options?: ExportOptions) => {
    if (!containerRef.current) return;
    const canvas = await exportCanvas(containerRef.current, options);
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
  };
  const toJpeg = async (options?: ExportOptions) => {
    if (!containerRef.current) return;
    return (
      await exportCanvas(containerRef.current, {
        backingColor: options?.backingColor ?? "white",
      })
    ).toDataURL("image/jpeg");
  };
  const zoomIn = () => {
    const newScale = Math.min(1, scale + 0.1);
    setScale(newScale);
  };
  const zoomOut = () => {
    setScale(scale - 0.1);
  };
  const setStyle = (style: string) => {
    const styleElementId = "zenuml-style";
    const styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.append(styleElement);
    styleElement.textContent = style;
  };
  const setRemoteCss = (url: string) => {
    const hostname = new URL(url).hostname;

    // if url is from GitHub, we fetch the raw content and set the style
    // if url contains GitHub.com or githubusercontent.com, we fetch the raw content and set the style
    if (
      hostname === "https://github.com" ||
      hostname === "https://githubusercontent.com"
    ) {
      fetch(
        url
          .replace("github.com", "raw.githubusercontent.com")
          .replace("blob/", ""),
      )
        .then((response) => response.text())
        .then((text) => {
          setStyle(text);
        });
      return;
    }
    const remoteCssUrlId = "zenuml-remote-css";
    // check if remote css element exists
    const remoteCssElement = document.createElement("link");
    remoteCssElement.id = remoteCssUrlId;
    remoteCssElement.rel = "stylesheet";
    document.head.append(remoteCssElement);
    remoteCssElement.href = url;
  };

  useImperativeHandle(ref, () => ({
    toPng,
    toSvg,
    toBlob,
    toJpeg,
    zoomIn,
    zoomOut,
    setTheme,
    setRemoteCss,
  }));

  return (
    // The Tailwind utilities (p-1, bg-skin-canvas, inline-block) work here because this component
    // is rendered inside a parent div with .zenuml class in core.tsx. The Tailwind configuration
    // uses important: ".zenuml" which generates selectors like ".zenuml .p-1" for scoped styling.
    <div
      ref={containerRef}
      className={cn("p-1 bg-skin-canvas inline-block", theme)}
      style={palette ? paletteCssVariables(palette) : undefined}
    >
      <Debug />
      <div className="frame text-skin-base bg-skin-frame border-skin-frame relative m-1 origin-top-left whitespace-nowrap border rounded">
        <div>
          <div
            className="header text-skin-title bg-skin-title border-skin-frame border-b p-1 flex items-center justify-between rounded-t"
            style={{ minHeight: DIAGRAM_HEADER_HEIGHT }}
          >
            <div className="left hide-export">{children}</div>
            <div className="right flex-grow flex justify-between">
              <DiagramTitle context={title} />
            </div>
          </div>
          <SeqDiagram
            className="origin-top-left"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
};
