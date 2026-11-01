import { createFileRoute } from "@tanstack/react-router";
import { WinterProvider, useWinter } from "@/components/winter/useWinter";
import { Intro } from "@/components/winter/Intro";
import { Header } from "@/components/winter/Header";
import { Hero } from "@/components/winter/Hero";
import { Collection } from "@/components/winter/Collection";
import { Styling } from "@/components/winter/Styling";
import { Editorial } from "@/components/winter/Editorial";
import { Footer } from "@/components/winter/Footer";
import { SnowCanvas } from "@/components/winter/SnowCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your logo — Cold days. Warm layers." },
      { name: "description", content: "A cozy winter clothing concept storefront: knits, coats and layers for the slower season." },
      { property: "og:title", content: "Your logo — Cold days. Warm layers." },
      { property: "og:description", content: "A cozy winter clothing concept storefront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <WinterProvider><WinterExperience /></WinterProvider>;
}

function WinterExperience() {
  const { entered, introKey, snow, reduced } = useWinter();
  return (
    <>
      <Intro key={introKey} />
      <div inert={!entered} aria-hidden={!entered ? true : undefined}>
        <a href="#main" className="skip-content">Skip to collection experience</a>
        <Header />
        {entered && snow && !reduced && <div className="pointer-events-none fixed inset-0 z-30 opacity-45"><SnowCanvas density={0.35} minR={0.6} maxR={1.7} speed={0.55} /></div>}
        <main id="main">
          <Hero />
          <Collection />
          <Styling />
          <Editorial />
        </main>
        <Footer />
      </div>
    </>
  );
}
