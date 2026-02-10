# Backlog & Roadmap

## v1 — MVP (Current)

Single-page app: paste a recipe URL, render it in Modernist Cuisine style.

### v1 Scope

- [ ] Project scaffolding (tech stack, build tooling)
- [ ] Backend endpoint to fetch recipe content from a URL
- [ ] Backend endpoint to call LLM for recipe parsing/formatting
- [ ] Frontend: single input field for URL, submit button
- [ ] Frontend: render formatted recipe HTML using the template design system
- [ ] Loading/progress states
- [ ] Basic error handling (invalid URL, fetch failures, unparseable recipes)
- [ ] Model selection: use lightest viable model (Haiku-class) for cost efficiency
- [ ] Deploy to a public URL

### Out of v1 Scope (Deferred)

Items below are explicitly deferred. They may inform v1 decisions (e.g., data model) but should not block shipping.

---

## Backlog (Future Versions)

### Print Formatting
- [ ] Card-for-print layout at various paper sizes (A4, Letter, 4x6, 5x7)
- [ ] Print-specific CSS with proper page breaks and margins
- [ ] PDF export option

### Recipe Normalization
- [ ] Markdown output of formatted recipe
- [ ] Standardized frontmatter (source URL, categories, tags, cuisine type, dietary info)
- [ ] Structured data export (JSON-LD, schema.org Recipe)

### Responsive Design
- [ ] Mobile-first responsive layout
- [ ] Touch-friendly interactions
- [ ] Responsive typography scaling

### UX Improvements
- [ ] Recipe history (local storage)
- [ ] Share formatted recipe via link
- [ ] Manual recipe text input (paste raw text instead of URL)
- [ ] Format selection (Format A vs Format B) or auto-detection
- [ ] Editable output (tweak ingredients, steps after generation)

### Infrastructure
- [ ] Rate limiting to manage API costs
- [ ] Usage analytics/monitoring
- [ ] Error tracking
- [ ] Caching layer for previously formatted recipes

### Quality
- [ ] Unit/integration tests
- [ ] Accessibility audit (WCAG compliance)
- [ ] Cross-browser testing
