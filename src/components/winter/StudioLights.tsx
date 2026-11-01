import { useEffect, useRef } from "react";

/** Cache the room once; animate only inexpensive, wind-driven snow paths. */
export function StudioLights({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const room = document.createElement("canvas");
    const lights = room.getContext("2d", { alpha: false });
    if (!lights) return;
    let w = 1,
      h = 1,
      scale = 1,
      raf = 0,
      last = performance.now(),
      time = 0;
    type Flake = { x: number; y: number; depth: number; seed: number };
    let snow: Flake[] = [];
    const resize = () => {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      // The atmosphere is deliberately soft. Never rasterize it at retina resolution.
      scale = Math.min(1, 1280 / w, 900 / h);
      canvas.width = room.width = Math.round(w * scale);
      canvas.height = room.height = Math.round(h * scale);
      lights.setTransform(scale, 0, 0, scale, 0, 0);
      lights.fillStyle = "#030505";
      lights.fillRect(0, 0, w, h);
      const center = w * 0.5,
        lampY = h * (w < 700 ? 0.16 : 0.145);
      const separation = w < 700 ? 31 : 42;
      // Soft gradient edges are baked once, without a full-screen blur filter.
      for (const side of [-1, 1]) {
        const x = center + side * separation;
        const cone = lights.createRadialGradient(
          x,
          lampY,
          0,
          center,
          h * 0.37,
          Math.min(w * 0.34, h * 0.47),
        );
        cone.addColorStop(0, "rgba(246,233,198,.32)");
        cone.addColorStop(0.32, "rgba(225,211,172,.095)");
        cone.addColorStop(0.72, "rgba(193,183,151,.018)");
        cone.addColorStop(1, "rgba(193,183,151,0)");
        lights.fillStyle = cone;
        lights.beginPath();
        lights.moveTo(x - 13, lampY);
        lights.quadraticCurveTo(
          x + side * 60,
          h * 0.32,
          center + side * Math.min(w * 0.3, 300),
          h * 0.67,
        );
        lights.quadraticCurveTo(center, h * 0.74, center - side * 130, h * 0.57);
        lights.closePath();
        lights.fill();
        lights.save();
        lights.translate(x, lampY);
        lights.rotate(side * 0.08);
        lights.fillStyle = "#242923";
        lights.fillRect(-23, -6, 46, 11);
        lights.fillStyle = "#fff0cf";
        lights.fillRect(-17, 3, 34, 2.5);
        lights.restore();
      }
      const halo = lights.createRadialGradient(
        center,
        h * 0.37,
        0,
        center,
        h * 0.37,
        Math.min(w * 0.35, 310),
      );
      halo.addColorStop(0, "rgba(211,194,141,.065)");
      halo.addColorStop(1, "rgba(211,194,141,0)");
      lights.fillStyle = halo;
      lights.fillRect(0, 0, w, h);
      // A faint studio crossbar stays behind the monogram, without a bright mast.
      lights.fillStyle = "#20251e";
      lights.fillRect(center - separation - 10, lampY - 9, separation * 2 + 20, 2);
      snow = Array.from({ length: w < 700 ? 100 : 190 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        depth: i % 3,
        seed: Math.random() * 6.28,
      }));
    };
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (!reduced) time += dt;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(room, 0, 0);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const gust = 1 + Math.sin(time * 0.7) * 0.3 + Math.sin(time * 1.6) * 0.12;
      for (let depth = 0; depth < 3; depth++) {
        ctx.strokeStyle = [
          "rgba(163,180,187,.20)",
          "rgba(205,216,220,.36)",
          "rgba(236,240,239,.58)",
        ][depth]!;
        ctx.lineWidth = [0.65, 1, 1.5][depth]!;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (const p of snow) {
          if (p.depth !== depth) continue;
          if (!reduced) {
            p.x += (210 + depth * 160) * gust * dt;
            p.y += (75 + depth * 65 + Math.sin(time + p.seed) * 22) * dt;
            if (p.x > w + 30) {
              p.x = -30;
              p.y = Math.random() * h;
            }
            if (p.y > h + 15) {
              p.y = -15;
              p.x = Math.random() * w;
            }
          }
          const length = reduced ? 1 : 3 + depth * 4 + gust * 2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + length, p.y + length * 0.3);
        }
        ctx.stroke();
      }
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!document.hidden) draw(last);
    };
    const observer = new ResizeObserver(() => {
      resize();
      restart();
    });
    observer.observe(canvas);
    resize();
    restart();
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", restart);
    };
  }, [reduced]);
  return <canvas ref={ref} className="n-studio-lights" aria-hidden="true" />;
}
