import { AnimatedText } from "./BrandDetails";
import { useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { products, type Product } from "@/lib/catalog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useReveal, useWinter, type Category } from "./useWinter";

function Swatches({
  p,
  active,
  onPick,
}: {
  p: Product;
  active: number;
  onPick: (v: number) => void;
}) {
  return (
    <div role="group" aria-label={`${p.name} colour`} className="n-swatches">
      {p.variants.map((v, i) => (
        <button
          key={v.name}
          aria-label={v.name}
          aria-pressed={active === i}
          onClick={() => onPick(i)}
        >
          <span style={{ background: v.swatch }} />
        </button>
      ))}
    </div>
  );
}
function Card({ p, onOpen }: { p: Product; onOpen: (p: Product, v: number) => void }) {
  const [v, setV] = useState(0);
  return (
    <article className="n-product">
      <button
        className="n-product-visual"
        onClick={() => onOpen(p, v)}
        aria-label={`View ${p.name}, ${p.variants[v]?.name}`}
      >
        <div className="n-product-images">
          {p.variants.map((variant, i) => (
            <img
              key={variant.name}
              src={variant.image}
              alt={`${p.name} in ${variant.name}`}
              width={800}
              height={1000}
              loading="lazy"
              className={v === i ? "is-active" : ""}
            />
          ))}
        </div>
        <span className="n-product-open">
          <Plus size={20} />
        </span>
        <span className="n-product-hover-label">Discover the piece</span>
        <span className="n-product-index">N / {p.id.toUpperCase()}</span>
      </button>
      <div className="n-product-info">
        <div>
          <h3>{p.name}</h3>
          <p>{p.material}</p>
        </div>
        <ArrowUpRight size={17} aria-hidden="true" />
      </div>
      <div className="n-product-colors">
        <Swatches p={p} active={v} onPick={setV} />
        <span>{p.variants[v]?.name}</span>
      </div>
    </article>
  );
}
export function Collection() {
  const ref = useReveal<HTMLDivElement>();
  const { category, setCategory } = useWinter();
  const [open, setOpen] = useState<{ p: Product; v: number } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const categories: Category[] = ["All pieces", "Knitwear", "Outerwear", "Accessories"];
  const shown = products.filter(
    (p) =>
      category === "All pieces" ||
      (category === "Knitwear" && ["knit", "trousers"].includes(p.id)) ||
      (category === "Outerwear" && ["coat", "puffer"].includes(p.id)) ||
      (category === "Accessories" && ["scarf", "beanie"].includes(p.id)),
  );
  return (
    <section id="collection" className="n-collection n-section" aria-labelledby="collection-title">
      <div ref={ref} className="n-reveal">
        <div className="n-section-heading">
          <div>
            <p className="n-eyebrow">01 — THE CONSIDERED WARDROBE</p>
            <h2 id="collection-title">
              <AnimatedText text="Winter," />{" "}
              <em>
                <AnimatedText text="well dressed." offset={120} />
              </em>
            </h2>
          </div>
          <p>
            Six essentials. Endless possibilities.
            <br />A capsule to come back to.
          </p>
        </div>
        <div className="n-collection-toolbar">
          <div role="group" aria-label="Filter collection" className="n-filters">
            {categories.map((c) => (
              <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <span className="n-count" role="status">
            {shown.length} pieces in {category.toLowerCase()}
          </span>
        </div>
        <div className="n-product-grid">
          {shown.map((p) => (
            <Card
              key={p.id}
              p={p}
              onOpen={(p, v) => {
                returnFocus.current = document.activeElement as HTMLElement;
                setOpen({ p, v });
              }}
            />
          ))}
        </div>
      </div>
      <Dialog
        open={!!open}
        onOpenChange={(o) => {
          if (!o) setOpen(null);
        }}
      >
        <DialogContent
          className="n-product-dialog"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          {open && (
            <div className="n-dialog-grid">
              <div className="n-dialog-image">
                {open.p.variants.map((v, i) => (
                  <img
                    key={v.name}
                    src={v.image}
                    alt={`${open.p.name} in ${v.name}`}
                    className={open.v === i ? "is-active" : ""}
                  />
                ))}
              </div>
              <div className="n-dialog-copy">
                <p className="n-eyebrow">NIVELLE · THE WINTER EDIT</p>
                <DialogTitle className="n-dialog-title">{open.p.name}</DialogTitle>
                <DialogDescription className="n-dialog-description">
                  {open.p.material}
                </DialogDescription>
                <p className="n-dialog-color">Colour — {open.p.variants[open.v]?.name}</p>
                <Swatches p={open.p} active={open.v} onPick={(v) => setOpen({ ...open, v })} />
                <div className="n-dialog-details">
                  <p className="n-eyebrow">THE DETAILS</p>
                  <ul>
                    {open.p.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div className="n-style-note">
                  <p className="n-eyebrow">A STYLING NOTE</p>
                  <p>{open.p.styling}</p>
                </div>
                <p className="n-demo-note">
                  A concept piece, imagined for this collection. Not for sale.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
