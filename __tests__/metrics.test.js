import {
  recordTap,
  getTapMetrics,
  resetTaps,
  MIN_TAP_INTERVAL,
  TAP_THRESHOLD,
} from "../metrics.js";

beforeEach(() => {
  resetTaps();
});

describe("recordTap + getTapMetrics", () => {
  test("returns null if no taps recorded", () => {
    expect(getTapMetrics()).toBeNull();
  });

  test("records a single tap but no metrics (needs at least 2 taps for interval)", () => {
    recordTap(TAP_THRESHOLD - 1, 1000); // first tap
    expect(getTapMetrics()).toBeNull();
  });

  test("records multiple taps and calculates metrics", () => {
    recordTap(TAP_THRESHOLD - 1, 1000); // first tap
    recordTap(TAP_THRESHOLD + 5, 1100); // release
    recordTap(TAP_THRESHOLD - 1, 2000); // second tap
    recordTap(TAP_THRESHOLD + 5, 2100); // release
    recordTap(TAP_THRESHOLD - 1, 3000); // third tap

    const metrics = getTapMetrics();
    expect(metrics.tapCount).toBe(2);
    expect(metrics.meanITI).toBeCloseTo(1.0, 2);
    expect(metrics.sdITI).toBeCloseTo(0.0, 2);
    expect(metrics.tapsPerSecond).toBeCloseTo(1.0, 2);
  });

  test("ignores taps that are too close together (debouncing)", () => {
    recordTap(TAP_THRESHOLD - 1, 1000); // first tap
    recordTap(TAP_THRESHOLD + 5, 1010); // release
    recordTap(TAP_THRESHOLD - 1, 1050); // too soon (< 300ms)

    expect(getTapMetrics()).toBeNull(); // still no valid interval
  });

  test("ignores taps that are too close together (debouncing)", () => {
    recordTap(TAP_THRESHOLD - 1, 1000); // first tap
    recordTap(TAP_THRESHOLD + 5, 1010); // release
    recordTap(TAP_THRESHOLD - 1, 1000 + MIN_TAP_INTERVAL - 10); // too soon

    expect(getTapMetrics()).toBeNull(); // still no valid interval
  });

  test("resets correctly", () => {
    recordTap(TAP_THRESHOLD - 1, 1000);
    resetTaps();
    expect(getTapMetrics()).toBeNull();
  });
});
