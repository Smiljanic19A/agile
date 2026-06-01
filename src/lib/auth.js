// Dummy auth — NOT real security. Until a backend exists, anyone reading
// the bundle can see these creds. Replace before any public deploy.

const ADMIN_EMAIL = 'admin@admin.com'
const ADMIN_PASS  = 'monkey123'
const TOKEN_KEY   = 'ap_admin_token'

export function login(email, password) {
  const e = (email || '').trim().toLowerCase()
  if (e === ADMIN_EMAIL && password === ADMIN_PASS) {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({
        email: ADMIN_EMAIL,
        issuedAt: Date.now(),
      }))
    } catch {}
    return { ok: true }
  }
  return { ok: false, error: 'Invalid email or password.' }
}

export function logout() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
}

export function isAuthed() {
  try { return !!localStorage.getItem(TOKEN_KEY) } catch { return false }
}

export function currentAdmin() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
