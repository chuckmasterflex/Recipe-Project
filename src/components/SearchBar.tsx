import type { Filters } from '../lib/search'

const TIME_CAPS: Array<[label: string, minutes: number | null]> = [
  ['Any time', null],
  ['Under 30 min', 30],
  ['Under 1 hour', 60],
]

interface Props {
  filters: Filters
  tags: string[]
  resultCount: number
  onChange: (filters: Filters) => void
}

export function SearchBar({ filters, tags, resultCount, onChange }: Props) {
  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onChange({ ...filters, tags: next })
  }

  const isFiltered =
    filters.query !== '' || filters.tags.length > 0 || filters.maxMinutes !== null

  return (
    <div className="searchbar">
      <div className="searchbar-row">
        <input
          type="search"
          className="search-input"
          placeholder="Search recipes, ingredients, tags…"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          aria-label="Search recipes"
        />
        <select
          className="time-select"
          value={filters.maxMinutes ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              maxMinutes: event.target.value === '' ? null : Number(event.target.value),
            })
          }
          aria-label="Maximum total time"
        >
          {TIME_CAPS.map(([label, minutes]) => (
            <option key={label} value={minutes ?? ''}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={filters.tags.includes(tag) ? 'tag tag-on' : 'tag'}
              aria-pressed={filters.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isFiltered && (
        <p className="result-count">
          {resultCount} {resultCount === 1 ? 'recipe' : 'recipes'}
          <button type="button" className="link-button" onClick={() => onChange({ query: '', tags: [], maxMinutes: null })}>
            Clear filters
          </button>
        </p>
      )}
    </div>
  )
}
