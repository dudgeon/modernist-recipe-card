---
created: 2026-02-08
updated: 2026-02-08
tags: [reference, recipe, formatting, html, modernist-cuisine]
status: active
domain: brain
source: inbox (2026-02-08T17-22-55-recipe-formatting-skill.md)
---

# Recipe Formatting Skill — Modernist Cuisine Style

## Overview

This skill formats recipes into polished, professional HTML documents inspired by the **Modernist Cuisine / Modernist Bread** recipe layout system. These recipes emphasize precision (weight-based measurements), scalability (baker's percentages), integrated ingredient-procedure tables, and rich metadata — all rendered with clean, editorial typography.

## When to Use

Use this skill when the user provides a recipe and wants it formatted professionally, or asks for a "Modernist Cuisine style", "cookbook-quality", or "printable" recipe layout. Also use when converting casual recipes into precise, scalable formats.

## Output Format

Generate a **single self-contained HTML file** with all CSS embedded. No external dependencies. Openable in any browser, prints cleanly, convertible to PDF.

---

## Design Language

### Typography
- **Title**: Large, uppercase, Georgia serif. `letter-spacing: 0.05em`, `font-size: 32px`.
- **Category label**: Small (~13px), uppercase, tracked, warm accent color above the title.
- **Section headers**: Uppercase serif, thin `1px solid` rule above, `letter-spacing: 0.1em`.
- **Body text**: Georgia, ~15px, `line-height: 1.65`.
- **Table headers**: Uppercase, ~11px, `letter-spacing: 0.08em`, border-bottom `1.5px solid #999`.
- **Metadata labels**: Uppercase small-caps, muted color, ~13px.

### Color Palette
```
Primary text:    #2c2c2c  (near-black)
Muted/labels:    #6b6b6b  (gray)
Accent:          #8b7355  (warm brown, category labels)
Table rules:     #d4d0c8  (light warm gray)
Header rules:    #999     (darker gray)
Background:      #ffffff  (white)
```

### Layout Principles
- Max width: ~1000px, centered
- Generous whitespace: 48px+ padding on page container
- Two-column layouts where natural (CSS Grid, ~40px gap)
- Tables: horizontal borders only — no vertical lines, no cell shading
- `@media print` block: white background, clean page breaks, no decorative elements

---

## Recipe Structural Zones

### 1. Header Zone
Category label (e.g., "MASTER RECIPE", "SIDE DISH") in small accented text above the title. Title in large uppercase serif.

### 2. Metadata Block
Key-value grid (`grid-template-columns: 220px 1fr`):

| Field | When to Include |
|---|---|
| YIELD | Always — quantity + weight/volume |
| TIME ESTIMATE | Always — include prep vs unattended breakdown |
| TOTAL TIME (Active/Inactive) | Baking recipes with long fermentation |
| STORAGE NOTES | When the dish stores well |
| LEVEL OF DIFFICULTY | Optional (easy · moderate · advanced) |
| SPECIAL REQUIREMENTS | When special equipment needed |

Labels: uppercase small-caps muted gray. Values: italic serif.

### 3. Introduction / Headnote
1–3 paragraphs: what makes this special, technique insights (*why* not just *how*), ingredient quality notes, variations. For long intros use `column-count: 2; column-gap: 40px`.

### 4. Ingredients Table

**Columns**: INGREDIENT | WEIGHT | VOLUME | SCALING (%)

**Rules:**
- Weight ALWAYS in grams. kg only if ≥ 1000 g.
- Volume in US measures (cups, tsp, tbsp). Include mL when helpful.
- Scaling: primary ingredient = 100% (flour for baking, main vegetable/protein for other recipes). Others = `(weight / primary_weight) × 100`, rounded to 1 decimal.
- Include Yield summary below table.
- Group ingredients by phase if recipe has distinct stages.
- "to taste" items: leave weight/scaling cells empty.
- Optional items: append "(optional)" to name.

### 5. Procedure — Two Formats

**Ingredient names in directions:** In all procedure text (both formats), wrap ingredient names in `<strong>` tags to make them stand out. E.g. "Add **butter** and **garlic**..."

**Combine steps with many ingredients:** When a step combines 3 or more ingredients, list them as em-dash bullets using `<ul class="ingredient-list">` instead of inline prose.

#### Format A: Labeled Steps (baking, multi-phase recipes)
Single-column layout: bold uppercase keyword label (~120px left), prose description (right) in a two-column CSS grid (label + description). All steps in one continuous list — do NOT split into multiple columns.

Common labels: MIX, BULK FERMENT, DIVIDE, PRESHAPE, PROOF, SHAPE, ASSEMBLE, BAKE, REST, TEMPER, CHILL, FRY, REDUCE, STRAIN, SERVE

#### Format B: Integrated Ingredient-Procedure Table (sequential recipes)
Single table: INGREDIENT | WEIGHT | VOLUME | SCALING | PROCEDURE

- New ingredient groups get a heavier top border (1.5px solid #999).
- Steps without new ingredients: ingredient cells empty, lighter/no bottom borders on those cells.
- Circled numbers for steps: ① ② ③ ... ⑳
- Steps are concise, single-sentence directives.
- Procedure column is the widest (~45% of table width).

### 6. Technique Notes
Prose below procedure: detailed technique explanations, scaling guidance, assembly quantities, equipment tips. Separated by thin rule + generous margin.

### 7. Reference Tables
For variable conditions (different oven types, vessels). Same minimal horizontal-rule table styling. Title in uppercase with letter-spacing.

### 8. Footnotes
Bottom of recipe, marked *, **, †. Smaller font (~13px), muted color. Sourcing, substitutions, equipment recommendations.

---

## Formatting Standards

| Element | Format | Example |
|---|---|---|
| Temperature | Metric first, Imperial second | `21°C / 70°F` |
| Length | Dual units | `2.5 cm / 1 in` |
| Weight | Grams primary | `610 g` or `1.3 kg` |
| Volume | US measures + mL when helpful | `½ cup`, `690 mL / 2½ cups` |
| Pressure | Dual | `1 bar / 15 psi` |
| Fractions | Unicode vulgar fractions | ½ ⅓ ¼ ⅔ ¾ ⅛ ⅜ ⅝ ⅞ |
| Time ranges | En-dash (–) not hyphen | `7–8 min`, `20–24 h` |
| Step numbers | Circled Unicode | ① ② ③ ④ ⑤ ... ⑳ |
| Degree symbol | Unicode U+00B0 | `°` (not superscript o) |

---

## Decision Guide

```
Baking/bread/pastry with distinct named phases?
  YES → FORMAT A: Labeled Steps + separate Ingredients Table
        + baker's percentages + Active/Inactive time + Baking Reference Table
  NO  → Ingredients added at different stages during cooking?
        YES → FORMAT B: Integrated Ingredient-Procedure Table
        NO  → Simple Ingredients Table + numbered steps below
```

---

## Quality Checklist

- [ ] Weights in grams, volumes in US measures
- [ ] Scaling percentages correct (primary = 100%)
- [ ] Temperatures dual-formatted (°C / °F)
- [ ] Lengths dual-formatted (cm / in)
- [ ] Active vs. inactive time distinguished
- [ ] Yield with quantity + weight/volume
- [ ] Prose headnote with technique insights
- [ ] Minimal horizontal-only table rules
- [ ] Footnotes for substitutions/sourcing
- [ ] `@media print` styles included
- [ ] En-dashes for ranges, Unicode fractions, circled numbers
- [ ] No orphaned headers at page bottom
