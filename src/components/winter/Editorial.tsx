import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import knit from "@/assets/ed-knit.jpg";
import morning from "@/assets/look-morning.jpg";
import { useReveal } from "./useWinter";
import { GlobeFallback } from "./GlobeFallback";

const SnowGlobe = lazy(() => import("./SnowGlobe"));

export function Editorial() {
  const a = useReveal<HTMLDivElement>();
  const b = useReveal<HTMLDivElement>();
  return (
    <section id="journal" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32" aria-labelledby="ed-title">
      <div ref={a} className="reveal mx-auto grid max-w-7xl gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-burgundy">Journal</p>
          <h2 id="ed-title" className="mt-3 text-5xl text-cocoa md:text-7xl">Made for the slower season.</h2>
          <p className="mt-6 max-w-sm text-lg text-muted-foreground">Thick cables. Brushed wool. The hush after snowfall. Pieces meant for staying in — and the short walks between.</p>
        </div>
        <figure className="md:col-span-4">
          <img src={knit} alt="Close-up of chunky oatmeal cable knit beside a mug of cocoa" width={1000} height={1250} loading="lazy" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft" />
        </figure>
        <figure className="md:col-span-3 md:mt-40">
          <img src={morning} alt="The model in a cabin kitchen holding a warm mug" width={1000} height={1375} loading="lazy" className="aspect-[3/4] w-full rounded-[2rem] object-cover object-top shadow-soft" />
          <figcaption className="mt-3 text-sm italic text-muted-foreground">Morning light, second cup.</figcaption>
        </figure>
      </div>

      <div ref={b} className="reveal mx-auto mt-24 grid max-w-6xl items-center gap-8 rounded-[2.5rem] bg-night p-6 text-night-foreground shadow-soft md:mt-32 md:grid-cols-2 md:p-12">
        <div className="order-2 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber">Keepsake</p>
          <h3 className="mt-3 text-4xl md:text-5xl">The cabin, in miniature.</h3>
          <p className="mt-4 max-w-sm text-night-foreground/75">Every collection begins with a place. Turn it in your hands — drag or swipe the globe — and shake the snow loose.</p>
        </div>
        <div className="order-1 md:order-2">
          <ClientOnly fallback={<GlobeFallback />}>
            <Suspense fallback={<GlobeFallback />}>
              <SnowGlobe />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}
