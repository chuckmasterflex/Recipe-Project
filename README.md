# The Recipe Hub

68 recipes across 9 categories, plus 6 standalone deep-dive guides. Static
site, no backend, deploys to GitHub Pages.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # typecheck + production build → dist/
npm test            # unit tests (Vitest)
npm run lint         # oxlint
```

Pushing to `main` deploys automatically via `.github/workflows/deploy.yml`.

## The GitHub Pages `base` trap

Vite builds absolute asset paths. Pages serves this repo at a subpath, not
the domain root, so `base` in `vite.config.ts` must match the repo name
exactly — leading **and** trailing slash:

```ts
base: '/Recipe-Project/', // repo named Recipe-Project → https://<user>.github.io/Recipe-Project/
```

Get it wrong and the page loads blank with a 404 on every JS/CSS file —
`recipes.json` included, so the recipe list silently renders empty. If the
repo is ever renamed, update `base` in the same commit. Never hardcode this
path elsewhere — guide links use `import.meta.env.BASE_URL`, which follows
whatever `base` is set to.

## Structure

```
├── index.html            Vite entry
├── vite.config.ts        base must match the repo name — see above
├── package.json
│
├── public/                served as-is, not processed by Vite
│   ├── aioli-guide.html          ┐
│   ├── mother-sauces-guide.html  │ six standalone guides — self-contained
│   ├── one-pot-guide.html        │ HTML, own inline CSS. Deliberately NOT
│   ├── korean-beef-bowls.html    │ React components: portable, openable on
│   ├── schwans-goulash.html      │ their own. lbj-chili.html intentionally
│   └── lbj-chili.html            ┘ breaks the design system — leave it.
│
└── src/
    ├── main.tsx
    ├── App.tsx             filtering, search, layout
    ├── components/
    │   └── RecipeCard.tsx  one recipe, expand/collapse
    ├── data/
    │   ├── recipes.json    source of truth, 68 recipes
    │   └── recipes.test.ts data-integrity checks (see below)
    └── styles/
        ├── tokens.css      design tokens + shared primitives
        └── app.css         component styles
```

## Data model — `src/data/recipes.json`

```jsonc
{
  "categories": {
    "breakfast": { "n": "Breakfast", "c": "#E0A33E" } // n = label, c = accent hex
  },
  "guides": [
    { "t": "Title", "d": "One-line description",
      "f": "filename.html",  // must exist in /public
      "i": "A",              // single-letter icon
      "c": "#E0A33E" }
  ],
  "recipes": [
    {
      "n": "Recipe name",           // required — also the React key, keep unique
      "c": "breakfast",             // required — must be a key in categories
      "t": ["400°F", "12 min"],     // optional badges, 2-4 max
      "i": ["1 cup oats", "..."],   // ingredients
      "m": ["Step one.", "..."],    // method, auto-numbered
      "f": "½ cup mayo + ...",      // formula — INSTEAD OF i/m, for one-liners
      "nt": "Notes, caveats, sourcing."
    }
  ]
}
```

Two gotchas:

- **`f` vs `i`/`m`.** The 25 aiolis use `f` and render as a single
  mono-spaced block. Everything else uses `i` + `m`. Never both on one
  recipe — `RecipeCard` branches on `recipe.f` first.
- **An ingredient string ending in `:` becomes a section header**, not a
  bullet — used by Chimichurri Chicken and Rice (`"CHIMICHURRI:"`,
  `"CHICKEN & RICE:"`).

Add a category by adding its key to `categories` — the chip, count, and
accent color all derive automatically. Category order in the JSON drives
display order.

`src/data/recipes.test.ts` guards the data itself: unique recipe names
(also the React key), every category reference valid, no recipe with both
`f` and `i`/`m`, and every guide's filename resolving to a real file in
`public/`. The markdown this data grew out of had corrupted itself —
duplicate numbering, one recipe listed twice under different names —
generating from structured, tested data is what fixed that. Don't
reintroduce a hand-maintained list.

## Categories

| key | label | count |
| --- | --- | --- |
| breakfast | Breakfast | 6 |
| airfryer | Air Fryer | 12 |
| onepot | One-Pot | 10 |
| bowls | Bowls & Mains | 6 |
| snacks | Snacks & Bars | 2 |
| sauce | Sauces & Aiolis | 25 |
| sweet | Sweets | 2 |
| sides | Sides & Salads | 2 |
| microwave | Microwave / Anyday | 3 |

## Design system

```
--bg      #14100E   page
--panel   #1F1917   cards
--panel2  #2A2220   nested / inset
--line    #3D322E   borders
--cream   #F2EAE2   primary text
--dim     #A99C93   secondary text
--red     #C8452F   section labels
--gold    #E0A33E   active state, primary accent
--green   #7BA05B   positive / confirmed
```

Type: Bebas Neue (display), Inter (body), JetBrains Mono (labels, badges,
measurements — anything numeric or systematic).

Patterns: cards carry a 3px left border in their category accent (`--accent`
via inline style); badges are uppercase mono ~8.5px; section labels are
uppercase mono in `--red` with a trailing hairline rule; `+` rotates 45° to
`×` on expand; mobile-first, 680px max width.

`lbj-chili.html` intentionally breaks all of this — Playfair Display, cream
paper, printed-recipe-card styling. It's a heritage document, not a
reference card. Leave it.

## Known gaps

- **The six guide pages in `public/` are placeholders**, not the real
  content — generated from the guide metadata so links resolve instead of
  404ing. Drop the real HTML files in and they replace the placeholders,
  no code changes needed.
- **Recipe permalinks / deep linking** aren't implemented (would need
  `HashRouter`, or a `404.html` redirect shim — GH Pages doesn't do SPA
  fallback natively).
- **Guides duplicated as data.** Korean beef bowls, Schwan's goulash, and
  LBJ chili exist both as `recipes.json` entries and as full guide pages —
  intentional (card is quick reference, guide is deep dive), but it means
  the two can drift apart.
- **Search is plain substring.** No fuzzy match or highlighting.
- No print stylesheet. No scaling/serving adjuster (the guides have static
  scaling tables; could be made interactive here).
