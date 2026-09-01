import type { Ingredient } from '../types'

/** Denominators cooks actually measure in, largest step first. */
const FRACTIONS: Array<[numerator: number, denominator: number, glyph: string]> = [
  [1, 4, '¼'],
  [1, 3, '⅓'],
  [1, 2, '½'],
  [2, 3, '⅔'],
  [3, 4, '¾'],
]

const TOLERANCE = 0.02

/**
 * Formats a quantity the way a recipe would write it: whole numbers plain,
 * near-common fractions as glyphs ("1½"), and anything else rounded to a
 * sensible precision for its size.
 */
export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity) || quantity <= 0) return '0'

  const whole = Math.floor(quantity)
  const remainder = quantity - whole

  if (remainder < TOLERANCE) return String(whole)
  if (1 - remainder < TOLERANCE) return String(whole + 1)

  // Fraction glyphs only make sense for small, hand-measured amounts.
  if (quantity < 100) {
    for (const [numerator, denominator, glyph] of FRACTIONS) {
      if (Math.abs(remainder - numerator / denominator) < TOLERANCE) {
        return whole === 0 ? glyph : `${whole}${glyph}`
      }
    }
  }

  // Big numbers (grams, millilitres) read better rounded off entirely.
  if (quantity >= 100) return String(Math.round(quantity))
  if (quantity >= 10) return String(Math.round(quantity * 10) / 10)
  return String(Math.round(quantity * 100) / 100)
}

/** Scales one ingredient from `fromServings` to `toServings`. */
export function scaleIngredient(
  ingredient: Ingredient,
  fromServings: number,
  toServings: number,
): Ingredient {
  if (ingredient.quantity === null || fromServings <= 0 || toServings <= 0) {
    return ingredient
  }
  return {
    ...ingredient,
    quantity: (ingredient.quantity * toServings) / fromServings,
  }
}

/** Scales a full ingredient list. */
export function scaleIngredients(
  ingredients: Ingredient[],
  fromServings: number,
  toServings: number,
): Ingredient[] {
  return ingredients.map((ingredient) => scaleIngredient(ingredient, fromServings, toServings))
}

/** Renders a scaled ingredient as one line: "1½ cup flour", "salt and pepper". */
export function formatIngredient(ingredient: Ingredient): string {
  const parts: string[] = []
  if (ingredient.quantity !== null) parts.push(formatQuantity(ingredient.quantity))
  if (ingredient.unit) parts.push(ingredient.unit)
  parts.push(ingredient.item)
  return parts.join(' ')
}
