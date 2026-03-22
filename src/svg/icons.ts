/**
 * Inline SVG icon paths for common participant types.
 * Build from the same raw SVG assets used by the HTML renderer so source
 * icons stay identical across renderers.
 */

import ActorSvg from "@/assets/actor.svg?raw";
import BoundarySvg from "@/assets/Robustness_Diagram_Boundary.svg?raw";
import ControlSvg from "@/assets/Robustness_Diagram_Control.svg?raw";
import DatabaseSvg from "@/assets/database.svg?raw";
import EntitySvg from "@/assets/Robustness_Diagram_Entity.svg?raw";
import IamSvg from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Security-Identity-Compliance/Res_AWS-Identity-Access-Management_IAM-Access-Analyzer_48.svg?raw";
import SnsSvg from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Notification-Service_Topic_48.svg?raw";
import SqsSvg from "@/assets/AWS-Asset-Package_02062024/Resource-Icons_01312024/Res_Application-Integration/Res_Amazon-Simple-Queue-Service_Queue_48.svg?raw";

export interface IconDefinition {
  /** ViewBox for the icon (default "0 0 24 24") */
  viewBox?: string;
  /** Presentation attributes from the source <svg> wrapper (e.g. fill="none") */
  attributes?: string;
  /** SVG path data or full SVG content (without outer <svg> tag) */
  content: string;
}

const PRESENTATION_ATTRIBUTES = new Set([
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "clip-rule",
  "opacity",
  "color",
  "style",
  "preserveAspectRatio",
]);

function parseRawSvg(raw: string): IconDefinition {
  const outer = raw.match(/<svg\b([^>]*)>/i)?.[1];
  const viewBox = raw.match(/viewBox="([^"]+)"/i)?.[1];
  const inner = raw.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i)?.[1]?.trim();
  if (!outer || !viewBox || !inner) {
    throw new Error("Invalid raw SVG asset");
  }

  const attributes = Array.from(
    outer.matchAll(/([:\w-]+)="([^"]*)"/g),
    ([, name, value]) => ({ name, value }),
  )
    .filter(({ name }) => PRESENTATION_ATTRIBUTES.has(name))
    .map(({ name, value }) => `${name}="${value}"`)
    .join(" ");

  return { viewBox, attributes, content: inner };
}

/**
 * Common icons for SVG renderer.
 * Icons are built from the same raw SVG assets as AsyncIcon/LazyIcons.
 */
export const ICONS: Record<string, IconDefinition> = {
  actor: parseRawSvg(ActorSvg),
  database: parseRawSvg(DatabaseSvg),
  sqs: parseRawSvg(SqsSvg),
  sns: parseRawSvg(SnsSvg),
  iam: parseRawSvg(IamSvg),
  boundary: parseRawSvg(BoundarySvg),
  control: parseRawSvg(ControlSvg),
  entity: parseRawSvg(EntitySvg),
};

/**
 * Get icon definition for a participant type.
 * Returns undefined if icon not available (will fall back to text label).
 */
export function getIcon(type: string | undefined): IconDefinition | undefined {
  if (!type) return undefined;
  const key = type.toLowerCase();
  return ICONS[key];
}
