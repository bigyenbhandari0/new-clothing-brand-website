import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = { className?: string; density?: number; minR?: number; maxR?: number; speed?: number; active?: boolean; color?: string };

/** Decorative snowfall. Never captures pointer events; pauses when hidden. */
export function SnowCanvas({ className, density = 1, minR = 0.6, maxR = 2.4, speed = 1, active = true, color = "255,250,240" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, raf = 0, running = true;
    type F = { x: number; y: number; r: number; v: number; d: number; o: number };
    let flakes: F[] = [];
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 700;
      const n = Math.round(((w * h) / (small ? 22000 : 14000)) * density);
      flakes = Array.from({ length: n }, () => {
        const r = minR + Math.random() * (maxR - minR);
        return { x: Math.random() * w, y: Math.random() * h, r, v: (0.25 + r * 0.25) * speed, d: Math.random() * Math.PI * 2, o: 0.4 + Math.random() * 0.6 };
      });
    };
    resize();
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 16.67, 3); last = t;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.d += 0.01 * dt;
        f.y += f.v * dt;
        f.x += Math.sin(f.d) * 0.3 * dt;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color},${f.o})`;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const vis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("resize", resize);
    return () => {
      running = false; cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [active, density, minR, maxR, speed, color]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none h-full w-full", className)} />;
}
