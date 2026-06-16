import React, { useEffect, useState } from "react";
import { X, Check, AlertCircle, Scale, BookOpen, Layers } from "lucide-react";
import { ProviderDot, TypeBadge } from "./ModelCard.jsx";
import { Term, isJargon } from "../glossary.jsx";

export default function CompareModal({ models, level: initialLevel = "beginner", onClose }) {
  const [level, setLevel] = useState(initialLevel);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const specKeys = [...new Set(models.flatMap((m) => Object.keys(m.specs || {})))];

  return (
    <div className="ffg-overlay" onClick={onClose}>
      <div
        className="ffg-cmp-modal"
        role="dialog"
        aria-modal="true"
        style={{ "--n-cols": models.length }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ffg-cmp-top">
          <h2 className="ffg-cmp-title">
            <Scale size={16} />
            Compare models
          </h2>
          <button className="ffg-cmp-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="ffg-cmp-level-bar">
          <div className="ffg-toggle ffg-toggle-sm" role="tablist" aria-label="Knowledge level">
            <span
              className="ffg-toggle-slider"
              style={{ transform: level === "expert" ? "translateX(100%)" : "translateX(0)" }}
            />
            <button
              className={`ffg-toggle-btn ${level === "beginner" ? "on" : ""}`}
              onClick={() => setLevel("beginner")}
              role="tab"
              aria-selected={level === "beginner"}
            >
              <BookOpen size={11} /> Beginner
            </button>
            <button
              className={`ffg-toggle-btn ${level === "expert" ? "on" : ""}`}
              onClick={() => setLevel("expert")}
              role="tab"
              aria-selected={level === "expert"}
            >
              <Layers size={11} /> Expert
            </button>
          </div>
        </div>

        <div className="ffg-cmp-scroll">
          {/* Model header columns */}
          <div className="ffg-cmp-row ffg-cmp-head-row">
            <div className="ffg-cmp-label" />
            {models.map((m) => (
              <div key={m.id} className="ffg-cmp-col-head">
                <div className="ffg-cmp-head-badges">
                  <ProviderDot provider={m.provider} />
                  <TypeBadge type={m.type} />
                </div>
                <h3 className="ffg-cmp-model-name">{m.name}</h3>
                <span className="ffg-released">{m.released || "—"}</span>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="ffg-cmp-row">
            <div className="ffg-cmp-label">About</div>
            {models.map((m) => (
              <div key={m.id} className="ffg-cmp-cell ffg-cmp-plain">
                {m.plain}
              </div>
            ))}
          </div>

          {/* Beginner-only rows */}
          {level === "beginner" && (
            <>
              <div className="ffg-cmp-row">
                <div className="ffg-cmp-label ffg-good">
                  <Check size={12} />
                  Good for
                </div>
                {models.map((m) => (
                  <div key={m.id} className="ffg-cmp-cell">
                    <ul className="ffg-list">
                      {(m.goodFor || []).map((g) => <li key={g}>{g}</li>)}
                      {!m.goodFor?.length && <li className="ffg-cmp-mute">—</li>}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="ffg-cmp-row">
                <div className="ffg-cmp-label ffg-bad">
                  <AlertCircle size={12} />
                  Less ideal
                </div>
                {models.map((m) => (
                  <div key={m.id} className="ffg-cmp-cell">
                    <ul className="ffg-list">
                      {(m.notFor || []).map((n) => <li key={n}>{n}</li>)}
                      {!m.notFor?.length && <li className="ffg-cmp-mute">—</li>}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="ffg-cmp-row">
                <div className="ffg-cmp-label">Use cases</div>
                {models.map((m) => (
                  <div key={m.id} className="ffg-cmp-cell">
                    <div className="ffg-tags">
                      {(m.uses || []).map((u) => (
                        <span key={u} className="ffg-tag">{u}</span>
                      ))}
                      {!m.uses?.length && <span className="ffg-cmp-mute">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Expert-only rows: specs */}
          {level === "expert" && specKeys.length > 0 && (
            <>
              <div className="ffg-cmp-section">Specs</div>
              {specKeys.map((key) => (
                <div key={key} className="ffg-cmp-row">
                  <div className="ffg-cmp-label">
                    {isJargon(key) ? <Term k={key}>{key}</Term> : key}
                  </div>
                  {models.map((m) => (
                    <div key={m.id} className="ffg-cmp-cell ffg-cmp-spec">
                      {(m.specs || {})[key] || "—"}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
