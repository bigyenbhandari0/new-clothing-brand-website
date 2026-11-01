import { Fragment, useId, type CSSProperties } from "react";

/** Word masks keep real text selectable and readable to assistive technology. */
export function AnimatedText({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(" ");
  return (
    <span className="n-text-reveal">
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="n-text-word">
            <span style={{ "--word-delay": `${offset + i * 70}ms` } as CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

export function WinterBloom({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
      className={`n-winter-bloom ${className}`}
    >
      <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth=".5" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 80 80)`}>
          <path
            d="M80 80C61 62 61 32 80 17C99 32 99 62 80 80ZM80 80V17"
            stroke="currentColor"
            strokeWidth=".7"
          />
        </g>
      ))}
      <circle cx="80" cy="80" r="6" fill="currentColor" />
    </svg>
  );
}

export function AtelierSeal() {
  const id = useId();
  return (
    <div className="n-atelier-seal" aria-hidden="true">
      <svg viewBox="0 0 150 150">
        <defs>
          <path id={id} d="M75,75m-55,0a55,55 0 1,1 110,0a55,55 0 1,1 -110,0" />
        </defs>
        <circle cx="75" cy="75" r="72" fill="none" stroke="currentColor" strokeWidth=".6" />
        <circle cx="75" cy="75" r="44" fill="none" stroke="currentColor" strokeWidth=".6" />
        <text>
          <textPath href={`#${id}`} startOffset="0%">
            NIVELLE ATELIER · WINTER IN FEELING ·{" "}
          </textPath>
        </text>
        <path
          d="M75 48C77 69 81 73 102 75C81 77 77 81 75 102C73 81 69 77 48 75C69 73 73 69 75 48Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function SeasonalRibbon() {
  return (
    <div
      className="n-seasonal-ribbon"
      aria-label="Nivelle. Warmth, well considered. The winter edit. Made for slower moments."
    >
      <div className="n-ribbon-track" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <span>WARMTH, WELL CONSIDERED</span>
            <i>✦</i>
            <span>THE WINTER EDIT</span>
            <i>✦</i>
            <span>MADE FOR SLOWER MOMENTS</span>
            <i>✦</i>
          </div>
        ))}
      </div>
    </div>
  );
}
