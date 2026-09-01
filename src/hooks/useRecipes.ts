import { useCallback, useEffect, useState } from 'react'
import type { Recipe, RecipeDraft } from '../types'
import { loadRecipes, resetToSeed, saveRecipes } from '../lib/storage'

function newId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Owns the recipe collection and keeps it in sync with local storage. */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes())

  useEffect(() => {
    saveRecipes(recipes)
  }, [recipes])

  const addRecipe = useCallback((draft: RecipeDraft): Recipe => {
    const recipe: Recipe = { ...draft, id: newId(), updatedAt: new Date().toISOString() }
    setRecipes((current) => [recipe, ...current])
    return recipe
  }, [])

  const updateRecipe = useCallback((id: string, draft: RecipeDraft) => {
    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === id ? { ...draft, id, updatedAt: new Date().toISOString() } : recipe,
      ),
    )
  }, [])

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((current) => current.filter((recipe) => recipe.id !== id))
  }, [])

  const restoreSeed = useCallback(() => {
    setRecipes(resetToSeed())
  }, [])

  return { recipes, addRecipe, updateRecipe, deleteRecipe, restoreSeed }
}
