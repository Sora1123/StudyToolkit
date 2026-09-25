/**
 * Canva-style snapping helpers for the workspace.
 *
 * Provides:
 *  - grid snapping (a base "locking" feel)
 *  - alignment snapping to nearby modules' edges/centers (with guide lines)
 *  - square snapping during resize
 *  - overlap avoidance so a dragged module abuts (not intersects) neighbours
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GRID = 8;
export const SNAP = 6; // px magnetic detent zone around alignment/square snapping

/** Vertical guide = a fixed x; Horizontal guide = a fixed y. */
export interface Guides {
  vertical: number[];
  horizontal: number[];
}

export const snapToGrid = (value: number, grid = GRID) =>
  Math.round(value / grid) * grid;

/** The candidate alignment coordinates a rect exposes on each axis (edges only). */
function xTargets(r: Rect): number[] {
  return [r.x, r.x + r.width];
}
function yTargets(r: Rect): number[] {
  return [r.y, r.y + r.height];
}

/**
 * Snap a dragged rect's position to align with neighbours.
 * Returns the adjusted x/y plus the guide lines that became active.
 */
export function snapDrag(
  moving: Rect,
  others: Rect[],
): { x: number; y: number; guides: Guides } {
  let x = moving.x;
  let y = moving.y;
  const guides: Guides = { vertical: [], horizontal: [] };

  // The moving rect's own candidate lines: left/right and top/bottom edges only.
  const movingX = [moving.x, moving.x + moving.width];
  const movingY = [moving.y, moving.y + moving.height];
  const xOffsets = [0, moving.width];
  const yOffsets = [0, moving.height];

  let bestXDelta = Infinity;
  let bestXLine = 0;
  let hasX = false;
  let bestYDelta = Infinity;
  let bestYLine = 0;
  let hasY = false;

  for (const o of others) {
    for (const ot of xTargets(o)) {
      for (let i = 0; i < movingX.length; i++) {
        const delta = Math.abs(ot - movingX[i]);
        if (delta <= SNAP && delta < bestXDelta) {
          bestXDelta = delta;
          bestXLine = ot;
          hasX = true;
          x = ot - xOffsets[i];
        }
      }
    }
    for (const ot of yTargets(o)) {
      for (let i = 0; i < movingY.length; i++) {
        const delta = Math.abs(ot - movingY[i]);
        if (delta <= SNAP && delta < bestYDelta) {
          bestYDelta = delta;
          bestYLine = ot;
          hasY = true;
          y = ot - yOffsets[i];
        }
      }
    }
  }

  if (hasX) guides.vertical.push(bestXLine);
  if (hasY) guides.horizontal.push(bestYLine);

  return { x, y, guides };
}

/**
 * Snap resize dimensions: to a perfect square when close, and to align the
 * bottom/right edges with neighbours. `origin` is the fixed top-left corner.
 */
export function snapResize(
  origin: { x: number; y: number },
  width: number,
  height: number,
  others: Rect[],
): { width: number; height: number; guides: Guides; square: boolean } {
  const guides: Guides = { vertical: [], horizontal: [] };
  let w = width;
  let h = height;
  let square = false;

  // Square snap.
  if (Math.abs(w - h) <= SNAP) {
    const size = Math.round((w + h) / 2);
    w = size;
    h = size;
    square = true;
  }

  // Align the right edge to neighbours' x-targets.
  const right = origin.x + w;
  let bestRDelta = Infinity;
  let bestRLine = 0;
  let hasR = false;
  for (const o of others) {
    for (const ot of xTargets(o)) {
      const delta = Math.abs(ot - right);
      if (delta <= SNAP && delta < bestRDelta) {
        bestRDelta = delta;
        bestRLine = ot;
        hasR = true;
      }
    }
  }
  if (hasR) {
    w = bestRLine - origin.x;
    guides.vertical.push(bestRLine);
  }

  // Align the bottom edge to neighbours' y-targets.
  const bottom = origin.y + h;
  let bestBDelta = Infinity;
  let bestBLine = 0;
  let hasB = false;
  for (const o of others) {
    for (const ot of yTargets(o)) {
      const delta = Math.abs(ot - bottom);
      if (delta <= SNAP && delta < bestBDelta) {
        bestBDelta = delta;
        bestBLine = ot;
        hasB = true;
      }
    }
  }
  if (hasB) {
    h = bestBLine - origin.y;
    guides.horizontal.push(bestBLine);
  }

  return { width: w, height: h, guides, square };
}

/** Axis-aligned overlap test. */
export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * If placing `moving` would overlap any neighbour, nudge it to abut the closest
 * offending edge instead of intersecting it (a gentle "stop before it hits").
 */
export function resolveOverlap(moving: Rect, others: Rect[]): Rect {
  const result = { ...moving };
  for (const o of others) {
    if (!overlaps(result, o)) continue;

    // Compute the minimal push needed on each side.
    const pushLeft = o.x - (result.x + result.width); // move left (negative)
    const pushRight = o.x + o.width - result.x; // move right (positive)
    const pushUp = o.y - (result.y + result.height); // move up (negative)
    const pushDown = o.y + o.height - result.y; // move down (positive)

    const candidates = [
      { axis: "x" as const, value: pushLeft, mag: Math.abs(pushLeft) },
      { axis: "x" as const, value: pushRight, mag: Math.abs(pushRight) },
      { axis: "y" as const, value: pushUp, mag: Math.abs(pushUp) },
      { axis: "y" as const, value: pushDown, mag: Math.abs(pushDown) },
    ].sort((a, b) => a.mag - b.mag);

    const best = candidates[0];
    if (best.axis === "x") result.x += best.value;
    else result.y += best.value;
  }
  return result;
}
