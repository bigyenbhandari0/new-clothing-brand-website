import { createFileRoute } from "@tanstack/react-router";
import { WinterProvider, useWinter } from "@/components/winter/useWinter";
import { Intro } from "@/components/winter/Intro";
import { Header } from "@/components/winter/Header";
import { Hero } from "@/components/winter/Hero";
import { Collection } from "@/components/winter/Collection";
import { Styling } from "@/components/winter/Styling";
import { Editorial } from "@/components/winter/Editorial";
import { Footer } from "@/components/winter/Footer";
import { FabricStudio } from "@/components/winter/FabricStudio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NIVELLE — The Winter Atelier" },
      {
        name: "description",
        content:
          "A considered winter wardrobe. Explore Nivelle’s collection, winter stories and interactive knit study.",
      },
      { property: "og:title", content: "NIVELLE — The Winter Atelier" },
      { property: "og:description", content: "A cozy winter clothing concept storefront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <WinterProvider>
      <WinterExperience />
    </WinterProvider>
  );
}

function WinterExperience() {
  const { entered, introKey } = useWinter();
  return (
    <>
      <Intro key={introKey} />
      <div inert={!entered} aria-hidden={!entered ? true : undefined}>
        <a href="#main" className="skip-content">
          Skip to collection experience
        </a>
        <Header />
        <main id="main">
          <Hero />
          <Collection />
          <Styling />
          <FabricStudio />
          <Editorial />
        </main>
        <Footer />
      </div>
    </>
  );
}
