import { ref, computed } from 'vue'
import en from './en.js'
import sr from './sr.js'

const STORAGE_KEY = 'ap_locale'
const messages = { en, sr }

export const LOCALES = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'sr', label: 'SR', name: 'Srpski' },
]

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && messages[saved]) return saved
  } catch { /* private mode */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en'
  return nav.toLowerCase().startsWith('sr') ? 'sr' : 'en'
}

const locale = ref(initialLocale())
if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value
}

export function setLocale(id) {
  if (!messages[id]) return
  locale.value = id
  try { localStorage.setItem(STORAGE_KEY, id) } catch { /* private mode */ }
  if (typeof document !== 'undefined') document.documentElement.lang = id
}

function resolve(dict, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)
}

/** Translate a dot-path key; falls back to English, then the key itself. */
export function t(path) {
  const hit = resolve(messages[locale.value], path)
  if (hit !== undefined) return hit
  const fallback = resolve(messages.en, path)
  return fallback !== undefined ? fallback : path
}

export function useI18n() {
  return {
    locale: computed(() => locale.value),
    setLocale,
    t,
    locales: LOCALES,
  }
}
