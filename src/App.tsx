import { useMemo, useState, type CSSProperties } from 'react'
import rawData from './data/recipes.json'
import RecipeCard from './components/RecipeCard'
import FeaturedRail, { type FeaturedItem } from './components/FeaturedRail'
import { useFavorites } from './lib/favorites'
import { openCardInList } from './lib/openCard'
import type { Recipe, RecipeData } from './types'
import './styles/tokens.css'
import './styles/app.css'

const FAVORITES_FILTER = 'favorites'

const data = rawData as RecipeData
const { recipes, categories, guides } = data
const CAT_KEYS = Object.keys(categories)

// A recipe carrying one of these tags is the standout in its category —
// prefer it for the rail. Falls back to the first recipe in category order.
const HIGHLIGHT_TAGS = new Set(['Top pick', 'Confirmed go-to', 'Confirmed'])

const FEATURED: FeaturedItem[] = CAT_KEYS.map((k) => {
  const inCategory = recipes.filter((r) => r.c === k)
  const pick = inCategory.find((r) => (r.t ?? []).some((t) => HIGHLIGHT_TAGS.has(t)))
  return { recipe: pick ?? inCategory[0], category: categories[k] }
})

interface IndexedRecipe extends Recipe {
  _hay: string
}

// Precompute lowercase haystacks once, not per keystroke.
const INDEXED: IndexedRecipe[] = recipes.map((r) => ({
  ...r,
  _hay: [
    r.n,
    categories[r.c].n,
    (r.t ?? []).join(' '),
    (r.i ?? []).join(' '),
    (r.m ?? []).join(' '),
    r.f ?? '',
    r.nt ?? '',
  ]
    .join(' ')
    .toLowerCase(),
}))

// Group order follows the category order in recipes.json, alphabetical within.
const ORDER = Object.fromEntries(CAT_KEYS.map((k, i) => [k, i]))
const SORTED = [...INDEXED].sort((a, b) => ORDER[a.c] - ORDER[b.c] || a.n.localeCompare(b.n))

export default function App() {
  const [cat, setCat] = useState('all')
  const [term, setTerm] = useState('')
  const { favorites, toggle: toggleFavorite } = useFavorites()

  const hits = useMemo(() => {
    const t = term.trim().toLowerCase()
    return SORTED.filter((r) => {
      const inScope =
        cat === 'all' ? true : cat === FAVORITES_FILTER ? favorites.has(r.n) : r.c === cat
      return inScope && (!t || r._hay.includes(t))
    })
  }, [cat, term, favorites])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: recipes.length, [FAVORITES_FILTER]: favorites.size }
    CAT_KEYS.forEach((k) => {
      c[k] = recipes.filter((r) => r.c === k).length
    })
    return c
  }, [favorites])

  function surpriseMe() {
    if (hits.length === 0) return
    const pick = hits[Math.floor(Math.random() * hits.length)]
    openCardInList(pick.n)
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Living Document · Master Index</div>
        <h1 className="title">
          The Recipe
          <br />
          Hub
        </h1>
        <p className="sub">
          Everything in one place. Filter by type, search by ingredient or name, tap any recipe to
          open it. Standalone deep-dive guides at the bottom.
        </p>
        <div className="stats no-print">
          <Stat
            label="Recipes"
            value={recipes.filter((r) => !['sauce', 'onepot'].includes(r.c)).length}
          />
          <Stat label="One-Pot" value={counts.onepot} />
          <Stat label="Aiolis" value={counts.sauce} />
          <Stat label="Guides" value={guides.length} />
        </div>
      </header>

      <div className="no-print">
        <div className="section-label">Chef's Picks</div>
        <FeaturedRail items={FEATURED} />
      </div>

      <div className="search-row no-print">
        <input
          className="search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search recipes, ingredients, methods…"
        />
        <button type="button" className="surprise" onClick={surpriseMe} disabled={hits.length === 0}>
          Surprise me
        </button>
      </div>

      <div className="chips no-print">
        <Chip on={cat === 'all'} onClick={() => setCat('all')} label="All" n={counts.all} />
        <Chip
          on={cat === FAVORITES_FILTER}
          onClick={() => setCat(FAVORITES_FILTER)}
          label="★ Favorites"
          n={counts[FAVORITES_FILTER]}
        />
        {CAT_KEYS.map((k) => (
          <Chip
            key={k}
            on={cat === k}
            onClick={() => setCat(k)}
            label={categories[k].n}
            n={counts[k]}
            accent={categories[k].c}
          />
        ))}
      </div>

      <div className="rcount no-print">
        {hits.length === recipes.length
          ? `${recipes.length} entries`
          : `${hits.length} of ${recipes.length} entries`}
      </div>

      <div>
        {hits.length ? (
          hits.map((r) => (
            <RecipeCard
              key={r.n}
              recipe={r}
              category={categories[r.c]}
              favorite={favorites.has(r.n)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="empty">
            Nothing matches that.
            <br />
            Try a different term or clear the filter.
          </div>
        )}
      </div>

      <div className="no-print">
        <div className="section-label">Deep-Dive Guides</div>
        {guides.map((g) => (
          // Guides live in /public as standalone HTML — plain anchors, not routes.
          // import.meta.env.BASE_URL keeps them correct under the GH Pages subpath.
          <a
            key={g.f}
            className="guide"
            href={`${import.meta.env.BASE_URL}${g.f}`}
            style={{ '--accent': g.c } as CSSProperties}
          >
            <span className="guide__icon" style={{ background: g.c }}>
              {g.i}
            </span>
            <span>
              <span className="guide__title">{g.t}</span>
              <span className="guide__desc">{g.d}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      {label}
      <b>{value}</b>
    </div>
  )
}

function Chip({
  on,
  onClick,
  label,
  n,
  accent,
}: {
  on: boolean
  onClick: () => void
  label: string
  n: number
  accent?: string
}) {
  return (
    <button
      type="button"
      className={`chip${on ? ' is-on' : ''}`}
      style={accent ? ({ '--accent': accent } as CSSProperties) : undefined}
      onClick={onClick}
    >
      {label} <span className="chip__n">{n}</span>
    </button>
  )
}
