import { useEffect, useRef } from "react";
import hero from "@/assets/hero-model.jpg";
import { Button } from "@/components/ui/button";
import { useWinter } from "./useWinter";
import { cn } from "@/lib/utils";

export function Hero() {
  const { entered } = useWinter();
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0) scale(1.04)`;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); };
  }, []);

  return (
    <section id="top" className={cn("grain relative overflow-hidden bg-night min-h-screen-stable", entered && "hero-in")} aria-labelledby="hero-title">
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <img src={hero} alt="A model in an oversized oatmeal knit, cocoa wool coat and ivory scarf beside a lit cabin in the snow" width={1000} height={1375} fetchPriority="high"
          className="hero-img h-full w-full object-cover object-[60%_25%] md:object-[50%_30%]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent md:bg-gradient-to-r md:from-night/80 md:via-night/25 md:to-transparent" />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-5 pb-16 pt-28 min-h-screen-stable md:justify-center md:px-8 md:pb-0" style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom))" }}>
        <div className="hero-copy max-w-xl text-ivory">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber">Winter capsule</p>
          <h1 id="hero-title" className="mt-4 text-5xl leading-[0.95] sm:text-6xl md:text-8xl">Cold days.<br /><em>Warm layers.</em></h1>
          <p className="mt-6 max-w-md text-base text-ivory/85 md:text-lg">Soft textures, quiet moments, and pieces to settle into.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hearth" size="lg"><a href="#collection">Explore the collection</a></Button>
            <Button asChild variant="glass" size="lg"><a href="#look">Find your winter look</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
