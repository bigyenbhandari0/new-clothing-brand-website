import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { StudioLights } from "./StudioLights";
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
      sessionStorage.setItem("nivelle-intro-studio-seen", "1");
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
      <div className="n-intro-environment" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet="/media/intro-courtyard-floor-mobile.webp" />
          <img src="/media/intro-courtyard-floor.webp" alt="" fetchPriority="high" />
        </picture>
        <div className="n-intro-environment-shade" />
      </div>
      <StudioLights reduced={reduced} />
      <div className="n-studio-vignette" aria-hidden="true" />
      <div className="n-intro-top">
        <span>NIVELLE / THE WINTER ATELIER</span>
        <button onClick={finish} className="n-intro-skip">
          Skip intro <ArrowUpRight size={12} />
        </button>
      </div>
      <div className="n-intro-center">
        <span className="n-intro-prelude">THE WINTER ATELIER</span>
        <div className="n-intro-wordmark">NIVELLE</div>
        <p className="n-intro-tagline">A quieter kind of winter.</p>
        <div className="n-floor-stage">
          <SpinningMark reduced={reduced} />
        </div>
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
