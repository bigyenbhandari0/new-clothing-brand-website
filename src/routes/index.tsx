import { createFileRoute } from "@tanstack/react-router";
import { WinterProvider } from "@/components/winter/useWinter";
import { Intro } from "@/components/winter/Intro";
import { Header } from "@/components/winter/Header";
import { Hero } from "@/components/winter/Hero";
import { Collection } from "@/components/winter/Collection";
import { Styling } from "@/components/winter/Styling";
import { Editorial } from "@/components/winter/Editorial";

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
  return (
    <WinterProvider>
      <Intro />
      <Header />
      <main>
        <Hero />
        <Collection />
        <Styling />
        <Editorial />
      </main>
      <footer className="px-5 py-12 text-center text-xs text-muted-foreground">
        Concept storefront — fictional collection, not for sale. Experience crafted by AUREN.
      </footer>
    </WinterProvider>
  );
}
