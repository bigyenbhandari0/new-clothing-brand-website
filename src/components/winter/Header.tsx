import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { useWinter, type Category } from "./useWinter";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { setCategory } = useWinter();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [open]);
  const choose = (category: Category) => {
    setCategory(category);
    setOpen(false);
  };
  return (
    <header className={`n-header ${scrolled ? "n-header-scrolled" : ""}`}>
      <a href="#top" aria-label="Nivelle home" className="n-brand">
        <Logo />
      </a>
      <nav className="n-desktop-nav" aria-label="Main navigation">
        <a href="#collection" onClick={() => choose("All pieces")}>
          The collection
        </a>
        <a href="#look">Winter stories</a>
        <a href="#material">The knit study</a>
      </nav>
      <a href="#collection" className="n-header-cta" onClick={() => choose("All pieces")}>
        Discover the edit <ArrowUpRight size={14} />
      </a>
      <button
        className="n-menu-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav id="mobile-navigation" className="n-mobile-nav" aria-label="Mobile navigation">
          <span className="n-eyebrow">A slower kind of winter</span>
          <a href="#collection" onClick={() => choose("All pieces")}>
            The collection <ArrowUpRight />
          </a>
          <a href="#look" onClick={() => setOpen(false)}>
            Winter stories <ArrowUpRight />
          </a>
          <a href="#material" onClick={() => setOpen(false)}>
            The knit study <ArrowUpRight />
          </a>
          <p>NIVELLE · THE WINTER ATELIER</p>
        </nav>
      )}
    </header>
  );
}
