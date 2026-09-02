import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import rawData from './recipes.json'
import type { RecipeData } from '../types'

const data = rawData as RecipeData

// The markdown this data replaced had corrupted itself — duplicate numbering,
// two #17s, two #18s, one recipe listed twice under different names. These
// guard the structured data against the same failure mode.

describe('recipes.json', () => {
  it('has a unique name for every recipe (also used as the React key)', () => {
    const names = data.recipes.map((r) => r.n)
    expect(new Set(names).size).toBe(names.length)
  })

  it('only references categories that exist', () => {
    const badRefs = data.recipes.filter((r) => !(r.c in data.categories))
    expect(badRefs.map((r) => r.n)).toEqual([])
  })

  it('never sets both a formula and ingredients/method on the same recipe', () => {
    const both = data.recipes.filter((r) => r.f && (r.i || r.m))
    expect(both.map((r) => r.n)).toEqual([])
  })

  it('gives every recipe a formula or at least one of ingredients/method', () => {
    const neither = data.recipes.filter((r) => !r.f && !r.i && !r.m)
    expect(neither.map((r) => r.n)).toEqual([])
  })

  it('has a matching public/ file for every guide', () => {
    const publicDir = fileURLToPath(new URL('../../public', import.meta.url))
    const missing = data.guides.filter((g) => !existsSync(`${publicDir}/${g.f}`))
    expect(missing.map((g) => g.f)).toEqual([])
  })

  it('has a unique title for every guide', () => {
    const titles = data.guides.map((g) => g.t)
    expect(new Set(titles).size).toBe(titles.length)
  })
})
