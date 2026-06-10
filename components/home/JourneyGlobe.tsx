"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { latLonToUnit, stops } from "./journeyData";
import { R, graticuleGeometry, coastlineGeometry } from "./globe/geometry";
import {
  activeIndex,
  arcActive,
  arcDraw,
  journeyDist,
  journeyJ,
  labelOpacity,
  markerScale,
} from "./journeyTimeline";

const FOV = 38;
const FAR = 3.6;
const FIT_RADIUS = 1.15;
const ARC_N = 96;
const ARC_LIFT = 0.06;

const C_FILL = new Color(0x0a0d11);
const C_GRAT = new Color(0xffffff);
const C_COAST = new Color(0x9ba1a6);
const C_ACCENT = new Color(0x4ade80);
const C_DIM = new Color(0x5c6166);

function slerpUnit(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
  let d = a.x * b.x + a.y * b.y + a.z * b.z;
  d = d < -1 ? -1 : d > 1 ? 1 : d;
  const omega = Math.acos(d);
  if (omega < 1e-4) return out.copy(a);
  const so = Math.sin(omega);
  const s0 = Math.sin((1 - t) * omega) / so;
  const s1 = Math.sin(t * omega) / so;
  return out.set(a.x * s0 + b.x * s1, a.y * s0 + b.y * s1, a.z * s0 + b.z * s1);
}

function arcGeometry(a: Vector3, b: Vector3): BufferGeometry {
  const p: number[] = [];
  const tmp = new Vector3();
  for (let k = 0; k < ARC_N; k++) {
    const t = k / (ARC_N - 1);
    slerpUnit(a, b, t, tmp);
    const alt = R * (1 + ARC_LIFT * Math.sin(Math.PI * t));
    p.push(tmp.x * alt, tmp.y * alt, tmp.z * alt);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  return g;
}

const smooth = (a: number, b: number, x: number) => {
  let t = (x - a) / (b - a);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
};

type Props = {
  progress: MotionValue<number>;
  onUnsupported?: () => void;
  onReady?: () => void;
  className?: string;
};

export default function JourneyGlobe({ progress, onUnsupported, onReady, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onReadyRef = useRef(onReady);
  const onUnsupportedRef = useRef(onUnsupported);
  useEffect(() => {
    onReadyRef.current = onReady;
    onUnsupportedRef.current = onUnsupported;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      onUnsupportedRef.current?.();
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
    const group = new Group();
    scene.add(group);

    const dirs = stops.map((s) => new Vector3(...latLonToUnit(s.lat, s.lon)).normalize());
    const stopsWorld = dirs.map((d) => d.clone().multiplyScalar(R));
    const introDir = dirs[0]
      .clone()
      .applyAxisAngle(new Vector3(0, 1, 0), 1.15)
      .applyAxisAngle(new Vector3(1, 0, 0), 0.18)
      .normalize();
    const path = [introDir, ...dirs];

    // Solid globe — barely lighter than the page, writes depth so the far
    // hemisphere's lines, arcs and markers are cleanly occluded.
    const sphere = new Mesh(
      new SphereGeometry(R * 0.997, 64, 48),
      new MeshBasicMaterial({ color: C_FILL }),
    );
    group.add(sphere);

    const grat = new LineSegments(
      graticuleGeometry(),
      new LineBasicMaterial({ color: C_GRAT, transparent: true, opacity: 0.1, depthWrite: false }),
    );
    group.add(grat);

    const coast = new LineSegments(
      coastlineGeometry(),
      new LineBasicMaterial({ color: C_COAST, transparent: true, opacity: 0.34, depthWrite: false }),
    );
    group.add(coast);

    // Arcs between consecutive stops — accent, drawn via setDrawRange.
    const arcs = dirs.slice(0, -1).map((d, i) => {
      const line = new Line(
        arcGeometry(d, dirs[i + 1]),
        new LineBasicMaterial({ color: C_ACCENT, transparent: true, opacity: 0, depthWrite: false }),
      );
      line.geometry.setDrawRange(0, 0);
      group.add(line);
      return line;
    });

    // Markers — a small dot per stop, plus a soft accent halo on the active one.
    const dotGeo = new SphereGeometry(0.022, 16, 16);
    const markers = stopsWorld.map((wpos) => {
      const dot = new Mesh(dotGeo, new MeshBasicMaterial({ color: C_DIM }));
      dot.position.copy(wpos);
      dot.scale.setScalar(0);
      group.add(dot);
      return dot;
    });
    const halo = new Mesh(
      new SphereGeometry(0.05, 24, 24),
      new MeshBasicMaterial({ color: C_ACCENT, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    halo.scale.setScalar(0);
    group.add(halo);

    // scratch — reused every frame, zero per-frame allocation
    const _focus = new Vector3();
    const _cam = new Vector3();
    const _proj = new Vector3();
    const labelW: number[] = []; // cached label widths (fixed text), avoids per-frame layout

    let distMul = 1;
    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vHalf = (FOV / 2) * (Math.PI / 180);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const lim = Math.min(vHalf, hHalf);
      const fit = Math.min(1, (FAR * Math.sin(lim)) / FIT_RADIUS);
      distMul = 1 / fit;
      dirty = true;
    };

    let lastActive = -1;
    const update = (p: number) => {
      const j = journeyJ(p);
      const dist = journeyDist(p) * distMul;
      const t = Math.max(0, Math.min(4, j + 1));
      const idx = Math.min(Math.floor(t), 3);
      slerpUnit(path[idx], path[idx + 1], t - idx, _focus);
      _cam.copy(_focus).multiplyScalar(dist);
      camera.position.copy(_cam);
      camera.lookAt(0, 0, 0);

      const active = activeIndex(p);
      if (active !== lastActive) {
        markers.forEach((m, i) =>
          (m.material as MeshBasicMaterial).color.copy(i === active ? C_ACCENT : C_DIM),
        );
        lastActive = active;
      }

      for (let i = 0; i < markers.length; i++) {
        const s = markerScale(p, i);
        markers[i].scale.setScalar(s * (i === active ? 1.15 : 0.8));
        markers[i].visible = s > 0.001;
      }
      const aS = markerScale(p, active);
      halo.position.copy(stopsWorld[active]);
      halo.scale.setScalar(aS * 1.2);
      halo.visible = aS > 0.001;

      for (let i = 0; i < arcs.length; i++) {
        const f = arcDraw(p, i);
        arcs[i].geometry.setDrawRange(0, f <= 0 ? 0 : Math.round(f * (ARC_N - 1)) + 1);
        const mat = arcs[i].material as LineBasicMaterial;
        mat.opacity = f <= 0 ? 0 : arcActive(p, i) ? 0.95 : 0.4;
      }

      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      for (let i = 0; i < stops.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const facing = smooth(-0.1, 0.25, dirs[i].dot(_focus));
        const o = labelOpacity(p, i) * facing;
        if (o < 0.01) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
          continue;
        }
        _proj.copy(stopsWorld[i]).project(camera);
        const sx = (_proj.x * 0.5 + 0.5) * w;
        const sy = (-_proj.y * 0.5 + 0.5) * h;
        // Flip the label to the marker's left if right-placement would clip the
        // viewport edge — keeps the year legible on narrow screens.
        let lw = labelW[i];
        if (!lw) {
          lw = el.offsetWidth;
          if (lw) labelW[i] = lw;
        }
        const lwv = lw || 140;
        el.style.visibility = "visible";
        el.style.opacity = String(o);
        if (w < 480) {
          // narrow: caption centered below the marker, clamped to the viewport
          const cx = Math.max(8 + lwv / 2, Math.min(w - 8 - lwv / 2, sx));
          el.style.transform = `translate3d(${cx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, 1.6em)`;
        } else {
          // wide: beside the marker, flipped left if it would clip the edge
          const flip = sx + 18 + lwv > w - 8;
          const dx = flip ? "calc(-100% - 18px)" : "18px";
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(${dx}, -50%)`;
        }
      }

      renderer.render(scene, camera);
    };

    let dirty = true;
    let last = -1;
    let raf = 0;
    let running = false;
    let ready = false;
    const tick = () => {
      const p = progress.get();
      if (dirty || p !== last) {
        update(p);
        last = p;
        dirty = false;
        if (!ready) {
          ready = true;
          onReadyRef.current?.();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pause the loop entirely while the section is off-screen.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { rootMargin: "0px" },
    );
    io.observe(wrap);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        const any = o as Mesh | LineSegments | Line;
        any.geometry?.dispose?.();
        const m = any.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose?.();
      });
      dotGeo.dispose();
      renderer.dispose();
    };
  }, [progress]);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0">
        {stops.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap font-mono text-12 uppercase tracking-label will-change-transform"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <span className="text-text-2">
              {s.place}, {s.region}
            </span>
            <span className="ml-2 text-accent tabular-nums">{s.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
