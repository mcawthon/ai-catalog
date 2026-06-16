# Frontier Field Guide

A plain-language catalog of current AI models — what they are, what they're good for, and how they compare. Explained at beginner or expert level.

```
ai-catalog/
└── client/        Vite + React frontend
    └── src/
        └── data/
            └── models.js   ← edit this to update the catalog
```

## Updating the catalog

All model data lives in [client/src/data/models.js](client/src/data/models.js). Each entry follows this shape:

```js
{
  id: "unique-kebab-id",
  name: "Model Name",
  provider: "Provider",
  type: "open" | "proprietary",
  released: "Month Year",
  tags: ["Tag1", "Tag2"],
  uses: ["Deep reasoning", "Coding", "Everyday chat", "Fast & cheap", "Multimodal", "Run it yourself"],
  plain: "Plain-English description of what this model is and does.",
  goodFor: ["Use case 1", "Use case 2"],
  notFor: ["Limitation 1"],
  specs: {
    "context window": "...",
    strengths: "...",
    access: "...",
    license: "...",
  },
}
```

Edit the file and push — the site rebuilds and deploys automatically via Fly.io.

## Local development

Node 18+ required.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Deployment

Hosted on [Fly.io](https://fly.io) as a static nginx site. To deploy:

```bash
fly deploy
```

The Dockerfile builds the Vite client and serves it with nginx — no server, no database.
