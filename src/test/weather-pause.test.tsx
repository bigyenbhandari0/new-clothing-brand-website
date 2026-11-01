import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WinterWeather } from "@/components/winter/WinterWeather";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("fades paused snow to an empty frame without rebuilding random particles", () => {
  const drawImage = vi.fn();
  const context = {
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  let id = 0;
  const queue = new Map<number, FrameRequestCallback>();
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    queue.set(++id, fn);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (key: number) => queue.delete(key));
  const random = vi.spyOn(Math, "random");
  const { rerender } = render(<WinterWeather running />);
  const initialRandom = random.mock.calls.length;
  expect(drawImage).toHaveBeenCalled();
  rerender(<WinterWeather running={false} />);
  expect(random.mock.calls.length).toBe(initialRandom);
  let lastFrameDraws = 0;
  let time = performance.now();
  for (let frame = 0; frame < 100; frame++) {
    const callbacks = [...queue.values()];
    queue.clear();
    time += 16.67;
    if (callbacks.length) {
      drawImage.mockClear();
      act(() => callbacks.forEach((fn) => fn(time)));
      lastFrameDraws = drawImage.mock.calls.length;
    }
  }
  expect(lastFrameDraws).toBe(0);
  expect(queue.size).toBe(0);
  drawImage.mockClear();
  rerender(<WinterWeather running={false} />);
  expect(drawImage).not.toHaveBeenCalled();
  const beforeResume = random.mock.calls.length;
  rerender(<WinterWeather running />);
  expect(random.mock.calls.length).toBe(beforeResume);
  expect(queue.size).toBe(1);
});
