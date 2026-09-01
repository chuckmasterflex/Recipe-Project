import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  /**
   * MUST exactly match the GitHub Pages path, with a leading AND trailing
   * slash. Pages serves a project repo at /<repo-name>/, so this repo
   * (Recipe-Project) is served from https://<user>.github.io/Recipe-Project/.
   *
   * Get this wrong and Pages serves a blank page with a 404 on every asset —
   * including recipes.json, so the recipe list silently renders empty while
   * static files in public/ still resolve.
   *
   * If the repo is ever renamed, change this in the same commit. Never
   * hardcode this path anywhere else: use import.meta.env.BASE_URL, which
   * follows whatever is set here.
   */
  base: '/Recipe-Project/',
  plugins: [react()],
})
