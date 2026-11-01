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
    let pointerY = 0.5;
    let wake = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dust = Array.from({ length: w < 700 ? 110 : 260 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.8,
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
      // Full-room atmosphere: cool side light, warm drifting fog and floor reflections.
      const sideLights = [
        { x: w * (0.12 + Math.sin(clock * 0.12) * 0.08), y: h * 0.4, color: "122,148,146" },
        { x: w * (0.86 + Math.cos(clock * 0.1) * 0.07), y: h * 0.58, color: "175,142,91" },
      ];
      for (const light of sideLights) {
        const glow = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          Math.max(w * 0.48, h * 0.6),
        );
        glow.addColorStop(0, `rgba(${light.color},.105)`);
        glow.addColorStop(1, `rgba(${light.color},0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }
      for (let i = 0; i < 5; i++) {
        const fx = w * (0.08 + i * 0.21) + Math.sin(clock * 0.19 + i) * w * 0.12 + aim * 1.7;
        const fy = h * (0.28 + (i % 3) * 0.23) + Math.cos(clock * 0.15 + i) * h * 0.1;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(1, 0.42);
        const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w * 0.38, 260));
        fog.addColorStop(0, `rgba(189,183,159,${0.07 + Math.sin(clock * 0.24 + i) * 0.025})`);
        fog.addColorStop(0.45, "rgba(146,151,135,.025)");
        fog.addColorStop(1, "rgba(146,151,135,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(-w, -h, w * 2, h * 2);
        ctx.restore();
      }
      if (!reduced) wake = Math.max(0, wake - dt * 0.35);
      if (wake > 0) {
        const glow = ctx.createRadialGradient(
          w * 0.5 + target * 12,
          h * pointerY,
          0,
          w * 0.5 + target * 12,
          h * pointerY,
          220,
        );
        glow.addColorStop(0, `rgba(219,199,152,${wake * 0.045})`);
        glow.addColorStop(1, "rgba(219,199,152,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }
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
          p.x += dt * (Math.sin(clock * 0.3 + p.phase) * 11 + aim * 0.25);
          if (p.y > h) {
            p.y = -5;
            p.x = Math.random() * w;
          }
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
        }
        const spread = 45 + Math.max(0, p.y - lampY) * 0.53;
        const distance = Math.abs(p.x - middle - aim * 0.5);
        const light =
          Math.max(0, 1 - distance / spread) *
          Math.max(0, 1 - Math.abs(p.y - h * 0.4) / (h * 0.55));
        const twinkle = 0.7 + Math.sin(clock * 0.8 + p.phase) * 0.3;
        const alpha = (0.13 + light * 0.55) * twinkle;
        if (p.r > 1.65) {
          ctx.fillStyle = `rgba(214,204,175,${alpha * 0.16})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
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
      vignette.addColorStop(1, "#0005");
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
      if (!reduced) {
        target = (e.clientX / Math.max(1, w) - 0.5) * 35;
        pointerY = e.clientY / Math.max(1, h);
        wake = 1;
      }
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
