import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Category = "All pieces" | "Knitwear" | "Outerwear" | "Accessories";

type Ctx = {
  category: Category;
  setCategory: (v: Category) => void;
  reduced: boolean;
  entered: boolean;
  setEntered: (v: boolean) => void;
  replay: () => void;
  introKey: number;
};
const WinterCtx = createContext<Ctx | null>(null);

export function WinterProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<Category>("All pieces");
  const [reduced, setReduced] = useState(false);
  const [entered, setEntered] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => {
      setReduced(mq.matches);
      document.documentElement.classList.toggle("reduced", mq.matches);
    };
    upd();
    mq.addEventListener("change", upd);
    try {
      if (sessionStorage.getItem("nivelle-intro-seen")) setEntered(true);
    } catch {
      /* Keep the experience usable when browser storage is blocked. */
    }
    return () => mq.removeEventListener("change", upd);
  }, []);

  const replay = () => {
    try {
      sessionStorage.removeItem("nivelle-intro-seen");
    } catch {
      /* Optional session. */
    }
    document.documentElement.classList.remove("intro-seen");
    setEntered(false);
    setIntroKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <WinterCtx.Provider
      value={{ category, setCategory, reduced, entered, setEntered, replay, introKey }}
    >
      {children}
    </WinterCtx.Provider>
  );
}

export function useWinter() {
  const c = useContext(WinterCtx);
  if (!c) throw new Error("useWinter outside provider");
  return c;
}

/** Adds .is-in once the element scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
