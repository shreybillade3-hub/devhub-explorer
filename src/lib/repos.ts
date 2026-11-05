import type { Repo, RepoSort } from '../types'

export interface RepoFilters {
  query: string
  language: string
  sort: RepoSort
  favoritesOnly: boolean
  favorites: number[]
  hideForks: boolean
}

export function filterAndSortRepos(repos: Repo[], f: RepoFilters): Repo[] {
  const q = f.query.trim().toLowerCase()
  const result = repos.filter((r) => {
    if (f.hideForks && r.fork) return false
    if (f.language !== 'All' && r.language !== f.language) return false
    if (f.favoritesOnly && !f.favorites.includes(r.id)) return false
    if (q && !`${r.name} ${r.description ?? ''}`.toLowerCase().includes(q)) return false
    return true
  })
  return result.sort((a, b) => {
    if (f.sort === 'stars') return b.stargazers_count - a.stargazers_count
    if (f.sort === 'name') return a.name.localeCompare(b.name)
    return b.updated_at.localeCompare(a.updated_at)
  })
}

export function languageBreakdown(repos: Repo[]): { language: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const r of repos) {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language))
}

export const uniqueLanguages = (repos: Repo[]) => languageBreakdown(repos).map((l) => l.language)

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
