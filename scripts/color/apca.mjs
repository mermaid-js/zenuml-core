// APCA-W3 contrast (version 0.1.9, "4g" constants), implemented from the
// published algorithm so the audit has no runtime dependency.
// https://github.com/Myndex/apca-w3 — the constants below are the 0.1.9 set.
//
// Lc is signed: positive for dark text on a light background, negative for
// light text on a dark background. Floors compare the absolute value.

import { parseColor } from "./srgb.mjs";

const SA98G = {
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  loClip: 0.1,
  deltaYmin: 0.0005,
};

/** APCA luminance (Ys) of an opaque sRGB colour given as [r, g, b] 0..255. */
export function apcaLuminance([r, g, b]) {
  const lin = (c) => Math.pow(c / 255, SA98G.mainTRC);
  return SA98G.sRco * lin(r) + SA98G.sGco * lin(g) + SA98G.sBco * lin(b);
}

/** Lc for `text` on `background`; both opaque sRGB ([r,g,b] or any CSS colour string). */
export function apcaContrast(text, background) {
  let Ytxt = apcaLuminance(parseColor(text));
  let Ybg = apcaLuminance(parseColor(background));
  if (Ytxt < 0 || Ytxt > 1.1 || Ybg < 0 || Ybg > 1.1) return 0;

  const clamp = (y) =>
    y > SA98G.blkThrs ? y : y + Math.pow(SA98G.blkThrs - y, SA98G.blkClmp);
  Ytxt = clamp(Ytxt);
  Ybg = clamp(Ybg);

  if (Math.abs(Ybg - Ytxt) < SA98G.deltaYmin) return 0;

  let sapc;
  let out;
  if (Ybg > Ytxt) {
    // Normal polarity: dark text on a light background.
    sapc =
      (Math.pow(Ybg, SA98G.normBG) - Math.pow(Ytxt, SA98G.normTXT)) *
      SA98G.scaleBoW;
    out = sapc < SA98G.loClip ? 0 : sapc - SA98G.loBoWoffset;
  } else {
    // Reverse polarity: light text on a dark background.
    sapc =
      (Math.pow(Ybg, SA98G.revBG) - Math.pow(Ytxt, SA98G.revTXT)) *
      SA98G.scaleWoB;
    out = sapc > -SA98G.loClip ? 0 : sapc + SA98G.loWoBoffset;
  }
  return out * 100;
}
