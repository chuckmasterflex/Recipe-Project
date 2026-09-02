/** Turns a recipe name into a stable DOM id, shared between RecipeCard and FeaturedRail. */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
