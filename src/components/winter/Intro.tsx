import { useEffect, useRef, useState } from "react";
import cabin from "@/assets/intro-cabin.jpg";
import { Logo } from "./Logo";
import { SnowCanvas } from "./SnowCanvas";
import { useWinter } from "./useWinter";
import { Button } from "@/components/ui/button";

const LIGHTS = [
  [18, 30], [27, 44], [36, 50], [64, 48], [72, 52], [80, 40], [9, 58], [90, 62],
];

export function Intro() {
  const { entered, setEntered, reduced, snow } = useWinter();
  const [state, setState] = useState<"idle" | "entering" | "leaving" | "done">("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (entered) setState("done");
    else { setState("idle"); busy.current = false; }
  }, [entered]);

  // parallax: pointer on desktop, gentle autopilot + touch on mobile
  useEffect(() => {
    const el = rootRef.current;
    if (!el || state === "done" || reduced) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, auto = !window.matchMedia("(pointer: fine)").matches;
    let touchUntil = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (e.pointerType !== "mouse") touchUntil = performance.now() + 2500;
    };
    const loop = (t: number) => {
      if (auto && t > touchUntil) { tx = Math.sin(t / 3200) * 0.7; ty = Math.cos(t / 4100) * 0.4; }
      x += (tx - x) * 0.05; y += (ty - y) * 0.05;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); };
  }, [state, reduced]);

  useEffect(() => {
    if (state === "done") return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [state]);

  const finish = () => {
    sessionStorage.setItem("intro-seen", "1");
    document.documentElement.classList.add("intro-seen");
    setEntered(true);
  };

  const enter = () => {
    if (busy.current) return;
    busy.current = true;
    if (reduced) {
      setState("leaving");
      setTimeout(finish, 450);
      return;
    }
    setState("entering");
    // let the hero begin appearing under the warm flood, then dissolve
    setTimeout(() => { setEntered(true); setState("leaving"); }, 2200);
    setTimeout(finish, 2900);
  };

  const skip = () => { busy.current = true; finish(); };

  if (state === "done") return null;

  const layer = (depth: number) => ({
    transform: `translate3d(calc(var(--px,0) * ${-depth}px), calc(var(--py,0) * ${-depth * 0.6}px), 0)`,
  });

  return (
    <div
      ref={rootRef}
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      className="intro-root fixed inset-0 z-[60] overflow-hidden bg-night text-night-foreground"
    >
      <div className="intro-stage absolute inset-0">
        <div className="absolute -inset-[4%]" style={layer(14)}>
          <img src={cabin} alt="" width={1600} height={914} className="h-full w-full object-cover" style={{ objectPosition: "49% 62%" }} />
          {/* doorway panels that swing open */}
          <div className="absolute flex" style={{ left: "46.4%", top: "54%", width: "5.2%", height: "14%" }} aria-hidden="true">
            <div className="door-panel h-full w-1/2 bg-cocoa/90 shadow-soft" />
            <div className="door-panel right h-full w-1/2 bg-cocoa/90 shadow-soft" />
          </div>
          {LIGHTS.map(([l, t], i) => (
            <span key={i} className="twinkle absolute h-1.5 w-1.5 rounded-full bg-amber" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.6}s`, boxShadow: "var(--shadow-glow)" }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-transparent to-night/60" />
        {snow && <SnowCanvas className="absolute inset-0" density={0.9} minR={0.4} maxR={1.2} speed={0.6} />}
        <div className="absolute -inset-[6%]" style={layer(34)}>
          {snow && <SnowCanvas className="absolute inset-0" density={0.5} minR={1.2} maxR={2.4} speed={1} />}
        </div>
        <div className="absolute -inset-[10%] blur-[3px]" style={layer(70)}>
          {snow && <SnowCanvas className="absolute inset-0" density={0.08} minR={3} maxR={6} speed={1.6} />}
        </div>
      </div>

      <div className="intro-glow pointer-events-none absolute inset-0 opacity-40" />
      <div className="intro-flood pointer-events-none absolute inset-0" />

      <div className="intro-ui relative flex h-full flex-col items-center justify-center px-6 text-center" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="-mt-[18vh]" style={{ perspective: "800px", ...layer(-10) }}>
          <div className={reduced ? "" : "logo-float"}>
            <Logo size="lg" className="flex-col gap-4 text-ivory drop-shadow-[0_0_30px_oklch(0.78_0.14_68/0.5)]" emblemClassName="text-amber" />
          </div>
        </div>
        <p className="mt-8 font-display text-2xl italic text-ivory/90 md:text-3xl">A little warmth awaits.</p>
        <Button variant="hearth" size="lg" className="mt-8" onClick={enter} disabled={state !== "idle"} autoFocus>
          Step inside
        </Button>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.35em] text-ivory/60" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
          Crafted by AUREN
        </p>
        <button onClick={skip} className="absolute right-5 top-5 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-ivory/75 transition hover:text-ivory frost-dark" style={{ marginTop: "env(safe-area-inset-top)" }}>
          Skip intro
        </button>
      </div>
    </div>
  );
}
