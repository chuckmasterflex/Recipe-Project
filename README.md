# Recipe Box

A browsable recipe box: search across titles, ingredients and tags, scale any
recipe to the number of servings you're actually cooking for, and add your own.

> **Status:** foundation. This is the first pass — the project is growing into a
> shared, living collection of recipes *and* guides. Expect the data model and
> storage layer to change as that takes shape.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Lint (oxlint) |
| `npm run typecheck` | Types only, no build |

## How it's laid out

```
src/
  types.ts              Recipe / Ingredient / RecipeDraft
  data/seed.ts          Starter recipes, loaded on first run
  lib/
    storage.ts          localStorage persistence, with corrupt-data fallback
    search.ts           Text, tag and time filtering
    scale.ts            Serving scaling + fraction-friendly formatting
  hooks/useRecipes.ts   The collection: add / update / delete, auto-saved
  components/           SearchBar, RecipeList, RecipeDetail, RecipeForm
```

The logic that's worth trusting — scaling and search — lives in plain functions
under `src/lib/` and is covered by unit tests. Components stay thin on top.

## What works today

- **Search** across title, description, tags and ingredient names; every term
  must match. Combines with tag filters (AND) and a total-time cap.
- **Serving scaling** with quantities that read like a recipe: `1½ cup flour`,
  not `1.5000000000000002 cup flour`. Ingredients without a quantity ("salt, to
  taste") pass through untouched.
- **Add, edit and delete** recipes, with blank ingredient and step rows dropped
  on save rather than rejected.
- **Ingredient check-off** while you cook.
- **Persistence** in the browser via `localStorage`, falling back to the starter
  recipes if nothing is saved or the stored data is unreadable.

## Known limits

Storage is per-browser, so nothing is shared between people or devices yet —
that's the main thing to solve for a collection two people are meant to use
together.
