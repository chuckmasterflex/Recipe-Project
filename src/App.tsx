import { useMemo, useState } from 'react'
import rawData from './data/recipes.json'
import RecipeCard from './components/RecipeCard'
import type { Recipe, RecipeData } from './types'
import './styles/tokens.css'
import './styles/app.css'

const data = rawData as RecipeData
const { recipes, categories, guides } = data
const CAT_KEYS = Object.keys(categories)

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

  const hits = useMemo(() => {
    const t = term.trim().toLowerCase()
    return SORTED.filter((r) => (cat === 'all' || r.c === cat) && (!t || r._hay.includes(t)))
  }, [cat, term])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: recipes.length }
    CAT_KEYS.forEach((k) => {
      c[k] = recipes.filter((r) => r.c === k).length
    })
    return c
  }, [])

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
        <div className="stats">
          <Stat
            label="Recipes"
            value={recipes.filter((r) => !['sauce', 'onepot'].includes(r.c)).length}
          />
          <Stat label="One-Pot" value={counts.onepot} />
          <Stat label="Aiolis" value={counts.sauce} />
          <Stat label="Guides" value={guides.length} />
        </div>
      </header>

      <input
        className="search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search recipes, ingredients, methods…"
      />

      <div className="chips">
        <Chip on={cat === 'all'} onClick={() => setCat('all')} label="All" n={counts.all} />
        {CAT_KEYS.map((k) => (
          <Chip
            key={k}
            on={cat === k}
            onClick={() => setCat(k)}
            label={categories[k].n}
            n={counts[k]}
          />
        ))}
      </div>

      <div className="rcount">
        {hits.length === recipes.length
          ? `${recipes.length} entries`
          : `${hits.length} of ${recipes.length} entries`}
      </div>

      <div>
        {hits.length ? (
          hits.map((r) => <RecipeCard key={r.n} recipe={r} category={categories[r.c]} />)
        ) : (
          <div className="empty">
            Nothing matches that.
            <br />
            Try a different term or clear the filter.
          </div>
        )}
      </div>

      <div className="section-label">Deep-Dive Guides</div>
      {guides.map((g) => (
        // Guides live in /public as standalone HTML — plain anchors, not routes.
        // import.meta.env.BASE_URL keeps them correct under the GH Pages subpath.
        <a key={g.f} className="guide" href={`${import.meta.env.BASE_URL}${g.f}`}>
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
}: {
  on: boolean
  onClick: () => void
  label: string
  n: number
}) {
  return (
    <button className={`chip${on ? ' is-on' : ''}`} onClick={onClick}>
      {label} <span className="chip__n">{n}</span>
    </button>
  )
}
