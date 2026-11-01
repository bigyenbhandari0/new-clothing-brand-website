import hero from "@/assets/hero-model.jpg";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AnimatedText } from "./BrandDetails";
import { useWinter } from "./useWinter";

export function Hero() {
  const { entered } = useWinter();
  return (
    <section
      id="top"
      className={`n-hero ${entered ? "n-arrived" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="n-hero-copy">
        <p className="n-eyebrow">
          <span className="n-line" />
          THE WINTER EDIT · VOL. 01
        </p>
        <h1 id="hero-title" tabIndex={-1}>
          <AnimatedText text="The art of" />
          <br />
          <em>
            <AnimatedText text="keeping warm." offset={180} />
          </em>
        </h1>
        <p className="n-hero-description">
          Quiet layers. Considered textures.
          <br />
          For the moments that make winter yours.
        </p>
        <a href="#collection" className="n-link-button">
          Explore the collection <ArrowUpRight size={18} />
        </a>
        <div className="n-hero-bottom">
          <span>DESIGNED FOR SLOWER DAYS</span>
          <a href="#collection" aria-label="Scroll to the winter collection">
            <ArrowDown size={18} />
          </a>
        </div>
      </div>
      <div className="n-hero-visual">
        <img
          src={hero}
          alt="Nivelle winter look: oatmeal knit, cocoa coat and ivory scarf in a snowy alpine setting"
          width={1000}
          height={1375}
          fetchPriority="high"
        />
        <div className="n-hero-caption">
          <span>01 / WINTER IN STILLNESS</span>
          <span>THE ALPINE CHAPTER</span>
        </div>
        <div className="n-photo-note">
          A season.
          <br />
          <em>A feeling.</em>
        </div>
      </div>
      <div className="n-vertical-note" aria-hidden="true">
        NIVELLE — WINTER ATELIER
      </div>
    </section>
  );
}
