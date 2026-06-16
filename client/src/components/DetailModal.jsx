import React, { useEffect, useState } from "react";
import { X, Check, AlertCircle, Layers, Pencil, ChevronRight, BookOpen } from "lucide-react";
import { ProviderDot, TypeBadge, SpecList } from "./ModelCard.jsx";

export default function DetailModal({ model, level: initialLevel = "beginner", canEdit, onEdit, onClose }) {
  const [level, setLevel] = useState(initialLevel);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Collapse specs when switching back to beginner
  useEffect(() => {
    if (level === "beginner") setShowSpecs(false);
  }, [level]);

  return (
    <div className="ffg-overlay" onClick={onClose}>
      <div
        className="ffg-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ffg-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="ffg-modal-head">
          <ProviderDot provider={model.provider} />
          <TypeBadge type={model.type} />
        </div>

        <h2 className="ffg-modal-name">{model.name}</h2>

        <div className="ffg-tags">
          {(model.tags || []).map((t) => (
            <span key={t} className="ffg-tag">{t}</span>
          ))}
        </div>

        <div className="ffg-modal-level-bar">
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

        {level === "beginner" ? (
          <>
            <p className="ffg-modal-plain">{model.plain}</p>
            <div className="ffg-cols">
              <div className="ffg-col">
                <h4 className="ffg-col-h ffg-good">
                  <Check size={14} /> Good for
                </h4>
                <ul className="ffg-list">
                  {(model.goodFor || []).map((g) => <li key={g}>{g}</li>)}
                </ul>
              </div>
              <div className="ffg-col">
                <h4 className="ffg-col-h ffg-bad">
                  <AlertCircle size={14} /> Less ideal for
                </h4>
                <ul className="ffg-list">
                  {(model.notFor || []).map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
            </div>
            <button
              className="ffg-specs-toggle"
              onClick={() => setShowSpecs((s) => !s)}
            >
              {showSpecs ? "Hide technical specs" : "Show technical specs"}
              <ChevronRight size={13} className={showSpecs ? "ffg-rot" : ""} />
            </button>
            {showSpecs && <SpecList specs={model.specs} />}
          </>
        ) : (
          <>
            <p className="ffg-modal-plain ffg-modal-plain-muted">{model.plain}</p>
            <h4 className="ffg-col-h">
              <Layers size={14} /> The specs
            </h4>
            <SpecList specs={model.specs} expert />
          </>
        )}

        {model.updatedAt && (
          <p className="ffg-updated">
            Last updated {new Date(model.updatedAt).toLocaleString()}
          </p>
        )}

        {canEdit && (
          <button className="ffg-edit-btn" onClick={() => onEdit(model)}>
            <Pencil size={14} /> Edit this model
          </button>
        )}
      </div>
    </div>
  );
}
