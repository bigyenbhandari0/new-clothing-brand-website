import { AnimatedText } from "./BrandDetails";
import knit from "@/assets/ed-knit.jpg";
import { useReveal } from "./useWinter";
export function Editorial() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="journal" className="n-editorial n-section">
      <div ref={ref} className="n-editorial-grid n-reveal">
        <div className="n-editorial-copy">
          <p className="n-eyebrow">THE NIVELLE POINT OF VIEW</p>
          <h2>
            <AnimatedText text="Less noise." />
            <br />
            <em>
              <AnimatedText text="More feeling." offset={120} />
            </em>
          </h2>
          <p>
            The weight of a good knit. The comfort of a familiar coat. The beauty of getting dressed
            without overthinking it.
          </p>
          <p>
            Our winter world is an invitation to slow down, layer up, and find a little warmth in
            the everyday.
          </p>
          <span className="n-editorial-signature">Nivelle</span>
        </div>
        <figure>
          <img
            src={knit}
            alt="A close study of oatmeal cable-knit texture beside warm cocoa"
            width={1000}
            height={1250}
            loading="lazy"
          />
          <figcaption>
            <span>TEXTURE STUDY NO. 01</span>
            <span>SOFTNESS, UP CLOSE.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
