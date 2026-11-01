import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import hero from "@/assets/hero-model.jpg";
import morning from "@/assets/look-morning.jpg";
import { WinterWeather } from "./WinterWeather";
import { AnimatedText } from "./BrandDetails";
import { useWinter } from "./useWinter";

const slides = [
  {
    image: "/media/campaign-chalet.webp",
    fallback: hero,
    label: "The alpine evening",
    alt: "Oatmeal knitwear and cocoa wool layers outside an alpine chalet",
    position: "76% top",
  },
  {
    image: "/media/campaign-pines.webp",
    fallback: morning,
    label: "Among the pines",
    alt: "Pine outerwear and ivory knitwear in a snowy alpine forest",
    position: "76% top",
  },
  {
    image: "/media/campaign-terrace.webp",
    fallback: hero,
    label: "First light",
    alt: "Cocoa wool tailoring on a snowy alpine terrace",
    position: "76% top",
  },
  {
    image: "/media/campaign-lodge.webp",
    fallback: morning,
    label: "The quiet hours",
    alt: "Ivory knitwear and burgundy scarf beside a warm lodge window",
    position: "76% top",
  },
];

export function Hero() {
  const { entered, reduced } = useWinter();
  const root = useRef<HTMLElement>(null);
  const wind = useRef({ x: 0.5, y: 0.5, impulse: 0 });
  const camera = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const moving = entered && !reduced && !paused && visible && !hidden;
  useEffect(() => {
    const el = root.current;
    if (!el || !moving) return;
    let raf = 0,
      last = 0,
      time = 0;
    const tick = (now: number) => {
      const dt = Math.min(last ? (now - last) / 1000 : 0, 1 / 30);
      last = now;
      time += dt;
      const c = camera.current;
      const tx =
        (wind.current.x - 0.5) * Math.min(28, el.clientWidth * 0.015) +
        Math.sin(time * 0.35) * Math.min(13, el.clientWidth * 0.007);
      const ty = (wind.current.y - 0.5) * 14 + Math.cos(time * 0.28) * 6;
      c.vx += ((tx - c.x) * 32 - c.vx * 10) * dt;
      c.vy += ((ty - c.y) * 32 - c.vy * 10) * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      el.style.setProperty("--camera-x", `${c.x}px`);
      el.style.setProperty("--camera-y", `${c.y}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moving]);
  const [active, setActive] = useState(0);
  const surface = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const change = (direction: number) =>
    setActive((i) => (i + direction + slides.length) % slides.length);
  return (
    <section
      ref={root}
      id="top"
      data-motion={moving ? "running" : "paused"}
      className={`n-hero n-film-hero n-campaign ${entered ? "n-arrived" : ""}`}
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      aria-label="Winter campaign"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          change(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="n-campaign-images" aria-hidden="true">
        <picture className="n-campaign-courtyard">
          <source media="(max-width:700px)" srcSet="/media/intro-courtyard-floor-mobile.webp" />
          <img src="/media/intro-courtyard-floor.webp" alt="" fetchPriority="high" />
        </picture>
        {slides.map((slide, i) => (
          <div key={slide.image} className={`n-campaign-slide ${active === i ? "is-active" : ""}`}>
            <img
              src={slide.image}
              alt={slide.alt}
              style={{ "--campaign-position": slide.position } as CSSProperties}
              fetchPriority={i === 0 ? "high" : "auto"}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(slide.fallback))
                  e.currentTarget.src = slide.fallback;
              }}
            />
          </div>
        ))}
        <WinterWeather studio running={moving} wind={wind} />
        <div className="n-film-shade" />
      </div>
      <div
        ref={surface}
        className="n-campaign-swipe"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          mouse.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.classList.add("is-dragging");
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const rect = e.currentTarget.getBoundingClientRect();
          const nextX = (e.clientX - rect.left) / rect.width;
          wind.current.impulse = Math.max(
            -180,
            Math.min(180, wind.current.impulse + (nextX - wind.current.x) * 500),
          );
          wind.current.x = nextX;
          wind.current.y = (e.clientY - rect.top) / rect.height;
          cursor.current?.style.setProperty("--cursor-x", `${e.clientX - rect.left}px`);
          cursor.current?.style.setProperty("--cursor-y", `${e.clientY - rect.top}px`);
          e.currentTarget.classList.add("is-hovering");
          if (mouse.current) {
            const distance = Math.max(-80, Math.min(80, (e.clientX - mouse.current.x) * 0.22));
            e.currentTarget.parentElement?.style.setProperty("--campaign-drag", `${distance}px`);
          }
        }}
        onPointerUp={(e) => {
          const m = mouse.current;
          mouse.current = null;
          e.currentTarget.classList.remove("is-dragging");
          e.currentTarget.parentElement?.style.setProperty("--campaign-drag", "0px");
          if (
            m &&
            Math.abs(e.clientX - m.x) > 55 &&
            Math.abs(e.clientX - m.x) > Math.abs(e.clientY - m.y)
          )
            change(e.clientX < m.x ? 1 : -1);
        }}
        onPointerCancel={(e) => {
          mouse.current = null;
          e.currentTarget.classList.remove("is-dragging");
          e.currentTarget.parentElement?.style.setProperty("--campaign-drag", "0px");
        }}
        onPointerLeave={(e) => e.currentTarget.classList.remove("is-hovering")}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) {
            const rect = e.currentTarget.getBoundingClientRect();
            wind.current.x = (t.clientX - rect.left) / rect.width;
            wind.current.y = (t.clientY - rect.top) / rect.height;
          }
          if (t) start.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0],
            s = start.current;
          start.current = null;
          if (t && s) wind.current.impulse = Math.max(-180, Math.min(180, (t.clientX - s.x) * 2));
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
      >
        <div ref={cursor} className="n-campaign-cursor">
          <ArrowLeft size={12} />
          <span>DRAG</span>
          <ArrowRight size={12} />
        </div>
      </div>
      <div className="n-hero-copy">
        <p className="n-eyebrow">
          <span className="n-line" />
          THE WINTER ATELIER · VOLUME 01
        </p>
        <h1 id="hero-title" tabIndex={-1}>
          <AnimatedText text="The art of" />
          <br />
          <em>
            <AnimatedText text="keeping warm." offset={200} />
          </em>
        </h1>
        <p className="n-hero-description">
          From the courtyard, into the collection.
          <br />
          Quiet layers for the colder hours.
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
          {!reduced && (
            <button
              className="n-scene-toggle"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "Resume scene animation" : "Pause scene animation"}
              aria-pressed={paused}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              <span>{paused ? "Resume atmosphere" : "Winter, in motion"}</span>
            </button>
          )}
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
                  <img src={s.image} alt="" aria-hidden="true" />
                  <span />
                  <small>0{i + 1}</small>
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
