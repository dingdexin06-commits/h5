import { createHmac, timingSafeEqual } from 'node:crypto'

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function fromBase64Url(value: string): string {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function parseDurationSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value || !value.trim()) {
    return fallbackSeconds
  }

  const raw = value.trim().toLowerCase()
  if (/^\d+$/.test(raw)) {
    return Number.parseInt(raw, 10)
  }

  const match = raw.match(/^(\d+)(s|m|h|d)$/)
  if (!match) {
    return fallbackSeconds
  }

  const base = Number.parseInt(match[1], 10)
  const unit = match[2]
  if (unit === 's') return base
  if (unit === 'm') return base * 60
  if (unit === 'h') return base * 60 * 60
  return base * 60 * 60 * 24
}

export function signJwt<TPayload extends object>(
  payload: TPayload,
  secret: string,
  expiresInSeconds: number
): string {
  const now = Math.floor(Date.now() / 1000)
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    })
  )
  const unsigned = `${header}.${body}`
  const signature = sign(unsigned, secret)
  return `${unsigned}.${signature}`
}

export function verifyJwt<TPayload extends object>(
  token: string,
  secret: string
): TPayload {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('invalid token format')
  }

  const [header, body, signature] = parts
  const expected = sign(`${header}.${body}`, secret)
  const a = Buffer.from(signature, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('invalid signature')
  }

  const payload = JSON.parse(fromBase64Url(body)) as TPayload & { exp?: unknown }
  const exp = payload.exp
  if (typeof exp !== 'number') {
    throw new Error('token exp missing')
  }

  const now = Math.floor(Date.now() / 1000)
  if (exp <= now) {
    throw new Error('token expired')
  }

  return payload
}
