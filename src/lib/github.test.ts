import { afterEach, describe, expect, it, vi } from 'vitest'
import { describeError, fetchUser, GitHubError } from './github'

const respond = (status: number, body: unknown = {}, headers: Record<string, string> = {}) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status, headers }))

afterEach(() => vi.restoreAllMocks())

describe('github client', () => {
  it('returns parsed JSON on success', async () => {
    respond(200, { login: 'octocat' })
    await expect(fetchUser('octocat')).resolves.toEqual({ login: 'octocat' })
  })

  it('throws a friendly error on 404', async () => {
    respond(404)
    await expect(fetchUser('nobody')).rejects.toMatchObject({ status: 404, message: expect.stringContaining('No GitHub user') })
  })

  it('exposes the rate limit reset time on 403', async () => {
    respond(403, {}, { 'x-ratelimit-reset': '1800000000' })
    const err = await fetchUser('x').catch((e: GitHubError) => e)
    expect(err).toBeInstanceOf(GitHubError)
    expect((err as GitHubError).resetAt?.getTime()).toBe(1800000000 * 1000)
    expect(describeError(err)).toMatch(/rate limit.*Try again after/)
  })

  it('encodes the username in the URL', async () => {
    const spy = respond(200, {})
    await fetchUser('a b')
    expect(spy.mock.calls[0][0]).toContain('/users/a%20b')
  })
})
