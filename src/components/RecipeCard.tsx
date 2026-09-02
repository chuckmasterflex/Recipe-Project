import { useState, type CSSProperties } from 'react'
import type { Category, Recipe } from '../types'

/**
 * One recipe. Native <details> was used in the static build; here it's state-driven
 * so search can force-collapse. Visual output is identical.
 *
 * Two shapes of recipe body:
 *   - `f` (formula)  → aiolis and other one-liners, mono block
 *   - `i` + `m`      → ingredients list + numbered method
 * Never both.
 */
export default function RecipeCard({ recipe, category }: { recipe: Recipe; category: Category }) {
  const [open, setOpen] = useState(false)
  const accent = category.c

  return (
    <div className="rec" data-cat={recipe.c} style={{ '--accent': accent } as CSSProperties}>
      <button className="rec__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="rec__left">
          <span className="rec__name">{recipe.n}</span>
          <span className="rec__tags">
            <span className="tag">{category.n}</span>
            {(recipe.t ?? []).map((t) => (
              <span key={t} className="tag tag--accent">
                {t}
              </span>
            ))}
          </span>
        </span>
        <span className={`rec__chev${open ? ' is-open' : ''}`}>+</span>
      </button>

      {open && (
        <div className="rec__body">
          <div className="rec__rule" />

          {recipe.f ? (
            <div className="rec__formula">{recipe.f}</div>
          ) : (
            <>
              {recipe.i && (
                <>
                  <div className="rec__bh">Ingredients</div>
                  <ul>
                    {recipe.i.map((x, k) =>
                      // an ingredient ending in ':' is a section header, not an item
                      x.endsWith(':') ? (
                        <li key={k} className="rec__sub" style={{ color: accent }}>
                          {x}
                        </li>
                      ) : (
                        <li key={k}>{x}</li>
                      ),
                    )}
                  </ul>
                </>
              )}
              {recipe.m && (
                <>
                  <div className="rec__bh">Method</div>
                  <ol>
                    {recipe.m.map((x, k) => (
                      <li key={k}>{x}</li>
                    ))}
                  </ol>
                </>
              )}
            </>
          )}

          {recipe.nt && <div className="rec__note">{recipe.nt}</div>}
        </div>
      )}
    </div>
  )
}
