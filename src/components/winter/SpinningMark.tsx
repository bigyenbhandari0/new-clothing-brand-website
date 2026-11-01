import { useEffect, useId, useRef, useState } from "react";

/** Same solid silhouette for the WebGL sculpture and the extruded CSS fallback. */
function SculptedFace({ edge = false }: { edge?: boolean }) {
  const id = useId();
  return (
    <svg viewBox="-112 -145 224 290" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff4da" />
          <stop offset=".2" stopColor="#bda47b" />
          <stop offset=".4" stopColor="#f2dfb5" />
          <stop offset=".57" stopColor="#8d7654" />
          <stop offset=".8" stopColor="#e5cda0" />
          <stop offset="1" stopColor="#b39a72" />
        </linearGradient>
      </defs>
      <g fill={edge ? "#806746" : `url(#${id})`}>
        <path
          fillRule="evenodd"
          d="M0 -135A100 135 0 1 1 0 135A100 135 0 1 1 0 -135ZM0 -124A89 124 0 1 0 0 124A89 124 0 1 0 0 -124Z"
        />
        <path d="M-57 88V-88H-30L40 45V-88H57V88H30L-40 -45V88Z" />
      </g>
      <path d="M-64 -88H-20M20 88H64" stroke={edge ? "#806746" : "#e7d1a9"} strokeWidth="4" />
    </svg>
  );
}

export function SpinningMark({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const motion = useRef(reduced);
  motion.current = reduced;
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let stopped = false;
    let clean: (() => void) | undefined;
    import("three")
      .then((T) => {
        if (stopped) return;
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
          if (!context) return;
          const renderer = new T.WebGLRenderer({
            canvas,
            context,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
          renderer.setSize(el.clientWidth, el.clientHeight);
          renderer.setClearColor(0, 0);
          renderer.toneMapping = T.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.05;
          canvas.setAttribute("aria-hidden", "true");
          el.appendChild(canvas);
          const scene = new T.Scene();
          const camera = new T.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 30);
          camera.position.set(0, 0.1, 6.6);
          camera.lookAt(0, 0, 0);
          // Self-contained studio light boxes give metal broad, moving reflections.
          const envCanvas = document.createElement("canvas");
          envCanvas.width = 1024;
          envCanvas.height = 512;
          const ctx = envCanvas.getContext("2d")!;
          ctx.fillStyle = "#282b29";
          ctx.fillRect(0, 0, 1024, 512);
          const softbox = (x: number, y: number, w: number, h: number, color: string) => {
            const gradient = ctx.createLinearGradient(x, 0, x + w, 0);
            gradient.addColorStop(0, "#383b35");
            gradient.addColorStop(0.18, color);
            gradient.addColorStop(0.82, color);
            gradient.addColorStop(1, "#383b35");
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w, h);
          };
          softbox(80, 30, 170, 420, "#fff1d7");
          softbox(490, 90, 90, 270, "#f6faff");
          softbox(760, 10, 190, 180, "#e7d3af");
          const envTexture = new T.CanvasTexture(envCanvas);
          envTexture.mapping = T.EquirectangularReflectionMapping;
          const pmrem = new T.PMREMGenerator(renderer);
          const environment = pmrem.fromEquirectangular(envTexture);
          scene.environment = environment.texture;
          envTexture.dispose();
          pmrem.dispose();
          scene.add(new T.HemisphereLight(0xe9e5da, 0x3b3328, 1.2));
          const key = new T.DirectionalLight(0xffefce, 4);
          key.position.set(-3, 4, 5);
          scene.add(key);
          const rim = new T.DirectionalLight(0xc5d5eb, 3.5);
          rim.position.set(4, 1, -3);
          scene.add(rim);
          const face = new T.MeshPhysicalMaterial({
            color: 0xd8c09a,
            metalness: 0.92,
            roughness: 0.22,
            clearcoat: 0.5,
            clearcoatRoughness: 0.2,
            envMapIntensity: 1.1,
          });
          const side = new T.MeshStandardMaterial({
            color: 0x8d6f47,
            metalness: 0.85,
            roughness: 0.3,
          });
          const group = new T.Group();
          scene.add(group);
          const n = new T.Shape();
          n.moveTo(-0.57, -0.88);
          n.lineTo(-0.57, 0.88);
          n.lineTo(-0.3, 0.88);
          n.lineTo(0.4, -0.45);
          n.lineTo(0.4, 0.88);
          n.lineTo(0.57, 0.88);
          n.lineTo(0.57, -0.88);
          n.lineTo(0.3, -0.88);
          n.lineTo(-0.4, 0.45);
          n.lineTo(-0.4, -0.88);
          n.closePath();
          const nGeo = new T.ExtrudeGeometry(n, {
            depth: 0.24,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.035,
            bevelThickness: 0.035,
            steps: 1,
          });
          nGeo.translate(0, 0, -0.12);
          group.add(new T.Mesh(nGeo, [face, side]));
          const ring = new T.Shape();
          ring.absellipse(0, 0, 1, 1.35, 0, Math.PI * 2, false, 0);
          const hole = new T.Path();
          hole.absellipse(0, 0, 0.89, 1.24, 0, Math.PI * 2, true, 0);
          ring.holes.push(hole);
          const ringGeo = new T.ExtrudeGeometry(ring, {
            depth: 0.18,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.025,
            bevelThickness: 0.025,
            curveSegments: 96,
            steps: 1,
          });
          ringGeo.translate(0, 0, -0.09);
          group.add(new T.Mesh(ringGeo, [face, side]));
          const serifGeo = new T.BoxGeometry(0.42, 0.025, 0.24);
          const serif1 = new T.Mesh(serifGeo, face);
          serif1.position.set(-0.43, 0.88, 0);
          group.add(serif1);
          const serif2 = serif1.clone();
          serif2.position.set(0.43, -0.88, 0);
          group.add(serif2);
          let raf = 0,
            last = performance.now(),
            angle = -0.5,
            px = 0,
            py = 0;
          const tick = (t: number) => {
            const dt = Math.min((t - last) / 1000, 0.04);
            last = t;
            if (!motion.current) angle += dt * 0.57;
            px += (pointer.current.x - px) * Math.min(1, dt * 5);
            py += (pointer.current.y - py) * Math.min(1, dt * 5);
            group.rotation.y = motion.current ? -0.5 : angle + px * 0.13;
            group.rotation.x = motion.current ? 0.08 : 0.1 + py * 0.12;
            group.position.y = motion.current ? 0 : Math.sin(t / 2100) * 0.045;
            renderer.render(scene, camera);
            if (!document.hidden) raf = requestAnimationFrame(tick);
          };
          const restart = () => {
            cancelAnimationFrame(raf);
            last = performance.now();
            if (!document.hidden) raf = requestAnimationFrame(tick);
          };
          const lost = (e: Event) => {
            e.preventDefault();
            cancelAnimationFrame(raf);
            setReady(false);
          };
          canvas.addEventListener("webglcontextlost", lost);
          document.addEventListener("visibilitychange", restart);
          const resize = new ResizeObserver(() => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
            camera.updateProjectionMatrix();
          });
          resize.observe(el);
          restart();
          setReady(true);
          clean = () => {
            cancelAnimationFrame(raf);
            resize.disconnect();
            document.removeEventListener("visibilitychange", restart);
            canvas.removeEventListener("webglcontextlost", lost);
            nGeo.dispose();
            ringGeo.dispose();
            serifGeo.dispose();
            face.dispose();
            side.dispose();
            environment.dispose();
            renderer.dispose();
            canvas.remove();
          };
        } catch {
          /* The layered 3D sculpture remains interactive when WebGL is unavailable. */
        }
      })
      .catch(() => {});
    return () => {
      stopped = true;
      clean?.();
    };
  }, []);
  return (
    <div
      className="n-spinning-mark n-sculpture"
      aria-label="Nivelle solid bronze three-dimensional monogram"
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    >
      <div ref={host} className="n-mark-canvas" />
      {!ready && (
        <div className={`n-solid-logo ${reduced ? "is-still" : ""}`}>
          <div className="n-logo-volume">
            {Array.from({ length: 19 }, (_, i) => (
              <div
                className={`n-logo-slice ${i === 0 || i === 18 ? "n-logo-face" : "n-logo-edge"}`}
                key={i}
                style={{ transform: `translateZ(${i - 9}px)` }}
              >
                <SculptedFace edge={i !== 0 && i !== 18} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="n-monogram-shadow" aria-hidden="true" />
    </div>
  );
}
