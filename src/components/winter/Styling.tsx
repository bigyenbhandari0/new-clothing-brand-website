import { AnimatedText } from "./BrandDetails";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { looks } from "@/lib/catalog";
import { useReveal } from "./useWinter";

export function Styling() {
  const [selected, setSelected] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const images = useRef<Array<HTMLImageElement | null>>([]);
  const available = useRef(new Set<number>());
  const requested = useRef<number | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ref = useReveal<HTMLDivElement>();
  const look = looks[selected] ?? looks[0];
  const commit = (i: number) => {
    clearTimeout(timeout.current);
    requested.current = null;
    setPending(null);
    setError("");
    setSelected(i);
  };
  const loaded = (i: number) => {
    available.current.add(i);
    if (requested.current === i) commit(i);
  };
  const failed = (i: number) => {
    available.current.delete(i);
    if (requested.current !== i) return;
    clearTimeout(timeout.current);
    requested.current = null;
    setPending(null);
    setError(
      "This look could not load. Your current look is still here. Please try another look or retry.",
    );
  };
  useEffect(() => {
    // SSR images can finish loading before React attaches onLoad. Inspect the
    // actual elements as well; event history is not an image-readiness signal.
    images.current.forEach((img, i) => {
      if (img?.complete && img.naturalWidth > 0) available.current.add(i);
    });
    return () => clearTimeout(timeout.current);
  }, []);
  const choose = (i: number) => {
    clearTimeout(timeout.current);
    requested.current = null;
    setPending(null);
    setError("");
    const img = images.current[i];
    if (available.current.has(i) || (img?.complete && img.naturalWidth > 0)) {
      commit(i);
      return;
    }
    requested.current = i;
    setPending(i);
    if (img?.complete && img.naturalWidth === 0) img.src = looks[i]!.image;
    timeout.current = setTimeout(() => failed(i), 8000);
  };
  return (
    <section id="look" className="n-look n-section" aria-labelledby="look-title">
      <div ref={ref} className="n-look-grid n-reveal">
        <div className="n-look-visual">
          {looks.map((l, i) => (
            <img
              key={l.id}
              ref={(element) => {
                images.current[i] = element;
              }}
              src={l.image}
              alt={`Nivelle ${l.name} winter outfit`}
              width={1000}
              height={1375}
              loading="eager"
              className={selected === i ? "is-active" : ""}
              onLoad={() => loaded(i)}
              onError={() => failed(i)}
            />
          ))}
          <span className="n-look-photo-label">NIVELLE / WINTER STORIES / 0{selected + 1}</span>
        </div>
        <div className="n-look-copy">
          <p className="n-eyebrow">02 — WAYS TO WEAR WINTER</p>
          <h2 id="look-title">
            <AnimatedText text="One season." />
            <br />
            <em>
              <AnimatedText text="Many moods." offset={120} />
            </em>
          </h2>
          <p className="n-look-description">
            From the first light to the last embers.
            <br />
            Find the layers that feel like you.
          </p>
          <div className="n-look-options" role="group" aria-label="Choose a winter outfit">
            {looks.map((l, i) => (
              <button key={l.id} aria-pressed={selected === i} onClick={() => choose(i)}>
                <span className="n-look-number">0{i + 1}</span>
                <span>
                  <strong>{l.name}</strong>
                  <small>{pending === i ? "Preparing your look…" : l.note}</small>
                </span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          {error && (
            <p className="n-look-error" role="status">
              {error}
            </p>
          )}
          <div className="n-look-pieces" aria-live="polite">
            <span className="n-eyebrow">IN THIS LOOK</span>
            <p>{look.pieces.join(" / ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
