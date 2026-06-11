// src/lib/font-detect.ts
// Font detection by width measurement: render a test string with
// `"<candidate>", <generic>` and compare against the generic family alone.
// If the width differs for ANY of the three generic baselines, the candidate
// is installed. No permissions, works in every browser (queryLocalFonts was
// rejected in the spec: permission prompt + Chromium-only).
//
// The measurer is injected so the logic is unit-testable; the only DOM-bound
// piece is createCanvasMeasure().

export type MeasureFn = (fontStack: string) => number;

const TEST_STRING = 'mmmMMMwwlfi10O';
const TEST_SIZE = '72px';
const BASELINES = ['monospace', 'sans-serif', 'serif'] as const;

// ~120 curated candidates: Windows core, macOS, Linux, office/classic,
// developer fonts (the last group is the most identifying in practice).
export const FONT_CANDIDATES: readonly string[] = [
  // Windows
  'Arial', 'Arial Black', 'Arial Narrow', 'Bahnschrift', 'Calibri', 'Cambria',
  'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
  'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'Impact',
  'Ink Free', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic',
  'Microsoft YaHei', 'MS Gothic', 'MV Boli', 'Nirmala UI', 'Palatino Linotype',
  'Segoe Print', 'Segoe Script', 'Segoe UI', 'SimSun', 'Sylfaen', 'Tahoma',
  'Times New Roman', 'Trebuchet MS', 'Verdana', 'Yu Gothic',
  // macOS
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Avenir',
  'Avenir Next', 'Baskerville', 'Big Caslon', 'Bradley Hand', 'Brush Script MT',
  'Chalkboard SE', 'Charter', 'Cochin', 'Copperplate', 'Courier', 'Didot',
  'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Hoefler Text',
  'Lucida Grande', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy', 'Optima',
  'Palatino', 'Papyrus', 'Rockwell', 'Snell Roundhand', 'Times', 'Zapfino',
  // Linux
  'Bitstream Vera Sans', 'Cantarell', 'DejaVu Sans', 'DejaVu Sans Mono',
  'DejaVu Serif', 'Droid Sans', 'FreeMono', 'FreeSans', 'FreeSerif',
  'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Nimbus Roman',
  'Nimbus Sans', 'Noto Sans', 'Noto Serif', 'Ubuntu', 'Ubuntu Mono',
  // Office / classic
  'Book Antiqua', 'Bookman Old Style', 'Century', 'Century Gothic', 'Garamond',
  'Goudy Old Style', 'Haettenschweiler', 'Lucida Bright', 'Lucida Handwriting',
  'Mistral', 'Monotype Corsiva', 'MS Reference Sans Serif', 'Perpetua',
  'Segoe UI Symbol',
  // Developer
  'Cascadia Code', 'Cascadia Mono', 'Fira Code', 'Fira Mono', 'Fira Sans',
  'Hack', 'Inconsolata', 'Iosevka', 'JetBrains Mono', 'Roboto',
  'Roboto Condensed', 'Roboto Mono', 'SF Mono', 'SF Pro Display', 'SF Pro Text',
  'Source Code Pro', 'Source Sans Pro', 'Victor Mono',
];

export interface FontDetectResult { detected: string[]; tested: number; }

export function detectFonts(measure: MeasureFn): FontDetectResult {
  const base: Record<string, number> = {};
  for (const b of BASELINES) base[b] = measure(b);
  const detected: string[] = [];
  for (const candidate of FONT_CANDIDATES) {
    for (const b of BASELINES) {
      if (measure(`"${candidate}", ${b}`) !== base[b]) {
        detected.push(candidate);
        break;
      }
    }
  }
  return { detected, tested: FONT_CANDIDATES.length };
}

/** DOM-bound measurer factory. Returns null when canvas 2D is unavailable. */
export function createCanvasMeasure(): MeasureFn | null {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return (fontStack: string) => {
      ctx.font = `${TEST_SIZE} ${fontStack}`;
      return ctx.measureText(TEST_STRING).width;
    };
  } catch {
    return null;
  }
}
