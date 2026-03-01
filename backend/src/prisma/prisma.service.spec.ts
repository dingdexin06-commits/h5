import { resolve } from 'node:path'
import { resolveDatabaseUrl } from './prisma.service'

describe('resolveDatabaseUrl', () => {
  const backendRoot = resolve(__dirname, '..', '..')

  it('uses backend prisma/dev.db when env is missing', () => {
    const expected = `file:${resolve(backendRoot, 'prisma/dev.db').replace(/\\/g, '/')}`
    expect(resolveDatabaseUrl(undefined)).toBe(expected)
  })

  it('resolves relative sqlite urls from backend root', () => {
    const expected = `file:${resolve(backendRoot, 'test-unit.db').replace(/\\/g, '/')}`
    expect(resolveDatabaseUrl('file:./test-unit.db')).toBe(expected)
  })

  it('keeps absolute sqlite urls unchanged', () => {
    const absoluteUrl = 'file:/tmp/demo.db'
    expect(resolveDatabaseUrl(absoluteUrl)).toBe(absoluteUrl)
  })

  it('keeps non-sqlite urls unchanged', () => {
    const url = 'postgresql://user:pass@localhost:5432/app'
    expect(resolveDatabaseUrl(url)).toBe(url)
  })
})
