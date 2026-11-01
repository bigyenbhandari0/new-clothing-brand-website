import { useRef, useState } from "react";
import { products, type Product } from "@/lib/catalog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useReveal } from "./useWinter";
import { cn } from "@/lib/utils";

function Swatches({ p, active, onPick, size = "sm" }: { p: Product; active: number; onPick: (i: number) => void; size?: "sm" | "lg" }) {
  return (
    <div role="radiogroup" aria-label={`${p.name} colour`} className="flex items-center gap-2">
      {p.variants.map((v, i) => (
        <button
          key={v.name}
          role="radio"
          aria-checked={active === i}
          aria-label={v.name}
          onClick={(e) => { e.stopPropagation(); onPick(i); }}
          className={cn("rounded-full border-2 transition-transform hover:scale-110", size === "lg" ? "h-10 w-10" : "h-7 w-7", active === i ? "border-cocoa" : "border-transparent")}
        >
          <span className="block h-full w-full rounded-full border border-cocoa/20" style={{ background: v.swatch }} />
        </button>
      ))}
    </div>
  );
}

function Card({ p, onOpen }: { p: Product; onOpen: (p: Product, v: number) => void }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group rounded-2xl bg-card p-3 shadow-soft transition-transform duration-500 ease-out active:scale-[0.98]"
    >
      <button onClick={() => onOpen(p, v)} className="block w-full text-left" aria-label={`View ${p.name}, ${p.variants[v].name}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
          {p.variants.map((vv, i) => (
            <img key={vv.name} src={vv.image} alt={`${p.name} in ${vv.name}`} width={800} height={1000} loading="lazy"
              className={cn("absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.03]", i === v ? "opacity-100" : "opacity-0")} />
          ))}
        </div>
        <h3 className="mt-4 px-1 text-2xl text-cocoa">{p.name}</h3>
        <p className="px-1 text-sm text-muted-foreground">{p.material}</p>
      </button>
      <div className="mt-3 flex items-center justify-between px-1 pb-1">
        <Swatches p={p} active={v} onPick={setV} />
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{p.variants[v].name}</span>
      </div>
    </div>
  );
}

export function Collection() {
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<{ p: Product; v: number } | null>(null);
  return (
    <section id="collection" className="relative px-5 py-24 md:px-8 md:py-32" aria-labelledby="col-title">
      <div ref={ref} className="reveal mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-forest">The capsule · Six pieces</p>
            <h2 id="col-title" className="mt-3 text-5xl text-cocoa md:text-7xl">The winter collection</h2>
          </div>
          <p className="max-w-sm text-muted-foreground">Built to layer, built to linger. Tap any piece for a closer look.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {products.map((p) => <Card key={p.id} p={p} onOpen={(p, v) => setOpen({ p, v })} />)}
        </div>
      </div>
      <ProductDialog state={open} onClose={() => setOpen(null)} onVariant={(v) => setOpen((o) => (o ? { ...o, v } : o))} />
    </section>
  );
}

function ProductDialog({ state, onClose, onVariant }: { state: { p: Product; v: number } | null; onClose: () => void; onVariant: (v: number) => void }) {
  const p = state?.p;
  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92svh] w-[94vw] max-w-4xl overflow-y-auto border-none bg-ivory p-0 sm:rounded-2xl">
        {p && state && (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] bg-muted md:rounded-l-2xl md:overflow-hidden">
              {p.variants.map((vv, i) => (
                <img key={vv.name} src={vv.image} alt={`${p.name} in ${vv.name}`} width={800} height={1000}
                  className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", i === state.v ? "opacity-100" : "opacity-0")} />
              ))}
            </div>
            <div className="flex flex-col gap-6 p-6 md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest">Concept piece</p>
                <DialogTitle className="mt-2 font-display text-4xl font-medium text-cocoa">{p.name}</DialogTitle>
                <DialogDescription className="mt-2 text-muted-foreground">{p.material}</DialogDescription>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-cocoa">Colour — {p.variants[state.v].name}</p>
                <Swatches p={p} active={state.v} onPick={onVariant} size="lg" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-cocoa">Material details</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {p.details.map((d) => <li key={d} className="flex gap-2"><span className="text-amber">✦</span>{d}</li>)}
                </ul>
              </div>
              <div className="rounded-xl knit-bg p-4">
                <p className="text-sm font-semibold text-cocoa">How to style it</p>
                <p className="mt-1 text-sm text-cocoa/80">{p.styling}</p>
              </div>
              <p className="text-xs text-muted-foreground">Showcase only — this concept piece isn't available to buy.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
