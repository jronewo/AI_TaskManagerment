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
