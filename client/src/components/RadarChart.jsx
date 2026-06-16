import React from "react";
import { BENCH_DEFS } from "./BenchmarkBars.jsx";

export const RADAR_COLORS = ["#7c5dfa", "#22c55e", "#f59e0b"];

const SIZE = 260;
const CX   = SIZE / 2;
const CY   = SIZE / 2;
const R    = 88;           // data radius
const LABEL_PAD = 26;      // gap between R and label anchor
const GRIDS = [25, 50, 75, 100];

// Shorten labels for tight chart space
const SHORT = {
  coding:    "Coding",
  math:      "Math",
  reasoning: "Reasoning",
  knowledge: "Knowledge",
};

const N      = BENCH_DEFS.length;
const ANGLES = BENCH_DEFS.map((_, i) => (2 * Math.PI * i / N) - Math.PI / 2);

function pt(r, angleIdx) {
  const a = ANGLES[angleIdx];
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function poly(points) {
  return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("") + "Z";
}

function textAnchor(angleIdx) {
  const cos = Math.cos(ANGLES[angleIdx]);
  if (cos >  0.1) return "start";
  if (cos < -0.1) return "end";
  return "middle";
}

function dominantBaseline(angleIdx) {
  const sin = Math.sin(ANGLES[angleIdx]);
  if (sin >  0.1) return "hanging";
  if (sin < -0.1) return "auto";
  return "middle";
}

export default function RadarChart({ models }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="ffg-radar-svg"
      aria-label="Radar chart of benchmark scores"
      role="img"
    >
      {/* Grid polygons */}
      {GRIDS.map((level) => {
        const r = R * level / 100;
        const pts = BENCH_DEFS.map((_, i) => pt(r, i));
        return (
          <polygon
            key={level}
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="var(--line)"
            strokeWidth={level === 100 ? 1.5 : 0.8}
            strokeDasharray={level === 100 ? undefined : "3,3"}
          />
        );
      })}

      {/* Grid level labels on the vertical axis (top, so negative sin) */}
      {[25, 50, 75].map((level) => {
        const [x, y] = pt(R * level / 100, 0); // top axis
        return (
          <text key={level} x={x + 4} y={y} fontSize={8} fill="var(--mute)" dominantBaseline="middle">
            {level}
          </text>
        );
      })}

      {/* Axis lines */}
      {BENCH_DEFS.map((_, i) => {
        const [x, y] = pt(R, i);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={x}  y2={y}
            stroke="var(--line)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygons — drawn back-to-front so model 0 is on top */}
      {[...models].reverse().map((model, ri) => {
        const i = models.length - 1 - ri;
        const color = RADAR_COLORS[i % RADAR_COLORS.length];
        const pts = BENCH_DEFS.map(({ key }, axisIdx) => {
          const score = model.benchmarks?.[key] ?? 0;
          return pt(R * score / 100, axisIdx);
        });
        return (
          <g key={model.id}>
            <path
              d={poly(pts)}
              fill={color}
              fillOpacity={0.12}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {pts.map(([x, y], axisIdx) => (
              <circle
                key={axisIdx}
                cx={x} cy={y}
                r={3.5}
                fill={color}
                stroke="var(--paper)"
                strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}

      {/* Axis labels */}
      {BENCH_DEFS.map(({ key }, i) => {
        const r = R + LABEL_PAD;
        const [x, y] = pt(r, i);
        return (
          <text
            key={key}
            x={x} y={y}
            fontSize={10.5}
            fontWeight={600}
            fill="var(--ink)"
            textAnchor={textAnchor(i)}
            dominantBaseline={dominantBaseline(i)}
            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            {SHORT[key]}
          </text>
        );
      })}
    </svg>
  );
}
