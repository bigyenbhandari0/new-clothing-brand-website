import { useEffect, useState } from "react";
import { Menu, Snowflake } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { useWinter, type Category } from "./useWinter";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#collection", label: "Knitwear" },
  { href: "#collection", label: "Outerwear" },
  { href: "#collection", label: "Accessories" },
  { href: "#look", label: "Lookbook" },
];

export function SnowToggle({ className }: { className?: string }) {
  const { snow, setSnow } = useWinter();
  return (
    <button
      onClick={() => setSnow(!snow)}
      aria-pressed={snow}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.15em] transition frost hover:bg-ivory", className)}
    >
      <Snowflake className={cn("h-4 w-4 transition-transform duration-700", snow && "rotate-180 text-forest")} aria-hidden />
      Snow: {snow ? "On" : "Off"}
    </button>
  );
}

export function Header() {
  const { setCategory } = useWinter();
  const chooseCategory = (label: string) => { if (label !== "Lookbook") setCategory(label as Category); };
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-500", scrolled ? "frost shadow-soft" : "bg-transparent")} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        <a href="#top" aria-label="Your logo — back to top" className="text-cocoa">
          <Logo />
        </a>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} onClick={() => chooseCategory(n.label)} className="text-sm font-medium text-cocoa/80 transition hover:text-cocoa">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SnowToggle className="hidden sm:inline-flex" />
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full frost text-cocoa lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm bg-ivory knit-bg">
              <SheetTitle className="text-cocoa"><Logo /></SheetTitle>
              <nav aria-label="Mobile" className="mt-10 flex flex-col gap-2">
                {NAV.map((n) => (
                  <SheetClose asChild key={n.label}>
                    <a href={n.href} onClick={() => chooseCategory(n.label)} className="rounded-lg px-2 py-3 font-display text-3xl text-cocoa transition hover:bg-ivory/60">{n.label}</a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-8"><SnowToggle /></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
