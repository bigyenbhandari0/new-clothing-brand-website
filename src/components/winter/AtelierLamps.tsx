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
      const targetY = logo ? logo.top + logo.height * 0.34 - rect.top : h * 0.36;
      const lampY = Math.max(32, Math.min(h * 0.14, targetY - 140));
      const separation = w < 700 ? 76 : 110;
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
              energy += Math.exp(-0.5 * ((x - axis) / spread) ** 2) * reach * 0.32;
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
      // Fixtures are suspended from an overhead rail, rather than floating light bars.
      const railY = 18;
      const rail = ctx.createLinearGradient(0, railY - 4, 0, railY + 5);
      rail.addColorStop(0, "#111815");
      rail.addColorStop(0.5, "#35372b");
      rail.addColorStop(1, "#0b110e");
      ctx.fillStyle = rail;
      ctx.fillRect(targetX - separation - 45, railY - 3, separation * 2 + 90, 6);
      for (const side of [-1, 1]) {
        const x = targetX + side * separation;
        ctx.strokeStyle = "#4b4b3a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, railY);
        ctx.lineTo(x, lampY - 27);
        ctx.stroke();
        ctx.fillStyle = "#171e18";
        ctx.fillRect(x - 6, lampY - 28, 12, 9);
        ctx.save();
        ctx.translate(x, lampY);
        ctx.rotate(-side * 0.15);
        const housing = ctx.createLinearGradient(-16, 0, 16, 0);
        housing.addColorStop(0, "#0b100d");
        housing.addColorStop(0.28, "#333729");
        housing.addColorStop(0.6, "#20271e");
        housing.addColorStop(1, "#0b100d");
        ctx.fillStyle = housing;
        ctx.beginPath();
        ctx.moveTo(-9, -22);
        ctx.bezierCurveTo(-12, -16, -16, -3, -16, 7);
        ctx.quadraticCurveTo(0, 15, 16, 7);
        ctx.bezierCurveTo(16, -3, 12, -16, 9, -22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#77674866";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 8, 13, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#b5a275";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 8, 10, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f3e3b9";
        ctx.shadowColor = "#e0c589";
        ctx.shadowBlur = 9;
        ctx.fill();
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
