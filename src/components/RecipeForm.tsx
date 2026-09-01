import { useState } from 'react'
import type { Ingredient, Recipe, RecipeDraft } from '../types'

interface Props {
  /** Omitted when adding; supplied when editing an existing recipe. */
  recipe?: Recipe
  onSave: (draft: RecipeDraft) => void
  onCancel: () => void
}

const blankIngredient: Ingredient = { quantity: null, unit: '', item: '' }

function initialDraft(recipe?: Recipe): RecipeDraft {
  if (recipe) {
    return {
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      tags: [...recipe.tags],
      ingredients: recipe.ingredients.map((i) => ({ ...i })),
      steps: [...recipe.steps],
    }
  }
  return {
    title: '',
    description: '',
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: [],
    ingredients: [{ ...blankIngredient }],
    steps: [''],
  }
}

export function RecipeForm({ recipe, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<RecipeDraft>(() => initialDraft(recipe))
  const [tagText, setTagText] = useState(recipe ? recipe.tags.join(', ') : '')
  const [error, setError] = useState('')

  function set<K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function setIngredient(index: number, patch: Partial<Ingredient>) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, ...patch } : ingredient,
      ),
    }))
  }

  function removeAt<T>(list: T[], index: number): T[] {
    return list.filter((_, i) => i !== index)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const title = draft.title.trim()
    // Blank rows are how the form breathes — drop them rather than complain.
    const ingredients = draft.ingredients
      .map((i) => ({ ...i, unit: i.unit.trim(), item: i.item.trim() }))
      .filter((i) => i.item !== '')
    const steps = draft.steps.map((step) => step.trim()).filter(Boolean)

    if (title === '') return setError('A recipe needs a title.')
    if (ingredients.length === 0) return setError('Add at least one ingredient.')
    if (steps.length === 0) return setError('Add at least one step.')

    const tags = tagText
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    onSave({
      ...draft,
      title,
      description: draft.description.trim(),
      servings: Math.max(1, draft.servings),
      prepMinutes: Math.max(0, draft.prepMinutes),
      cookMinutes: Math.max(0, draft.cookMinutes),
      tags: [...new Set(tags)],
      ingredients,
      steps,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <button type="button" className="link-button back" onClick={onCancel}>
        ← Cancel
      </button>
      <h1>{recipe ? 'Edit recipe' : 'New recipe'}</h1>

      <label className="field">
        <span>Title</span>
        <input
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Weeknight tomato soup"
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="One line about why this one is worth making."
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Servings</span>
          <input
            type="number"
            min={1}
            value={draft.servings}
            onChange={(e) => set('servings', Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Prep (min)</span>
          <input
            type="number"
            min={0}
            value={draft.prepMinutes}
            onChange={(e) => set('prepMinutes', Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Cook (min)</span>
          <input
            type="number"
            min={0}
            value={draft.cookMinutes}
            onChange={(e) => set('cookMinutes', Number(e.target.value))}
          />
        </label>
      </div>

      <label className="field">
        <span>Tags</span>
        <input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="dinner, vegetarian, quick"
        />
      </label>

      <fieldset className="field-group">
        <legend>Ingredients</legend>
        {draft.ingredients.map((ingredient, index) => (
          <div className="ingredient-row" key={index}>
            <input
              className="qty"
              type="number"
              step="any"
              min={0}
              placeholder="Qty"
              value={ingredient.quantity ?? ''}
              onChange={(e) =>
                setIngredient(index, {
                  quantity: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              aria-label={`Ingredient ${index + 1} quantity`}
            />
            <input
              className="unit"
              placeholder="Unit"
              value={ingredient.unit}
              onChange={(e) => setIngredient(index, { unit: e.target.value })}
              aria-label={`Ingredient ${index + 1} unit`}
            />
            <input
              className="item"
              placeholder="Ingredient"
              value={ingredient.item}
              onChange={(e) => setIngredient(index, { item: e.target.value })}
              aria-label={`Ingredient ${index + 1} name`}
            />
            <button
              type="button"
              className="row-remove"
              onClick={() => set('ingredients', removeAt(draft.ingredients, index))}
              disabled={draft.ingredients.length === 1}
              aria-label={`Remove ingredient ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-quiet"
          onClick={() => set('ingredients', [...draft.ingredients, { ...blankIngredient }])}
        >
          Add ingredient
        </button>
      </fieldset>

      <fieldset className="field-group">
        <legend>Method</legend>
        {draft.steps.map((step, index) => (
          <div className="step-row" key={index}>
            <span className="step-number">{index + 1}</span>
            <textarea
              rows={2}
              value={step}
              placeholder="What happens in this step?"
              onChange={(e) =>
                set(
                  'steps',
                  draft.steps.map((s, i) => (i === index ? e.target.value : s)),
                )
              }
              aria-label={`Step ${index + 1}`}
            />
            <button
              type="button"
              className="row-remove"
              onClick={() => set('steps', removeAt(draft.steps, index))}
              disabled={draft.steps.length === 1}
              aria-label={`Remove step ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-quiet"
          onClick={() => set('steps', [...draft.steps, ''])}
        >
          Add step
        </button>
      </fieldset>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="button button-primary">
          {recipe ? 'Save changes' : 'Add recipe'}
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
