import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { colorFor } from "../providers.js";

// Standard usage for cost calculation
const STD = { reqs: 5_000, input: 500, output: 200 };

// SVG layout constants
const W = 560, H = 360;
const PAD = { left: 56, right: 24, top: 24, bottom: 44 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top  - PAD.bottom;

// Log X scale: ~$0.10 to ~$250/month
const LOG_MIN = Math.log10(0.07);
const LOG_MAX = Math.log10(280);

// Linear Y scale: score 55–100
const Y_MIN = 55;
const Y_MAX = 100;

const X_TICKS = [0.10, 0.50, 1, 5, 10, 50, 100];
const Y_TICKS = [60, 70, 80, 90, 100];

function xSvg(cost) {
  return PAD.left + (Math.log10(cost) - LOG_MIN) / (LOG_MAX - LOG_MIN) * PW;
}
function ySvg(score) {
  return PAD.top + PH - (score - Y_MIN) / (Y_MAX - Y_MIN) * PH;
}
function monthlyCost(pricing) {
  if (!pricing) return null;
  return (STD.input / 1e6 * pricing.input + STD.output / 1e6 * pricing.output) * STD.reqs;
}
function avgScore(b) {
  if (!b) return null;
  const vals = Object.values(b).filter((v) => v != null);
  return vals.length ? vals.reduce((a, c) => a + c, 0) / vals.length : null;
}
function fmtCost(c) {
  if (c < 1)   return `$${c.toFixed(2)}`;
  if (c < 10)  return `$${c.toFixed(1)}`;
  return `$${Math.round(c)}`;
}

export default function ScatterPlot({ models, onOpen, onClose }) {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const points = models
    .map((m) => ({ m, cost: monthlyCost(m.pricing), score: avgScore(m.benchmarks), color: colorFor(m.provider) }))
    .filter((p) => p.score != null);

  const plotted  = points.filter((p) => p.cost != null);
  const offChart = points.filter((p) => p.cost == null);

  const hoveredPt = hovered ? plotted.find((p) => p.m.id === hovered) : null;

  return (
    <div className="ffg-overlay" onClick={onClose}>
      <div
        className="ffg-scatter-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ffg-cost-head">
          <div>
            <h2 className="ffg-cost-title">Value Map</h2>
            <p className="ffg-cost-sub">
              Capability vs. cost · {STD.reqs.toLocaleString()} req/mo · {STD.input} input / {STD.output} output tokens
            </p>
          </div>
          <button className="ffg-cmp-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="ffg-scatter-body">
          <svg viewBox={`0 0 ${W} ${H}`} className="ffg-scatter-svg">
            {/* Y grid lines */}
            {Y_TICKS.map((s) => (
              <line key={s} x1={PAD.left} x2={PAD.left + PW} y1={ySvg(s)} y2={ySvg(s)}
                stroke="var(--line)" strokeWidth={0.8} strokeDasharray="4,4" />
            ))}
            {/* X grid lines */}
            {X_TICKS.map((c) => (
              <line key={c} x1={xSvg(c)} x2={xSvg(c)} y1={PAD.top} y2={PAD.top + PH}
                stroke="var(--line)" strokeWidth={0.8} strokeDasharray="4,4" />
            ))}

            {/* Axes */}
            <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + PH}
              stroke="var(--line)" strokeWidth={1.5} />
            <line x1={PAD.left} x2={PAD.left + PW} y1={PAD.top + PH} y2={PAD.top + PH}
              stroke="var(--line)" strokeWidth={1.5} />

            {/* Y axis labels */}
            {Y_TICKS.map((s) => (
              <text key={s} x={PAD.left - 7} y={ySvg(s)} fontSize={9} fill="var(--mute)"
                textAnchor="end" dominantBaseline="middle">{s}</text>
            ))}
            {/* X axis labels */}
            {X_TICKS.map((c) => (
              <text key={c} x={xSvg(c)} y={PAD.top + PH + 10} fontSize={9} fill="var(--mute)"
                textAnchor="middle" dominantBaseline="hanging">{fmtCost(c)}</text>
            ))}

            {/* Axis titles */}
            <text x={PAD.left + PW / 2} y={H - 4} fontSize={10} fill="var(--ink-soft)"
              textAnchor="middle" fontWeight={600}>
              Monthly cost (log scale)
            </text>
            <text x={11} y={PAD.top + PH / 2} fontSize={10} fill="var(--ink-soft)"
              textAnchor="middle" fontWeight={600}
              transform={`rotate(-90,11,${PAD.top + PH / 2})`}>
              Avg. score
            </text>

            {/* Data points */}
            {plotted.map(({ m, cost, score, color }) => {
              const cx = xSvg(cost);
              const cy = ySvg(score);
              const isH = hovered === m.id;
              return (
                <g key={m.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { onOpen(m); onClose(); }}>
                  <circle cx={cx} cy={cy} r={isH ? 9 : 6.5}
                    fill={color} fillOpacity={isH ? 1 : 0.82}
                    stroke="var(--paper)" strokeWidth={isH ? 2.5 : 1.5} />
                </g>
              );
            })}

            {/* Hovered label — rendered last so it's on top */}
            {hoveredPt && (() => {
              const { m, cost, score } = hoveredPt;
              const cx = xSvg(cost);
              const cy = ySvg(score);
              const above = cy > PAD.top + PH * 0.55;
              const ly = above ? cy - 13 : cy + 13;
              const lx = Math.max(PAD.left + 40, Math.min(cx, PAD.left + PW - 40));
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={lx - 58} y={ly - (above ? 18 : 0)} width={116} height={17}
                    rx={4} fill="var(--paper)" stroke="var(--line)" strokeWidth={1} />
                  <text x={lx} y={ly + (above ? -5 : 10)} fontSize={10.5}
                    fill="var(--ink)" textAnchor="middle" fontWeight={700}>
                    {m.name}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Hovered detail panel */}
          <div className="ffg-scatter-detail">
            {hoveredPt ? (
              <>
                <p className="ffg-scatter-detail-name">{hoveredPt.m.name}</p>
                <p className="ffg-scatter-detail-provider">{hoveredPt.m.provider}</p>
                <div className="ffg-scatter-detail-stats">
                  <span>Monthly est.</span>
                  <strong>{fmtCost(hoveredPt.cost)}</strong>
                </div>
                <div className="ffg-scatter-detail-stats">
                  <span>Avg. score</span>
                  <strong>{hoveredPt.score.toFixed(1)}</strong>
                </div>
                <p className="ffg-scatter-detail-hint">Click to open model</p>
              </>
            ) : (
              <p className="ffg-scatter-detail-empty">Hover a dot for details</p>
            )}
          </div>
        </div>

        {offChart.length > 0 && (
          <div className="ffg-scatter-offchart">
            <span className="ffg-scatter-offchart-label">Self-hosted (no API cost):</span>
            {offChart.map(({ m, score, color }) => (
              <button key={m.id} className="ffg-scatter-offchart-item"
                onClick={() => { onOpen(m); onClose(); }}>
                <span className="ffg-dot" style={{ background: color }} />
                {m.name}
                <span className="ffg-scatter-offchart-score">{score?.toFixed(0)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ffg-cost-foot">
          Costs estimated at {STD.reqs.toLocaleString()} req/mo · {STD.input} in / {STD.output} out tokens.
          Scores are averages across Coding, Math, Reasoning, and Knowledge benchmarks.
        </div>
      </div>
    </div>
  );
}
