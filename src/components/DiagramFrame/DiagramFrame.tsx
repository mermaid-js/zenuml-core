import {
  RenderMode,
  modeAtom,
  rootContextAtom,
  showTipsAtom,
  scaleAtom,
  themeAtom,
  enableNumberingAtom,
  enableMultiThemeAtom,
} from "@/store/Store";
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
import { TipsDialog } from "./Tutorial/TipsDialog";
import Icon from "../Icon/Icons";
import { ThemeSelector } from "./ThemeSelector";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const rootContext = useAtomValue(rootContextAtom);
  const [showTips, setShowTips] = useAtom(showTipsAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [enableNumbering, setEnableNumbering] = useAtom(enableNumberingAtom);
  const enableMultiTheme = useAtomValue(enableMultiThemeAtom);
  const mode = useAtomValue(modeAtom);
  const title = rootContext?.title();

  const showTipsDialog = () => {
    setShowTips(true);

    // try {
    //   this.$gtag?.event("view", {
    //     event_category: "help",
    //     event_label: "tips dialog",
    //   });
    // } catch (e) {
    //   console.error(e);
    // }
  };

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
    let styleElement =
      document.getElementById(styleElementId) ||
      document.createElement("style");
    styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.append(styleElement);
    styleElement.textContent = style;
  };
  const setRemoteCss = (url: string) => {
    const hostname = new URL(url).hostname;

    // if url is from github, we fetch the raw content and set the style
    // if url contains github.com or githubusercontent.com, we fetch the raw content and set the style
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
    let remoteCssElement =
      (document.getElementById(remoteCssUrlId) as HTMLLinkElement) ||
      document.createElement("link");
    remoteCssElement = document.createElement("link");
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
    <div
      ref={containerRef}
      className={cn("zenuml p-1 bg-skin-canvas inline-block", theme)}
    >
      <Debug />
      <div className="frame text-skin-base bg-skin-frame border-skin-frame relative m-1 origin-top-left whitespace-nowrap border rounded">
        <div ref={contentRef}>
          <div className="header text-skin-title bg-skin-title border-skin-frame border-b p-1 flex justify-between rounded-t">
            <div className="left hide-export">{children}</div>
            <div className="right flex-grow flex justify-between">
              <DiagramTitle context={title} />
              {/* Knowledge: how to vertically align a svg icon. */}
              <Privacy className="hide-export flex items-center" />
            </div>
          </div>
          {showTips && (
            <div
              className="fixed z-40 inset-0 overflow-y-auto"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <TipsDialog />
            </div>
          )}
          <SeqDiagram
            className="origin-top-left"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
        <div className="footer rounded text-skin-control bg-skin-title px-4 py-1 flex justify-between items-center gap-3">
          {mode === RenderMode.Dynamic && (
            <>
              <div className="flex items-center gap-3 color-base">
                <button
                  className="bottom-1 flex items-center left-1 hide-export"
                  onClick={showTipsDialog}
                >
                  <Icon name="tip" className="filter grayscale w-4 h-4" />
                </button>
                {enableMultiTheme && <ThemeSelector />}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="order-display"
                    className="mr-1"
                    checked={Boolean(enableNumbering)}
                    onChange={() => setEnableNumbering(!enableNumbering)}
                  />
                  <label
                    htmlFor="order-display"
                    title="Numbering the diagram"
                    className="select-none"
                  >
                    <Icon name="numbering" className="w-6 h-6" />
                  </label>
                </div>
              </div>
              <div className="zoom-controls flex hide-export gap-1">
                <button className="zoom-in" onClick={zoomIn}>
                  <Icon name="zoom-in" className="w-4 h-4" />
                </button>
                <label className="w-12 block text-center">
                  {Number(scale * 100).toFixed(0)}%
                </label>
                <button className="zoom-out" onClick={zoomOut}>
                  <Icon name="zoom-out" className="w-4 h-4" />
                </button>
              </div>
              <a
                target="_blank"
                href="https://zenuml.com"
                className="brand text-xs hover:underline"
              >
                ZenUML.com
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
