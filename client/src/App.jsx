import React, { useMemo, useState } from "react";
import { Search, Sparkles, X, BookOpen, Layers } from "lucide-react";
import { useCatalog } from "./useCatalog.js";
import { USE_CASES } from "./constants.js";
import ModelCard from "./components/ModelCard.jsx";
import DetailModal from "./components/DetailModal.jsx";

export default function App() {
  const { models, loading, error } = useCatalog();

  const [level, setLevel] = useState("beginner");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [useFilter, setUseFilter] = useState("All uses");
  const [selected, setSelected] = useState(null);

  const providers = useMemo(
    () => new Set(models.map((m) => m.provider)).size,
    [models]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (useFilter !== "All uses" && !(m.uses || []).includes(useFilter)) return false;
      if (
        q &&
        !(
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          (m.tags || []).join(" ").toLowerCase().includes(q) ||
          (m.plain || "").toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [models, query, typeFilter, useFilter]);

  return (
    <div className="ffg-root">
      <header className="ffg-header">
        <div className="ffg-brand">
          <Sparkles size={18} className="ffg-spark" />
          <span className="ffg-brand-name">Frontier Field Guide</span>
        </div>

        <div className="ffg-header-right">
          <div className="ffg-toggle" role="tablist" aria-label="Knowledge level">
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
              <BookOpen size={14} /> Beginner
            </button>
            <button
              className={`ffg-toggle-btn ${level === "expert" ? "on" : ""}`}
              onClick={() => setLevel("expert")}
              role="tab"
              aria-selected={level === "expert"}
            >
              <Layers size={14} /> Expert
            </button>
          </div>
        </div>
      </header>

      <section className="ffg-hero">
        <p className="ffg-eyebrow">A plain-language atlas</p>
        <h1 className="ffg-h1">
          Every AI model worth knowing,
          <br />
          <span className="ffg-h1-accent">explained at your level.</span>
        </h1>
        <p className="ffg-sub">
          {level === "beginner"
            ? "New to all this? Each model is described in plain English — what it is, and what it's actually good for. Flip to Expert any time for the specs."
            : "Specs-first view: context windows, parameters, licenses, and access. Flip to Beginner for plain-language summaries."}
        </p>
        <p className="ffg-count">
          <strong>{models.length}</strong> models · <strong>{providers}</strong> providers
        </p>
      </section>

      <div className="ffg-controls">
        <div className="ffg-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models, providers, or strengths…"
            aria-label="Search models"
          />
          {query && (
            <button className="ffg-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="ffg-seg">
          {[
            ["all", "All"],
            ["proprietary", "Proprietary"],
            ["open", "Open weights"],
          ].map(([v, label]) => (
            <button
              key={v}
              className={`ffg-seg-btn ${typeFilter === v ? "on" : ""}`}
              onClick={() => setTypeFilter(v)}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          className="ffg-select"
          value={useFilter}
          onChange={(e) => setUseFilter(e.target.value)}
          aria-label="Filter by use case"
        >
          <option>All uses</option>
          {USE_CASES.map((u) => <option key={u}>{u}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="ffg-empty"><p>Loading the catalog…</p></div>
      ) : error ? (
        <div className="ffg-empty"><p>Couldn't load the catalog.</p></div>
      ) : filtered.length === 0 ? (
        <div className="ffg-empty">
          <p>No models match those filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setUseFilter("All uses");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="ffg-grid">
          {filtered.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              level={level}
              flash={false}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <footer className="ffg-footer">
        <p>
          The AI landscape moves fast — new models ship most weeks and lineups get
          reshuffled. This catalog is updated manually; verify specifics against
          each provider's own docs before relying on them.
        </p>
        <p className="ffg-foot-tip">
          Tip: tap any <span className="ffg-term ffg-term-demo">underlined term</span> for a
          plain-English definition.
        </p>
      </footer>

      {selected && (
        <DetailModal
          model={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
