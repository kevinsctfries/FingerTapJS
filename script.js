import { fingerTapEffect, getTapMetrics } from "./fingertap.js";

const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById("overlay");
const canvasCtx = canvasElement.getContext("2d");
const resultElement = document.getElementById("result");

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
    resultElement.textContent = "Tap index and thumb together!";
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

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((landmarks, index) => {
      fingerTapEffect(landmarks, canvasCtx, results, index);
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
