const USER_ID_KEY = 'taskgenie_user_id'
const NAME_KEY = 'taskgenie_name'
const EMAIL_KEY = 'taskgenie_email'
const ROLE_KEY = 'taskgenie_role'
const ORG_OWNER_KEY = 'taskgenie_isOrgOwner'

export function saveSession({ userId, name, email, role, isOrgOwner }) {
  if (userId) localStorage.setItem(USER_ID_KEY, userId.toString())
  if (name) localStorage.setItem(NAME_KEY, name)
  if (email) localStorage.setItem(EMAIL_KEY, email)
  if (role != null) localStorage.setItem(ROLE_KEY, role)
  if (isOrgOwner != null) localStorage.setItem(ORG_OWNER_KEY, isOrgOwner.toString())
}

export function clearSession() {
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(NAME_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(ORG_OWNER_KEY)
}

export function getUserId() {
  const id = localStorage.getItem(USER_ID_KEY)
  return id ? parseInt(id, 10) : null
}

export function getDisplayName() {
  return localStorage.getItem(NAME_KEY)
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

export function getIsOrgOwner() {
  return localStorage.getItem(ORG_OWNER_KEY) === 'true'
}

export function authHeaders() {
  const userId = getUserId()
  return userId ? { 'X-User-Id': userId.toString() } : {}
}

// Keeping these for backward compatibility if needed, but they just return from storage now
export function getJwtPayload() {
  const userId = getUserId()
  if (!userId) return null
  return {
    sub: userId.toString(),
    name: getDisplayName(),
    email: getEmail()
  }
}

export function getEmailFromToken() {
  return getEmail()
}
