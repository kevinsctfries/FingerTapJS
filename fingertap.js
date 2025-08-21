let lastTapTime = 0;
let taps = [];
let isTouching = false;
const MIN_TAP_INTERVAL = 300; // Minimum time (ms) between taps
const TAP_THRESHOLD = 40; // Distance threshold for thumb-index proximity

export function fingerTapEffect(
  landmarks,
  canvasCtx,
  handedness,
  isPrimaryHand
) {
  if (
    !landmarks ||
    !canvasCtx ||
    !Array.isArray(landmarks) ||
    landmarks.length < 21
  ) {
    console.warn("Invalid landmarks data:", landmarks);
    return;
  }

  const thumbTip = landmarks[4]; // Thumb tip
  const indexTip = landmarks[8]; // Index tip

  if (!thumbTip || !indexTip || !thumbTip.x || !indexTip.x) {
    console.warn("Missing thumb or index tip landmarks:", landmarks);
    return;
  }

  const x1 = thumbTip.x * canvasCtx.canvas.width;
  const y1 = thumbTip.y * canvasCtx.canvas.height;
  const x2 = indexTip.x * canvasCtx.canvas.width;
  const y2 = indexTip.y * canvasCtx.canvas.height;

  const distance = Math.hypot(x2 - x1, y2 - y1);
  const now = performance.now();

  if (isPrimaryHand) {
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

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  canvasCtx.beginPath();
  canvasCtx.arc(midX, midY, 15, 0, Math.PI * 2);
  canvasCtx.fillStyle =
    isPrimaryHand && distance < TAP_THRESHOLD ? "limegreen" : "gray";
  canvasCtx.fill();
  canvasCtx.closePath();

  if (handedness && handedness.label) {
    canvasCtx.font = "16px Arial";
    canvasCtx.fillStyle = isPrimaryHand ? "blue" : "gray";
    const displayLabel = handedness.label === "Left" ? "R" : "L";
    canvasCtx.fillText(displayLabel, midX + 20, midY);
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
    tapsPerSecond: 1 / mean,
  };
}

export function resetTaps() {
  taps = [];
  lastTapTime = 0;
  isTouching = false;
}
