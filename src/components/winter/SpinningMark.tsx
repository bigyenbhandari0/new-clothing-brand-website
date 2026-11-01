import { useEffect, useRef, useState } from "react";
import { Emblem } from "./Logo";

export function SpinningMark({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const motion = useRef(reduced);
  motion.current = reduced;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let stopped = false;
    let clean: (() => void) | undefined;
    import("three")
      .then((T) => {
        if (stopped) return;
        try {
          const renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
          renderer.setSize(el.clientWidth, el.clientHeight);
          renderer.setClearColor(0, 0);
          renderer.toneMapping = T.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.3;
          renderer.domElement.setAttribute("aria-hidden", "true");
          el.appendChild(renderer.domElement);
          const scene = new T.Scene();
          const camera = new T.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.1, 30);
          camera.position.set(0, 0, 7.3);
          scene.add(new T.AmbientLight(0xeee6da, 1.4));
          const light = new T.DirectionalLight(0xffe8c8, 5);
          light.position.set(-3, 4, 5);
          scene.add(light);
          const rim = new T.DirectionalLight(0xa5bdcb, 4);
          rim.position.set(4, -1, -2);
          scene.add(rim);
          const metal = new T.MeshStandardMaterial({
            color: 0xe5d3b3,
            metalness: 0.78,
            roughness: 0.24,
          });
          const group = new T.Group();
          scene.add(group);
          const shape = new T.Shape();
          shape.moveTo(-0.58, -0.85);
          shape.lineTo(-0.58, 0.85);
          shape.lineTo(-0.36, 0.85);
          shape.lineTo(0.45, -0.55);
          shape.lineTo(0.45, 0.85);
          shape.lineTo(0.58, 0.85);
          shape.lineTo(0.58, -0.85);
          shape.lineTo(0.36, -0.85);
          shape.lineTo(-0.45, 0.55);
          shape.lineTo(-0.45, -0.85);
          shape.closePath();
          const geo = new T.ExtrudeGeometry(shape, {
            depth: 0.09,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.018,
            bevelThickness: 0.018,
          });
          geo.translate(0, 0, -0.045);
          group.add(new T.Mesh(geo, metal));
          const oval = new T.EllipseCurve(0, 0, 0.92, 1.25, 0, Math.PI * 2, false, 0);
          const points = oval.getPoints(120).map((p) => new T.Vector3(p.x, p.y, 0));
          const curve = new T.CatmullRomCurve3(points, true);
          const ringGeo = new T.TubeGeometry(curve, 120, 0.014, 8, true);
          group.add(new T.Mesh(ringGeo, metal));
          let raf = 0,
            last = performance.now(),
            angle = -0.25;
          const tick = (t: number) => {
            const dt = Math.min((t - last) / 1000, 0.04);
            last = t;
            if (!motion.current) angle += dt * 0.8;
            group.rotation.y = motion.current ? -0.25 : angle;
            group.rotation.x = motion.current ? 0 : Math.sin(t / 3500) * 0.08;
            renderer.render(scene, camera);
            if (!document.hidden) raf = requestAnimationFrame(tick);
          };
          const resume = () => {
            cancelAnimationFrame(raf);
            last = performance.now();
            if (!document.hidden) raf = requestAnimationFrame(tick);
          };
          document.addEventListener("visibilitychange", resume);
          const resize = new ResizeObserver(() => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
            camera.updateProjectionMatrix();
          });
          resize.observe(el);
          resume();
          setReady(true);
          clean = () => {
            cancelAnimationFrame(raf);
            resize.disconnect();
            document.removeEventListener("visibilitychange", resume);
            geo.dispose();
            ringGeo.dispose();
            metal.dispose();
            renderer.dispose();
            renderer.domElement.remove();
          };
        } catch {
          /* Keep the CSS 3D monogram available on devices without WebGL. */
        }
      })
      .catch(() => {});
    return () => {
      stopped = true;
      clean?.();
    };
  }, []);
  return (
    <div className="n-spinning-mark" aria-label="Nivelle rotating metallic monogram">
      <div ref={host} className="n-mark-canvas" />
      {!ready && (
        <div className={`n-mark-fallback ${reduced ? "is-still" : ""}`}>
          <Emblem />
        </div>
      )}
    </div>
  );
}
