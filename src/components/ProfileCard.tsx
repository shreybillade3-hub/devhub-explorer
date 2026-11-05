import type { GitHubUser } from '../types'

export default function ProfileCard({ user }: { user: GitHubUser }) {
  const stats = [
    ['Repositories', user.public_repos],
    ['Followers', user.followers],
    ['Following', user.following],
  ] as const

  return (
    <section
      aria-label="Profile"
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row dark:border-slate-800 dark:bg-slate-900"
    >
      <img src={user.avatar_url} alt={`${user.login} avatar`} width={96} height={96} className="h-24 w-24 rounded-full" />
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold">{user.name ?? user.login}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          @{user.login}
          {user.location ? ` · ${user.location}` : ''}
        </p>
        <p className="mt-2 text-sm">{user.bio ?? 'No bio provided.'}</p>
        <dl className="mt-3 flex flex-wrap gap-6">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <a
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-500"
        >
          View on GitHub ↗
        </a>
      </div>
    </section>
  )
}
