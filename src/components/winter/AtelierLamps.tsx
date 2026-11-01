import { useEffect, useRef } from "react";

/** A cached scattering field aimed at the actual monogram, without a floor halo. */
export function AtelierLamps() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width),
        h = Math.max(1, rect.height);
      const scale = Math.min(1, 960 / w, 720 / h);
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const logo = canvas.parentElement?.querySelector(".n-spinning-mark")?.getBoundingClientRect();
      const targetX = logo ? logo.left + logo.width * 0.5 - rect.left : w * 0.5;
      const targetY = logo ? logo.top + logo.height * 0.5 - rect.top : h * 0.36;
      const lampY = Math.max(32, Math.min(h * 0.14, targetY - 140));
      const separation = w < 700 ? 48 : 68;
      const pixels = ctx.createImageData(canvas.width, canvas.height);
      for (let py = 0; py < canvas.height; py++)
        for (let px = 0; px < canvas.width; px++) {
          const x = px / scale,
            y = py / scale,
            dy = y - lampY;
          let energy = 0;
          if (dy > 0) {
            const distance = Math.max(90, targetY - lampY);
            const spread = 7 + dy * 0.145;
            const reach =
              ((1 - Math.exp(-dy / 14)) * Math.exp(-dy / (h * 0.6))) /
              (1 + Math.exp((dy - distance - 65) / 25));
            for (const side of [-1, 1]) {
              const lampX = targetX + side * separation;
              const axis = lampX + ((targetX + side * 16 - lampX) * dy) / distance;
              energy += Math.exp(-0.5 * ((x - axis) / spread) ** 2) * reach * 0.48;
            }
          }
          const i = (py * canvas.width + px) * 4;
          pixels.data[i] = 236;
          pixels.data[i + 1] = 224;
          pixels.data[i + 2] = 193;
          pixels.data[i + 3] = Math.min(150, energy * 255);
        }
      ctx.putImageData(pixels, 0, 0);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      for (const side of [-1, 1]) {
        const x = targetX + side * separation;
        ctx.save();
        ctx.translate(x, lampY);
        ctx.rotate(-side * 0.1);
        const casing = ctx.createLinearGradient(0, -10, 0, 9);
        casing.addColorStop(0, "#4a4b40");
        casing.addColorStop(0.5, "#141a16");
        casing.addColorStop(1, "#343a2e");
        ctx.fillStyle = casing;
        ctx.beginPath();
        ctx.roundRect(-30, -10, 60, 18, 4);
        ctx.fill();
        ctx.fillStyle = "#f3e3ba";
        ctx.shadowColor = "#f2d99a";
        ctx.shadowBlur = 18;
        ctx.fillRect(-23, 4, 46, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff2d3";
        ctx.fillRect(-20, 4, 40, 2);
        ctx.restore();
      }
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    const logo = canvas.parentElement?.querySelector(".n-spinning-mark");
    if (logo) observer.observe(logo);
    draw();
    document.fonts?.ready.then(() => {
      if (ref.current) draw();
    });
    return () => observer.disconnect();
  }, []);
  return <canvas ref={ref} className="n-atelier-lamps" aria-hidden="true" />;
}
