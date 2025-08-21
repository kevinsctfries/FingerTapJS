let lastTapTime = 0;
let taps = [];
let isTouching = false;
const MIN_TAP_INTERVAL = 300; // minimum time (in milliseconds) between taps
const TAP_THRESHOLD = 40; // distance threshold for thumb-index proximity

// relevant landmark indices for partial skeleton
const PARTIAL_CONNECTIONS = [
  // palm
  [0, 1],
  [1, 2],
  [2, 5],
  [5, 9],
  [9, 13],
  [13, 17],
  [0, 17],

  // thumb
  [1, 2],
  [2, 3],
  [3, 4],

  // index finger
  [5, 6],
  [6, 7],
  [7, 8],
];

export function fingerTapEffect(
  landmarks,
  canvasCtx,
  handedness,
  isPrimaryHand
) {
  if (!landmarks || landmarks.length < 21) {
    console.warn("Invalid landmarks data:", landmarks);
    return;
  }

  const thumbTip = landmarks[4]; // thumb tip
  const indexTip = landmarks[8]; // index tip

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
      if (interval) taps.push(interval);
      lastTapTime = now;
    } else if (distance >= TAP_THRESHOLD) {
      isTouching = false;
    }
  }

  // draw partial skeleton
  canvasCtx.strokeStyle = "rgba(0,0,0,0.7)";
  canvasCtx.lineWidth = 2;
  PARTIAL_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (start && end) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(
        start.x * canvasCtx.canvas.width,
        start.y * canvasCtx.canvas.height
      );
      canvasCtx.lineTo(
        end.x * canvasCtx.canvas.width,
        end.y * canvasCtx.canvas.height
      );
      canvasCtx.stroke();
    }
  });

  // visualize tracked points
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(idx => {
    const lm = landmarks[idx];
    canvasCtx.beginPath();
    canvasCtx.arc(
      lm.x * canvasCtx.canvas.width,
      lm.y * canvasCtx.canvas.height,
      5,
      0,
      Math.PI * 2
    );
    canvasCtx.fillStyle = idx === 4 || idx === 8 ? "limegreen" : "blue";
    canvasCtx.fill();
    canvasCtx.closePath();
  });

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  canvasCtx.beginPath();
  canvasCtx.arc(midX, midY, 15, 0, Math.PI * 2);
  canvasCtx.fillStyle =
    isPrimaryHand && distance < TAP_THRESHOLD ? "limegreen" : "gray";
  canvasCtx.fill();
  canvasCtx.closePath();

  // handedness label
  if (handedness && handedness.label) {
    const labelOffset = 20;
    const labelText = handedness.label === "Left" ? "R" : "L";

    const labelX = labelText === "R" ? midX - labelOffset : midX + labelOffset;
    const labelY = midY;

    canvasCtx.font = "16px Arial";
    canvasCtx.fillStyle = isPrimaryHand ? "blue" : "gray";
    canvasCtx.textBaseline = "middle";
    canvasCtx.textAlign = labelText === "R" ? "right" : "left";
    canvasCtx.fillText(labelText, labelX, labelY);
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
