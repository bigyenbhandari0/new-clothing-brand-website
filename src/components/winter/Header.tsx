import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, X } from "lucide-react";
import knit from "@/assets/p-knit-oatmeal.jpg";
import { Logo } from "./Logo";
import { WinterBloom } from "./BrandDetails";
import { useWinter, type Category } from "./useWinter";

const NAV = [
  { id: "collection", label: "The collection", note: "The considered wardrobe" },
  { id: "look", label: "Winter stories", note: "Three ways to wear the season" },
  { id: "material", label: "The knit studio", note: "Get closer to the texture" },
  { id: "journal", label: "Our world", note: "The Nivelle point of view" },
];
const CATEGORIES: Category[] = ["All pieces", "Knitwear", "Outerwear", "Accessories"];
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [active, setActive] = useState("top");
  const root = useRef<HTMLElement>(null);
  const collectionButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { setCategory, entered } = useWinter();
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 35);
        const height = document.documentElement.scrollHeight - window.innerHeight;
        root.current?.style.setProperty(
          "--nav-progress",
          String(height > 0 ? Math.min(1, window.scrollY / height) : 0),
        );
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, []);
  useEffect(() => {
    if (!entered) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -48% 0px", threshold: [0, 0.15, 0.4] },
    );
    ["top", ...NAV.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [entered]);
  useEffect(() => {
    if (!open && !collectionOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (collectionOpen) {
        setCollectionOpen(false);
        collectionButton.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setCollectionOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, collectionOpen]);
  const choose = (category: Category) => {
    setCategory(category);
    setCollectionOpen(false);
    setOpen(false);
    setActive("collection");
  };
  const go = (id: string) => {
    setOpen(false);
    setCollectionOpen(false);
    setActive(id);
  };
  return (
    <header
      ref={root}
      className={`n-header n-header-v3 ${scrolled ? "n-header-scrolled" : ""} ${open ? "n-nav-is-open" : ""}`}
    >
      <div className="n-nav-shell">
        <a href="#top" aria-label="Nivelle home" className="n-brand" onClick={() => go("top")}>
          <Logo />
        </a>
        <div className="n-nav-divider" aria-hidden="true" />
        <nav className="n-desktop-nav" aria-label="Main navigation">
          <button
            ref={collectionButton}
            className={`n-nav-link ${active === "collection" ? "is-active" : ""}`}
            aria-expanded={collectionOpen}
            aria-controls="collection-menu"
            onClick={() => setCollectionOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCollectionOpen(true);
                requestAnimationFrame(() =>
                  document.querySelector<HTMLAnchorElement>("#collection-menu a")?.focus(),
                );
              }
            }}
          >
            The collection <ChevronDown size={12} className={collectionOpen ? "is-rotated" : ""} />
          </button>
          {NAV.slice(1).map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => go(n.id)}
              className={`n-nav-link ${active === n.id ? "is-active" : ""}`}
              aria-current={active === n.id ? "location" : undefined}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#collection" className="n-header-cta" onClick={() => choose("All pieces")}>
          <span>Explore the edit</span>
          <span className="n-nav-cta-icon">
            <ArrowUpRight size={16} />
          </span>
        </a>
        <button
          ref={menuButton}
          className="n-menu-toggle"
          onClick={() => {
            setOpen((v) => !v);
            setCollectionOpen(false);
          }}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span>{open ? "Close" : "Menu"}</span>
          {open ? (
            <X size={18} />
          ) : (
            <span className="n-menu-lines" aria-hidden="true">
              <i />
              <i />
            </span>
          )}
        </button>
        <div className="n-nav-progress" aria-hidden="true" />
      </div>
      {collectionOpen && (
        <div id="collection-menu" className="n-mega-menu">
          <div className="n-mega-copy">
            <p className="n-eyebrow">THE WINTER WARDROBE</p>
            <p>
              Find your
              <br />
              <em>next favourite.</em>
            </p>
            <div className="n-mega-categories">
              {CATEGORIES.map((c, i) => (
                <a key={c} href="#collection" onClick={() => choose(c)}>
                  <span>0{i + 1}</span>
                  {c}
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
            <span className="n-mega-note">Six pieces. A whole season of possibilities.</span>
          </div>
          <a href="#collection" className="n-mega-photo" onClick={() => choose("Knitwear")}>
            <img src={knit} alt="Discover Nivelle oatmeal knitwear" width={800} height={1000} />
            <span>
              The softer side of winter <ArrowUpRight size={16} />
            </span>
          </a>
        </div>
      )}
      {open && (
        <nav id="mobile-navigation" className="n-mobile-nav" aria-label="Mobile navigation">
          <div className="n-mobile-nav-intro">
            <span className="n-eyebrow">A SLOWER KIND OF WINTER</span>
            <WinterBloom />
          </div>
          {NAV.map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => (n.id === "collection" ? choose("All pieces") : go(n.id))}
            >
              <span className="n-mobile-number">0{i + 1}</span>
              <span>
                {n.label}
                <small>{n.note}</small>
              </span>
              <ArrowUpRight />
            </a>
          ))}
          <div className="n-mobile-category-links">
            {CATEGORIES.slice(1).map((c) => (
              <a href="#collection" key={c} onClick={() => choose(c)}>
                {c}
              </a>
            ))}
          </div>
          <p>
            NIVELLE · THE WINTER ATELIER<span>VOL. 01</span>
          </p>
        </nav>
      )}
    </header>
  );
}
