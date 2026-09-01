import { useState } from 'react'
import type { Recipe } from '../types'
import { formatIngredient, scaleIngredients } from '../lib/scale'
import { totalMinutes } from '../lib/search'

interface Props {
  recipe: Recipe
  onBack: () => void
  onEdit: (recipe: Recipe) => void
  onDelete: (id: string) => void
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete }: Props) {
  const [servings, setServings] = useState(recipe.servings)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const ingredients = scaleIngredients(recipe.ingredients, recipe.servings, servings)
  const isScaled = servings !== recipe.servings

  function toggleChecked(index: number) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <article className="detail">
      <button type="button" className="link-button back" onClick={onBack}>
        ← All recipes
      </button>

      <header className="detail-header">
        <h1>{recipe.title}</h1>
        <p className="detail-description">{recipe.description}</p>
        <p className="card-meta">
          <span>{recipe.prepMinutes} min prep</span>
          <span>·</span>
          <span>{recipe.cookMinutes} min cook</span>
          <span>·</span>
          <span>{totalMinutes(recipe)} min total</span>
        </p>
        <p className="card-tags">
          {recipe.tags.map((tag) => (
            <span key={tag} className="tag tag-static">
              {tag}
            </span>
          ))}
        </p>
      </header>

      <section className="detail-section">
        <div className="section-head">
          <h2>Ingredients</h2>
          <div className="stepper" role="group" aria-label="Servings">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Fewer servings"
              disabled={servings <= 1}
            >
              −
            </button>
            <span className="stepper-value">
              {servings} {servings === 1 ? 'serving' : 'servings'}
            </span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(99, s + 1))}
              aria-label="More servings"
              disabled={servings >= 99}
            >
              +
            </button>
          </div>
        </div>

        {isScaled && (
          <p className="scaled-note">
            Scaled from {recipe.servings}. Cooking times stay roughly the same.
            <button type="button" className="link-button" onClick={() => setServings(recipe.servings)}>
              Reset
            </button>
          </p>
        )}

        <ul className="ingredient-list">
          {ingredients.map((ingredient, index) => (
            <li key={`${ingredient.item}-${index}`}>
              <label className={checked.has(index) ? 'ingredient done' : 'ingredient'}>
                <input
                  type="checkbox"
                  checked={checked.has(index)}
                  onChange={() => toggleChecked(index)}
                />
                <span>{formatIngredient(ingredient)}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>Method</h2>
        <ol className="step-list">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      <footer className="detail-actions">
        <button type="button" className="button" onClick={() => onEdit(recipe)}>
          Edit
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={() => {
            if (confirm(`Delete “${recipe.title}”? This cannot be undone.`)) onDelete(recipe.id)
          }}
        >
          Delete
        </button>
      </footer>
    </article>
  )
}
