import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WinterProvider, useWinter } from "@/components/winter/useWinter";
import { Intro } from "@/components/winter/Intro";
import { Collection } from "@/components/winter/Collection";
import { Footer } from "@/components/winter/Footer";
import { Styling } from "@/components/winter/Styling";

vi.mock("@/components/winter/SnowCanvas", () => ({ SnowCanvas: () => null }));
vi.mock("@/components/winter/SpinningMark", () => ({
  SpinningMark: () => <span>Rotating Nivelle monogram</span>,
}));
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", Observer);
  window.sessionStorage.clear();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function Entrance() {
  const { entered, introKey } = useWinter();
  return (
    <>
      <Intro key={introKey} />
      <div data-testid="store" inert={!entered}>
        <h1 id="hero-title" tabIndex={-1}>
          Winter collection
        </h1>
        <Footer />
      </div>
    </>
  );
}

describe("Winter experience", () => {
  it("keeps the entrance mounted through its dissolve, then enables the store and supports replay", () => {
    vi.useFakeTimers();
    render(
      <WinterProvider>
        <Entrance />
      </WinterProvider>,
    );
    expect(screen.getByTestId("store")).toHaveAttribute("inert");
    fireEvent.click(screen.getByRole("button", { name: "Enter the atelier" }));
    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "leaving");
    expect(screen.getByTestId("store")).toHaveAttribute("inert");
    act(() => vi.advanceTimersByTime(850));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("store")).not.toHaveAttribute("inert");
    expect(sessionStorage.getItem("nivelle-intro-v2-seen")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Replay entrance" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "idle");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters the collection and opens the selected colour in an accessible detail dialog", () => {
    render(
      <WinterProvider>
        <Collection />
      </WinterProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Accessories" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 pieces in accessories");
    expect(screen.queryByRole("button", { name: /View Alpine Puffer/ })).not.toBeInTheDocument();
    const beanie = screen.getByRole("button", { name: /View Hearth Beanie/ }).parentElement!;
    fireEvent.click(within(beanie).getByRole("button", { name: "Oatmeal" }));
    fireEvent.click(screen.getByRole("button", { name: "View Hearth Beanie, Oatmeal" }));
    expect(within(screen.getByRole("dialog")).getByText("Colour — Oatmeal")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("keeps the current outfit visible until the requested image loads", () => {
    render(<Styling />);
    const snow = screen.getByRole("button", { name: /02 Snow day/ });
    fireEvent.click(snow);
    expect(snow).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByAltText("Nivelle Cabin morning winter outfit")).toHaveClass("is-active");
    fireEvent.load(screen.getByAltText("Nivelle Snow day winter outfit"));
    expect(snow).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByAltText("Nivelle Snow day winter outfit")).toHaveClass("is-active");
  });
  it("switches cached SSR images even when no load event is received after hydration", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1000);
    render(<Styling />);
    fireEvent.click(screen.getByRole("button", { name: /02 Snow day/ }));
    expect(screen.getByAltText("Nivelle Snow day winter outfit")).toHaveClass("is-active");
    expect(screen.queryByText("Preparing your look…")).not.toBeInTheDocument();
  });

  it("does not let a late image load override the most recent selection", () => {
    render(<Styling />);
    fireEvent.click(screen.getByRole("button", { name: /02 Snow day/ }));
    fireEvent.load(screen.getByAltText("Nivelle Fireside evening winter outfit"));
    fireEvent.click(screen.getByRole("button", { name: /03 Fireside evening/ }));
    fireEvent.load(screen.getByAltText("Nivelle Snow day winter outfit"));
    expect(screen.getByAltText("Nivelle Fireside evening winter outfit")).toHaveClass("is-active");
    expect(screen.queryByText("Preparing your look…")).not.toBeInTheDocument();
  });

  it("keeps the existing outfit and ends loading if an image fails or times out", () => {
    vi.useFakeTimers();
    render(<Styling />);
    fireEvent.click(screen.getByRole("button", { name: /02 Snow day/ }));
    fireEvent.error(screen.getByAltText("Nivelle Snow day winter outfit"));
    expect(screen.getByRole("status")).toHaveTextContent("could not load");
    expect(screen.queryByText("Preparing your look…")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /03 Fireside evening/ }));
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.queryByText("Preparing your look…")).not.toBeInTheDocument();
    expect(screen.getByAltText("Nivelle Cabin morning winter outfit")).toHaveClass("is-active");
  });
});
