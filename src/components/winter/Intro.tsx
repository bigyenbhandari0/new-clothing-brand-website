import { useEffect, useRef, useState } from "react";
import cabin from "@/assets/intro-cabin.jpg";
import { ArrowUpRight } from "lucide-react";
import { SnowCanvas } from "./SnowCanvas";
import { SpinningMark } from "./SpinningMark";
import { useWinter } from "./useWinter";

export function Intro() {
  const { entered, setEntered, reduced } = useWinter();
  const [state, setState] = useState<"idle" | "entering" | "leaving" | "done">("idle");
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = useRef(false);
  useEffect(() => {
    if (entered) setState("done");
  }, [entered]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const finish = () => {
    timers.current.forEach(clearTimeout);
    try {
      sessionStorage.setItem("nivelle-intro-v2-seen", "1");
    } catch {}
    setState("done");
    setEntered(true);
    timers.current.push(
      setTimeout(() => document.getElementById("hero-title")?.focus({ preventScroll: true }), 50),
    );
  };
  useEffect(() => {
    if (state === "done") return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = root.current;
    el?.querySelector<HTMLButtonElement>(".n-enter")?.focus();
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
      if (e.key !== "Tab" || !el) return;
      const btns = Array.from(el.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const first = btns[0],
        last = btns.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    el?.addEventListener("keydown", on);
    return () => {
      document.body.style.overflow = old;
      el?.removeEventListener("keydown", on);
    };
  }, [state]);
  const enter = () => {
    if (busy.current) return;
    busy.current = true;
    setState("entering");
    timers.current.push(setTimeout(() => setState("leaving"), reduced ? 80 : 650));
    timers.current.push(setTimeout(finish, reduced ? 280 : 1450));
  };
  if (state === "done") return null;
  return (
    <div
      ref={root}
      className="n-intro"
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Nivelle"
    >
      <div className="n-intro-scene" aria-hidden="true">
        <img src={cabin} alt="" width={1600} height={914} />
        <div className="n-intro-mist" />
        <div className="n-stage-beam n-stage-beam-left" />
        <div className="n-stage-beam n-stage-beam-right" />
        <div className="n-stage-floor" />
        <div className="n-stage-horizon" />
      </div>
      <div className="n-intro-atmosphere" />
      <div className="n-intro-halo" />
      {!reduced && (
        <SnowCanvas
          className="n-intro-snow"
          density={4.5}
          minR={0.7}
          maxR={3.1}
          speed={0.48}
          color="224,216,203"
        />
      )}
      <div className="n-intro-top">
        <span>NIVELLE / THE WINTER ATELIER</span>
        <button onClick={finish} className="n-intro-skip">
          Skip intro <ArrowUpRight size={12} />
        </button>
      </div>
      <div className="n-intro-center">
        <span className="n-intro-prelude">A SEASON OF STILLNESS</span>
        <SpinningMark reduced={reduced} />
        <div className="n-intro-wordmark">NIVELLE</div>
        <p className="n-intro-tagline">
          Outside, the world slows.
          <br />
          Inside, winter feels different.
        </p>
        <button className="n-enter" onClick={enter} disabled={state !== "idle"}>
          Enter the atelier <ArrowUpRight size={16} />
        </button>
        <span className="n-intro-season">
          <i /> THE WINTER EDIT — VOLUME 01 <i />
        </span>
      </div>
      <div className="n-intro-footer">
        <span>WARMTH, WITH INTENTION.</span>
        <span>
          AN EXPERIENCE BY <b>AUREN</b>
        </span>
      </div>
    </div>
  );
}
