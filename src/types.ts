export interface Category {
  /** Display label. */
  n: string
  /** Accent hex, used as the card's left border and other accent touches. */
  c: string
}

export interface Guide {
  t: string
  d: string
  /** Filename in /public — must exist there. */
  f: string
  /** Single-letter icon shown on the guide tile. */
  i: string
  c: string
}

export interface Recipe {
  /** Also used as the React key — must be unique across all recipes. */
  n: string
  /** Must be a key in RecipeData['categories']. */
  c: string
  /** Optional badges, 2-4 max. */
  t?: string[]
  /** Ingredients. Mutually exclusive with `f`. A line ending in ':' renders as a section header. */
  i?: string[]
  /** Method steps, auto-numbered. Mutually exclusive with `f`. */
  m?: string[]
  /** One-line formula, instead of i/m — used by the aiolis. Never set alongside i or m. */
  f?: string
  /** Notes, caveats, sourcing. */
  nt?: string
}

export interface RecipeData {
  categories: Record<string, Category>
  guides: Guide[]
  recipes: Recipe[]
}
