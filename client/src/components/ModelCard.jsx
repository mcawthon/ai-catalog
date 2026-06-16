import React, { useState } from "react";
import { ChevronRight, ArrowRight, Lock, Unlock, Scale, Check } from "lucide-react";
import { Term, isJargon } from "../glossary.jsx";
import { colorFor } from "../providers.js";

export function ProviderDot({ provider }) {
  return (
    <span className="ffg-prov">
      <span className="ffg-dot" style={{ background: colorFor(provider) }} />
      {provider}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span className={`ffg-type ffg-type-${type}`}>
      {type === "open" ? <Unlock size={11} /> : <Lock size={11} />}
      {type === "open" ? "Open weights" : "Proprietary"}
    </span>
  );
}

export function SpecList({ specs, expert }) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) {
    return <p className="ffg-no-specs">No technical details recorded yet.</p>;
  }
  return (
    <dl className={`ffg-specs ${expert ? "ffg-specs-expert" : ""}`}>
      {entries.map(([k, v]) => (
        <div key={k} className="ffg-spec-row">
          <dt>{isJargon(k) ? <Term k={k}>{k}</Term> : k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ModelCard({ model, level, flash, onOpen, inCompare, onToggleCompare }) {
  const [showSpecs, setShowSpecs] = useState(false);
  return (
    <article
      className={`ffg-card ${flash ? "ffg-flash" : ""}`}
      tabIndex={0}
      onClick={() => onOpen(model)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(model)}
    >
      <div className="ffg-card-top">
        <ProviderDot provider={model.provider} />
        <TypeBadge type={model.type} />
      </div>

      <h3 className="ffg-card-name">{model.name}</h3>

      <div className="ffg-tags">
        {(model.tags || []).map((t) => (
          <span key={t} className="ffg-tag">{t}</span>
        ))}
      </div>

      {level === "beginner" ? (
        <>
          <p className="ffg-plain">{model.plain}</p>
          <button
            className="ffg-specs-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowSpecs((s) => !s);
            }}
          >
            {showSpecs ? "Hide technical details" : "Show technical details"}
            <ChevronRight size={13} className={showSpecs ? "ffg-rot" : ""} />
          </button>
          {showSpecs && <SpecList specs={model.specs} />}
        </>
      ) : (
        <SpecList specs={model.specs} expert />
      )}

      <div className="ffg-card-foot">
        <span className="ffg-released">{model.released || "—"}</span>
        {onToggleCompare && (
          <button
            className={`ffg-cmp-toggle ${inCompare ? "on" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleCompare(model.id); }}
            aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
            aria-pressed={inCompare}
          >
            {inCompare ? <Check size={11} /> : <Scale size={11} />}
            {inCompare ? "Added" : "Compare"}
          </button>
        )}
        <span className="ffg-more">
          Details <ArrowRight size={13} />
        </span>
      </div>
    </article>
  );
}
