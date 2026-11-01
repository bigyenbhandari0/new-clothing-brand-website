import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Ctx = {
  snow: boolean;
  setSnow: (v: boolean) => void;
  reduced: boolean;
  entered: boolean;
  setEntered: (v: boolean) => void;
  replay: () => void;
  introKey: number;
};
const WinterCtx = createContext<Ctx | null>(null);

export function WinterProvider({ children }: { children: ReactNode }) {
  const [snow, setSnowState] = useState(true);
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
    if (localStorage.getItem("snow") === "off") setSnowState(false);
    if (sessionStorage.getItem("intro-seen")) setEntered(true);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const setSnow = (v: boolean) => {
    setSnowState(v);
    localStorage.setItem("snow", v ? "on" : "off");
  };
  const replay = () => {
    sessionStorage.removeItem("intro-seen");
    document.documentElement.classList.remove("intro-seen");
    setEntered(false);
    setIntroKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  return <WinterCtx.Provider value={{ snow, setSnow, reduced, entered, setEntered, replay, introKey }}>{children}</WinterCtx.Provider>;
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
