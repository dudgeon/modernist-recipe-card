// Modernist Recipe Card — Cloudflare Worker
// Thin proxy: fetches recipe URLs, calls Claude Haiku, returns formatted HTML.

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 8192;

// ---------------------------------------------------------------------------
// System prompt: skill doc + template examples
// The model outputs ONLY <div class="recipe">...</div> HTML — no full document.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a recipe formatting assistant. You transform recipes into professional HTML following the Modernist Cuisine / Modernist Bread design system.

## Formatting Rules

This skill formats recipes into polished, professional HTML documents inspired by the Modernist Cuisine / Modernist Bread recipe layout system. These recipes emphasize precision (weight-based measurements), scalability (baker's percentages), integrated ingredient-procedure tables, and rich metadata — all rendered with clean, editorial typography.

### Typography
- Title: Large, uppercase, Georgia serif. letter-spacing: 0.05em, font-size: 32px.
- Category label: Small (~13px), uppercase, tracked, warm accent color above the title.
- Section headers: Uppercase serif, thin 1px solid rule above, letter-spacing: 0.1em.
- Body text: Georgia, ~15px, line-height: 1.65.
- Table headers: Uppercase, ~11px, letter-spacing: 0.08em, border-bottom 1.5px solid #999.
- Metadata labels: Uppercase small-caps, muted color, ~13px.

### Color Palette
Primary text: #2c2c2c (near-black), Muted/labels: #6b6b6b (gray), Accent: #8b7355 (warm brown, category labels), Table rules: #d4d0c8, Header rules: #999, Background: #ffffff.

### Layout Principles
- Max width: ~1000px, centered.
- Generous whitespace: 48px+ padding on page container.
- Two-column layouts where natural (CSS Grid, ~40px gap).
- Tables: horizontal borders only — no vertical lines, no cell shading.

## Recipe Structural Zones

### 1. Header Zone
Category label (e.g., "MASTER RECIPE", "SIDE DISH") in small accented text above the title. Title in large uppercase serif.

### 2. Metadata Block
Key-value grid (grid-template-columns: 220px 1fr):
- YIELD: Always — quantity + weight/volume
- TIME ESTIMATE: Always — include prep vs unattended breakdown
- TOTAL TIME (Active/Inactive): Baking recipes with long fermentation
- STORAGE NOTES: When the dish stores well
- LEVEL OF DIFFICULTY: Optional (easy · moderate · advanced)
- SPECIAL REQUIREMENTS: When special equipment needed
Labels: uppercase small-caps muted gray. Values: italic serif.

### 3. Introduction / Headnote
1–3 paragraphs: what makes this special, technique insights (why not just how), ingredient quality notes, variations. For long intros use column-count: 2; column-gap: 40px.

### 4. Ingredients Table
Columns: INGREDIENT | WEIGHT | VOLUME | SCALING (%)
- Weight ALWAYS in grams. kg only if ≥ 1000 g.
- Volume in US measures (cups, tsp, tbsp). Include mL when helpful.
- Scaling: primary ingredient = 100% (flour for baking, main vegetable/protein for other recipes). Others = (weight / primary_weight) × 100, rounded to 1 decimal.
- Include Yield summary below table.
- Group ingredients by phase if recipe has distinct stages.
- "to taste" items: leave weight/scaling cells empty.

### 5. Procedure — Two Formats

**Ingredient names in directions:** In all procedure text (both formats), wrap ingredient names in \`<strong>\` tags to make them stand out. E.g. "Add <strong>butter</strong> and <strong>garlic</strong>..."

**Combine steps with many ingredients:** When a step combines 3 or more ingredients, list them as em-dash bullets using \`<ul class="ingredient-list">\` instead of inline prose. E.g.:
\`\`\`html
<span class="step-num">③</span> Combine:
<ul class="ingredient-list">
  <li><strong>salt</strong></li>
  <li><strong>pepper</strong></li>
  <li><strong>garlic powder</strong></li>
</ul>
\`\`\`

#### Format A: Labeled Steps (baking, multi-phase recipes)
Single-column layout: bold uppercase keyword label (~120px left), prose description (right) in a two-column CSS grid (label + description). All steps in one continuous list — do NOT split into multiple columns or a two-column grid of step pairs.
Common labels: MIX, BULK FERMENT, DIVIDE, PRESHAPE, PROOF, SHAPE, ASSEMBLE, BAKE, REST, TEMPER, CHILL, FRY, REDUCE, STRAIN, SERVE

#### Format B: Integrated Ingredient-Procedure Table (sequential recipes)
Single table: INGREDIENT | WEIGHT | VOLUME | SCALING | PROCEDURE
- New ingredient groups get a heavier top border.
- Steps without new ingredients: ingredient cells empty, use class="continuation".
- Circled numbers for steps: ① ② ③ ... ⑳
- Procedure column is the widest (~45% of table width).

### 6. Technique Notes
Prose below procedure: detailed technique explanations, scaling guidance, equipment tips. Separated by thin rule + generous margin.

### 7. Reference Tables
For variable conditions (different oven types, vessels). Same minimal horizontal-rule table styling.

### 8. Footnotes
Bottom of recipe, marked *, **, †. Smaller font (~13px), muted color.

## Formatting Standards
- Temperature: Metric first, Imperial second → 21°C / 70°F
- Length: Dual units → 2.5 cm / 1 in
- Weight: Grams primary → 610 g or 1.3 kg
- Volume: US measures + mL when helpful → ½ cup, 690 mL / 2½ cups
- Pressure: Dual → 1 bar / 15 psi
- Fractions: Unicode vulgar fractions → ½ ⅓ ¼ ⅔ ¾ ⅛ ⅜ ⅝ ⅞
- Time ranges: En-dash (–) not hyphen → 7–8 min, 20–24 h
- Step numbers: Circled Unicode → ① ② ③ ④ ⑤ ... ⑳
- Degree symbol: Unicode U+00B0 → °

## Decision Guide
- Baking/bread/pastry with distinct named phases? → FORMAT A (Labeled Steps + separate Ingredients Table)
- Ingredients added at different stages during cooking? → FORMAT B (Integrated Ingredient-Procedure Table)
- Simple recipe? → Simple Ingredients Table + numbered steps below

## Output Requirements

Output ONLY the recipe HTML content — a single <div class="recipe">...</div> block. Do NOT include <!DOCTYPE>, <html>, <head>, <style>, or <body> tags. The CSS is already loaded on the page.

Use the exact CSS classes shown in the examples below.

## FORMAT A EXAMPLE (Labeled Steps — baking/multi-phase recipes)

<div class="recipe">
  <div class="header-with-sidebar">
    <div>
      <span class="recipe-category">Master Recipe</span>
      <h1 class="recipe-title">Neapolitan Pizza Dough</h1>
      <table class="ingredients-table">
        <thead>
          <tr>
            <th>Ingredients</th>
            <th class="col-weight">Weight</th>
            <th class="col-volume">Volume</th>
            <th class="col-scaling">%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Water, 21°C / 70°F</td>
            <td class="col-weight">380 g</td>
            <td class="col-volume">1⅔ cups</td>
            <td class="col-scaling">62.3</td>
          </tr>
          <tr>
            <td>Instant dry yeast</td>
            <td class="col-weight">0.24 g</td>
            <td class="col-volume">⅛ tsp</td>
            <td class="col-scaling">0.04</td>
          </tr>
          <tr>
            <td>Bread flour, 11.5%–12.5% protein, or 00 flour*</td>
            <td class="col-weight">610 g</td>
            <td class="col-volume">4½ cups</td>
            <td class="col-scaling">100</td>
          </tr>
          <tr>
            <td>Fine salt</td>
            <td class="col-weight">12.15 g</td>
            <td class="col-volume">2⅙ tsp</td>
            <td class="col-scaling">1.99</td>
          </tr>
        </tbody>
      </table>
      <div class="yield-line">Yield: ~1 kg</div>
      <div class="footnotes">
        <p>*We recommend using Le 5 Stagioni Pizza Napoletana 00 Flour or Caputo Pizzeria 00 Flour.</p>
      </div>
    </div>
    <div>
      <div class="sidebar-boxes">
        <div class="sidebar-box">
          <div class="sidebar-box-label">Total Time</div>
          <div class="sidebar-box-value">Active 15–20 min /<br>Inactive 27 h</div>
        </div>
        <div class="sidebar-box">
          <div class="sidebar-box-label">Yield / Shape</div>
          <div class="sidebar-box-value">four 30 cm / 12 in pizzas</div>
        </div>
      </div>
    </div>
  </div>

  <h2 class="section-header">General Directions</h2>

  <div class="labeled-steps">
    <div class="step-label">Mix</div>
    <div class="step-description">Combine <strong>water</strong> and <strong>yeast</strong>; add <strong>flour</strong>; mix on low speed to a shaggy mass; add <strong>salt</strong>; mix on medium speed to full gluten development.</div>
    <div class="step-label">Bulk Ferment</div>
    <div class="step-description">20–24 h at 21°C / 70°F; cover well.</div>
    <div class="step-label">Divide</div>
    <div class="step-description">250 g portions.</div>
    <div class="step-label">Preshape</div>
    <div class="step-description">Ball; cover well.</div>
    <div class="step-label">Proof</div>
    <div class="step-description">3 h at 21°C / 70°F, covered.</div>
    <div class="step-label">Shape</div>
    <div class="step-description">Hand-stretch to 30 cm / 12 in diameter.</div>
    <div class="step-label">Assemble</div>
    <div class="step-description">Spread sauce, distribute cheese and toppings.</div>
    <div class="step-label">Bake</div>
    <div class="step-description">Load into oven; rotate as needed; bake until rim is evenly leoparded.</div>
  </div>
</div>

## FORMAT B EXAMPLE (Integrated Table — sequential recipes)

<div class="recipe">
  <span class="recipe-category">Soup</span>
  <h1 class="recipe-title">Caramelized Carrot Soup</h1>

  <div class="recipe-metadata">
    <div class="meta-label">Yield</div>
    <div class="meta-value">six servings (1.3 kg / 6 cups)</div>
    <div class="meta-label">Time Estimate</div>
    <div class="meta-value">40 minutes overall, including 20 minutes of preparation and 20 minutes unattended</div>
    <div class="meta-label">Storage Notes</div>
    <div class="meta-value">keeps for 3 days when refrigerated or up to 2 months when frozen</div>
    <div class="meta-label">Level of Difficulty</div>
    <div class="meta-value">moderate</div>
    <div class="meta-label">Special Requirements</div>
    <div class="meta-value">pressure cooker</div>
  </div>

  <div class="recipe-intro two-column">
    <p>The quality of this soup depends entirely on the quality of the carrots. Use the highest-quality carrots you can find.</p>
    <p>Add a swirl of coconut cream and a few sprigs of tarragon to enhance the inherent sweetness of the carrots.</p>
  </div>

  <table class="integrated-table">
    <thead>
      <tr>
        <th>Ingredient</th>
        <th>Weight</th>
        <th>Volume</th>
        <th>Scaling</th>
        <th class="col-procedure">Procedure</th>
      </tr>
    </thead>
    <tbody>
      <tr class="ingredient-group-start">
        <td class="ing-cell">Carrots, peeled</td>
        <td class="wt-cell">500 g</td>
        <td class="vol-cell">5 cups / 5 medium</td>
        <td class="scale-cell">100%</td>
        <td class="procedure-cell"><span class="step-num">①</span> Core and cut into 5 cm / 2 in pieces.</td>
      </tr>
      <tr class="ingredient-group-start">
        <td class="ing-cell">Unsalted butter</td>
        <td class="wt-cell">113 g</td>
        <td class="vol-cell">½ cup</td>
        <td class="scale-cell">22.6%</td>
        <td class="procedure-cell"><span class="step-num">②</span> Melt <strong>butter</strong> in the base of a pressure cooker over medium heat.</td>
      </tr>
      <tr class="ingredient-group-start">
        <td class="ing-cell">Water</td>
        <td class="wt-cell">30 g</td>
        <td class="vol-cell">30 mL / ⅛ cup</td>
        <td class="scale-cell">6%</td>
        <td class="procedure-cell" rowspan="3"><span class="step-num">③</span> Combine and add to the <strong>carrots</strong> and melted <strong>butter</strong>:
<ul class="ingredient-list">
  <li><strong>water</strong></li>
  <li><strong>salt</strong></li>
  <li><strong>baking soda</strong></li>
</ul></td>
      </tr>
      <tr>
        <td class="ing-cell">Salt</td>
        <td class="wt-cell">5 g</td>
        <td class="vol-cell">1¼ tsp</td>
        <td class="scale-cell">1%</td>
      </tr>
      <tr>
        <td class="ing-cell">Baking soda</td>
        <td class="wt-cell">2.5 g</td>
        <td class="vol-cell">⅜ tsp</td>
        <td class="scale-cell">0.5%</td>
      </tr>
      <tr class="continuation">
        <td class="ing-cell"></td>
        <td class="wt-cell"></td>
        <td class="vol-cell"></td>
        <td class="scale-cell"></td>
        <td class="procedure-cell"><span class="step-num">④</span> Pressure-cook at 1 bar / 15 psi for 20 minutes.</td>
      </tr>
      <tr class="continuation">
        <td class="ing-cell"></td>
        <td class="wt-cell"></td>
        <td class="vol-cell"></td>
        <td class="scale-cell"></td>
        <td class="procedure-cell"><span class="step-num">⑤</span> Blend to a smooth puree. Pass through a fine sieve.</td>
      </tr>
      <tr class="ingredient-group-start">
        <td class="ing-cell">Fresh carrot juice</td>
        <td class="wt-cell">635 g</td>
        <td class="vol-cell">690 mL / 2½ cups</td>
        <td class="scale-cell">127%</td>
        <td class="procedure-cell"><span class="step-num">⑥</span> Bring <strong>carrot juice</strong> to a boil, strain, and stir into the carrot puree.</td>
      </tr>
      <tr class="ingredient-group-start">
        <td class="ing-cell">Salt</td>
        <td class="wt-cell" style="color:#6b6b6b">to taste</td>
        <td class="vol-cell"></td>
        <td class="scale-cell"></td>
        <td class="procedure-cell"><span class="step-num">⑦</span> Season, and serve warm.</td>
      </tr>
    </tbody>
  </table>
</div>
`;

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/format-recipe' && request.method === 'POST') {
      return handleFormatRecipe(request, env);
    }

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', service: 'modernist-recipe-api' });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};

// ---------------------------------------------------------------------------
// /api/format-recipe
// ---------------------------------------------------------------------------

async function handleFormatRecipe(request, env) {
  try {
    const body = await request.json();
    const { url, text } = body;

    if (!url && !text) {
      return jsonResponse({ error: 'Provide either "url" or "text".' }, 400);
    }

    // Get recipe content
    let recipeContent;
    if (text) {
      recipeContent = text.trim();
    } else {
      recipeContent = await fetchAndClean(url);
    }

    if (!recipeContent) {
      return jsonResponse({ error: 'No recipe content found.' }, 400);
    }

    // Call Claude
    const html = await formatWithClaude(recipeContent, env.ANTHROPIC_API_KEY);
    return jsonResponse({ html });
  } catch (err) {
    console.error('format-recipe error:', err);
    return jsonResponse({ error: err.message || 'Internal error' }, 500);
  }
}

// ---------------------------------------------------------------------------
// Fetch & clean recipe page
// ---------------------------------------------------------------------------

async function fetchAndClean(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe page (HTTP ${response.status}).`);
  }

  const html = await response.text();

  // Try to extract JSON-LD recipe data first (many recipe sites include this)
  const jsonLd = extractJsonLdRecipe(html);
  if (jsonLd) {
    return 'Structured recipe data (JSON-LD):\n' + JSON.stringify(jsonLd, null, 2);
  }

  // Fall back to cleaned HTML text
  return cleanHTML(html);
}

function extractJsonLdRecipe(html) {
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      let data = JSON.parse(match[1]);
      // Handle @graph wrapper
      if (data['@graph']) {
        data = data['@graph'];
      }
      // Handle arrays
      if (Array.isArray(data)) {
        const recipe = data.find(
          (item) => item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
        );
        if (recipe) return recipe;
      }
      if (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe'))) {
        return data;
      }
    } catch {
      // ignore parse errors, try next script tag
    }
  }
  return null;
}

function cleanHTML(html) {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate to keep token usage reasonable
  if (cleaned.length > 20000) {
    cleaned = cleaned.substring(0, 20000) + '\n[Content truncated]';
  }

  return cleaned;
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function formatWithClaude(content, apiKey) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Run: npx wrangler secret put ANTHROPIC_API_KEY');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Format the following recipe into Modernist Cuisine style HTML. Choose the appropriate format (A or B) based on the recipe type.\n\nRecipe content:\n\n${content}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Claude API error (${response.status}): ${err.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  let html = data.content[0].text;

  // Strip markdown code fences if the model wrapped its output
  html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '');

  return html;
}
