import type { Recipe } from '../types'
import { seedRecipes } from '../data/seed'

const STORAGE_KEY = 'recipe-project:recipes:v1'

/** True for anything that still looks like a Recipe after a round-trip through JSON. */
function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Partial<Recipe>
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.servings === 'number' &&
    Array.isArray(r.ingredients) &&
    Array.isArray(r.steps) &&
    Array.isArray(r.tags)
  )
}

/**
 * Reads the saved recipes, falling back to the seed set on a first run or if
 * the stored value is missing, unreadable, or corrupt.
 */
export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return seedRecipes
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedRecipes
    const recipes = parsed.filter(isRecipe)
    // An empty box the user emptied on purpose is legitimate; a corrupt one is not.
    return recipes.length > 0 || parsed.length === 0 ? recipes : seedRecipes
  } catch {
    return seedRecipes
  }
}

/** Persists the whole collection. Storage being unavailable is not fatal to the session. */
export function saveRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  } catch {
    // Private-browsing or quota errors: the app keeps working in memory.
  }
}

/** Restores the starter recipes, discarding anything saved. */
export function resetToSeed(): Recipe[] {
  saveRecipes(seedRecipes)
  return seedRecipes
}
