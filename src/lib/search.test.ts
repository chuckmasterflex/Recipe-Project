import { describe, expect, it } from 'vitest'
import { allTags, filterRecipes, matchesQuery, totalMinutes } from './search'
import type { Recipe } from '../types'

function recipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'r1',
    title: 'Lemon Pasta',
    description: 'Bright and fast.',
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 15,
    tags: ['dinner', 'quick'],
    ingredients: [
      { quantity: 200, unit: 'g', item: 'spaghetti' },
      { quantity: 1, unit: '', item: 'lemon, zested' },
    ],
    steps: ['Boil.', 'Toss.'],
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('matchesQuery', () => {
  const r = recipe()

  it('matches on title, case-insensitively', () => {
    expect(matchesQuery(r, 'lemon')).toBe(true)
    expect(matchesQuery(r, 'LEMON')).toBe(true)
  })

  it('matches on ingredients and tags', () => {
    expect(matchesQuery(r, 'spaghetti')).toBe(true)
    expect(matchesQuery(r, 'quick')).toBe(true)
  })

  it('requires every term to match', () => {
    expect(matchesQuery(r, 'lemon pasta')).toBe(true)
    expect(matchesQuery(r, 'lemon beef')).toBe(false)
  })

  it('treats an empty or whitespace query as matching everything', () => {
    expect(matchesQuery(r, '')).toBe(true)
    expect(matchesQuery(r, '   ')).toBe(true)
  })
})

describe('filterRecipes', () => {
  const pasta = recipe()
  const ribs = recipe({
    id: 'r2',
    title: 'Short Ribs',
    description: 'A long braise.',
    tags: ['dinner', 'beef'],
    prepMinutes: 25,
    cookMinutes: 195,
    ingredients: [{ quantity: 2, unit: 'kg', item: 'short ribs' }],
    updatedAt: '2026-02-01T00:00:00.000Z',
  })
  const all = [pasta, ribs]

  it('requires all selected tags to be present', () => {
    expect(filterRecipes(all, { query: '', tags: ['dinner'], maxMinutes: null })).toHaveLength(2)
    expect(filterRecipes(all, { query: '', tags: ['dinner', 'quick'], maxMinutes: null })).toEqual([
      pasta,
    ])
    expect(filterRecipes(all, { query: '', tags: ['beef', 'quick'], maxMinutes: null })).toEqual([])
  })

  it('caps results by total time', () => {
    expect(filterRecipes(all, { query: '', tags: [], maxMinutes: 30 })).toEqual([pasta])
    // The cap is inclusive: a 20-minute recipe passes a 20-minute limit.
    expect(filterRecipes(all, { query: '', tags: [], maxMinutes: 20 })).toEqual([pasta])
    expect(filterRecipes(all, { query: '', tags: [], maxMinutes: 19 })).toEqual([])
  })

  it('combines query, tags, and time', () => {
    expect(filterRecipes(all, { query: 'ribs', tags: ['beef'], maxMinutes: 300 })).toEqual([ribs])
    expect(filterRecipes(all, { query: 'ribs', tags: ['quick'], maxMinutes: 300 })).toEqual([])
  })

  it('orders most recently updated first', () => {
    const result = filterRecipes(all, { query: '', tags: [], maxMinutes: null })
    expect(result.map((r) => r.id)).toEqual(['r2', 'r1'])
  })

  it('does not reorder the source array', () => {
    filterRecipes(all, { query: '', tags: [], maxMinutes: null })
    expect(all.map((r) => r.id)).toEqual(['r1', 'r2'])
  })
})

describe('helpers', () => {
  it('sums prep and cook time', () => {
    expect(totalMinutes(recipe())).toBe(20)
  })

  it('collects a sorted, de-duplicated tag list', () => {
    expect(allTags([recipe(), recipe({ id: 'r2', tags: ['beef', 'dinner'] })])).toEqual([
      'beef',
      'dinner',
      'quick',
    ])
  })
})
