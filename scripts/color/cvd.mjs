// Colour-vision-deficiency simulation: Machado, Oliveira & Fernandes (2009),
// "A Physiologically-based Model for Simulation of Color Vision Deficiency",
// severity 1.0 matrices, applied in linear RGB.
// https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html

import { linearToSrgb, parseColor, srgbToLinear, toHex } from "./srgb.mjs";

const MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

/** Simulate how `color` looks with the given deficiency; returns "#rrggbb". */
export function simulateCvd(color, kind) {
  const M = MATRICES[kind];
  if (!M) throw new Error(`unknown deficiency: ${kind}`);
  const lin = parseColor(color).map((c) => srgbToLinear(c / 255));
  const out = M.map((row) =>
    Math.max(0, Math.min(1, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2])),
  );
  return toHex(out.map((c) => linearToSrgb(c) * 255));
}

export const CVD_KINDS = Object.keys(MATRICES);
