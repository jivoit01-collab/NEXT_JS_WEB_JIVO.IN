/**
 * Removes a flat white studio background from a product render and writes a
 * transparent WebP.
 *
 * Uses an edge-seeded flood fill (NOT a global "delete all white" pass), so
 * white *inside* the subject — label text, cap highlights, reflections — is
 * preserved. Only background connected to the image border is cleared.
 *
 * Usage:
 *   node scripts/remove-white-bg.mjs <input> <output> [threshold]
 *
 * threshold: how close to pure white counts as background (default 240).
 */
import sharp from 'sharp';

const [, , inputPath, outputPath, thresholdArg] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/remove-white-bg.mjs <input> <output> [threshold]');
  process.exit(1);
}

// Kept high on purpose. A studio background is essentially pure white, while
// translucent parts of the subject (handle windows, pale label panels) are
// slightly tinted. A permissive threshold lets the fill leak through those and
// punch holes in the bottle, so we only treat near-perfect white as background.
const THRESHOLD = Number(thresholdArg ?? 250);


const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const isBackground = new Uint8Array(width * height);

const luminanceAt = (idx) => {
  const o = idx * channels;
  return Math.min(data[o], data[o + 1], data[o + 2]);
};

// Background must be bright AND neutral. Translucent plastic picks up a colour
// cast (the green field behind it, the yellow bottle), so a saturation check
// stops the fill from tunnelling through the handle windows.
const MAX_TINT = 6;
const isNeutral = (idx) => {
  const o = idx * channels;
  const r = data[o];
  const g = data[o + 1];
  const b = data[o + 2];
  return Math.max(r, g, b) - Math.min(r, g, b) <= MAX_TINT;
};

// Flood fill inward from the border.
//
// This is deliberately connectivity-based, not colour-based. On a studio
// render the see-through parts of the subject — handle windows, gaps under
// the cap — are pixel-identical pure white to the backdrop, so NO threshold
// can tell them apart. What separates them is topology: the backdrop is one
// region touching the image border, while those windows are enclosed by the
// bottle outline. Only the border-connected region is cleared, so the windows
// keep their pixels and the bottle stays whole.
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push(x, x + (height - 1) * width);
}
for (let y = 0; y < height; y++) {
  stack.push(y * width, width - 1 + y * width);
}

const qualifies = (idx) => luminanceAt(idx) >= THRESHOLD && isNeutral(idx);

while (stack.length) {
  const idx = stack.pop();
  if (isBackground[idx]) continue;
  if (!qualifies(idx)) continue;

  isBackground[idx] = 1;

  const x = idx % width;
  const y = (idx - x) / width;
  // 4-connectivity only. 8-connectivity would let the fill slip diagonally
  // through single-pixel anti-aliased seams in the bottle outline and flood
  // the enclosed windows.
  if (x > 0) stack.push(idx - 1);
  if (x < width - 1) stack.push(idx + 1);
  if (y > 0) stack.push(idx - width);
  if (y < height - 1) stack.push(idx + width);
}

// Apply alpha.
//
// Only pixels the border fill actually reached are cleared. Every other pixel
// keeps full alpha — including enclosed white windows. An earlier version
// feathered ALL near-white pixels by luminance, which punched holes straight
// through those windows; alpha must follow the fill, never raw colour.
let cleared = 0;
for (let idx = 0; idx < width * height; idx++) {
  const o = idx * channels;
  if (isBackground[idx] === 1) {
    data[o + 3] = 0;
    cleared++;
  }
}

// Soften the cutout edge: a background pixel adjacent to kept pixels gets
// partial alpha, so the outline reads smooth instead of stair-stepped.
const alphaCopy = new Uint8Array(width * height);
for (let idx = 0; idx < width * height; idx++) {
  alphaCopy[idx] = isBackground[idx] === 1 ? 0 : 255;
}
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
    if (alphaCopy[idx] !== 255) continue;
    const neighbours =
      alphaCopy[idx - 1] + alphaCopy[idx + 1] + alphaCopy[idx - width] + alphaCopy[idx + width];
    if (neighbours < 4 * 255) {
      // On the boundary — average with neighbours for a 1px feather.
      data[idx * channels + 3] = Math.round((255 + neighbours / 4) / 2);
    }
  }
}

await sharp(data, { raw: { width, height, channels } })
  .trim() // drop the now-transparent margin so the bottle fills its box
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toFile(outputPath);

const out = await sharp(outputPath).metadata();
console.log(
  `${outputPath}  ${out.width}x${out.height}  hasAlpha=${out.hasAlpha}  ` +
    `cleared=${((cleared / (width * height)) * 100).toFixed(1)}%`,
);
