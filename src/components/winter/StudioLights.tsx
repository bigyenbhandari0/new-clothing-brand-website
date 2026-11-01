import { useEffect, useRef } from "react";

/** Local, resolution-capped light study. Dust is visible inside the light, not across a flat overlay. */
export function StudioLights({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0,
      h = 0,
      raf = 0,
      last = performance.now(),
      clock = 0,
      aim = 0,
      target = 0;
    type Particle = { x: number; y: number; r: number; speed: number; phase: number };
    let dust: Particle[] = [];
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dust = Array.from({ length: w < 700 ? 100 : 200 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.25 + Math.random() * 1.25,
        speed: 9 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    const beam = (x: number, y: number, shift: number, intensity: number) => {
      ctx.save();
      ctx.filter = `blur(${Math.max(12, w * 0.012)}px)`;
      const radius = Math.min(w * 0.3, 390);
      const endY = h * 0.92;
      const gradient = ctx.createLinearGradient(x, y, x + shift, endY);
      gradient.addColorStop(0, `rgba(245,235,213,${0.22 * intensity})`);
      gradient.addColorStop(0.2, `rgba(231,219,194,${0.085 * intensity})`);
      gradient.addColorStop(0.65, `rgba(216,207,190,${0.026 * intensity})`);
      gradient.addColorStop(1, "rgba(216,207,190,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.quadraticCurveTo(x + shift + radius * 0.45, h * 0.55, x + shift + radius, endY);
      ctx.quadraticCurveTo(x + shift, endY + h * 0.08, x + shift - radius, endY);
      ctx.quadraticCurveTo(x + shift - radius * 0.45, h * 0.55, x - 10, y);
      ctx.fill();
      ctx.restore();
    };
    const lamp = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const metal = ctx.createLinearGradient(0, -6, 0, 8);
      metal.addColorStop(0, "#56544c");
      metal.addColorStop(0.4, "#171915");
      metal.addColorStop(1, "#45463d");
      ctx.fillStyle = metal;
      ctx.beginPath();
      ctx.roundRect(-23, -5, 46, 12, 3);
      ctx.fill();
      ctx.fillStyle = "#fff4d9";
      ctx.shadowColor = "#f5e5bb";
      ctx.shadowBlur = 22;
      ctx.fillRect(-17, 4, 34, 2.8);
      ctx.shadowBlur = 8;
      ctx.fillRect(-15, 4, 30, 2);
      ctx.restore();
    };
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (!reduced) clock += dt;
      aim += (target - aim) * Math.min(1, dt * 2);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#080a09";
      ctx.fillRect(0, 0, w, h);
      const lampY = h * (w < 700 ? 0.16 : 0.145),
        middle = w * 0.5,
        separation = w < 700 ? 31 : 42;
      const ambient = ctx.createRadialGradient(
        middle,
        h * 0.4,
        0,
        middle,
        h * 0.4,
        Math.min(w * 0.6, h * 0.65),
      );
      ambient.addColorStop(0, "#282a2224");
      ambient.addColorStop(1, "#00000000");
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, w, h);
      beam(
        middle - separation,
        lampY,
        aim - 24 + Math.sin(clock * 0.32) * 45,
        1.18 + Math.sin(clock * 0.6) * 0.14,
      );
      beam(
        middle + separation,
        lampY,
        aim + 24 + Math.cos(clock * 0.28) * 40,
        1.12 + Math.cos(clock * 0.5) * 0.12,
      );
      // Dark brushed-metal uprights and crossbar, kept behind the floating signature.
      const mast = middle + Math.min(95, w * 0.18);
      const pole = ctx.createLinearGradient(mast - 5, 0, mast + 5, 0);
      pole.addColorStop(0, "#080a09");
      pole.addColorStop(0.48, "#383d32");
      pole.addColorStop(0.7, "#181b16");
      pole.addColorStop(1, "#080a09");
      ctx.fillStyle = pole;
      ctx.fillRect(mast - 3, lampY - 15, 6, h * 0.76);
      ctx.fillStyle = "#272b24";
      ctx.fillRect(middle - separation - 5, lampY - 8, mast - middle + separation + 12, 4);
      lamp(middle - separation, lampY, -0.08);
      lamp(middle + separation, lampY, 0.08);
      // Broad, slow mist layers catch the moving studio light.
      for (let i = 0; i < 3; i++) {
        const cx = middle + Math.sin(clock * 0.14 + i * 2) * w * 0.22;
        const cy = h * (0.36 + i * 0.16) + Math.cos(clock * 0.18 + i) * 24;
        const mist = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w * 0.44, 480));
        mist.addColorStop(0, `rgba(188,179,147,${0.045 + Math.sin(clock * 0.3 + i) * 0.012})`);
        mist.addColorStop(1, "rgba(188,179,147,0)");
        ctx.fillStyle = mist;
        ctx.fillRect(0, 0, w, h);
      }
      const floor = ctx.createRadialGradient(
        middle,
        h * 0.82,
        0,
        middle,
        h * 0.82,
        Math.min(w * 0.38, 370),
      );
      floor.addColorStop(0, "#b7ac8512");
      floor.addColorStop(1, "#00000000");
      ctx.save();
      ctx.translate(0, h * 0.66);
      ctx.scale(1, 0.2);
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, w, h * 5);
      ctx.restore();
      for (const p of dust) {
        if (!reduced) {
          p.y += p.speed * dt;
          p.x -= dt * (5 + Math.sin(clock * 0.3 + p.phase) * 3);
          if (p.y > h) {
            p.y = -5;
            p.x = Math.random() * w;
          }
          if (p.x < 0) p.x = w;
        }
        const spread = 45 + Math.max(0, p.y - lampY) * 0.53;
        const distance = Math.abs(p.x - middle - aim * 0.5);
        const light =
          Math.max(0, 1 - distance / spread) *
          Math.max(0, 1 - Math.abs(p.y - h * 0.4) / (h * 0.55));
        const alpha = 0.025 + light * 0.7;
        ctx.strokeStyle = `rgba(237,228,207,${alpha})`;
        ctx.lineWidth = p.r * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + 2 + p.r * 1.8);
        ctx.stroke();
      }
      const vignette = ctx.createRadialGradient(
        middle,
        h * 0.4,
        Math.min(w, h) * 0.2,
        middle,
        h * 0.45,
        Math.max(w, h) * 0.65,
      );
      vignette.addColorStop(0, "#0000");
      vignette.addColorStop(1, "#000b");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      draw(last);
    };
    const move = (e: PointerEvent) => {
      if (!reduced) target = (e.clientX / Math.max(1, w) - 0.5) * 25;
    };
    const observer = new ResizeObserver(() => {
      resize();
      restart();
    });
    observer.observe(canvas);
    resize();
    restart();
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [reduced]);
  return <canvas ref={ref} className="n-studio-lights" aria-hidden="true" />;
}
