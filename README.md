# Modernist Recipe Card

Paste a recipe URL, get it rendered in the distinctive style popularized by the *Modernist Cuisine* book series.

## What It Does

Takes a recipe from any URL and reformats it into a professional, precision-focused layout featuring:

- Weight-based measurements with baker's percentages for scaling
- Dual-unit formatting (metric primary, imperial secondary)
- Two layout formats: **Format A** (labeled steps + separate ingredients table) and **Format B** (integrated ingredient-procedure table)
- Clean, editorial typography using the Modernist Cuisine design language

## Architecture

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│ GitHub Pages │────▶│ Cloudflare Worker    │────▶│ Anthropic API│
│ (index.html) │◀────│ (fetch + proxy)      │◀────│ (Claude)     │
└──────────────┘     └─────────────────────┘     └──────────────┘
```

- **Frontend**: Static HTML/CSS/JS on GitHub Pages. No build step, no framework.
- **Worker**: Cloudflare Worker (~free tier). Fetches recipe URLs, calls Claude Haiku, keeps API key server-side.
- **Model**: Claude Haiku 4.5 — cheapest model that reliably handles recipe parsing + formatting.

## Setup

### 1. Deploy the Cloudflare Worker

```sh
cd worker
npm install
npx wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
npm run deploy
```

Note the deployed URL (e.g., `https://modernist-recipe-api.<you>.workers.dev`).

### 2. Configure the frontend

Edit `index.html` and set `WORKER_URL` to your worker's URL:

```js
const WORKER_URL = 'https://modernist-recipe-api.<you>.workers.dev';
```

### 3. Deploy to GitHub Pages

Push to `main` and enable GitHub Pages (Settings > Pages > Source: main branch, root `/`).

## Development

```sh
# Run the worker locally
cd worker
npm run dev

# Serve the frontend locally (any static server)
npx serve ..
```

Set `WORKER_URL` to `http://localhost:8787` during local development.

## Project Status

See [BACKLOG.md](./BACKLOG.md) for the roadmap and [CHANGELOG.md](./CHANGELOG.md) for history.

## Repository Contents

| Path | Description |
|------|-------------|
| `index.html` | Frontend — single-page app |
| `worker/` | Cloudflare Worker — API proxy |
| `recipe-formatting-skill.md` | Skill definition: formatting rules, typography specs, structural zones |
| `recipe-formatting-template.html` | Reference HTML/CSS template with two example recipes |
