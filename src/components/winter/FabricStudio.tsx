import { AnimatedText } from "./BrandDetails";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, MoveHorizontal } from "lucide-react";
import knit from "@/assets/ed-knit.jpg";
import { useReveal, useWinter } from "./useWinter";

const COLORS = [
  { name: "Oatmeal", hex: "#c6b79c" },
  { name: "Pine", hex: "#344d40" },
  { name: "Cocoa", hex: "#705547" },
  { name: "Burgundy", hex: "#6a303c" },
];
export function FabricStudio() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [color, setColor] = useState(0);
  const [drape, setDrape] = useState(55);
  const [turn, setTurn] = useState({ x: 0, y: 0 });
  const ref = useReveal<HTMLDivElement>();
  const { reduced } = useWinter();
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const interaction = useRef({
    x: 0,
    y: 0,
    energy: 0,
    drape: 0.55,
    color: COLORS[0]!.hex,
    reduced: false,
  });
  interaction.current.drape = drape / 100;
  interaction.current.color = COLORS[color]!.hex;
  interaction.current.reduced = reduced;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let clean: (() => void) | undefined;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        try {
          const T = await import("three");
          if (disposed) return;
          const renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
          renderer.setClearColor(0, 0);
          renderer.toneMapping = T.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.3;
          renderer.domElement.setAttribute("aria-hidden", "true");
          el.appendChild(renderer.domElement);
          const scene = new T.Scene();
          const camera = new T.PerspectiveCamera(36, 1, 0.1, 30);
          camera.position.set(0, 0.1, 6.6);
          camera.lookAt(0, 0, 0);
          scene.add(new T.HemisphereLight(0xfff7e5, 0x615349, 3));
          const key = new T.DirectionalLight(0xffe9ce, 4);
          key.position.set(-3, 4, 5);
          scene.add(key);
          const edge = new T.DirectionalLight(0xb5c7d6, 1.5);
          edge.position.set(4, 0, -1);
          scene.add(edge);
          // Procedural interlocking stitch relief. Both texture and geometry live in the scene.
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#a9a398";
          ctx.fillRect(0, 0, 512, 512);
          ctx.lineCap = "round";
          for (let row = -1; row < 18; row++)
            for (let col = -1; col < 18; col++) {
              const x = col * 32 + (row % 2 ? 3 : 0),
                y = row * 32;
              ctx.strokeStyle = "#77716a";
              ctx.lineWidth = 9;
              ctx.beginPath();
              ctx.moveTo(x - 8, y - 14);
              ctx.bezierCurveTo(x - 15, y, x - 8, y + 6, x, y + 15);
              ctx.bezierCurveTo(x + 10, y + 5, x + 14, y, x + 8, y - 14);
              ctx.stroke();
              ctx.strokeStyle = "#e3ddd0";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(x - 8, y - 14);
              ctx.bezierCurveTo(x - 15, y, x - 8, y + 6, x, y + 15);
              ctx.stroke();
              ctx.strokeStyle = "#c7c0b4";
              ctx.beginPath();
              ctx.moveTo(x, y + 15);
              ctx.bezierCurveTo(x + 10, y + 5, x + 14, y, x + 8, y - 14);
              ctx.stroke();
            }
          const texture = new T.CanvasTexture(canvas);
          texture.wrapS = texture.wrapT = T.RepeatWrapping;
          texture.repeat.set(2.5, 3.5);
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          const material = new T.MeshStandardMaterial({
            color: interaction.current.color,
            bumpMap: texture,
            bumpScale: 0.045,
            roughness: 0.96,
            side: T.DoubleSide,
          });
          const small = window.innerWidth < 700;
          const geometry = new T.PlaneGeometry(2.45, 3.15, small ? 44 : 70, small ? 56 : 85);
          const initial = new Float32Array(geometry.attributes["position"]!.array);
          const cloth = new T.Mesh(geometry, material);
          cloth.rotation.set(-0.1, -0.24, -0.08);
          scene.add(cloth);
          const fringeGeo = new T.BufferGeometry();
          const fringePositions = new Float32Array(38 * 6);
          fringeGeo.setAttribute("position", new T.BufferAttribute(fringePositions, 3));
          const fringeMaterial = new T.LineBasicMaterial({ color: interaction.current.color });
          const fringe = new T.LineSegments(fringeGeo, fringeMaterial);
          cloth.add(fringe);
          let visible = true,
            raf = 0,
            last = performance.now(),
            time = 0,
            targetDrape = 0.55,
            rotationX = 0,
            rotationY = 0,
            lastColor = "",
            rendered = false;
          const position = (x: number, y: number, t: number) => {
            const fold = Math.sin(x * 4.2 + y * 0.35) * (0.12 + targetDrape * 0.2);
            const billow = Math.cos(y * 1.55) * (0.1 + targetDrape * 0.4);
            const ripple = Math.sin(x * 4 + y * 3 - t * 6) * interaction.current.energy * 0.13;
            return fold + billow + ripple;
          };
          const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.04);
            last = now;
            const s = interaction.current;
            const moving =
              Math.abs(s.drape - targetDrape) > 0.0001 ||
              Math.abs(s.x - rotationY) > 0.0001 ||
              Math.abs(s.y - rotationX) > 0.0001 ||
              s.energy > 0;
            if (rendered && !moving && lastColor === s.color) {
              if (visible && !document.hidden) raf = requestAnimationFrame(tick);
              return;
            }
            lastColor = s.color;
            rendered = true;
            if (!s.reduced) time += dt;
            targetDrape += (s.drape - targetDrape) * Math.min(1, dt * 6);
            rotationY += (s.x - rotationY) * Math.min(1, dt * 6);
            rotationX += (s.y - rotationX) * Math.min(1, dt * 6);
            s.energy = Math.max(0, s.energy - dt * 0.5);
            cloth.rotation.y = -0.24 + rotationY;
            cloth.rotation.x = -0.1 + rotationX;
            material.color.set(s.color);
            fringeMaterial.color.set(s.color);
            const positions = geometry.attributes["position"]!;
            for (let i = 0; i < positions.count; i++) {
              const x = initial[i * 3]!,
                y = initial[i * 3 + 1]!;
              positions.setXYZ(i, x, y, position(x, y, time));
            }
            positions.needsUpdate = true;
            geometry.computeVertexNormals();
            for (let i = 0; i < 38; i++) {
              const x = -1.2 + i * (2.4 / 37);
              const y = -1.575;
              const z = position(x, y, time);
              fringePositions.set(
                [
                  x,
                  y,
                  z,
                  x + Math.sin(i + time) * s.energy * 0.035,
                  y - 0.16 - (i % 3) * 0.012,
                  z + 0.025,
                ],
                i * 6,
              );
            }
            fringeGeo.attributes["position"]!.needsUpdate = true;
            renderer.render(scene, camera);
            if (visible && !document.hidden) raf = requestAnimationFrame(tick);
          };
          const restart = () => {
            cancelAnimationFrame(raf);
            last = performance.now();
            if (visible && !document.hidden) raf = requestAnimationFrame(tick);
          };
          const io = new IntersectionObserver(([e]) => {
            visible = !!e?.isIntersecting;
            restart();
          });
          io.observe(el);
          document.addEventListener("visibilitychange", restart);
          const resize = new ResizeObserver(() => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
            camera.updateProjectionMatrix();
          });
          resize.observe(el);
          const lost = (e: Event) => {
            e.preventDefault();
            setFailed(true);
          };
          renderer.domElement.addEventListener("webglcontextlost", lost);
          setReady(true);
          restart();
          clean = () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            resize.disconnect();
            document.removeEventListener("visibilitychange", restart);
            renderer.domElement.removeEventListener("webglcontextlost", lost);
            geometry.dispose();
            fringeGeo.dispose();
            material.dispose();
            fringeMaterial.dispose();
            texture.dispose();
            renderer.dispose();
            renderer.domElement.remove();
          };
        } catch {
          if (!disposed) setFailed(true);
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(el);
    return () => {
      disposed = true;
      observer.disconnect();
      clean?.();
    };
  }, []);
  const reset = () => {
    interaction.current.x = 0;
    interaction.current.y = 0;
    interaction.current.energy = 0;
    setDrape(55);
    setTurn({ x: 0, y: 0 });
  };
  return (
    <section id="material" className="n-material n-section" aria-labelledby="material-title">
      <div ref={ref} className="n-material-grid n-reveal">
        <div className="n-material-copy">
          <p className="n-eyebrow">03 — THE KNIT STUDY</p>
          <h2 id="material-title">
            <AnimatedText text="A closer look" />
            <br />
            at{" "}
            <em>
              <AnimatedText text="softness." offset={120} />
            </em>
          </h2>
          <p>
            Light, texture, and the way a fabric falls.
            <br />
            Explore a digital knit study in your own hands.
          </p>
          <div className="n-material-colors" role="group" aria-label="Knit study colour">
            {COLORS.map((c, i) => (
              <button
                key={c.name}
                aria-label={c.name}
                aria-pressed={color === i}
                onClick={() => setColor(i)}
                style={{ "--swatch": c.hex } as React.CSSProperties}
              >
                <span />
              </button>
            ))}
          </div>
          <p className="n-material-color-name" aria-live="polite">
            {COLORS[color]?.name} <span>/ WOOL KNIT STUDY</span>
          </p>
          <label className="n-drape-label" htmlFor="drape">
            Shape the drape <span>{drape}%</span>
          </label>
          <input
            id="drape"
            className="n-drape"
            type="range"
            min="0"
            max="100"
            value={drape}
            onChange={(e) => {
              setDrape(Number(e.target.value));
              interaction.current.energy = reduced ? 0 : 0.6;
            }}
          />
          <div className="n-drape-ends">
            <span>Structured</span>
            <span>Relaxed</span>
          </div>
          <button className="n-reset" onClick={reset}>
            <RotateCcw size={13} />
            Reset the study
          </button>
          <p className="n-demo-note">
            An illustrative material study, not a fabric or fit simulation.
          </p>
        </div>
        <div className="n-fabric-panel">
          <div className="n-fabric-top">
            <span>N / MATERIAL LAB</span>
            <span>INTERACTIVE STUDY 001</span>
          </div>
          <div
            className="n-fabric-stage"
            role="group"
            aria-label="Interactive 3D knit fabric. Drag to turn and ripple the fabric, or use the keyboard arrow keys."
            tabIndex={0}
            onPointerDown={(e) => {
              pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const p = pointer.current;
              if (!p || p.id !== e.pointerId) return;
              interaction.current.x = Math.max(
                -1.1,
                Math.min(1.1, interaction.current.x + (e.clientX - p.x) * 0.008),
              );
              interaction.current.y = Math.max(
                -0.4,
                Math.min(0.4, interaction.current.y + (e.clientY - p.y) * 0.004),
              );
              interaction.current.energy = reduced ? 0 : 1;
              if (failed) setTurn({ x: interaction.current.x, y: interaction.current.y });
              p.x = e.clientX;
              p.y = e.clientY;
            }}
            onPointerUp={() => {
              pointer.current = null;
            }}
            onPointerCancel={() => {
              pointer.current = null;
            }}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
              e.preventDefault();
              interaction.current.x = Math.max(
                -1.1,
                Math.min(
                  1.1,
                  interaction.current.x +
                    (e.key === "ArrowRight" ? 0.15 : e.key === "ArrowLeft" ? -0.15 : 0),
                ),
              );
              interaction.current.y = Math.max(
                -0.4,
                Math.min(
                  0.4,
                  interaction.current.y +
                    (e.key === "ArrowDown" ? 0.1 : e.key === "ArrowUp" ? -0.1 : 0),
                ),
              );
              interaction.current.energy = reduced ? 0 : 0.6;
              if (failed) setTurn({ x: interaction.current.x, y: interaction.current.y });
            }}
          >
            {!ready && !failed && (
              <div className="n-fabric-fallback">
                <img src={knit} alt="Close-up of oatmeal cable knit" />
                <p>Preparing the knit study…</p>
              </div>
            )}
            {failed && (
              <div
                className="n-css-knit"
                aria-label={`${COLORS[color]?.name} knit texture, interactive lightweight view`}
                style={
                  {
                    "--fabric-color": COLORS[color]!.hex,
                    "--turn-x": `${turn.y * 35}deg`,
                    "--turn-y": `${turn.x * 45 - 12}deg`,
                    "--drape": drape / 100,
                  } as React.CSSProperties
                }
              >
                <div className="n-css-cloth">
                  {Array.from({ length: 24 }, (_, i) => (
                    <span
                      key={i}
                      style={
                        {
                          "--fold": Math.sin(i * 0.6) * drape * 0.3,
                          "--i": i,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
                <span className="n-cloth-shadow" />
              </div>
            )}
            <div
              ref={host}
              className="n-fabric-canvas"
              style={{ visibility: failed ? "hidden" : "visible" }}
            />
          </div>
          <div className="n-fabric-bottom">
            <MoveHorizontal size={15} />
            <span>DRAG TO EXPLORE · SLIDE TO SHAPE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
