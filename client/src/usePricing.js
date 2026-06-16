import { useEffect, useState } from "react";

// Best-effort mapping from our model IDs to OpenRouter model IDs
const OR_MAP = {
  "claude-opus-4-8":   "anthropic/claude-opus-4-5",
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4-6",
  "claude-haiku-4-5":  "anthropic/claude-haiku-3-5",
  "llama-4-maverick":  "meta-llama/llama-4-maverick",
  "llama-4-scout":     "meta-llama/llama-4-scout",
  "deepseek-v4-pro":   "deepseek/deepseek-r1",
  "mistral-large-3":   "mistralai/mistral-large",
  "qwen-3-6":          "qwen/qwq-32b",
  "gemma-4":           "google/gemma-3-27b-it",
};

export function usePricing(models) {
  const [liveMap, setLiveMap] = useState({});

  useEffect(() => {
    fetch("https://openrouter.ai/api/v1/models")
      .then((r) => r.json())
      .then(({ data = [] }) => {
        const byId = Object.fromEntries(data.map((m) => [m.id, m]));
        const map = {};
        for (const [ourId, orId] of Object.entries(OR_MAP)) {
          const entry = byId[orId];
          if (!entry?.pricing) continue;
          const inp = parseFloat(entry.pricing.prompt) * 1_000_000;
          const out = parseFloat(entry.pricing.completion) * 1_000_000;
          if (!isNaN(inp) && !isNaN(out) && inp > 0) {
            map[ourId] = { input: inp, output: out, live: true };
          }
        }
        setLiveMap(map);
      })
      .catch(() => {});
  }, []);

  // Live data wins; fall back to model.pricing for everything else
  const pricing = {};
  for (const m of models) {
    if (liveMap[m.id]) {
      pricing[m.id] = liveMap[m.id];
    } else if (m.pricing) {
      pricing[m.id] = { ...m.pricing, live: false };
    }
  }

  return pricing;
}
