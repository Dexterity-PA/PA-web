import { WINDOW } from "@/lib/hawkes/params";
import { baked } from "@/lib/hawkes/static";

const W = 1000;
const H = 320;
const AX = H / 2;
const SPAN = AX - 14;

const sat = (v: number) => v / (v + 2.5);
const px = (t: number) => ((t - baked.t0) / WINDOW) * W;

function pts(lam: Float32Array, dir: number) {
  const parts: string[] = [];
  for (let i = 0; i < lam.length; i++) {
    const x = px(baked.ts0 + i / baked.hz).toFixed(1);
    const y = (AX + dir * sat(lam[i]) * SPAN).toFixed(1);
    parts.push(`${x},${y}`);
  }
  return parts.join(" ");
}

const buyPts = pts(baked.lamB, -1);
const sellPts = pts(baked.lamS, 1);
const x0 = px(baked.ts0).toFixed(1);
const buyArea = `${x0},${AX} ${buyPts} ${W},${AX}`;
const sellArea = `${x0},${AX} ${sellPts} ${W},${AX}`;

type Props = { className?: string };

export default function StaticPointProcess({ className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <style>{`@keyframes ppfade{from{opacity:0}}.ppfade{animation:ppfade .9s ease-out both}@media (prefers-reduced-motion:reduce){.ppfade{animation:none}}`}</style>
      <g className="ppfade">
        <rect x="0" y={AX - 0.5} width={W} height="1" fill="rgba(255,255,255,0.08)" />
        <polygon points={buyArea} fill="rgba(74,222,128,0.07)" />
        <polygon points={sellArea} fill="rgba(248,113,113,0.07)" />
        <polyline
          points={buyPts}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={sellPts}
          fill="none"
          stroke="#f87171"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        {baked.events.map((ev, i) => (
          <rect
            key={i}
            x={(px(ev.t) - 1).toFixed(1)}
            y={ev.side === 0 ? AX - ev.mark * SPAN * 0.5 : AX}
            width="2"
            height={ev.mark * SPAN * 0.5}
            fill={ev.side === 0 ? "#4ade80" : "#f87171"}
          />
        ))}
      </g>
    </svg>
  );
}
