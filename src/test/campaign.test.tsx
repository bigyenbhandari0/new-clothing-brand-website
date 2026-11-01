import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/winter/Hero";
vi.mock("@/components/winter/useWinter", () => ({ useWinter: () => ({ entered: true }) }));
vi.mock("@/components/winter/BrandDetails", () => ({
  AnimatedText: ({ text }: { text: string }) => text,
}));
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("changes campaign with arrows and dots, wraps, and removes film controls", () => {
  const { container } = render(<Hero />);
  expect(container.querySelector("video")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next campaign image" }));
  expect(screen.getByRole("button", { name: "Show Among the pines" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Next campaign image" }));
  expect(screen.getByRole("button", { name: "Show First light" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Next campaign image" }));
  fireEvent.click(screen.getByRole("button", { name: "Next campaign image" }));
  expect(screen.getByRole("button", { name: "Show The alpine evening" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Show Among the pines" }));
  fireEvent.click(screen.getByRole("button", { name: "Previous campaign image" }));
  expect(screen.getByRole("button", { name: "Show The alpine evening" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
it("responds to horizontal swipes but allows vertical scrolling", () => {
  const { container } = render(<Hero />);
  const surface = container.querySelector(".n-campaign-swipe")!;
  fireEvent.touchStart(surface, { touches: [{ clientX: 250, clientY: 100 }] });
  fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 100, clientY: 105 }] });
  expect(screen.getByRole("button", { name: "Show Among the pines" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.touchStart(surface, { touches: [{ clientX: 250, clientY: 100 }] });
  fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 190, clientY: 300 }] });
  expect(screen.getByRole("button", { name: "Show Among the pines" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("supports keyboard browsing across the four campaign scenes", () => {
  render(<Hero />);
  const gallery = screen.getByRole("region", { name: /The art of/ });
  fireEvent.keyDown(gallery, { key: "ArrowLeft" });
  expect(screen.getByRole("button", { name: "Show The quiet hours" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.keyDown(gallery, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: "Show The alpine evening" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("lets visitors pause and resume the scene animation", () => {
  const { container } = render(<Hero />);
  expect(container.querySelector("section")).toHaveAttribute("data-motion", "running");
  fireEvent.click(screen.getByRole("button", { name: "Pause scene animation" }));
  expect(container.querySelector("section")).toHaveAttribute("data-motion", "paused");
  fireEvent.click(screen.getByRole("button", { name: "Resume scene animation" }));
  expect(container.querySelector("section")).toHaveAttribute("data-motion", "running");
});
