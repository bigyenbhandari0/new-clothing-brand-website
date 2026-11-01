import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { looks } from "@/lib/catalog";
import { useReveal } from "./useWinter";

export function Styling() {
  const [selected, setSelected] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<number[]>([]);
  const ref = useReveal<HTMLDivElement>();
  const look = looks[selected] ?? looks[0];
  const choose = (i: number) => {
    if (loaded.includes(i)) setSelected(i);
    else setPending(i);
  };
  return (
    <section id="look" className="n-look n-section" aria-labelledby="look-title">
      <div ref={ref} className="n-look-grid n-reveal">
        <div className="n-look-visual">
          {looks.map((l, i) => (
            <img
              key={l.id}
              src={l.image}
              alt={`Nivelle ${l.name} winter outfit`}
              width={1000}
              height={1375}
              loading="eager"
              className={selected === i ? "is-active" : ""}
              onLoad={() => {
                setLoaded((old) => (old.includes(i) ? old : [...old, i]));
                if (pending === i) {
                  setSelected(i);
                  setPending(null);
                }
              }}
            />
          ))}
          <span className="n-look-photo-label">NIVELLE / WINTER STORIES / 0{selected + 1}</span>
        </div>
        <div className="n-look-copy">
          <p className="n-eyebrow">02 — WAYS TO WEAR WINTER</p>
          <h2 id="look-title">
            One season.
            <br />
            <em>Many moods.</em>
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
          <div className="n-look-pieces" aria-live="polite">
            <span className="n-eyebrow">IN THIS LOOK</span>
            <p>{look.pieces.join(" / ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
