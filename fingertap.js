let lastTapTime = 0;
let taps = [];
let isTouching = false;

export function fingerTapEffect(landmarks, canvasCtx) {
  if (!landmarks) return;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const x1 = thumbTip.x * canvasCtx.canvas.width;
  const y1 = thumbTip.y * canvasCtx.canvas.height;
  const x2 = indexTip.x * canvasCtx.canvas.width;
  const y2 = indexTip.y * canvasCtx.canvas.height;

  const distance = Math.hypot(x2 - x1, y2 - y1);
  const TAP_THRESHOLD = 40;
  const now = performance.now();

  if (distance < TAP_THRESHOLD) {
    if (!isTouching) {
      isTouching = true;

      if (lastTapTime > 0) {
        const interval = (now - lastTapTime) / 1000;
        taps.push(interval);
      }
      lastTapTime = now;
    }
  } else {
    isTouching = false;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  canvasCtx.beginPath();
  canvasCtx.arc(midX, midY, 15, 0, Math.PI * 2);
  canvasCtx.fillStyle = distance < TAP_THRESHOLD ? "limegreen" : "gray";
  canvasCtx.fill();
  canvasCtx.closePath();
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
}
