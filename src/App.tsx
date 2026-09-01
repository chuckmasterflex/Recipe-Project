import { useMemo, useState } from 'react'
import type { Recipe, RecipeDraft } from './types'
import { useRecipes } from './hooks/useRecipes'
import { allTags, emptyFilters, filterRecipes, type Filters } from './lib/search'
import { SearchBar } from './components/SearchBar'
import { RecipeList } from './components/RecipeList'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeForm } from './components/RecipeForm'
import './App.css'

type View =
  | { name: 'list' }
  | { name: 'detail'; id: string }
  | { name: 'new' }
  | { name: 'edit'; id: string }

export default function App() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, restoreSeed } = useRecipes()
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [view, setView] = useState<View>({ name: 'list' })

  const visible = useMemo(() => filterRecipes(recipes, filters), [recipes, filters])
  const tags = useMemo(() => allTags(recipes), [recipes])

  // Read the recipe from state rather than holding a copy, so edits show up immediately.
  const active =
    view.name === 'detail' || view.name === 'edit'
      ? recipes.find((recipe) => recipe.id === view.id)
      : undefined

  // A recipe that no longer exists falls back to the list instead of a blank screen.
  const current: View =
    (view.name === 'detail' || view.name === 'edit') && !active ? { name: 'list' } : view

  function handleCreate(draft: RecipeDraft) {
    const created = addRecipe(draft)
    setView({ name: 'detail', id: created.id })
  }

  function handleUpdate(id: string, draft: RecipeDraft) {
    updateRecipe(id, draft)
    setView({ name: 'detail', id })
  }

  function handleDelete(id: string) {
    deleteRecipe(id)
    setView({ name: 'list' })
  }

  return (
    <div className="app">
      <header className="app-header">
        <button type="button" className="wordmark" onClick={() => setView({ name: 'list' })}>
          Recipe Box
        </button>
        {current.name === 'list' && (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setView({ name: 'new' })}
          >
            Add recipe
          </button>
        )}
      </header>

      <main>
        {current.name === 'list' && (
          <>
            <SearchBar
              filters={filters}
              tags={tags}
              resultCount={visible.length}
              onChange={setFilters}
            />
            <RecipeList
              recipes={visible}
              onSelect={(recipe: Recipe) => setView({ name: 'detail', id: recipe.id })}
            />
            {recipes.length === 0 && (
              <p className="empty">
                Your recipe box is empty.
                <button type="button" className="link-button" onClick={restoreSeed}>
                  Restore the starter recipes
                </button>
              </p>
            )}
          </>
        )}

        {current.name === 'detail' && active && (
          <RecipeDetail
            recipe={active}
            onBack={() => setView({ name: 'list' })}
            onEdit={(recipe) => setView({ name: 'edit', id: recipe.id })}
            onDelete={handleDelete}
          />
        )}

        {current.name === 'new' && (
          <RecipeForm onSave={handleCreate} onCancel={() => setView({ name: 'list' })} />
        )}

        {current.name === 'edit' && active && (
          <RecipeForm
            recipe={active}
            onSave={(draft) => handleUpdate(active.id, draft)}
            onCancel={() => setView({ name: 'detail', id: active.id })}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}, saved in this browser.
        </span>
      </footer>
    </div>
  )
}
