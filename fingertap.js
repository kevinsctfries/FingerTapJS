import { recordTap } from "./metrics.js";

// relevant landmark indices for partial skeleton
const PARTIAL_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 5],
  [5, 9],
  [9, 13],
  [13, 17],
  [0, 17],
  [1, 2],
  [2, 3],
  [3, 4],
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

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const x1 = thumbTip.x * canvasCtx.canvas.width;
  const y1 = thumbTip.y * canvasCtx.canvas.height;
  const x2 = indexTip.x * canvasCtx.canvas.width;
  const y2 = indexTip.y * canvasCtx.canvas.height;
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const now = performance.now();

  // Record tap for primary hand
  if (isPrimaryHand) {
    recordTap(distance, now);
  }

  // draw skeleton structure
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

  // draw points
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

  // draw sphere in between index and thumb
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  canvasCtx.beginPath();
  canvasCtx.arc(midX, midY, 15, 0, Math.PI * 2);
  canvasCtx.fillStyle = isPrimaryHand && distance < 30 ? "limegreen" : "gray"; // 30px matches TAP_THRESHOLD
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
