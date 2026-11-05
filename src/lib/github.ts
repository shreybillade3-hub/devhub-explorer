import type { GitHubUser, Repo } from '../types'

const API = 'https://api.github.com'

export class GitHubError extends Error {
  readonly status: number
  readonly resetAt?: Date

  constructor(message: string, status: number, resetAt?: Date) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
    this.resetAt = resetAt
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, { signal, headers: { Accept: 'application/vnd.github+json' } })
  if (res.ok) return (await res.json()) as T

  if (res.status === 404) throw new GitHubError('No GitHub user found with that username.', 404)
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset')
    const resetAt = reset ? new Date(Number(reset) * 1000) : undefined
    throw new GitHubError('GitHub rate limit reached for unauthenticated requests.', res.status, resetAt)
  }
  throw new GitHubError(`GitHub returned an unexpected error (${res.status}).`, res.status)
}

export const fetchUser = (username: string, signal?: AbortSignal) =>
  request<GitHubUser>(`/users/${encodeURIComponent(username)}`, signal)

export const fetchRepos = (username: string, signal?: AbortSignal) =>
  request<Repo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, signal)

export function describeError(error: unknown): string {
  if (error instanceof GitHubError && error.resetAt) {
    const time = error.resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${error.message} Try again after ${time}.`
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}
