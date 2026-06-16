import React, { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, X, BookOpen, Layers, Moon, Sun, ArrowRight, Calculator } from "lucide-react";
import { useCatalog } from "./useCatalog.js";
import { usePricing } from "./usePricing.js";
import { colorFor } from "./providers.js";
import { USE_CASES } from "./constants.js";
import ModelCard from "./components/ModelCard.jsx";
import DetailModal from "./components/DetailModal.jsx";
import CompareBar from "./components/CompareBar.jsx";
import CompareModal from "./components/CompareModal.jsx";
import QuizModal from "./components/QuizModal.jsx";
import CostModal from "./components/CostModal.jsx";

export default function App() {
  const { models, loading, error } = useCatalog();
  const pricing = usePricing(models);

  const [level, setLevel] = useState("beginner");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [useFilter, setUseFilter] = useState("All uses");
  const [providerFilter, setProviderFilter] = useState(new Set());
  const [sortBy, setSortBy] = useState("default");
  const [selected, setSelected] = useState(null);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("ffg-dark") === "true");

  const [quizOpen, setQuizOpen] = useState(() =>
    new URLSearchParams(window.location.search).has("quiz")
  );
  const [quizInitial] = useState(() => {
    const raw = new URLSearchParams(window.location.search).get("quiz") || "";
    const [useCase, access, priority] = raw.split(",");
    return useCase && access && priority ? { useCase, access, priority } : null;
  });

  function closeQuiz() {
    setQuizOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("quiz");
    window.history.replaceState({}, "", url.toString());
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("ffg-dark", darkMode);
  }, [darkMode]);

  const [costOpen, setCostOpen] = useState(false);

  const [compareSet, setCompareSet] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("compare") || "";
    return new Set(raw.split(",").filter(Boolean));
  });
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (compareSet.size > 0) {
      url.searchParams.set("compare", [...compareSet].join(","));
    } else {
      url.searchParams.delete("compare");
    }
    window.history.replaceState({}, "", url.toString());
  }, [compareSet]);

  function toggleCompare(id) {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }

  const allProviders = useMemo(
    () => [...new Set(models.map((m) => m.provider))],
    [models]
  );

  function toggleProvider(name) {
    setProviderFilter((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = models.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (useFilter !== "All uses" && !(m.uses || []).includes(useFilter)) return false;
      if (providerFilter.size > 0 && !providerFilter.has(m.provider)) return false;
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
    if (sortBy !== "default") {
      list.sort((a, b) => (b.benchmarks?.[sortBy] ?? 0) - (a.benchmarks?.[sortBy] ?? 0));
    }
    return list;
  }, [models, query, typeFilter, useFilter, providerFilter, sortBy]);

  return (
    <div className="ffg-root">
      <header className="ffg-header">
        <div className="ffg-brand">
          <Sparkles size={18} className="ffg-spark" />
          <span className="ffg-brand-name">Frontier Field Guide</span>
        </div>

        <div className="ffg-header-right">
          <button
            className="ffg-theme-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
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
        <div className="ffg-hero-actions">
          <button className="ffg-quiz-entry-btn" onClick={() => setQuizOpen(true)}>
            <Sparkles size={13} />
            Not sure which model to pick?
            <ArrowRight size={13} />
          </button>
          <button className="ffg-calc-entry-btn" onClick={() => setCostOpen(true)}>
            <Calculator size={13} />
            Estimate costs
          </button>
        </div>
        <p className="ffg-count">
          <strong>{models.length}</strong> models · <strong>{allProviders.length}</strong> providers
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

        <select
          className="ffg-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort by benchmark"
        >
          <option value="default">Sort: default</option>
          <option value="coding">Sort: Coding</option>
          <option value="math">Sort: Math &amp; logic</option>
          <option value="reasoning">Sort: Science reasoning</option>
          <option value="knowledge">Sort: General knowledge</option>
        </select>

        <div className="ffg-prov-chips">
          {allProviders.map((p) => {
            const on = providerFilter.has(p);
            const color = colorFor(p);
            return (
              <button
                key={p}
                className={`ffg-prov-chip${on ? " on" : ""}`}
                onClick={() => toggleProvider(p)}
                style={on ? { borderColor: color, color } : {}}
                aria-pressed={on}
              >
                <span className="ffg-dot" style={{ background: color }} />
                {p}
              </button>
            );
          })}
          {providerFilter.size > 0 && (
            <button
              className="ffg-prov-clear"
              onClick={() => setProviderFilter(new Set())}
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
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
              setProviderFilter(new Set());
              setSortBy("default");
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
              inCompare={compareSet.has(m.id)}
              onToggleCompare={toggleCompare}
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

      {costOpen && (
        <CostModal
          models={models}
          pricing={pricing}
          onClose={() => setCostOpen(false)}
        />
      )}

      {selected && (
        <DetailModal
          model={selected}
          level={level}
          onClose={() => setSelected(null)}
        />
      )}

      {quizOpen && (
        <QuizModal
          models={models}
          initialAnswers={quizInitial}
          onClose={closeQuiz}
        />
      )}

      {compareSet.size > 0 && (
        <CompareBar
          models={models}
          compareSet={compareSet}
          onToggle={toggleCompare}
          onOpen={() => setCompareOpen(true)}
          onClear={() => setCompareSet(new Set())}
        />
      )}

      {compareOpen && compareSet.size >= 2 && (
        <CompareModal
          models={models.filter((m) => compareSet.has(m.id))}
          level={level}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
