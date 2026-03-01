const AUTH_STORAGE_KEY = 'wecom_oa_auth'

function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'))
  }
}

export function getAuthSession() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function getAuthToken() {
  const session = getAuthSession()
  const token = session?.accessToken
  return typeof token === 'string' && token.trim() ? token : ''
}

export function getAuthUser() {
  const session = getAuthSession()
  if (!session || typeof session.user !== 'object') {
    return null
  }
  return session.user
}

export function isManagerUser(user) {
  return user?.role === 'manager'
}

export function saveAuthSession(session) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  notifyAuthChanged()
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  notifyAuthChanged()
}

export async function apiFetch(url, options = {}) {
  const token = getAuthToken()
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  return fetch(url, {
    ...options,
    headers
  })
}
