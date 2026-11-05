import type { RepoSort } from '../types'

interface Props {
  query: string
  onQuery: (v: string) => void
  language: string
  onLanguage: (v: string) => void
  languages: string[]
  sort: RepoSort
  onSort: (v: RepoSort) => void
  favoritesOnly: boolean
  onFavoritesOnly: (v: boolean) => void
  hideForks: boolean
  onHideForks: (v: boolean) => void
}

const field =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-2 focus-visible:outline-brand-500'

export default function RepoControls(p: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        aria-label="Filter repositories"
        placeholder="Filter repositories"
        value={p.query}
        onChange={(e) => p.onQuery(e.target.value)}
        className={`${field} min-w-48 flex-1`}
      />
      <select aria-label="Language" className={field} value={p.language} onChange={(e) => p.onLanguage(e.target.value)}>
        <option value="All">All languages</option>
        {p.languages.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <select aria-label="Sort by" className={field} value={p.sort} onChange={(e) => p.onSort(e.target.value as RepoSort)}>
        <option value="updated">Recently updated</option>
        <option value="stars">Most stars</option>
        <option value="name">Name</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={p.favoritesOnly} onChange={(e) => p.onFavoritesOnly(e.target.checked)} />
        Favorites only
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={p.hideForks} onChange={(e) => p.onHideForks(e.target.checked)} />
        Hide forks
      </label>
    </div>
  )
}
