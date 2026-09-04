import { slug } from './slug'

/** Scrolls the named recipe's card into view and opens it if it's closed. */
export function openCardInList(name: string): void {
  const card = document.getElementById(`recipe-${slug(name)}`)
  if (!card) return
  const toggle = card.querySelector<HTMLButtonElement>('.rec__toggle')
  if (toggle?.getAttribute('aria-expanded') === 'false') toggle.click()
  card.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
