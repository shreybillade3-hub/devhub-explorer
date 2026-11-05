import { formatDate } from '../lib/repos'
import type { Repo } from '../types'

interface Props {
  repo: Repo
  favorite: boolean
  onToggleFavorite: (id: number) => void
}

export default function RepoCard({ repo, favorite, onToggleFavorite }: Props) {
  return (
    <li className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="break-all font-semibold text-brand-600 hover:underline dark:text-brand-500"
        >
          {repo.name}
        </a>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={`${favorite ? 'Remove' : 'Add'} ${repo.name} ${favorite ? 'from' : 'to'} favorites`}
          onClick={() => onToggleFavorite(repo.id)}
          className="text-xl leading-none text-amber-500 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>
      <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{repo.description ?? 'No description.'}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        {repo.language && <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{repo.language}</span>}
        <span>★ {repo.stargazers_count}</span>
        <span>⑂ {repo.forks_count}</span>
        <span>Updated {formatDate(repo.updated_at)}</span>
      </div>
    </li>
  )
}
