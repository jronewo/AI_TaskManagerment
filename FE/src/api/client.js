import { authHeaders } from '../lib/authStorage'

function apiBase() {
  const env = import.meta.env.VITE_API_BASE_URL
  if (typeof env === 'string' && env.trim() !== '') {
    return env.trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) return ''
  return 'http://localhost:5283'.replace(/\/$/, '')
}

export function apiUrl(path) {
  const b = apiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return b ? `${b}${p}` : p
}

export async function safeFetch(url, options = {}) {
  try {
    const headers = authHeaders()
    options.headers = {
      ...options.headers,
      ...headers
    }
    return await fetch(url, options)
  } catch {
    throw new Error(
      'Không kết nối được máy chủ API. Hãy đảm bảo backend đang chạy.'
    )
  }
}

export async function parseBody(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    const j = JSON.parse(text)
    return j
  } catch {
    return { message: text }
  }
}
