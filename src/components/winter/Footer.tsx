import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Logo } from "./Logo";
import { useReveal, useWinter } from "./useWinter";

export function Footer() {
  const ref = useReveal<HTMLDivElement>();
  const { replay, reduced } = useWinter();
  const [burst, setBurst] = useState(0);
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const sparkle = () => {
    if (reduced) return;
    setBurst(n => n + 1); setActive(true);
    clearTimeout(timer.current); timer.current = setTimeout(() => setActive(false), 1500);
  };
  return (
    <footer className="winter-footer relative overflow-hidden bg-forest px-5 pb-8 pt-16 text-ivory md:px-8 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-ivory/20 pb-12 sm:flex-row sm:items-end">
          <div><Logo /><p className="mt-4 max-w-xs text-sm text-ivory/70">A little warmth, wherever winter takes you.</p></div>
          <button onClick={replay} className="inline-flex min-h-12 items-center gap-3 self-start rounded-full border border-ivory/30 px-6 text-sm transition hover:bg-ivory/10 sm:self-auto"><RotateCcw size={16} />Replay entrance</button>
        </div>
        <div ref={ref} className="auren py-16 text-center md:py-24">
          <p className="text-[10px] uppercase tracking-[0.4em] text-ivory/65">Experience crafted by</p>
          <button onClick={sparkle} onPointerEnter={sparkle} className={`auren-word relative mx-auto mt-5 block ${active ? "lift" : ""}`} aria-label="AUREN — play signature animation">
            <span aria-hidden="true" className="auren-signature font-display text-[clamp(4.5rem,16vw,12rem)] leading-none tracking-[0.13em]">
              {"AUREN".split("").map((letter, i) => <span key={i} className="auren-letter" style={{ animationDelay: `${i * 110}ms` }}>{letter}</span>)}
            </span>
            <span aria-hidden="true" className="auren-light" />
            {active && <span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0">{Array.from({ length: 12 }, (_, i) => <span key={i} className="auren-flake" style={{ left: `${10 + i * 7}%`, top: "55%", "--dx": `${Math.sin(i * 2) * 40}px`, "--dy": `${-40 - (i % 4) * 22}px` } as CSSProperties} />)}</span>}
          </button>
          <p className="mt-5 text-xs tracking-widest text-ivory/60">Thoughtfully imagined. Carefully brought to life.<ArrowUpRight className="ml-1 inline" size={13} aria-hidden /></p>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-ivory/20 pt-6 text-[11px] text-ivory/60 sm:flex-row"><p>Your logo · Winter capsule</p><p>Concept storefront — fictional collection, not for sale.</p></div>
      </div>
    </footer>
  );
}
