import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material } from "three";
import { RotateCcw, RotateCw, Sparkles } from "lucide-react";
import { GlobeFallback } from "./GlobeFallback";
import { useWinter } from "./useWinter";

/** Procedural cabin keeps the keepsake self-contained: no remote models or textures. */
export default function SnowGlobe() {
  const host = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const shake = useRef(0);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { reduced, snow } = useWinter();
  const settings = useRef({ reduced, snow });
  settings.current = { reduced, snow };

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let destroy: (() => void) | undefined;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry?.isIntersecting || disposed || destroy) return;
      observer.disconnect();
      try {
        const T = await import("three");
        if (disposed) return;
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(36, 1, 0.1, 40);
        camera.position.set(0, 1.3, 6.7);
        camera.lookAt(0, 0.05, 0);
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.domElement.setAttribute("aria-hidden", "true");
        element.appendChild(renderer.domElement);
        const world = new T.Group();
        scene.add(world);
        scene.add(new T.HemisphereLight(0xd9eafb, 0x554030, 2.6));
        const light = new T.DirectionalLight(0xffd7a1, 4);
        light.position.set(-3, 5, 4); scene.add(light);
        const rim = new T.DirectionalLight(0xaacfff, 2);
        rim.position.set(3, 2, -3); scene.add(rim);
        const wood = new T.MeshStandardMaterial({ color: 0x583627, roughness: 0.85 });
        const dark = new T.MeshStandardMaterial({ color: 0x38291f, roughness: 0.6 });
        const white = new T.MeshStandardMaterial({ color: 0xf5f2e9, roughness: 0.9 });
        const pine = new T.MeshStandardMaterial({ color: 0x204d40, roughness: 0.9 });
        const windowMat = new T.MeshStandardMaterial({ color: 0xffd589, emissive: 0xffaa44, emissiveIntensity: 2 });
        const mesh = (geometry: BufferGeometry, material: Material, x: number, y: number, z: number) => {
          const m = new T.Mesh(geometry, material); m.position.set(x, y, z); world.add(m); return m;
        };
        mesh(new T.CylinderGeometry(1.18, 1.25, 0.23, 64), dark, 0, -1.36, 0);
        mesh(new T.CylinderGeometry(1.22, 1.22, 0.07, 64), wood, 0, -1.2, 0);
        mesh(new T.CylinderGeometry(1.17, 1.17, 0.13, 64), white, 0, -1.1, 0);
        mesh(new T.BoxGeometry(1.05, 0.78, 0.85), wood, 0, -0.66, 0);
        // A triangular roof extruded along the cabin's depth.
        const shape = new T.Shape(); shape.moveTo(-0.66, 0); shape.lineTo(0, 0.6); shape.lineTo(0.66, 0); shape.closePath();
        mesh(new T.ExtrudeGeometry(shape, { depth: 1.08, bevelEnabled: false }), white, 0, -0.27, -0.54);
        mesh(new T.BoxGeometry(0.22, 0.46, 0.05), dark, 0, -0.82, 0.45);
        for (const x of [-0.32, 0.32]) {
          mesh(new T.BoxGeometry(0.22, 0.24, 0.035), windowMat, x, -0.63, 0.45);
          mesh(new T.BoxGeometry(0.025, 0.25, 0.04), dark, x, -0.63, 0.475);
          mesh(new T.BoxGeometry(0.23, 0.025, 0.04), dark, x, -0.63, 0.475);
        }
        mesh(new T.BoxGeometry(0.15, 0.4, 0.17), wood, 0.32, 0.1, -0.12);
        const glow = new T.PointLight(0xffba65, 2.5, 3); glow.position.set(0, -0.45, 0.8); world.add(glow);
        for (const [x, z, scale] of [[-0.8, -0.15, 0.9], [0.78, -0.35, 1.15], [-0.45, -0.75, 0.65]]) {
          if (x === undefined || z === undefined || scale === undefined) continue;
          mesh(new T.CylinderGeometry(0.035, 0.05, 0.35, 8), wood, x, -0.94, z);
          for (let i = 0; i < 3; i++) {
            const y = -0.8 + i * 0.22 * scale;
            mesh(new T.ConeGeometry((0.32 - i * 0.06) * scale, 0.53 * scale, 12), pine, x, y, z);
            mesh(new T.ConeGeometry((0.27 - i * 0.055) * scale, 0.36 * scale, 12), white, x, y + 0.09 * scale, z);
          }
        }
        const glass = new T.Mesh(new T.SphereGeometry(1.47, 48, 32), new T.MeshPhysicalMaterial({ color: 0xd8eaff, transparent: true, opacity: 0.12, roughness: 0.08, metalness: 0.2, clearcoat: 1, side: T.FrontSide, depthWrite: false }));
        scene.add(glass);
        const ring = new T.Mesh(new T.TorusGeometry(1.47, 0.012, 8, 80), new T.MeshBasicMaterial({ color: 0xbcd5e3, transparent: true, opacity: 0.35 }));
        ring.rotation.y = 0.35; scene.add(ring);
        // Soft glass reflection, positioned on the surface rather than a flat overlay.
        const shine = new T.Mesh(new T.SphereGeometry(1.48, 24, 12, 0.3, 0.6, 0.5, 0.85), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: T.DoubleSide, depthWrite: false }));
        shine.rotation.y = -1.1; scene.add(shine);
        const count = window.innerWidth < 700 ? 150 : 260;
        const positions = new Float32Array(count * 3);
        const speeds = Array.from({ length: count }, () => 0.08 + Math.random() * 0.15);
        for (let i = 0; i < count; i++) {
          const radius = Math.cbrt(Math.random()) * 1.35;
          const theta = Math.random() * Math.PI * 2;
          const u = Math.random() * 2 - 1;
          positions.set([radius * Math.sqrt(1 - u * u) * Math.cos(theta), radius * u, radius * Math.sqrt(1 - u * u) * Math.sin(theta)], i * 3);
        }
        const flakesGeo = new T.BufferGeometry(); flakesGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
        const flakes = new T.Points(flakesGeo, new T.PointsMaterial({ color: 0xfffaf0, size: 0.026, transparent: true, opacity: 0.85, depthWrite: false }));
        world.add(flakes);
        let raf = 0, last = 0, visible = true, angle = 0;
        const render = (now: number) => {
          const dt = Math.min((now - last) / 1000 || 0, 0.04); last = now;
          const prefs = settings.current;
          angle += (rotation.current - angle) * Math.min(1, dt * 8);
          world.rotation.y = angle;
          if (!prefs.reduced && shake.current > 0) shake.current = Math.max(0, shake.current - dt * 0.32);
          world.rotation.z = prefs.reduced ? 0 : Math.sin(now / 70) * shake.current * 0.035;
          if (!prefs.reduced && prefs.snow) {
            for (let i = 0; i < count; i++) {
              const k = i * 3;
              let x = positions[k]!, y = positions[k + 1]!, z = positions[k + 2]!;
              const spin = shake.current * dt * 3;
              const nx = x * Math.cos(spin) - z * Math.sin(spin);
              z = x * Math.sin(spin) + z * Math.cos(spin); x = nx;
              y += dt * (shake.current * 1.4 - speeds[i]!);
              const bound = Math.sqrt(Math.max(0.01, 1.35 ** 2 - x * x - z * z));
              if (y < -bound) y = bound;
              if (y > bound) y = -bound;
              positions[k] = x; positions[k + 1] = y; positions[k + 2] = z;
            }
            flakesGeo.attributes["position"]!.needsUpdate = true;
          }
          flakes.visible = prefs.snow;
          renderer.render(scene, camera);
          if (visible && !document.hidden) raf = requestAnimationFrame(render);
        };
        const restart = () => { cancelAnimationFrame(raf); last = performance.now(); if (visible && !document.hidden) raf = requestAnimationFrame(render); };
        const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; restart(); }); io.observe(element);
        const resize = new ResizeObserver(() => { const w = element.clientWidth; const h = element.clientHeight; renderer.setSize(w, h); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }); resize.observe(element);
        const lost = (e: Event) => { e.preventDefault(); setFailed(true); };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        document.addEventListener("visibilitychange", restart);
        const resources = new Set<InstanceType<typeof T.Material>>();
        destroy = () => {
          cancelAnimationFrame(raf); io.disconnect(); resize.disconnect();
          document.removeEventListener("visibilitychange", restart);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          scene.traverse((o) => { if (o instanceof T.Mesh || o instanceof T.Points) { o.geometry.dispose(); const mats = Array.isArray(o.material) ? o.material : [o.material]; mats.forEach(m => resources.add(m)); } });
          resources.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove();
        };
        setReady(true); restart();
      } catch { if (!disposed) setFailed(true); }
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); destroy?.(); };
  }, []);

  useEffect(() => {
    if (!shaking) return;
    const timer = window.setTimeout(() => setShaking(false), reduced ? 400 : 3200);
    return () => window.clearTimeout(timer);
  }, [shaking, reduced]);
  const pointer = useRef<{ id: number; x: number } | null>(null);
  if (failed) return <GlobeFallback note="A quiet winter keepsake — interactive 3D is unavailable on this device." />;
  return (
    <div className="globe-experience">
      <div className="globe-stage relative aspect-square w-full" role="group" aria-label="3D winter cabin snow globe. Swipe horizontally or use the rotation buttons."
        onPointerDown={e => { pointer.current = { id: e.pointerId, x: e.clientX }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const p = pointer.current; if (!p || p.id !== e.pointerId) return; rotation.current += (e.clientX - p.x) * 0.012; p.x = e.clientX; }}
        onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }}>
        {!ready && <div className="absolute inset-0"><GlobeFallback /></div>}
        <div ref={host} className="absolute inset-0" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="globe-control" aria-label="Rotate globe left" disabled={!ready} onClick={() => { rotation.current -= Math.PI / 4; }}><RotateCcw size={17} /></button>
        <button className="globe-control gap-2 px-5" disabled={!ready || shaking || !snow} onClick={() => { shake.current = reduced ? 0 : 1; setShaking(true); }}><Sparkles size={16} />{shaking ? "Snow is settling…" : "Shake the snow"}</button>
        <button className="globe-control" aria-label="Rotate globe right" disabled={!ready} onClick={() => { rotation.current += Math.PI / 4; }}><RotateCw size={17} /></button>
      </div>
      <p className="mt-3 text-center text-xs text-ivory/60" aria-live="polite">{!snow ? "Turn snow on above to shake the globe." : reduced ? "Reduced motion · use arrows to explore" : "Drag slowly. Stay a little longer."}</p>
    </div>
  );
}
