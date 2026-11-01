import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WinterProvider, useWinter } from "@/components/winter/useWinter";
import { Intro } from "@/components/winter/Intro";
import { Collection } from "@/components/winter/Collection";
import { Footer } from "@/components/winter/Footer";

vi.mock("@/components/winter/SnowCanvas", () => ({ SnowCanvas: () => null }));
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", Observer);
  window.sessionStorage.clear(); window.localStorage.clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function Entrance() {
  const { entered, introKey } = useWinter();
  return <><Intro key={introKey} /><div data-testid="store" inert={!entered}><h1 id="hero-title" tabIndex={-1}>Winter collection</h1><Footer /></div></>;
}

describe("Winter experience", () => {
  it("keeps the entrance mounted through its dissolve, then enables the store and supports replay", () => {
    vi.useFakeTimers();
    render(<WinterProvider><Entrance /></WinterProvider>);
    expect(screen.getByTestId("store")).toHaveAttribute("inert");
    fireEvent.click(screen.getByRole("button", { name: "Step inside" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "leaving");
    expect(screen.getByTestId("store")).toHaveAttribute("inert");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("store")).not.toHaveAttribute("inert");
    expect(sessionStorage.getItem("intro-seen")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Replay entrance" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "idle");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters the collection and opens the selected colour in an accessible detail dialog", () => {
    render(<WinterProvider><Collection /></WinterProvider>);
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
});
