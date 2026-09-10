import { rootContextAtom, scaleAtom, themeAtom } from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";
import * as htmlToImage from "html-to-image";
import {
  PropsWithChildren,
  RefObject,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "@/utils";
import { Debug } from "./Debug";
import { Privacy } from "./Privacy";
import { DiagramTitle } from "./DiagramTitle";
import { SeqDiagram } from "./SeqDiagram/SeqDiagram";

const exportConfig = {
  backgroundColor: "white",
  filter: (node: HTMLElement) => {
    return !node?.classList?.contains("hide-export");
  },
};

export const DiagramFrame = ({
  ref,
  children,
}: PropsWithChildren<{
  ref?: RefObject<{
    toPng: () => Promise<string | undefined>;
    toSvg: () => Promise<string | undefined>;
    toBlob: () => Promise<Blob | null | undefined>;
    toJpeg: () => Promise<string | undefined>;
    zoomIn: () => void;
    zoomOut: () => void;
  }>;
}>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootContext = useAtomValue(rootContextAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const title = rootContext?.title();

  const toPng = async () => {
    if (!containerRef.current) return;
    return htmlToImage.toPng(containerRef.current, exportConfig);
  };
  const toSvg = async () => {
    if (!containerRef.current) return;
    return htmlToImage.toSvg(containerRef.current, exportConfig);
  };
  const toBlob = async () => {
    if (!containerRef.current) return;
    return htmlToImage.toBlob(containerRef.current, exportConfig);
  };
  const toJpeg = async () => {
    if (!containerRef.current) return;
    return htmlToImage.toJpeg(containerRef.current, exportConfig);
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
    >
      <Debug />
      <div className="frame text-skin-base bg-skin-frame border-skin-frame relative m-1 origin-top-left whitespace-nowrap border rounded">
        <div>
          <div className="header text-skin-title bg-skin-title border-skin-frame border-b p-1 flex justify-between rounded-t">
            <div className="left hide-export">{children}</div>
            <div className="right flex-grow flex justify-between">
              <DiagramTitle context={title} />
              {/* Knowledge: how to vertically align a svg icon. */}
              <Privacy className="hide-export flex items-center" />
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
