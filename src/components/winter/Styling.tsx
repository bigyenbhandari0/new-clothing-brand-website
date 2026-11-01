import { useState } from "react";
import { looks } from "@/lib/catalog";
import { useReveal } from "./useWinter";
import { cn } from "@/lib/utils";

export function Styling() {
  const [i, setI] = useState(0);
  const ref = useReveal<HTMLDivElement>();
  const look = looks[i] ?? looks[0];
  return (
    <section id="look" className="grain relative bg-cocoa px-5 py-24 text-ivory md:px-8 md:py-32" aria-labelledby="look-title">
      <div ref={ref} className="reveal mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-16">
        <div className="relative mx-auto aspect-[4/5.5] w-full max-w-lg overflow-hidden rounded-[2rem] bg-night shadow-soft">
          {looks.map((l, k) => (
            <img key={l.id} src={l.image} alt={`The same model dressed for ${l.name}`} width={1000} height={1375}
              loading={k === 0 ? "lazy" : "eager"} decoding="async"
              className={cn("outfit-img absolute inset-0 h-full w-full object-cover object-top", k === i ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]")} />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-6 pt-20">
            <p className="font-display text-3xl italic" aria-live="polite">{look.name}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber">Lookbook</p>
          <h2 id="look-title" className="mt-3 text-5xl md:text-7xl">Find your winter look</h2>
          <div role="tablist" aria-label="Outfits" className="mt-10 flex flex-col gap-3">
            {looks.map((l, k) => (
              <button key={l.id} role="tab" aria-selected={k === i} onClick={() => setI(k)}
                className={cn("flex min-h-14 items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-500",
                  k === i ? "border-amber bg-ivory text-cocoa shadow-[var(--shadow-glow)]" : "border-ivory/20 hover:border-ivory/50 hover:bg-ivory/5")}>
                <span>
                  <span className="block font-display text-2xl">{l.name}</span>
                  <span className={cn("block text-sm", k === i ? "text-cocoa/70" : "text-ivory/60")}>{l.note}</span>
                </span>
                <span className="text-sm font-semibold">0{k + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 rounded-2xl frost-dark p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">In this look</p>
            <ul key={look.id} className="mt-3 grid gap-2 sm:grid-cols-2">
              {look.pieces.map((pc, k) => (
                <li key={pc} className="animate-in fade-in slide-in-from-bottom-2 text-sm text-ivory/90" style={{ animationDelay: `${k * 70}ms`, animationFillMode: "both" }}>✦ {pc}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
