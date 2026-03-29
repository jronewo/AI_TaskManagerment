function apiBase() {
  const env = import.meta.env.VITE_API_BASE_URL
  if (typeof env === 'string' && env.trim() !== '') {
    return env.trim().replace(/\/$/, '')
  }
  // Dev: gọi cùng origin → Vite proxy chuyển /api sang backend (tránh Failed to fetch / CORS).
  if (import.meta.env.DEV) return ''
  // Build production: cần set VITE_API_BASE_URL khi deploy; fallback cho preview local.
  return 'http://localhost:5283'.replace(/\/$/, '')
}

function apiUrl(path) {
  const b = apiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return b ? `${b}${p}` : p
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error(
      'Không kết nối được máy chủ API. Hãy chạy backend (ví dụ: `dotnet run --launch-profile http` trong AI_ManagermentAPI) và đảm bảo API lắng nghe đúng cổng (mặc định 5283).'
    )
  }
}

async function parseBody(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    const j = JSON.parse(text)
    if (typeof j === 'string') return { message: j }
    return j
  } catch {
    return { message: text }
  }
}

/**
 * @returns {Promise<{ message: string, token: string, role: string }>}
 */
export async function loginApi(email, password) {
  const res = await safeFetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseBody(res)
  if (!res.ok) {
    const msg =
      data.message ||
      data.title ||
      (typeof data === 'string' ? data : null) ||
      'Đăng nhập thất bại.'
    throw new Error(msg)
  }
  return data
}

/**
 * @returns {Promise<{ message: string }>}
 */
/**
 * @param {string} idToken — JWT credential từ Google Identity Services
 * @returns {Promise<{ message: string, token: string, role: string }>}
 */
export async function googleLoginApi(idToken) {
  const res = await safeFetch(apiUrl('/api/auth/google'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: idToken }),
  })
  const data = await parseBody(res)
  if (!res.ok) {
    const msg =
      data.message ||
      data.title ||
      (typeof data === 'string' ? data : null) ||
      'Đăng nhập Google thất bại.'
    throw new Error(msg)
  }
  return data
}

export async function registerApi(name, email, password) {
  const res = await safeFetch(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await parseBody(res)
  if (!res.ok) {
    const msg =
      data.message ||
      data.title ||
      data.detail ||
      (typeof data === 'string' ? data : null) ||
      'Đăng ký thất bại.'
    throw new Error(typeof msg === 'string' ? msg : 'Đăng ký thất bại.')
  }
  return data
}
