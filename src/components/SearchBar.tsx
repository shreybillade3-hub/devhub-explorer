import type { FormEvent } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  recent: string[]
  onPick: (username: string) => void
}

export default function SearchBar({ value, onChange, onSubmit, recent, onPick }: Props) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <div>
      <form onSubmit={submit} role="search" className="flex gap-2">
        <input
          type="search"
          aria-label="GitHub username"
          placeholder="Search a GitHub username, e.g. gaearon"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-2 focus-visible:outline-brand-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Search
        </button>
      </form>
      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Recent:</span>
          {recent.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onPick(u)}
              className="rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {u}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
