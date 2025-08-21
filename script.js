import { fingerTapEffect, getTapMetrics } from "./fingertap.js";

const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById("overlay");
const canvasCtx = canvasElement.getContext("2d");
const resultElement = document.getElementById("result");
const disclaimerElement = document.getElementById("disclaimer");
const disclaimerCloseButton = document.getElementById("disclaimer-close");

if (disclaimerCloseButton && disclaimerElement) {
  disclaimerCloseButton.addEventListener("click", () => {
    disclaimerElement.style.display = "none";
  });
}

function updateResultMessage() {
  const metrics = getTapMetrics();
  if (metrics) {
    resultElement.textContent = `Taps: ${
      metrics.tapCount
    }, Mean ITI: ${metrics.meanITI.toFixed(
      2
    )}s, Variability: ${metrics.sdITI.toFixed(
      2
    )}s, Taps per Second: ${metrics.tapsPerSecond.toFixed(2)}`;
  } else {
    resultElement.textContent =
      "Tap index and thumb together with either hand!";
  }
  resultElement.style.display = "block";
}

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(results => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  canvasCtx.restore();

  if (results.multiHandLandmarks && results.multiHandedness) {
    let primaryHandIndex = 0;
    if (results.multiHandLandmarks.length > 1) {
      const rightHandIndex = results.multiHandedness.findIndex(
        h => h.label === "Right"
      );
      primaryHandIndex = rightHandIndex !== -1 ? rightHandIndex : 0;
    }

    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness[index];
      const isPrimaryHand = index === primaryHandIndex;
      const flippedLandmarks = landmarks.map(landmark => ({
        ...landmark,
        x: 1 - landmark.x,
      }));
      fingerTapEffect(flippedLandmarks, canvasCtx, handedness, isPrimaryHand);
    });
  }

  canvasCtx.restore();
  updateResultMessage();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();
