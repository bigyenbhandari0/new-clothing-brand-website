import { useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Logo } from "./Logo";
import { useReveal, useWinter } from "./useWinter";
export function Footer() {
  const ref = useReveal<HTMLDivElement>();
  const { replay } = useWinter();
  const [glint, setGlint] = useState(0);
  return (
    <footer className="n-footer">
      <div className="n-footer-top">
        <Logo />
        <p>
          For a quieter,
          <br />
          <em>warmer kind of winter.</em>
        </p>
        <button onClick={replay}>
          <RotateCcw size={14} />
          Replay entrance
        </button>
      </div>
      <div ref={ref} className="n-credit n-reveal">
        <div className="n-credit-label">
          <span>INDEPENDENT DESIGN & DIGITAL EXPERIENCES</span>
          <span>CRAFTED BY</span>
        </div>
        <button
          key={glint}
          className="n-auren"
          aria-label="AUREN — play signature animation"
          onClick={() => setGlint((g) => g + 1)}
        >
          <span>
            {"AUREN".split("").map((l, i) => (
              <span key={i} style={{ animationDelay: `${i * 90}ms` }}>
                {l}
              </span>
            ))}
          </span>
          <ArrowUpRight aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
      </div>
      <div className="n-footer-bottom">
        <span>NIVELLE · THE WINTER ATELIER</span>
        <span>Concept collection. Imagined products. Not for sale.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
