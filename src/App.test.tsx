import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const user = {
  login: 'octocat',
  name: 'The Octocat',
  avatar_url: 'https://example.com/a.png',
  html_url: 'https://github.com/octocat',
  bio: 'Test bio',
  location: 'Internet',
  public_repos: 2,
  followers: 10,
  following: 1,
}
const repos = [
  { id: 1, name: 'hello-world', html_url: 'https://github.com/octocat/hello-world', description: 'First repo', language: 'JavaScript', stargazers_count: 9, forks_count: 2, updated_at: '2026-03-01T00:00:00Z', fork: false },
  { id: 2, name: 'spoon-knife', html_url: 'https://github.com/octocat/spoon-knife', description: 'Forked', language: 'CSS', stargazers_count: 3, forks_count: 1, updated_at: '2026-02-01T00:00:00Z', fork: true },
]

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

function mockFetch(userStatus = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)
    if (url.includes('/repos')) return new Response(JSON.stringify(repos), { status: 200 })
    return new Response(JSON.stringify(userStatus === 200 ? user : {}), { status: userStatus })
  })
}

describe('App', () => {
  it('shows the empty prompt initially', () => {
    renderApp()
    expect(screen.getByText(/type a username/i)).toBeInTheDocument()
  })

  it('loads a profile and its repositories on submit', async () => {
    mockFetch()
    renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: /github username/i }), 'octocat')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByText('The Octocat')).toBeInTheDocument()
    expect(await screen.findByText('hello-world')).toBeInTheDocument()
    expect(screen.getByText('spoon-knife')).toBeInTheDocument()
  })

  it('filters repositories and hides forks', async () => {
    mockFetch()
    renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: /github username/i }), 'octocat')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByText('hello-world')
    await userEvent.click(screen.getByLabelText('Hide forks'))
    expect(screen.queryByText('spoon-knife')).not.toBeInTheDocument()
  })

  it('stores favorites in localStorage', async () => {
    mockFetch()
    renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: /github username/i }), 'octocat')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await userEvent.click(await screen.findByRole('button', { name: /add hello-world to favorites/i }))
    expect(JSON.parse(localStorage.getItem('favorite-repos')!)).toEqual([1])
  })

  it('paginates long repository lists with Show more', async () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ ...repos[0], id: 100 + i, name: `repo-${i}` }))
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
      String(input).includes('/repos')
        ? new Response(JSON.stringify(many), { status: 200 })
        : new Response(JSON.stringify(user), { status: 200 }),
    )
    renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: /github username/i }), 'octocat')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByText('repo-0')
    expect(screen.queryByText('repo-14')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /show more/i }))
    expect(screen.getByText('repo-14')).toBeInTheDocument()
  })

  it('shows an error for an unknown user', async () => {
    mockFetch(404)
    renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: /github username/i }), 'ghost')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no github user/i))
  })
})
