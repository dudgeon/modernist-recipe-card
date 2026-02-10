# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Frontend: single-page app (`index.html`) with URL and paste-text input modes
- Cloudflare Worker: API proxy that fetches recipe URLs, calls Claude Haiku, returns formatted HTML
- Worker extracts JSON-LD structured data from recipe pages when available, falls back to cleaned text
- Print support via `@media print` styles and Print button
- Project infrastructure: BACKLOG.md, CHANGELOG.md, README.md with deployment instructions
- Recipe formatting skill definition (`recipe-formatting-skill.md`)
- Recipe formatting HTML template with two example formats (`recipe-formatting-template.html`)
