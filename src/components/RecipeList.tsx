import type { Recipe } from '../types'
import { totalMinutes } from '../lib/search'

interface Props {
  recipes: Recipe[]
  onSelect: (recipe: Recipe) => void
}

export function RecipeList({ recipes, onSelect }: Props) {
  if (recipes.length === 0) {
    return (
      <p className="empty">
        Nothing matches yet. Try a broader search, or add a recipe of your own.
      </p>
    )
  }

  return (
    <ul className="recipe-grid">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <button type="button" className="recipe-card" onClick={() => onSelect(recipe)}>
            <h2>{recipe.title}</h2>
            <p className="card-description">{recipe.description}</p>
            <p className="card-meta">
              <span>{totalMinutes(recipe)} min</span>
              <span>·</span>
              <span>serves {recipe.servings}</span>
              <span>·</span>
              <span>{recipe.ingredients.length} ingredients</span>
            </p>
            <p className="card-tags">
              {recipe.tags.map((tag) => (
                <span key={tag} className="tag tag-static">
                  {tag}
                </span>
              ))}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}
