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
  const motion = useRef(running);
  motion.current = running;
  const resume = useRef<(() => void) | null>(null);
  useEffect(() => {
    resume.current?.();
  }, [running]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const paint = sprite.getContext("2d")!;
    const glow = paint.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, "rgba(239,246,249,.9)");
    glow.addColorStop(0.25, "rgba(220,234,241,.65)");
    glow.addColorStop(1, "rgba(220,234,241,0)");
    paint.fillStyle = glow;
    paint.fillRect(0, 0, 32, 32);
    const crystal = document.createElement("canvas");
    crystal.width = crystal.height = 64;
    const ice = crystal.getContext("2d")!;
    ice.translate(32, 32);
    ice.strokeStyle = "rgba(231,242,248,.8)";
    ice.lineWidth = 1.35;
    ice.lineCap = "round";
    for (let arm = 0; arm < 6; arm++) {
      ice.save();
      ice.rotate((arm * Math.PI) / 3);
      ice.beginPath();
      ice.moveTo(0, 0);
      ice.lineTo(0, -25);
      for (const distance of [11, 18]) {
        ice.moveTo(-6, -distance + 5);
        ice.lineTo(0, -distance);
        ice.lineTo(6, -distance + 5);
      }
      ice.stroke();
      ice.restore();
    }
    let fade = motion.current ? 1 : 0;
    let w = 1,
      h = 1,
      scale = 1,
      raf = 0,
      last = 0,
      time = 0;
    type Flake = {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      phase: number;
      crystal: boolean;
    };
    let flakes: Flake[] = [];
    const resize = () => {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      scale = Math.min(1, 1280 / w, 850 / h);
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      // Depth controls speed and defocus; the lamps are rendered in a separate cached layer.
      flakes = Array.from({ length: w < 700 ? (studio ? 140 : 80) : studio ? 310 : 145 }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: studio ? 140 + z * 300 : 40 + z * 80,
          vy: 18 + z * 50,
          phase: Math.random() * Math.PI * 2,
          crystal: z > 0.72 && Math.random() > 0.65,
        };
      });
    };
    const draw = (now: number) => {
      const dt = Math.min(last ? (now - last) / 1000 : 0, 1 / 30);
      last = now;
      const moving = motion.current;
      fade += ((moving ? 1 : 0) - fade) * (1 - Math.exp(-dt * (moving ? 4 : 7)));
      if (!moving && fade < 0.015) fade = 0;
      if (moving || fade > 0) time += dt;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const gust = studio
        ? 230 + Math.sin(time * 0.7) * 110 + Math.sin(time * 1.8) * 65
        : 75 + Math.sin(time * 0.43) * 55 + Math.sin(time * 1.17) * 24;
      const input = wind?.current;
      if (input && (moving || fade > 0)) input.impulse *= Math.exp(-dt * 2.8);
      for (const p of flakes) {
        if (moving || fade > 0) {
          const response = (studio ? 2.2 : 1.2) + p.z * 2.5;
          const eddy =
            Math.sin(p.y * 0.009 + time * 0.9 + p.phase) * 26 +
            Math.cos(p.x * 0.005 - time * 0.6) * 18;
          const wake = input
            ? input.impulse * Math.exp(-(((p.y - input.y * h) / (h * 0.3)) ** 2))
            : 0;
          const tx = (gust + eddy * (studio ? 2.4 : 1) + wake) * (0.35 + p.z * 1.4);
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
        ctx.globalAlpha =
          (studio ? (0.15 + lit * 0.4) * (0.35 + p.z * 0.65) : 0.2 + p.z * 0.35) * fade;
        const r = (0.65 + p.z * p.z * 3.7) * (p.z > 0.87 ? 1.6 : 1);
        if (fade === 0) continue;
        if (p.crystal) {
          const size = r * 2.1;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.phase + time * (studio ? 0.5 + p.z : 0.18 + p.z * 0.4));
          ctx.drawImage(crystal, -size, -size, size * 2, size * 2);
          ctx.restore();
        } else {
          if (studio && p.z > 0.65 && (moving || fade > 0)) {
            const opacity = ctx.globalAlpha;
            for (let exposure = 2; exposure > 0; exposure--) {
              ctx.globalAlpha = opacity * (0.12 / exposure);
              const trail = exposure * 0.004;
              ctx.drawImage(sprite, p.x - p.vx * trail - r, p.y - p.vy * trail - r, r * 2, r * 2);
            }
            ctx.globalAlpha = opacity;
          }
          ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
      if ((moving || fade > 0) && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden) draw(performance.now());
    };
    resume.current = restart;
    const observer = new ResizeObserver(() => {
      resize();
      restart();
    });
    observer.observe(canvas);
    resize();
    restart();
    document.addEventListener("visibilitychange", restart);
    return () => {
      resume.current = null;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", restart);
    };
  }, [studio, wind]);
  return (
    <canvas
      ref={ref}
      className={studio ? "n-studio-lights" : "n-physical-weather"}
      aria-hidden="true"
    />
  );
}
