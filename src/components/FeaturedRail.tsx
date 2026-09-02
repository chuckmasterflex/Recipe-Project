import type { CSSProperties } from 'react'
import type { Category, Recipe } from '../types'
import { slug } from '../lib/slug'

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
  function openInList(name: string) {
    const card = document.getElementById(`recipe-${slug(name)}`)
    if (!card) return
    const head = card.querySelector<HTMLButtonElement>('.rec__head')
    if (head?.getAttribute('aria-expanded') === 'false') head.click()
    card.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="rail">
      {items.map(({ recipe, category }) => (
        <button
          key={recipe.n}
          type="button"
          className="rail__card"
          style={{ '--accent': category.c } as CSSProperties}
          onClick={() => openInList(recipe.n)}
        >
          <span className="rail__cat">{category.n}</span>
          <span className="rail__name">{recipe.n}</span>
          {recipe.t?.[0] && <span className="rail__tag">{recipe.t[0]}</span>}
        </button>
      ))}
    </div>
  )
}
