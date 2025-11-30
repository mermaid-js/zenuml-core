import type { Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";

/**
 * Color palette for component markers.
 * Each color is [R, G, B, A] format.
 */
const COMPONENT_COLORS: Record<string, [number, number, number, number]> = {
  cursorTop: [0, 128, 255, 255], // Blue
  commentHeight: [255, 165, 0, 255], // Orange
  creationAltBranchOffset: [255, 0, 0, 255], // Red
  creationTcfSegmentOffset: [128, 0, 128, 255], // Purple
  creationParSiblingOffset: [0, 128, 0, 255], // Green
  altBranchInset: [255, 0, 255, 255], // Magenta
  visualAdjustment: [0, 255, 255, 255], // Cyan
  assignmentAdjustment: [255, 255, 0, 255], // Yellow
  finalMessageAnchor: [0, 255, 0, 255], // Bright Green
  default: [128, 128, 128, 255], // Gray
};

interface CreationTopComponent {
  name: string;
  value: number;
  statementKey?: string;
  description?: string;
}

interface CreationTopRecord {
  participant: string;
  finalTop: number;
  components: CreationTopComponent[];
}

interface ParticipantPosition {
  name: string;
  centerX: number;
}

/**
 * Draws a horizontal dashed line at the specified Y coordinate.
 */
function drawHorizontalLine(
  png: PNG,
  y: number,
  startX: number,
  endX: number,
  color: [number, number, number, number],
  dashLength = 4,
  gapLength = 2,
) {
  if (y < 0 || y >= png.height) return;

  let x = startX;
  let drawing = true;
  let count = 0;

  while (x <= endX && x < png.width) {
    if (x >= 0) {
      if (drawing) {
        const idx = (png.width * Math.floor(y) + x) << 2;
        png.data[idx] = color[0];
        png.data[idx + 1] = color[1];
        png.data[idx + 2] = color[2];
        png.data[idx + 3] = color[3];
      }
    }
    count++;
    if (drawing && count >= dashLength) {
      drawing = false;
      count = 0;
    } else if (!drawing && count >= gapLength) {
      drawing = true;
      count = 0;
    }
    x++;
  }
}

/**
 * Draws a small label/marker at the specified position.
 */
function drawMarker(
  png: PNG,
  x: number,
  y: number,
  color: [number, number, number, number],
  size = 4,
) {
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px >= 0 && px < png.width && py >= 0 && py < png.height) {
        // Draw a diamond shape
        if (Math.abs(dx) + Math.abs(dy) <= size) {
          const idx = (png.width * py + px) << 2;
          png.data[idx] = color[0];
          png.data[idx + 1] = color[1];
          png.data[idx + 2] = color[2];
          png.data[idx + 3] = color[3];
        }
      }
    }
  }
}

/**
 * Get participant horizontal positions from the page.
 */
async function getParticipantPositions(
  page: Page,
): Promise<ParticipantPosition[]> {
  return page.evaluate(() => {
    const positions: { name: string; centerX: number }[] = [];
    const lifelines = document.querySelectorAll(
      ".lifeline[id]",
    ) as NodeListOf<HTMLElement>;
    const diagramRect = document
      .querySelector(".diagram")
      ?.getBoundingClientRect();
    const offsetX = diagramRect?.left ?? 0;

    lifelines.forEach((lifeline) => {
      const id = lifeline.getAttribute("id");
      if (id) {
        const rect = lifeline.getBoundingClientRect();
        positions.push({
          name: id,
          centerX: rect.left + rect.width / 2 - offsetX,
        });
      }
    });
    return positions;
  });
}

/**
 * Captures and annotates a screenshot with component debug overlays.
 * Each participant gets horizontal lines at each component's vertical coordinate.
 */
export async function captureDebugScreenshot(
  page: Page,
  slug: string,
): Promise<string | null> {
  // Check if debug mode is enabled
  const shouldCapture = process.env.DEBUG_VERTICAL === "1";
  if (!shouldCapture) return null;

  // Get creation top records from the page
  const debugData = await page.evaluate(() => {
    const creationTopRecords = (window as any).__zenumlCreationTopRecords || [];
    const lifelineLayerPaddingTop = 8;
    const messageLayer = document.querySelector(".message-layer");
    const messageLayerRect = messageLayer?.getBoundingClientRect();
    const diagramRect = document
      .querySelector(".diagram")
      ?.getBoundingClientRect();
    return {
      creationTopRecords,
      lifelineLayerPaddingTop,
      messageLayerTop: messageLayerRect?.top ?? 0,
      diagramTop: diagramRect?.top ?? 0,
      diagramLeft: diagramRect?.left ?? 0,
    };
  });

  if (
    !debugData.creationTopRecords ||
    debugData.creationTopRecords.length === 0
  ) {
    return null;
  }

  // Get participant positions
  const participantPositions = await getParticipantPositions(page);

  // Take the original screenshot
  const screenshot = await page.screenshot({ fullPage: true });

  // Parse the PNG
  const png = PNG.sync.read(screenshot);

  // Calculate the offset from diagram top to message layer top
  const verticalOffset = debugData.messageLayerTop - debugData.diagramTop;

  // Draw component markers for each participant
  for (const record of debugData.creationTopRecords as CreationTopRecord[]) {
    const participantPos = participantPositions.find(
      (p) => p.name === record.participant,
    );
    if (!participantPos) continue;

    const centerX = Math.floor(participantPos.centerX);
    let cumulativeY = verticalOffset;

    // Draw each component
    for (const component of record.components) {
      const color =
        COMPONENT_COLORS[component.name] || COMPONENT_COLORS.default;

      if (
        component.name === "cursorTop" ||
        component.name === "finalMessageAnchor"
      ) {
        // For absolute values, draw at the absolute position
        const y = verticalOffset + component.value;
        drawHorizontalLine(
          png,
          y,
          Math.max(0, centerX - 30),
          Math.min(png.width - 1, centerX + 30),
          color,
          component.name === "finalMessageAnchor" ? 2 : 4,
          component.name === "finalMessageAnchor" ? 1 : 2,
        );
        drawMarker(
          png,
          centerX,
          y,
          color,
          component.name === "finalMessageAnchor" ? 5 : 3,
        );
      } else if (component.value !== 0) {
        // For incremental values, draw at the cumulative position
        cumulativeY += component.value;
        const y = cumulativeY;
        drawHorizontalLine(
          png,
          y,
          Math.max(0, centerX - 25),
          Math.min(png.width - 1, centerX + 25),
          color,
        );
        drawMarker(png, centerX, y, color, 3);
      }
    }
  }

  // Draw legend at top-left corner
  let legendY = 10;
  const legendX = 10;
  const legendLineLength = 40;
  for (const [name, color] of Object.entries(COMPONENT_COLORS)) {
    if (name === "default") continue;
    drawHorizontalLine(
      png,
      legendY,
      legendX,
      legendX + legendLineLength,
      color,
      4,
      2,
    );
    drawMarker(png, legendX + legendLineLength + 10, legendY, color, 2);
    legendY += 15;
  }

  // Save the annotated screenshot
  const outputDir = path.resolve("tmp");
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slug}-debug.png`);
  const buffer = PNG.sync.write(png);
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

/**
 * Exports component breakdown data to a text file for easy inspection.
 */
export async function exportComponentBreakdown(
  page: Page,
  slug: string,
): Promise<string | null> {
  const shouldCapture = process.env.DEBUG_VERTICAL === "1";
  if (!shouldCapture) return null;

  const records = await page.evaluate(() => {
    return (window as any).__zenumlCreationTopRecords || [];
  });

  if (!records || records.length === 0) {
    return null;
  }

  const lines: string[] = ["# Component Breakdown Report", ""];

  for (const record of records as CreationTopRecord[]) {
    lines.push(`## Participant: ${record.participant}`);
    lines.push(`Final Top: ${record.finalTop}px`);
    lines.push("");
    lines.push("| Component | Value | Description |");
    lines.push("|-----------|-------|-------------|");

    for (const comp of record.components) {
      const sign = comp.value >= 0 ? "+" : "";
      lines.push(
        `| ${comp.name} | ${sign}${comp.value}px | ${comp.description || ""} |`,
      );
    }
    lines.push("");
  }

  const outputDir = path.resolve("tmp");
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slug}-breakdown.md`);
  await fs.writeFile(outputPath, lines.join("\n"));

  return outputPath;
}
