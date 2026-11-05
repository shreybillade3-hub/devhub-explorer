import { describe, expect, it } from 'vitest'
import type { Repo } from '../types'
import { filterAndSortRepos, languageBreakdown, type RepoFilters } from './repos'

const repo = (id: number, over: Partial<Repo> = {}): Repo => ({
  id,
  name: `repo-${id}`,
  html_url: `https://github.com/u/repo-${id}`,
  description: null,
  language: 'TypeScript',
  stargazers_count: 0,
  forks_count: 0,
  updated_at: '2026-01-01T00:00:00Z',
  fork: false,
  ...over,
})

const base: RepoFilters = { query: '', language: 'All', sort: 'updated', favoritesOnly: false, favorites: [], hideForks: false }

describe('filterAndSortRepos', () => {
  const repos = [
    repo(1, { name: 'alpha', stargazers_count: 5, updated_at: '2026-03-01T00:00:00Z', description: 'Chart library' }),
    repo(2, { name: 'beta', language: 'Python', stargazers_count: 50, updated_at: '2026-01-01T00:00:00Z', fork: true }),
    repo(3, { name: 'gamma', language: null, stargazers_count: 1, updated_at: '2026-02-01T00:00:00Z' }),
  ]

  it('sorts by recently updated, stars and name', () => {
    expect(filterAndSortRepos(repos, base).map((r) => r.id)).toEqual([1, 3, 2])
    expect(filterAndSortRepos(repos, { ...base, sort: 'stars' }).map((r) => r.id)).toEqual([2, 1, 3])
    expect(filterAndSortRepos(repos, { ...base, sort: 'name' }).map((r) => r.id)).toEqual([1, 2, 3])
  })

  it('filters by query across name and description', () => {
    expect(filterAndSortRepos(repos, { ...base, query: 'chart' }).map((r) => r.id)).toEqual([1])
  })

  it('filters by language, forks and favorites', () => {
    expect(filterAndSortRepos(repos, { ...base, language: 'Python' }).map((r) => r.id)).toEqual([2])
    expect(filterAndSortRepos(repos, { ...base, hideForks: true }).map((r) => r.id)).toEqual([1, 3])
    expect(filterAndSortRepos(repos, { ...base, favoritesOnly: true, favorites: [3] }).map((r) => r.id)).toEqual([3])
  })

  it('does not mutate the input array', () => {
    const copy = [...repos]
    filterAndSortRepos(repos, { ...base, sort: 'stars' })
    expect(repos).toEqual(copy)
  })
})

describe('languageBreakdown', () => {
  it('counts languages, ignores null and sorts by count', () => {
    const data = languageBreakdown([repo(1), repo(2), repo(3, { language: 'Go' }), repo(4, { language: null })])
    expect(data).toEqual([
      { language: 'TypeScript', count: 2 },
      { language: 'Go', count: 1 },
    ])
  })
})
