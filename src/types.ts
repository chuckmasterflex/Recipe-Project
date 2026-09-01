/** A single ingredient line. `quantity` is null for things like "salt, to taste". */
export interface Ingredient {
  /** Amount in `unit`s, for one batch at the recipe's base `servings`. */
  quantity: number | null
  /** "g", "cup", "tbsp", "clove" — empty string for countable items. */
  unit: string
  /** "yellow onion, finely diced" */
  item: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  /** The yield these ingredient quantities are written for. */
  servings: number
  prepMinutes: number
  cookMinutes: number
  tags: string[]
  ingredients: Ingredient[]
  /** Ordered instructions, one step per entry. */
  steps: string[]
  /** ISO timestamp, used for "newest first" ordering. */
  updatedAt: string
}

/** The shape the recipe form works with before an id/timestamp is assigned. */
export type RecipeDraft = Omit<Recipe, 'id' | 'updatedAt'>
