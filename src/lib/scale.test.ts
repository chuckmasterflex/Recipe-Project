import { describe, expect, it } from 'vitest'
import { formatIngredient, formatQuantity, scaleIngredients } from './scale'
import type { Ingredient } from '../types'

describe('formatQuantity', () => {
  it('leaves whole numbers alone', () => {
    expect(formatQuantity(3)).toBe('3')
    expect(formatQuantity(200)).toBe('200')
  })

  it('renders common fractions as glyphs', () => {
    expect(formatQuantity(0.5)).toBe('½')
    expect(formatQuantity(0.25)).toBe('¼')
    expect(formatQuantity(1.5)).toBe('1½')
    expect(formatQuantity(2.75)).toBe('2¾')
    expect(formatQuantity(1 / 3)).toBe('⅓')
  })

  it('snaps near-whole values instead of showing 1.999', () => {
    expect(formatQuantity(1.995)).toBe('2')
    expect(formatQuantity(3.005)).toBe('3')
  })

  it('rounds large amounts to whole units', () => {
    expect(formatQuantity(266.666)).toBe('267')
    expect(formatQuantity(133.33)).toBe('133')
  })

  it('keeps limited precision for awkward small amounts', () => {
    expect(formatQuantity(0.4)).toBe('0.4')
    expect(formatQuantity(12.1)).toBe('12.1')
  })

  it('snaps to the nearest cookable fraction when one is close', () => {
    // 12.34 is within a rounding error of 12⅓, and that is how a cook measures it.
    expect(formatQuantity(12.34)).toBe('12⅓')
  })

  it('treats non-positive and non-finite input as zero', () => {
    expect(formatQuantity(0)).toBe('0')
    expect(formatQuantity(-2)).toBe('0')
    expect(formatQuantity(Number.NaN)).toBe('0')
  })
})

describe('scaleIngredients', () => {
  const ingredients: Ingredient[] = [
    { quantity: 200, unit: 'g', item: 'pasta' },
    { quantity: 1, unit: '', item: 'lemon' },
    { quantity: null, unit: '', item: 'salt, to taste' },
  ]

  it('scales quantities proportionally', () => {
    const doubled = scaleIngredients(ingredients, 2, 4)
    expect(doubled[0].quantity).toBe(400)
    expect(doubled[1].quantity).toBe(2)
  })

  it('halves correctly', () => {
    expect(scaleIngredients(ingredients, 2, 1)[0].quantity).toBe(100)
  })

  it('leaves quantity-less ingredients untouched', () => {
    expect(scaleIngredients(ingredients, 2, 8)[2].quantity).toBeNull()
  })

  it('does not mutate the input', () => {
    scaleIngredients(ingredients, 2, 10)
    expect(ingredients[0].quantity).toBe(200)
  })

  it('ignores nonsensical serving counts rather than producing Infinity', () => {
    expect(scaleIngredients(ingredients, 0, 4)[0].quantity).toBe(200)
    expect(scaleIngredients(ingredients, 2, 0)[0].quantity).toBe(200)
  })
})

describe('formatIngredient', () => {
  it('joins quantity, unit, and item', () => {
    expect(formatIngredient({ quantity: 1.5, unit: 'cup', item: 'flour' })).toBe('1½ cup flour')
  })

  it('omits an empty unit', () => {
    expect(formatIngredient({ quantity: 2, unit: '', item: 'eggs' })).toBe('2 eggs')
  })

  it('omits a null quantity', () => {
    expect(formatIngredient({ quantity: null, unit: '', item: 'salt' })).toBe('salt')
  })
})
