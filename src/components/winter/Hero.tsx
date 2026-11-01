import { useEffect, useRef, useState } from "react";
import hero from "@/assets/hero-model.jpg";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { AnimatedText } from "./BrandDetails";
import { useWinter } from "./useWinter";

export function Hero() {
  const { entered, reduced } = useWinter();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    setSaveData(!!connection?.saveData);
  }, []);
  const enabled = entered && (manual || (!reduced && !saveData)) && !failed;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let visible = true;
    const update = () => {
      if (!enabled || userPaused || document.hidden || !visible) {
        element.pause();
        return;
      }
      void element.play().catch(() => {
        /* Keep the poster and an explicit Play control if autoplay is blocked. */
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        update();
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [enabled, userPaused]);
  const toggle = () => {
    if (playing) {
      setUserPaused(true);
      video.current?.pause();
    } else {
      setManual(true);
      setUserPaused(false);
      void video.current?.play().catch(() => {});
    }
  };
  return (
    <section
      id="top"
      className={`n-hero n-film-hero ${entered ? "n-arrived" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className={`n-hero-visual n-film-visual ${hasFrame ? "n-film-ready" : ""}`}>
        <img
          className="n-film-poster"
          src={hero}
          alt="Nivelle winter campaign, with oatmeal knitwear and cocoa outerwear in an alpine setting"
          width={1000}
          height={1375}
          fetchPriority="high"
        />
        <video
          ref={video}
          className="n-hero-video"
          src={enabled ? "/media/nivelle-winter-film.mp4" : undefined}
          poster={hero}
          muted
          loop
          playsInline
          preload={enabled ? "auto" : "none"}
          aria-hidden="true"
          onPlaying={() => {
            setPlaying(true);
            setHasFrame(true);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            el.parentElement?.style.setProperty(
              "--film-progress",
              String(el.duration > 0 ? el.currentTime / el.duration : 0),
            );
          }}
        />
        <div className="n-film-shade" aria-hidden="true" />
        <div className="n-film-grain" aria-hidden="true" />
      </div>
      <div className="n-hero-copy">
        <p className="n-eyebrow">
          <span className="n-line" />
          THE WINTER FILM · VOLUME 01
        </p>
        <h1 id="hero-title" tabIndex={-1}>
          <AnimatedText text="The art of" />
          <br />
          <em>
            <AnimatedText text="keeping warm." offset={200} />
          </em>
        </h1>
        <p className="n-hero-description">
          Quiet layers. Considered textures.
          <br />A season, felt a little differently.
        </p>
        <a href="#collection" className="n-link-button">
          Explore the collection <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="n-film-footer">
        <a href="#collection" className="n-film-scroll">
          <ArrowDown size={14} />
          <span>DISCOVER THE WINTER EDIT</span>
        </a>
        <div className="n-film-caption">
          <span>{playing ? "WINTER, IN MOTION" : "THE NIVELLE CAMPAIGN"}</span>
          {!failed && (
            <button
              onClick={toggle}
              aria-label={playing ? "Pause campaign film" : "Play campaign film"}
              aria-pressed={playing}
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
              <span>{playing ? "Pause film" : "Play film"}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
