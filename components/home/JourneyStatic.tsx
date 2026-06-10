import { stops } from "./journeyData";

// Static frame for prefers-reduced-motion and WebGL-unsupported. A globe can't
// show India and Arizona at once, so this is a flattened diagram: all four
// stops, the arcs between them, and the present marker lit — no motion.
type Node = { x: number; y: number; anchor: "start" | "end" };
const nodes: Node[] = [
  { x: 300, y: 330, anchor: "end" },
  { x: 320, y: 165, anchor: "end" },
  { x: 500, y: 175, anchor: "start" },
  { x: 520, y: 340, anchor: "start" },
];
const arcs = [
  "M300 330 Q 250 240 320 165",
  "M320 165 Q 410 120 500 175",
  "M500 175 Q 585 258 520 340",
];

export default function JourneyStatic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 820 520"
      className={`h-full w-full ${className ?? ""}`}
      role="img"
      aria-label="From Nuzvid, India to Chandler, Arizona — four stops across the globe"
    >
      <g stroke="#ffffff" fill="none">
        <circle cx="410" cy="252" r="178" strokeOpacity="0.12" />
        <g strokeOpacity="0.06">
          <ellipse cx="410" cy="252" rx="178" ry="60" />
          <ellipse cx="410" cy="252" rx="178" ry="120" />
          <ellipse cx="410" cy="252" rx="60" ry="178" />
          <ellipse cx="410" cy="252" rx="120" ry="178" />
        </g>
      </g>

      {arcs.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      ))}

      {nodes.map((n, i) => {
        const active = i === nodes.length - 1;
        return (
          <g key={stops[i].id}>
            {active && <circle cx={n.x} cy={n.y} r="13" fill="#4ade80" fillOpacity="0.16" />}
            <circle cx={n.x} cy={n.y} r="3.5" fill={active ? "#4ade80" : "#5c6166"} />
            <text
              x={n.anchor === "start" ? n.x + 14 : n.x - 14}
              y={n.y + 4}
              textAnchor={n.anchor}
              className="font-mono text-12 uppercase tracking-label"
            >
              <tspan className="fill-text-2">
                {stops[i].place}, {stops[i].region}
              </tspan>
              <tspan className="fill-accent" dx="8">
                {stops[i].year}
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
