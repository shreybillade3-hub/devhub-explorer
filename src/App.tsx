import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import LanguageChart from './components/LanguageChart'
import ProfileCard from './components/ProfileCard'
import RepoCard from './components/RepoCard'
import RepoControls from './components/RepoControls'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import useDebounce from './hooks/useDebounce'
import useLocalStorage from './hooks/useLocalStorage'
import useTheme from './hooks/useTheme'
import { describeError, fetchRepos, fetchUser } from './lib/github'
import { filterAndSortRepos, languageBreakdown, uniqueLanguages } from './lib/repos'
import type { RepoSort } from './types'

const PAGE_SIZE = 12

export default function App() {
  const { theme, toggle } = useTheme()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')
  const debounced = useDebounce(input.trim(), 500)
  const username = submitted || debounced

  const [recent, setRecent] = useLocalStorage<string[]>('recent-searches', [])
  const [favorites, setFavorites] = useLocalStorage<number[]>('favorite-repos', [])

  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('All')
  const [sort, setSort] = useState<RepoSort>('updated')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [hideForks, setHideForks] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const userQuery = useQuery({
    queryKey: ['user', username],
    queryFn: async ({ signal }) => {
      const user = await fetchUser(username, signal)
      setRecent((prev) => [user.login, ...prev.filter((u) => u !== user.login)].slice(0, 5))
      return user
    },
    enabled: username.length > 0,
    retry: false,
  })
  const reposQuery = useQuery({
    queryKey: ['repos', username],
    queryFn: ({ signal }) => fetchRepos(username, signal),
    enabled: userQuery.isSuccess,
    retry: false,
  })

  const repos = useMemo(() => reposQuery.data ?? [], [reposQuery.data])
  const visible = useMemo(
    () => filterAndSortRepos(repos, { query, language, sort, favoritesOnly, favorites, hideForks }),
    [repos, query, language, sort, favoritesOnly, favorites, hideForks],
  )

  const toggleFavorite = (id: number) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

  const pick = (name: string) => {
    setInput(name)
    setSubmitted(name)
  }

  const error = userQuery.error ?? reposQuery.error

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DevHub Explorer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Explore any public GitHub profile</p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>

      <SearchBar
        value={input}
        onChange={(v) => {
          setInput(v)
          setSubmitted('')
        }}
        onSubmit={() => setSubmitted(input.trim())}
        recent={recent}
        onPick={pick}
      />

      <div aria-live="polite" className="mt-5 space-y-5">
        {!username && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Type a username to see their profile and repositories.
          </p>
        )}
        {userQuery.isFetching && <p className="text-slate-500">Loading profile…</p>}
        {error && (
          <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            {describeError(error)}
          </p>
        )}

        {userQuery.data && (
          <>
            <ProfileCard user={userQuery.data} />
            {reposQuery.isFetching && <p className="text-slate-500">Loading repositories…</p>}
            {reposQuery.isSuccess && (
              <>
                <LanguageChart data={languageBreakdown(repos)} />
                <section aria-labelledby="repos-title" className="space-y-3">
                  <h2 id="repos-title" className="text-base font-semibold">
                    Repositories ({visible.length} of {repos.length}
                    {userQuery.data.public_repos > repos.length ? `, showing the ${repos.length} most recent` : ''})
                  </h2>
                  <RepoControls
                    query={query}
                    onQuery={setQuery}
                    language={language}
                    onLanguage={setLanguage}
                    languages={uniqueLanguages(repos)}
                    sort={sort}
                    onSort={setSort}
                    favoritesOnly={favoritesOnly}
                    onFavoritesOnly={setFavoritesOnly}
                    hideForks={hideForks}
                    onHideForks={setHideForks}
                  />
                  {visible.length === 0 ? (
                    <p className="py-6 text-center text-slate-500">No repositories match these filters.</p>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {visible.slice(0, limit).map((r) => (
                        <RepoCard key={r.id} repo={r} favorite={favorites.includes(r.id)} onToggleFavorite={toggleFavorite} />
                      ))}
                    </ul>
                  )}
                  {visible.length > limit && (
                    <button
                      type="button"
                      onClick={() => setLimit((l) => l + PAGE_SIZE)}
                      className="mx-auto block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Show more ({visible.length - limit} remaining)
                    </button>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
