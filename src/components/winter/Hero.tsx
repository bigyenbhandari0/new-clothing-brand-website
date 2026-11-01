import { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import hero from "@/assets/hero-model.jpg";
import morning from "@/assets/look-morning.jpg";
import { AnimatedText } from "./BrandDetails";
import { useWinter } from "./useWinter";

const slides = [
  {
    image: "/media/campaign-chalet.webp",
    fallback: hero,
    label: "The alpine evening",
    alt: "Oatmeal knitwear and cocoa wool layers outside an alpine chalet",
    position: "65% center",
  },
  {
    image: "/media/campaign-pines.webp",
    fallback: morning,
    label: "Among the pines",
    alt: "Pine outerwear and ivory knitwear in a snowy alpine forest",
    position: "65% center",
  },
];

export function Hero() {
  const { entered } = useWinter();
  const [active, setActive] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const change = (direction: number) =>
    setActive((i) => (i + direction + slides.length) % slides.length);
  return (
    <section
      id="top"
      className={`n-hero n-film-hero n-campaign ${entered ? "n-arrived" : ""}`}
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      aria-label="Winter campaign"
    >
      <div className="n-campaign-images" aria-hidden="true">
        {slides.map((slide, i) => (
          <div key={slide.image} className={`n-campaign-slide ${active === i ? "is-active" : ""}`}>
            <img
              src={slide.image}
              alt={slide.alt}
              style={{ objectPosition: slide.position }}
              fetchPriority={i === 0 ? "high" : "auto"}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(slide.fallback))
                  e.currentTarget.src = slide.fallback;
              }}
            />
          </div>
        ))}
        <div className="n-film-shade" />
      </div>
      <div
        className="n-campaign-swipe"
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) start.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0],
            s = start.current;
          start.current = null;
          if (
            t &&
            s &&
            Math.abs(t.clientX - s.x) > 45 &&
            Math.abs(t.clientX - s.x) > Math.abs(t.clientY - s.y)
          )
            change(t.clientX < s.x ? 1 : -1);
        }}
        onTouchCancel={() => {
          start.current = null;
        }}
        aria-hidden="true"
      />
      <div className="n-hero-copy">
        <p className="n-eyebrow">
          <span className="n-line" />
          THE WINTER CAMPAIGN · VOLUME 01
        </p>
        <h1 id="hero-title" tabIndex={-1}>
          <AnimatedText text="The art of" />
          <br />
          <em>
            <AnimatedText text="keeping warm." offset={200} />
          </em>
        </h1>
        <p className="n-hero-description">
          Quiet layers. Considered textures.
          <br />A season, felt a little differently.
        </p>
        <a href="#collection" className="n-link-button">
          Explore the collection <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="n-film-footer">
        <a href="#collection" className="n-film-scroll">
          <ArrowDown size={14} />
          <span>DISCOVER THE WINTER EDIT</span>
        </a>
        <div className="n-campaign-controls">
          <span className="n-campaign-caption" aria-live="polite" aria-atomic="true">
            0{active + 1} / 0{slides.length} — {slides[active]!.label}
          </span>
          <div className="n-campaign-buttons">
            <button onClick={() => change(-1)} aria-label="Previous campaign image">
              <ArrowLeft size={18} />
            </button>
            <div className="n-campaign-dots">
              {slides.map((s, i) => (
                <button
                  key={s.image}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${s.label}`}
                  aria-pressed={active === i}
                >
                  <span />
                </button>
              ))}
            </div>
            <button onClick={() => change(1)} aria-label="Next campaign image">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
