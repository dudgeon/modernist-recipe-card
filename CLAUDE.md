# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modernist Recipe Card transforms recipes (from URL or pasted text) into professionally formatted HTML in the style of Modernist Cuisine. It's a two-part system: a vanilla JS frontend (served via GitHub Pages) and a Cloudflare Worker backend that proxies requests to the Claude API.

## Architecture

```
index.html (GitHub Pages)  →  worker/src/index.js (Cloudflare Worker)  →  Claude Haiku 4.5
Static HTML/CSS/JS              Fetches URLs, extracts JSON-LD,            Parses recipe,
No build step                   cleans HTML, calls Claude API              returns formatted HTML
```

- **Frontend**: Single `index.html` file (~630 lines) with embedded CSS and JS. No framework, no build tools.
- **Worker**: `worker/src/index.js` (~500 lines). Handles URL fetching, HTML cleaning, JSON-LD extraction, and Claude API calls. System prompt embeds the full recipe-formatting spec.
- **Spec**: `recipe-formatting-skill.md` is the source of truth for recipe output formatting (typography, layout, two format types).

## Development Commands

```sh
# Backend (Cloudflare Worker)
cd worker
npm install
npm run dev              # Local dev server at http://localhost:8787

# Frontend (static — any server works)
npx serve .              # From repo root, serves index.html
```

Set `WORKER_URL` in `index.html` to `http://localhost:8787` for local development.

## Deployment

```sh
# Worker
cd worker
npx wrangler secret put ANTHROPIC_API_KEY   # One-time secret setup
npm run deploy                               # Deploy to Cloudflare edge

# Frontend: push to main, served via GitHub Pages
```

## API

**POST /api/format-recipe** — accepts `{url}` or `{text}`, returns `{html}` or `{error}`.

## Key Conventions

- **No build step** for frontend — edit `index.html` directly
- **Secrets**: managed via `npx wrangler secret put`, never committed
- **CSS classes**: kebab-case, defined in recipe-formatting-skill.md (`.recipe`, `.ingredients-table`, `.integrated-table`, `.labeled-steps`, etc.)
- **Two recipe formats**: Format A (labeled steps for baking) and Format B (integrated table for sequential recipes) — see recipe-formatting-skill.md
- **Model**: `claude-haiku-4-5-20251001` — chosen for cost; MAX_TOKENS = 8192; input truncated to 20k chars
- **No tests yet** — listed in BACKLOG.md as deferred work
