import { useEffect, useRef, type MutableRefObject } from "react";

export type WindInput = { x: number; y: number; impulse: number };
/** Depth-dependent snow: inertia, terminal fall speed, gusts and a local pointer wake. */
export function WinterWeather({
  running,
  studio = false,
  wind,
}: {
  running: boolean;
  studio?: boolean;
  wind?: MutableRefObject<WindInput>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: !studio });
    if (!ctx) return;
    const room = document.createElement("canvas");
    const light = room.getContext("2d");
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const paint = sprite.getContext("2d")!;
    const glow = paint.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, "rgba(239,246,249,.9)");
    glow.addColorStop(0.25, "rgba(220,234,241,.65)");
    glow.addColorStop(1, "rgba(220,234,241,0)");
    paint.fillStyle = glow;
    paint.fillRect(0, 0, 32, 32);
    let w = 1,
      h = 1,
      scale = 1,
      raf = 0,
      last = 0,
      time = 0;
    type Flake = { x: number; y: number; z: number; vx: number; vy: number; phase: number };
    let flakes: Flake[] = [];
    const resize = () => {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      scale = Math.min(1, 1280 / w, 850 / h);
      canvas.width = room.width = Math.round(w * scale);
      canvas.height = room.height = Math.round(h * scale);
      if (studio && light) {
        // Bake smooth light scattering into pixels once, never polygonal light cones.
        const pixels = light.createImageData(room.width, room.height);
        const sy = h * (w < 700 ? 0.16 : 0.145);
        for (let py = 0; py < room.height; py++)
          for (let px = 0; px < room.width; px++) {
            const x = px / scale,
              y = py / scale,
              dy = y - sy;
            let illumination = 0;
            if (dy > 0) {
              const spread = 16 + dy * 0.24;
              const fade = (1 - Math.exp(-dy / 35)) * Math.exp(-dy / (h * 0.28));
              for (const side of [-1, 1]) {
                const axis = w * 0.5 + side * (w < 700 ? 31 : 42) + side * dy * 0.07;
                illumination += Math.exp(-0.5 * ((x - axis) / spread) ** 2) * fade * 0.21;
              }
            }
            const index = (py * room.width + px) * 4;
            pixels.data[index] = 3 + illumination * 230;
            pixels.data[index + 1] = 5 + illumination * 217;
            pixels.data[index + 2] = 5 + illumination * 183;
            pixels.data[index + 3] = 255;
          }
        light.putImageData(pixels, 0, 0);
        light.setTransform(scale, 0, 0, scale, 0, 0);
        for (const side of [-1, 1]) {
          const x = w * 0.5 + side * (w < 700 ? 31 : 42);
          const halo = light.createRadialGradient(x, sy, 0, x, sy, 32);
          halo.addColorStop(0, "#f5e3b326");
          halo.addColorStop(1, "#f5e3b300");
          light.fillStyle = halo;
          light.fillRect(x - 32, sy - 32, 64, 64);
          const metal = light.createLinearGradient(x, sy - 7, x, sy + 5);
          metal.addColorStop(0, "#33372e");
          metal.addColorStop(1, "#0c100d");
          light.fillStyle = metal;
          light.fillRect(x - 22, sy - 7, 44, 11);
          light.fillStyle = "#e8ddbd";
          light.fillRect(x - 16, sy + 2, 32, 2);
        }
      }
      flakes = Array.from({ length: w < 700 ? 80 : studio ? 220 : 145 }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: 40 + z * 80,
          vy: 18 + z * 50,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };
    const draw = (now: number) => {
      const dt = Math.min(last ? (now - last) / 1000 : 0, 1 / 30);
      last = now;
      if (running) time += dt;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (studio) ctx.drawImage(room, 0, 0);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const gust = 75 + Math.sin(time * 0.43) * 55 + Math.sin(time * 1.17) * 24;
      const input = wind?.current;
      if (input && running) input.impulse *= Math.exp(-dt * 2.8);
      for (const p of flakes) {
        if (running) {
          const response = 1.2 + p.z * 2.5;
          const eddy =
            Math.sin(p.y * 0.009 + time * 0.9 + p.phase) * 26 +
            Math.cos(p.x * 0.005 - time * 0.6) * 18;
          const wake = input
            ? input.impulse * Math.exp(-(((p.y - input.y * h) / (h * 0.3)) ** 2))
            : 0;
          const tx = (gust + eddy + wake) * (0.35 + p.z * 1.4);
          p.vx += (tx - p.vx) * (1 - Math.exp(-response * dt));
          // Gravity balanced by air drag; eddies change each flake's path independently.
          p.vy +=
            (32 + p.z * 80 + Math.sin(time * 1.3 + p.phase) * 22 - p.vy) *
            (1 - Math.exp(-dt * 1.8));
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x > w + 20) p.x = -20;
          if (p.x < -20) p.x = w + 20;
          if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
          }
        }
        const spread = 50 + Math.max(0, p.y - h * 0.15) * 0.28;
        const lit = Math.exp(-(((p.x - w * 0.5) / spread) ** 2));
        ctx.globalAlpha = studio ? (0.08 + lit * 0.55) * (0.35 + p.z * 0.65) : 0.18 + p.z * 0.3;
        const r = (0.65 + p.z * p.z * 3.7) * (p.z > 0.87 ? 1.6 : 1);
        ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      if (running && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden) draw(performance.now());
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
  }, [running, studio, wind]);
  return (
    <canvas
      ref={ref}
      className={studio ? "n-studio-lights" : "n-physical-weather"}
      aria-hidden="true"
    />
  );
}
