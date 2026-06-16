import React, { useState } from "react";

export const GLOSSARY = {
  "context window":
    "How much text a model can 'hold in its head' at once — your prompt plus its reply. Bigger windows let it read long documents or whole codebases in one go. Measured in tokens.",
  tokens:
    "The chunks a model reads and writes in. A token is roughly ¾ of a word, so 1,000 tokens ≈ 750 words.",
  parameters:
    "The internal 'dials' a model tunes during training. More parameters can mean more capability, but also more cost to run. Counted in billions (B) or trillions (T).",
  "open weights":
    "The trained model file is published, so anyone can download it, run it on their own hardware, and customize it. The opposite of a closed model you can only reach through someone's website or API.",
  proprietary:
    "A model you can only use through the company that made it — via their app or API. You can't download or self-host it.",
  MoE:
    "Mixture of Experts. The model is split into many specialist sub-networks and only activates the few it needs per question — so a huge model can run at the cost of a much smaller one.",
  "active parameters":
    "In a Mixture-of-Experts model, the slice of parameters actually used for any single answer. Lower active counts mean cheaper, faster responses.",
  reasoning:
    "Models tuned to 'think' through multi-step problems — math, logic, hard coding — often by working through intermediate steps before answering.",
  multimodal:
    "Handles more than just text — can also take in or produce images, audio, or video.",
  API:
    "A way for software to talk to a model directly in code, instead of through a chat website. How developers build apps on top of a model.",
  agentic:
    "Able to take actions in steps — calling tools, browsing, running code — to complete a task rather than just replying once.",
  license:
    "The legal terms for using a model. Permissive ones (Apache 2.0, MIT) allow broad commercial use; others add caps or restrictions.",
};

const KEYS = Object.keys(GLOSSARY);
export const isJargon = (k) => KEYS.includes(k);

export function Term({ k, children }) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[k];
  if (!def) return <>{children}</>;
  return (
    <span className="ffg-term-wrap">
      <button
        className="ffg-term"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={() => setOpen(false)}
        aria-label={`Define ${k}`}
      >
        {children}
      </button>
      {open && (
        <span className="ffg-tip" role="tooltip">
          <strong>{k}</strong>
          {def}
        </span>
      )}
    </span>
  );
}
