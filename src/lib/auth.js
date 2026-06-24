const ADMIN_EMAIL = 'mladen@agileperiodization.com'
const ADMIN_PASS  = 'AP_admin_2026!'
const TOKEN_KEY   = 'ap_admin_session'

export function login(email, password) {
  if (
    email.trim().toLowerCase() === ADMIN_EMAIL &&
    password === ADMIN_PASS
  ) {
    try { localStorage.setItem(TOKEN_KEY, JSON.stringify({ email: ADMIN_EMAIL, issuedAt: Date.now() })) } catch {}
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
