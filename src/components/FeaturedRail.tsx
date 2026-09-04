import type { CSSProperties } from 'react'
import type { Category, Recipe } from '../types'
import { openCardInList } from '../lib/openCard'

export interface FeaturedItem {
  recipe: Recipe
  category: Category
}

/**
 * Horizontal scroller of hand-picked recipes. Tapping a tile scrolls the
 * matching card into view in the list below and opens it if it isn't
 * already — the rail is a shortcut into the same cards, not a separate
 * data source.
 */
export default function FeaturedRail({ items }: { items: FeaturedItem[] }) {
  return (
    <div className="rail">
      {items.map(({ recipe, category }) => (
        <button
          key={recipe.n}
          type="button"
          className="rail__card"
          style={{ '--accent': category.c } as CSSProperties}
          onClick={() => openCardInList(recipe.n)}
        >
          <span className="rail__cat">{category.n}</span>
          <span className="rail__name">{recipe.n}</span>
          {recipe.t?.[0] && <span className="rail__tag">{recipe.t[0]}</span>}
        </button>
      ))}
    </div>
  )
}
