"use client";

import { useEffect, useRef } from "react";
import {
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { coastlineGeometry, graticuleGeometry } from "./globe/geometry";
import { introActive, introSignal } from "./introBus";

// 90s per revolution.
const SPIN = (Math.PI * 2) / 90;
// A gentle lean so the graticule reads as a tilted planet, never a target.
const TILT_X = 0.42;
const TILT_Z = -0.16;
// Half-extent of the ortho frustum; >1 leaves a hair of margin around the sphere.
const HALF = 1.04;
const DPR_CAP = 2;
// Arrival: during the first-visit intro the planet eases in from this zoom (small,
// distant) to 1 (resting) while its hairlines bloom up from nothing.
const DISTANT_ZOOM = 0.52;
const BASE_GRAT = 0.1;
const BASE_COAST = 0.085;

type Props = {
  reduce: boolean;
  onReady?: () => void;
  onUnsupported?: () => void;
};

export default function HeroGlobe({ reduce, onReady, onUnsupported }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
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
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        depth: false,
        powerPreference: "low-power",
      });
    } catch {
      onUnsupportedRef.current?.();
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-HALF, HALF, HALF, -HALF, -10, 10);
    camera.position.set(0, 0, 4);

    // tilt → spin: lean the axis once, rotate the lines underneath it.
    const tilt = new Group();
    tilt.rotation.x = TILT_X;
    tilt.rotation.z = TILT_Z;
    scene.add(tilt);
    const spin = new Group();
    tilt.add(spin);

    // No fill, no depth — a transparent wireframe; both hemispheres' hairlines
    // read at once. White, 8–10% so it stays atmosphere, never subject.
    const white = new Color(0xffffff);
    const gratMat = new LineBasicMaterial({ color: white, transparent: true, opacity: BASE_GRAT, depthWrite: false });
    const coastMat = new LineBasicMaterial({ color: white, transparent: true, opacity: BASE_COAST, depthWrite: false });
    const grat = new LineSegments(graticuleGeometry(), gratMat);
    const coast = new LineSegments(coastlineGeometry(), coastMat);
    spin.add(grat);
    spin.add(coast);

    // First visit: start dark and distant; the intro's reveal signal eases us in.
    const active = introActive();
    if (active) {
      gratMat.opacity = 0;
      coastMat.opacity = 0;
      camera.zoom = DISTANT_ZOOM;
      camera.updateProjectionMatrix();
    }
    let lastR = active ? 0 : 1;

    const draw = () => renderer.render(scene, camera);

    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(w, h, false);
      // Keep the sphere perfectly round at any canvas aspect.
      const asp = w / h;
      if (asp >= 1) {
        camera.left = -HALF * asp;
        camera.right = HALF * asp;
        camera.top = HALF;
        camera.bottom = -HALF;
      } else {
        camera.left = -HALF;
        camera.right = HALF;
        camera.top = HALF / asp;
        camera.bottom = -HALF / asp;
      }
      camera.updateProjectionMatrix();
      draw();
    };

    let raf = 0;
    let running = false;
    let lastNow = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // dt-based so the cadence survives pauses without a jump on resume.
      const dt = lastNow ? (now - lastNow) / 1000 : 0;
      lastNow = now;
      spin.rotation.y += dt * SPIN;
      if (active) {
        const r = introSignal.reveal;
        if (r !== lastR) {
          camera.zoom = DISTANT_ZOOM + (1 - DISTANT_ZOOM) * r;
          camera.updateProjectionMatrix();
          gratMat.opacity = BASE_GRAT * r;
          coastMat.opacity = BASE_COAST * r;
          lastR = r;
        }
      }
      draw();
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      lastNow = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    onReadyRef.current?.();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pause while the hero is scrolled away or the tab is hidden.
    let inView = true;
    let visible = !document.hidden;
    const sync = () => (inView && visible ? start() : stop());
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    const onVis = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      grat.geometry.dispose();
      (grat.material as LineBasicMaterial).dispose();
      coast.geometry.dispose();
      (coast.material as LineBasicMaterial).dispose();
      renderer.dispose();
      renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduce]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
