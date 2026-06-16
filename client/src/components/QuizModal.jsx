import React, { useEffect, useState } from "react";
import { X, ArrowLeft, Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { ProviderDot, TypeBadge } from "./ModelCard.jsx";

const QUESTIONS = [
  {
    id: "useCase",
    question: "What do you mainly want to do?",
    options: [
      { id: "coding",     label: "Write or debug code" },
      { id: "chat",       label: "Everyday writing & chat" },
      { id: "reasoning",  label: "Research & hard problems" },
      { id: "multimodal", label: "Work with images or video" },
      { id: "volume",     label: "Run tasks at high volume" },
    ],
  },
  {
    id: "access",
    question: "How will you use it?",
    options: [
      { id: "hosted",    label: "Hosted API or app",           sub: "Easy setup, no hardware needed" },
      { id: "selfhost",  label: "Download and run it myself",  sub: "Full control, works offline" },
      { id: "any",       label: "No preference" },
    ],
  },
  {
    id: "priority",
    question: "What matters most?",
    options: [
      { id: "quality",  label: "Best possible quality",     sub: "Flagship models, higher cost" },
      { id: "balanced", label: "Good balance",              sub: "Strong quality at reasonable cost" },
      { id: "cheap",    label: "Lowest cost",               sub: "Fast, efficient models" },
    ],
  },
];

const USE_CASE_MAP = {
  coding:     "Coding",
  chat:       "Everyday chat",
  reasoning:  "Deep reasoning",
  multimodal: "Multimodal",
  volume:     "Fast & cheap",
};

const SUMMARY_LABELS = {
  useCase: {
    coding:     "writing or debugging code",
    chat:       "everyday writing & chat",
    reasoning:  "research & hard problems",
    multimodal: "working with images or video",
    volume:     "running tasks at high volume",
  },
  access: {
    hosted:   "hosted",
    selfhost: "self-hosted",
    any:      null,
  },
  priority: {
    quality:  "best possible quality",
    balanced: "a good balance of quality and cost",
    cheap:    "lowest cost",
  },
};

function buildSummary(answers) {
  const useCase  = SUMMARY_LABELS.useCase[answers.useCase];
  const access   = SUMMARY_LABELS.access[answers.access];
  const priority = SUMMARY_LABELS.priority[answers.priority];
  const modelPart = access ? `a ${access} model` : "a model (any setup)";
  return { useCase, modelPart, priority };
}

function scoreModel(model, answers) {
  let s = 0;
  const tags = model.tags || [];
  const uses = model.uses || [];
  const targetUse = USE_CASE_MAP[answers.useCase];

  if (targetUse && uses.includes(targetUse)) s += 4;

  if (answers.access === "hosted"   && model.type === "proprietary") s += 2;
  if (answers.access === "selfhost" && model.type === "open")        s += 2;
  if (answers.access === "hosted"   && model.type === "open")        s -= 1;
  if (answers.access === "selfhost" && model.type === "proprietary") s -= 1;

  const isCheap    = tags.some((t) => ["Fast", "Cheap", "Ultra-cheap"].includes(t));
  const isFlagship = tags.some((t) => ["Flagship", "Frontier", "New tier"].includes(t));

  if (answers.priority === "cheap")    { if (isCheap)    s += 2; if (isFlagship) s -= 1; }
  if (answers.priority === "quality")  { if (isFlagship) s += 2; if (isCheap)    s -= 1; }
  if (answers.priority === "balanced") { if (!isCheap && !isFlagship) s += 1; }

  return s;
}

function getResults(models, answers) {
  return [...models]
    .map((m) => ({ m, s: scoreModel(m, answers) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ m }) => m);
}

export default function QuizModal({ models, initialAnswers, onClose }) {
  const isComplete = (a) => a?.useCase && a?.access && a?.priority;

  const [answers, setAnswers] = useState(initialAnswers || {});
  const [step, setStep]       = useState(isComplete(initialAnswers) ? "results" : 0);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function pick(questionId, optionId) {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setStep("results");
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  function copyLink() {
    const { useCase, access, priority } = answers;
    const url = new URL(window.location.href);
    url.searchParams.set("quiz", `${useCase},${access},${priority}`);
    window.history.replaceState({}, "", url.toString());
    navigator.clipboard.writeText(url.toString()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const results = step === "results" ? getResults(models, answers) : [];
  const q = step !== "results" ? QUESTIONS[step] : null;

  return (
    <div className="ffg-overlay" onClick={onClose}>
      <div
        className="ffg-quiz-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ffg-quiz-head">
          <span className="ffg-quiz-eyebrow">
            <Sparkles size={12} /> Find your model
          </span>
          <button className="ffg-cmp-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {step !== "results" ? (
          <>
            <div className="ffg-quiz-progress" aria-label={`Step ${step + 1} of ${QUESTIONS.length}`}>
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`ffg-quiz-dot${i === step ? " active" : i < step ? " done" : ""}`}
                />
              ))}
            </div>

            <h2 className="ffg-quiz-q">{q.question}</h2>

            <div className="ffg-quiz-options">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  className={`ffg-quiz-opt${answers[q.id] === opt.id ? " on" : ""}`}
                  onClick={() => pick(q.id, opt.id)}
                >
                  <span className="ffg-quiz-opt-label">{opt.label}</span>
                  {opt.sub && <span className="ffg-quiz-opt-sub">{opt.sub}</span>}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button className="ffg-quiz-back" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={13} /> Back
              </button>
            )}
          </>
        ) : (
          <>
            <h2 className="ffg-quiz-q">
              {results.length > 0 ? "Here's what we recommend" : "No strong match found"}
            </h2>

            {(() => {
              const { useCase, modelPart, priority } = buildSummary(answers);
              return (
                <p className="ffg-quiz-summary">
                  You're looking for {modelPart} for{" "}
                  <strong>{useCase}</strong>, prioritizing{" "}
                  <strong>{priority}</strong>.
                </p>
              );
            })()}

            {results.length === 0 ? (
              <p className="ffg-quiz-empty">
                Try adjusting your answers — the combination may be too narrow.
              </p>
            ) : (
              <div className="ffg-quiz-results">
                {results.map((m, i) => (
                  <div key={m.id} className={`ffg-quiz-result${i === 0 ? " top" : ""}`}>
                    {i === 0 && <span className="ffg-quiz-top-pick">Top pick</span>}
                    <div className="ffg-quiz-result-head">
                      <ProviderDot provider={m.provider} />
                      <TypeBadge type={m.type} />
                    </div>
                    <h3 className="ffg-quiz-result-name">{m.name}</h3>
                    <p className="ffg-quiz-result-plain">{m.plain}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="ffg-quiz-footer">
              <button className="ffg-ghost" onClick={restart}>
                <RotateCcw size={13} /> Start over
              </button>
              <button className="ffg-primary" onClick={copyLink} disabled={results.length === 0}>
                {copied
                  ? <><Check size={13} /> Copied!</>
                  : <><Copy size={13} /> Copy link</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
