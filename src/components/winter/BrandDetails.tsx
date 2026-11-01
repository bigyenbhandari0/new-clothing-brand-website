import { Fragment, type CSSProperties } from "react";

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
