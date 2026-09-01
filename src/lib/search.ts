import type { Recipe } from '../types'

export interface Filters {
  /** Free text, matched against title, description, tags, and ingredients. */
  query: string
  /** A recipe must carry every selected tag to match. */
  tags: string[]
  /** Upper bound on prep + cook time, in minutes. null means no limit. */
  maxMinutes: number | null
}

export const emptyFilters: Filters = { query: '', tags: [], maxMinutes: null }

export function totalMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes
}

/** Every searchable string on a recipe, lowercased. */
function haystack(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.description,
    ...recipe.tags,
    ...recipe.ingredients.map((ingredient) => ingredient.item),
  ]
    .join(' ')
    .toLowerCase()
}

/** A recipe matches when it contains every whitespace-separated term. */
export function matchesQuery(recipe: Recipe, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = haystack(recipe)
  return terms.every((term) => text.includes(term))
}

export function matchesFilters(recipe: Recipe, filters: Filters): boolean {
  if (!matchesQuery(recipe, filters.query)) return false
  if (!filters.tags.every((tag) => recipe.tags.includes(tag))) return false
  if (filters.maxMinutes !== null && totalMinutes(recipe) > filters.maxMinutes) return false
  return true
}

/** Filters and orders recipes: most recently updated first. */
export function filterRecipes(recipes: Recipe[], filters: Filters): Recipe[] {
  return recipes
    .filter((recipe) => matchesFilters(recipe, filters))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/** Every tag in use, alphabetically, for the filter bar. */
export function allTags(recipes: Recipe[]): string[] {
  const tags = new Set<string>()
  for (const recipe of recipes) {
    for (const tag of recipe.tags) tags.add(tag)
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}
