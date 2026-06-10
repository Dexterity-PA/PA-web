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

// 90s per revolution.
const SPIN = (Math.PI * 2) / 90;
// A gentle lean so the graticule reads as a tilted planet, never a target.
const TILT_X = 0.42;
const TILT_Z = -0.16;
// Half-extent of the ortho frustum; >1 leaves a hair of margin around the sphere.
const HALF = 1.04;
const DPR_CAP = 2;

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
    const grat = new LineSegments(
      graticuleGeometry(),
      new LineBasicMaterial({ color: white, transparent: true, opacity: 0.1, depthWrite: false }),
    );
    const coast = new LineSegments(
      coastlineGeometry(),
      new LineBasicMaterial({ color: white, transparent: true, opacity: 0.085, depthWrite: false }),
    );
    spin.add(grat);
    spin.add(coast);

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
