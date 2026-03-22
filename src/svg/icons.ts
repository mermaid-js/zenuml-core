/**
 * Inline SVG icon paths for common participant types.
 * Limited set for SVG renderer to avoid bundle bloat.
 * Full icon library is available in HTML renderer via AsyncIcon.
 */

export interface IconDefinition {
  /** ViewBox for the icon (default "0 0 24 24") */
  viewBox?: string;
  /** SVG path data or full SVG content (without outer <svg> tag) */
  content: string;
}

/**
 * Common icons for SVG renderer.
 * Icons are embedded inline to work in static/server-side rendering.
 */
export const ICONS: Record<string, IconDefinition> = {
  // Actor/user icon (from actor.svg)
  actor: {
    viewBox: "0 0 24 24",
    content: `<path d="M15.5489 4.19771C15.5489 5.18773 15.1485 6.13721 14.4358 6.83726C13.7231 7.53731 12.7565 7.93058 11.7486 7.93058C10.7407 7.93058 9.77403 7.53731 9.06133 6.83726C8.34863 6.13721 7.94824 5.18773 7.94824 4.19771C7.94824 3.20768 8.34863 2.25822 9.06133 1.55818C9.77403 0.858126 10.7407 0.464844 11.7486 0.464844C12.7565 0.464844 13.7231 0.858126 14.4358 1.55818C15.1485 2.25822 15.5489 3.20768 15.5489 4.19771Z" fill="none" stroke="#222" stroke-width="1"/>
<path d="M6.54883 11.2152L17.2025 11.2073M11.7471 8.06641V19.5806V8.06641ZM11.7471 19.4385L6.79789 23.5738L11.7471 19.4385ZM11.7551 19.4385L17.1864 23.3055L11.7551 19.4385Z" fill="none" stroke="#222" stroke-width="1"/>`,
  },
  // Database icon (from database.svg - simplified)
  database: {
    viewBox: "0 0 24 24",
    content: `<path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.372 0 2 1.79 2 3.5V20.5C2 22.21 5.372 24 12 24C18.628 24 22 22.21 22 20.5V3.5C22 1.79 18.628 0 12 0ZM3 20.5V16.373C4.485 17.478 8.015 18.346 12 18.346C15.985 18.346 19.515 17.478 21 16.373V20.5C21 20.521 20.999 20.542 20.998 20.563C20.531 21.864 16.932 23 12 23C7.068 23 3.469 21.864 3.002 20.563C3.001 20.542 3 20.521 3 20.5ZM3 14.846V10.707C4.485 11.812 8.015 12.68 12 12.68C15.985 12.68 19.515 11.812 21 10.707V14.846C21 14.867 20.999 14.888 20.998 14.91C20.531 16.211 16.932 17.346 12 17.346C7.068 17.346 3.469 16.211 3.002 14.91C3.001 14.888 3 14.867 3 14.846ZM3 9.18V5.027C4.485 6.132 8.015 7 12 7C15.985 7 19.515 6.132 21 5.027V9.18C21 9.201 20.999 9.222 20.998 9.243C20.531 10.544 16.932 11.68 12 11.68C7.068 11.68 3.469 10.544 3.002 9.243C3.001 9.222 3 9.201 3 9.18ZM12 6C7.068 6 3.469 4.864 3.002 3.563C3.001 3.542 3 3.521 3 3.5C3 3.479 3.001 3.458 3.002 3.437C3.469 2.136 7.068 1 12 1C16.932 1 20.531 2.136 20.998 3.437C20.999 3.458 21 3.479 21 3.5C21 3.521 20.999 3.542 20.998 3.563C20.531 4.864 16.932 6 12 6Z" fill="currentColor"/>`,
  },
  // AWS SQS icon (simplified)
  sqs: {
    viewBox: "0 0 48 48",
    content: `<path d="M37.449,22.261V26.221L35.026,24.207L37.449,22.261ZM37.81,29.121C37.993,29.273,38.22,29.352,38.449,29.352C38.594,29.352,38.738,29.321,38.874,29.257C39.224,29.092,39.449,28.74,39.449,28.352V20.176C39.449,19.791,39.228,19.441,38.882,19.275C38.535,19.108,38.123,19.156,37.823,19.397L32.819,23.414C32.585,23.602,32.448,23.885,32.445,24.185C32.442,24.486,32.575,24.771,32.806,24.963L37.81,29.121ZM10.527,22.307L12.951,24.322L10.527,26.267V22.307ZM9.095,29.253C9.232,29.32,9.38,29.352,9.527,29.352C9.751,29.352,9.972,29.277,10.153,29.132L15.158,25.115C15.392,24.927,15.529,24.644,15.532,24.344C15.535,24.043,15.402,23.758,15.171,23.566L10.166,19.407C9.868,19.16,9.453,19.107,9.102,19.271C8.752,19.436,8.527,19.788,8.527,20.176V28.352C8.527,28.737,8.748,29.087,9.095,29.253ZM28.368,34.027H30.368V14.747H28.368V34.027ZM23.121,34.027H25.121V14.747H23.121V34.027ZM17.711,34.027H19.711V14.747H17.711V34.027ZM3.999,35.773H43.977V13.001H3.999V35.773ZM44.977,11H3C2.447,11,2,11.448,2,12V36.773C2,37.325,2.447,37.773,3,37.773H44.977C45.53,37.773,45.977,37.325,45.977,36.773V12C45.977,11.448,45.53,11,44.977,11Z" fill="#E7157B"/>`,
  },
  // AWS SNS icon (simplified)
  sns: {
    viewBox: "0 0 48 48",
    content: `<path d="M28,22h-2v2h2V22z M32,22h-2v2h2V22z M24,22h-2v2h2V22z M20,22h-2v2h2V22z M37,13H11c-1.1,0-2,0.9-2,2v18c0,1.1,0.9,2,2,2h26c1.1,0,2-0.9,2-2V15C39,13.9,38.1,13,37,13z M37,33H11V15h26V33z" fill="#E7157B"/>`,
  },
  // AWS IAM icon (simplified)
  iam: {
    viewBox: "0 0 48 48",
    content: `<path d="M24,13c-2.206,0-4,1.794-4,4s1.794,4,4,4s4-1.794,4-4S26.206,13,24,13z M24,19c-1.103,0-2-0.897-2-2s0.897-2,2-2s2,0.897,2,2S25.103,19,24,19z M32,25H16c-1.654,0-3,1.346-3,3v7h2v-7c0-0.551,0.449-1,1-1h16c0.551,0,1,0.449,1,1v7h2v-7C35,26.346,33.654,25,32,25z" fill="#DD344C"/>`,
  },
  // Boundary icon (Robustness diagram)
  boundary: {
    viewBox: "0 0 24 24",
    content: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="2"/>`,
  },
  // Control icon (Robustness diagram)
  control: {
    viewBox: "0 0 24 24",
    content: `<circle cx="12" cy="12" r="3" fill="currentColor"/>
<line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" stroke-width="2"/>
<line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" stroke-width="2"/>
<line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
<line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/>`,
  },
  // Entity icon (Robustness diagram)
  entity: {
    viewBox: "0 0 24 24",
    content: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/>`,
  },
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
