/**
 * Built-in shortcode → Unicode emoji mapping.
 * Serves as a fallback when the Icon Registry service is not available.
 */
export const BUILTIN_EMOJIS: Record<string, string> = {
  // Status/feedback
  check: "✅",
  x: "❌",
  warning: "⚠️",
  exclamation: "❗",
  question: "❓",
  bulb: "💡",
  eyes: "👀",

  // Actions
  rocket: "🚀",
  fire: "🔥",
  zap: "⚡",
  boom: "💥",
  sparkles: "✨",
  tada: "🎉",
  confetti_ball: "🎊",

  // Objects
  lock: "🔒",
  unlock: "🔓",
  key: "🔑",
  gear: "⚙️",
  hammer: "🔨",
  wrench: "🔧",
  package: "📦",
  email: "📧",
  link: "🔗",
  clipboard: "📋",
  bookmark: "🔖",

  // Communication
  speech_balloon: "💬",
  thought_balloon: "💭",
  bell: "🔔",
  megaphone: "📣",

  // Nature/weather
  cloud: "☁️",
  sun: "☀️",
  star: "⭐",
  globe: "🌐",

  // Arrows
  arrow_right: "➡️",
  arrow_left: "⬅️",
  arrow_up: "⬆️",
  arrow_down: "⬇️",

  // People
  wave: "👋",
  thumbsup: "👍",
  thumbsdown: "👎",

  // Tech / Architecture
  computer: "💻",
  iphone: "📱",
  robot: "🤖",
  bug: "🐛",
  database: "🗄️",
  server: "🖥️",
  api: "🔌",
  gateway: "🚪",
  queue: "📬",
  cache: "⚡",
  service: "⚙️",
  processor: "🔄",
  store: "🏪",
  worker: "👷",
  container: "📦",
  network: "🌐",

  // Data
  chart: "📊",
  chart_with_upwards_trend: "📈",
  chart_with_downwards_trend: "📉",

  // Containers
  inbox_tray: "📥",
  outbox_tray: "📤",
  file_folder: "📁",

  // Time
  hourglass: "⏳",
  clock: "🕐",
  stopwatch: "⏱️",

  // Symbols
  heavy_check_mark: "✔️",
  heavy_multiplication_x: "✖️",
  red: "🔴",
  red_circle: "🔴",
  green_circle: "🟢",
  blue_circle: "🔵",
  white_circle: "⚪",
  black_circle: "⚫",
  heart: "❤️",
  shield: "🛡️",

  // Food/common
  coffee: "☕",
  pizza: "🍕",

  // Transport
  car: "🚗",
  bus: "🚌",
  airplane: "✈️",
  ship: "🚢",

  // Database/infra
  floppy_disk: "💾",
  cd: "💿",
  satellite: "🛰️",
  factory: "🏭",
  hospital: "🏥",
  bank: "🏦",

  // Misc
  construction: "🚧",
  recycle: "♻️",
  receipt: "🧾",
  cart: "🛒",
  cylinder: "🪨",
  dollar: "💵",
};
