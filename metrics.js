let lastTapTime = 0;
let taps = [];
let isTouching = false;
export const MIN_TAP_INTERVAL = 300; // minimum time (in milliseconds) between taps
export const TAP_THRESHOLD = 40; // distance threshold for thumb-index proximity

export function recordTap(distance, now) {
  if (
    distance < TAP_THRESHOLD &&
    !isTouching &&
    now - lastTapTime >= MIN_TAP_INTERVAL
  ) {
    isTouching = true;
    const interval = lastTapTime > 0 ? (now - lastTapTime) / 1000 : null;
    if (interval) {
      taps.push(interval);
    }
    lastTapTime = now;
  } else if (distance >= TAP_THRESHOLD) {
    isTouching = false;
  }
}

export function getTapMetrics() {
  if (taps.length === 0) return null;

  const mean = taps.reduce((a, b) => a + b, 0) / taps.length;
  const variance =
    taps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / taps.length;
  const sd = Math.sqrt(variance);

  return {
    tapCount: taps.length,
    meanITI: mean,
    sdITI: sd,
    tapsPerSecond: mean > 0 ? 1 / mean : 0, // prevent division by zero
  };
}

export function resetTaps() {
  taps = [];
  lastTapTime = 0;
  isTouching = false;
}
