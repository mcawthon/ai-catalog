import React from "react";
import { ProviderDot } from "./ModelCard.jsx";

const MONTH_NUM = {
  Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
  Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12",
};

function bucketOf(released) {
  if (!released) return { key: "z", label: "Unknown" };

  // "Apr 2026" → specific month
  const mY = released.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/);
  if (mY) return { key: `${mY[2]}-${MONTH_NUM[mY[1]]}`, label: released };

  // "2025–26" or plain "2026" → bucket by year
  const yr = released.match(/^(\d{4})/);
  if (yr) return { key: `${yr[1]}-00`, label: yr[1] };

  return { key: "z", label: "Unknown" };
}

export default function TimelineView({ models, onOpen }) {
  // Build ordered buckets
  const bucketMap = {};
  models.forEach((m) => {
    const { key, label } = bucketOf(m.released);
    if (!bucketMap[key]) bucketMap[key] = { key, label, models: [] };
    bucketMap[key].models.push(m);
  });
  const buckets = Object.values(bucketMap).sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="ffg-tl-outer">
      <div className="ffg-tl-inner">
        {/* The continuous horizontal bar — absolute inside the flex container */}
        <div className="ffg-tl-bar" />

        {buckets.map((bucket) => (
          <div key={bucket.key} className="ffg-tl-col">
            <div className="ffg-tl-col-head">
              <span className="ffg-tl-date">{bucket.label}</span>
              <div className="ffg-tl-stem" />
              <div className="ffg-tl-node" />
            </div>

            <div className="ffg-tl-cards">
              {bucket.models.map((m) => (
                <button key={m.id} className="ffg-tl-card" onClick={() => onOpen(m)}>
                  <div className="ffg-tl-card-head">
                    <ProviderDot provider={m.provider} />
                    <span className="ffg-tl-card-name">{m.name}</span>
                  </div>
                  {m.tags?.length > 0 && (
                    <div className="ffg-tl-card-tags">
                      {m.tags.slice(0, 2).map((t) => (
                        <span key={t} className="ffg-tl-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
