import React from "react";
import { Scale, X } from "lucide-react";
import { colorFor } from "../providers.js";

export default function CompareBar({ models, compareSet, onToggle, onOpen, onClear }) {
  const selected = models.filter((m) => compareSet.has(m.id));
  const canCompare = selected.length >= 2;
  const remaining = 3 - selected.length;

  return (
    <div className="ffg-cbar">
      <div className="ffg-cbar-chips">
        {selected.map((m) => (
          <div key={m.id} className="ffg-cbar-chip">
            <span className="ffg-dot" style={{ background: colorFor(m.provider) }} />
            <span className="ffg-cbar-chip-name">{m.name}</span>
            <button
              className="ffg-cbar-chip-remove"
              onClick={() => onToggle(m.id)}
              aria-label={`Remove ${m.name} from comparison`}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <span className="ffg-cbar-hint">
          {canCompare
            ? remaining > 0
              ? `+ add up to ${remaining} more`
              : "ready to compare"
            : `select ${2 - selected.length} more to compare`}
        </span>
      </div>
      <div className="ffg-cbar-actions">
        <button className="ffg-ghost ffg-cbar-ghost" onClick={onClear}>
          Clear
        </button>
        <button className="ffg-primary" onClick={onOpen} disabled={!canCompare}>
          <Scale size={13} />
          Compare ({selected.length})
        </button>
      </div>
    </div>
  );
}
