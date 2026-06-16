import React, { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";
import { ProviderDot } from "./ModelCard.jsx";

const PRESETS = [
  { label: "Simple chat",     inputTok: 200,   outputTok: 150,  reqs: 10_000 },
  { label: "Power user",      inputTok: 1_000, outputTok: 500,  reqs: 5_000  },
  { label: "Doc processing",  inputTok: 3_000, outputTok: 800,  reqs: 1_000  },
  { label: "High-volume API", inputTok: 500,   outputTok: 200,  reqs: 100_000 },
];

function fmtMonthly(n) {
  if (n == null) return null;
  if (n < 0.01)  return "<$0.01";
  if (n < 1)     return `$${n.toFixed(3)}`;
  if (n < 10)    return `$${n.toFixed(2)}`;
  if (n < 1_000) return `$${n.toFixed(0)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtRate(n) {
  if (n == null) return "—";
  if (n < 0.01)  return `<$0.01`;
  if (n < 1)     return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

export default function CostModal({ models, pricing, onClose }) {
  const [inputTok,    setInputTok]    = useState(1_000);
  const [outputTok,   setOutputTok]   = useState(500);
  const [reqs,        setReqs]        = useState(10_000);
  const [activePreset, setPreset]     = useState("Power user");

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function applyPreset(p) {
    setInputTok(p.inputTok);
    setOutputTok(p.outputTok);
    setReqs(p.reqs);
    setPreset(p.label);
  }

  function handleField(setter) {
    return (e) => { setter(Math.max(1, Number(e.target.value) || 1)); setPreset(null); };
  }

  const rows = models
    .map((m) => {
      const p = pricing[m.id];
      if (!p) return { m, monthly: null, p: null };
      const monthly = (inputTok / 1_000_000 * p.input + outputTok / 1_000_000 * p.output) * reqs;
      return { m, monthly, p };
    })
    .sort((a, b) => {
      if (a.monthly === null && b.monthly === null) return 0;
      if (a.monthly === null) return 1;
      if (b.monthly === null) return -1;
      return a.monthly - b.monthly;
    });

  const maxMonthly = Math.max(0, ...rows.map((r) => r.monthly ?? 0));

  return (
    <div className="ffg-overlay" onClick={onClose}>
      <div
        className="ffg-cost-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ffg-cost-head">
          <div>
            <h2 className="ffg-cost-title">Cost Calculator</h2>
            <p className="ffg-cost-sub">Estimate monthly API spend across models</p>
          </div>
          <button className="ffg-cmp-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="ffg-cost-inputs">
          <div className="ffg-cost-presets">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`ffg-cost-preset${activePreset === p.label ? " on" : ""}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="ffg-cost-fields">
            <label className="ffg-cost-field">
              <span>Input tokens / request</span>
              <input type="number" min={1} value={inputTok}  onChange={handleField(setInputTok)} />
            </label>
            <label className="ffg-cost-field">
              <span>Output tokens / request</span>
              <input type="number" min={1} value={outputTok} onChange={handleField(setOutputTok)} />
            </label>
            <label className="ffg-cost-field">
              <span>Requests / month</span>
              <input type="number" min={1} value={reqs}      onChange={handleField(setReqs)} />
            </label>
          </div>
        </div>

        <div className="ffg-cost-results">
          <div className="ffg-cost-table-head">
            <span>Model</span>
            <span className="ffg-cost-th-r">$/1M in</span>
            <span className="ffg-cost-th-r">$/1M out</span>
            <span className="ffg-cost-th-r">Monthly est.</span>
          </div>
          {rows.map(({ m, monthly, p }) => (
            <div key={m.id} className="ffg-cost-row">
              <div className="ffg-cost-model">
                <ProviderDot provider={m.provider} />
                <span className="ffg-cost-name">{m.name}</span>
                {p?.live  && <span className="ffg-cost-live">Live</span>}
                {p && !p.live && <span className="ffg-cost-est">Est.</span>}
              </div>
              <span className="ffg-cost-rate">{fmtRate(p?.input)}</span>
              <span className="ffg-cost-rate">{fmtRate(p?.output)}</span>
              <div className="ffg-cost-monthly">
                {monthly != null ? (
                  <>
                    <span className="ffg-cost-monthly-val">{fmtMonthly(monthly)}</span>
                    <div className="ffg-cost-bar">
                      <div
                        className="ffg-cost-bar-fill"
                        style={{ width: maxMonthly > 0 ? `${(monthly / maxMonthly) * 100}%` : "0%" }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="ffg-cost-self-hosted">Self-hosted</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="ffg-cost-foot">
          <Zap size={11} />
          Live prices from OpenRouter where available; all others are estimates. Verify with your provider before budgeting.
        </div>
      </div>
    </div>
  );
}
