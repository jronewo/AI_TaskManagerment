const TOKEN_KEY = 'taskgenie_token'
const ROLE_KEY = 'taskgenie_role'

export function saveSession({ token, role }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (role != null) localStorage.setItem(ROLE_KEY, role)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

export function authHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/** @returns {Record<string, unknown> | null} */
export function getJwtPayload() {
  const t = getToken()
  if (!t) return null
  try {
    const part = t.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = '='.repeat((4 - (b64.length % 4)) % 4)
    const json = atob(b64 + pad)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getDisplayName() {
  const p = getJwtPayload()
  if (!p || typeof p !== 'object') return null
  const o = /** @type {Record<string, string | undefined>} */ (p)
  return (
    o.Name ||
    o.name ||
    o.unique_name ||
    o['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    (typeof o.email === 'string' ? o.email.split('@')[0] : null) ||
    null
  )
}

export function getEmailFromToken() {
  const p = getJwtPayload()
  if (!p || typeof p !== 'object') return null
  const o = /** @type {Record<string, string | undefined>} */ (p)
  return o.email || o['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null
}
