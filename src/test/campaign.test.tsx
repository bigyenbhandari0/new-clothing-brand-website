import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/winter/Hero";
vi.mock("@/components/winter/useWinter", () => ({ useWinter: () => ({ entered: true }) }));
vi.mock("@/components/winter/BrandDetails", () => ({
  AnimatedText: ({ text }: { text: string }) => text,
}));
afterEach(cleanup);
it("changes campaign with arrows and dots, wraps, and removes film controls", () => {
  const { container } = render(<Hero />);
  expect(container.querySelector("video")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next campaign image" }));
  expect(screen.getByRole("button", { name: "Show Among the pines" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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
