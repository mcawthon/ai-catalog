import React from "react";

export const BENCH_DEFS = [
  { key: "coding",    label: "Coding",            desc: "HumanEval / SWE-bench" },
  { key: "math",      label: "Math & logic",       desc: "MATH / AIME" },
  { key: "reasoning", label: "Science reasoning",  desc: "GPQA Diamond" },
  { key: "knowledge", label: "General knowledge",  desc: "MMLU" },
];

function scoreColor(n) {
  if (n >= 90) return "var(--bench-hi)";
  if (n >= 75) return "var(--accent)";
  if (n >= 60) return "var(--bench-mid)";
  return "var(--bench-lo)";
}

export function BenchmarkBars({ benchmarks }) {
  if (!benchmarks) return null;
  const rows = BENCH_DEFS.filter((d) => benchmarks[d.key] != null);
  if (rows.length === 0) return null;

  return (
    <div className="ffg-bench">
      {rows.map(({ key, label, desc }) => {
        const score = benchmarks[key];
        return (
          <div key={key} className="ffg-bench-row">
            <div className="ffg-bench-meta">
              <span className="ffg-bench-label">{label}</span>
              <span className="ffg-bench-desc">{desc}</span>
            </div>
            <div className="ffg-bench-track">
              <div
                className="ffg-bench-fill"
                style={{ width: `${score}%`, background: scoreColor(score) }}
              />
            </div>
            <span className="ffg-bench-score" style={{ color: scoreColor(score) }}>
              {score}
            </span>
          </div>
        );
      })}
      <p className="ffg-bench-note">
        Scores are percentile estimates based on published benchmarks. Exact numbers vary by test version and evaluation setup.
      </p>
    </div>
  );
}

export function BenchmarkCell({ score }) {
  if (score == null) return <span className="ffg-cmp-mute">—</span>;
  return (
    <div className="ffg-bench-cell">
      <div className="ffg-bench-track ffg-bench-track-sm">
        <div
          className="ffg-bench-fill"
          style={{ width: `${score}%`, background: scoreColor(score) }}
        />
      </div>
      <span className="ffg-bench-score" style={{ color: scoreColor(score) }}>
        {score}
      </span>
    </div>
  );
}
