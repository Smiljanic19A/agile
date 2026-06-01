import { defineStore } from 'pinia'
import { itemUrl } from '@/stores/content.js'

const STORAGE_KEY = 'ap_featured_entries_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalize) : null
  } catch { return null }
}

function saveToStorage(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch {}
}

// Allowed inline HTML tags (everything else is stripped on save).
const ALLOWED_TAGS = new Set(['EM', 'STRONG', 'B', 'I', 'BR'])

export function sanitizeHtml(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return String(html)
  const wrap = document.createElement('div')
  wrap.innerHTML = String(html)
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 1) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          while (child.firstChild) node.insertBefore(child.firstChild, child)
          node.removeChild(child)
        } else {
          for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name)
          walk(child)
        }
      } else if (child.nodeType === 8) {
        node.removeChild(child)
      }
    }
  }
  walk(wrap)
  return wrap.innerHTML.trim()
}

// Default entry shape — used for new entries and for migrations.
function blankEntry(overrides = {}) {
  return {
    id: 'fe-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    sourceItemId: null,
    title: '',
    description: '',
    image: '',
    type: '',
    badge: '',
    ctaLabel: 'Learn more',
    ctaUrl: '',
    layout: 'overlay',
    textAlign: 'left',
    verticalAlign: 'bottom',
    enabled: true,
    order: 1,
    ...overrides,
  }
}

function normalize(e) {
  return { ...blankEntry(), ...e }
}

function defaultEntries() {
  return [
    normalize({
      id: 'fe-seed-1',
      sourceItemId: 'f-overview',
      title: 'What is <em>Agile Periodization</em>?',
      description: 'Why fixed plans break, why training needs feedback loops, and how Agile Periodization turns planning into a learning system.',
      image: '/assets/images/philosophical-foundations.png',
      type: 'Video orientation',
      badge: 'Start here',
      ctaLabel: 'Watch the overview',
      ctaUrl: 'https://www.youtube.com/@mladenjovanovic',
      layout: 'split-right',
      textAlign: 'left',
      verticalAlign: 'center',
      order: 1,
    }),
    normalize({
      id: 'fe-seed-2',
      sourceItemId: 'f-endurance',
      title: 'Endurance Map <em>Builder</em>',
      description: 'Map domains, thresholds, CP/W′, MAS/vVO₂max, and conditioning decisions.',
      image: '/assets/images/endurance-map-builder.png',
      type: 'Tool · Conditioning',
      badge: 'New tool',
      ctaLabel: 'Get the tool',
      ctaUrl: 'https://payhip.com/b/DSc7p',
      layout: 'overlay',
      textAlign: 'left',
      verticalAlign: 'bottom',
      order: 2,
    }),
    normalize({
      id: 'fe-seed-3',
      sourceItemId: 'f-stm',
      title: 'Strength Training <em>Manual</em>',
      description: 'The long-form reference on programming logic, set-and-rep schemes, and progression — for coaches who want the system, not the trend.',
      image: '/assets/images/strength-training-manual.png',
      type: 'Book · Strength',
      badge: 'Paperback',
      ctaLabel: 'View on Amazon',
      ctaUrl: 'https://www.amazon.com/stores/author/B07MYX4Y13',
      layout: 'split-left',
      textAlign: 'left',
      verticalAlign: 'center',
      order: 3,
    }),
  ]
}

function ctaForSource(source) {
  if (source === 'amazon')   return 'View on Amazon'
  if (source === 'payhip')   return 'Get it on Payhip'
  if (source === 'youtube')  return 'Watch on YouTube'
  if (source === 'skool')    return 'Open in Skool'
  if (source === 'substack') return 'Read on Substack'
  return 'Learn more'
}

// Build an entry from an existing item — copies values into independent fields.
export function entryFromItem(item) {
  if (!item) return blankEntry()
  return blankEntry({
    sourceItemId: item.id,
    title: item.title || '',
    description: item.description || '',
    image: item.image || '',
    type: item.tag ? `${item.type} · ${item.tag}` : (item.type || ''),
    ctaUrl: itemUrl(item),
    ctaLabel: ctaForSource(item.source),
    layout: 'overlay',
    textAlign: 'left',
    verticalAlign: 'bottom',
  })
}

export const useFeaturedStore = defineStore('featured', {
  state: () => ({
    entries: loadFromStorage() || defaultEntries(),
  }),

  getters: {
    activeEntries: (s) =>
      [...s.entries]
        .filter((e) => e.enabled)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    byId: (s) => (id) => s.entries.find((e) => e.id === id) || null,
  },

  actions: {
    persist() { saveToStorage(this.entries) },

    create(overrides = {}) {
      const maxOrder = this.entries.reduce((m, e) => Math.max(m, e.order || 0), 0)
      const entry = blankEntry({ order: maxOrder + 1, ...overrides })
      entry.title = sanitizeHtml(entry.title)
      entry.description = sanitizeHtml(entry.description)
      this.entries.push(entry)
      this.persist()
      return entry
    },

    update(id, patch) {
      const i = this.entries.findIndex((e) => e.id === id)
      if (i < 0) return null
      const next = { ...this.entries[i], ...patch }
      if ('title' in patch)       next.title = sanitizeHtml(next.title)
      if ('description' in patch) next.description = sanitizeHtml(next.description)
      this.entries[i] = next
      this.persist()
      return next
    },

    remove(id) {
      this.entries = this.entries.filter((e) => e.id !== id)
      this.persist()
    },

    toggleEnabled(id) {
      const e = this.byId(id)
      if (!e) return
      this.update(id, { enabled: !e.enabled })
    },

    move(id, direction) {
      const sorted = [...this.entries].sort((a, b) => (a.order || 0) - (b.order || 0))
      const i = sorted.findIndex((e) => e.id === id)
      if (i < 0) return
      const j = i + direction
      if (j < 0 || j >= sorted.length) return
      const a = sorted[i]
      const b = sorted[j]
      const tmp = a.order
      this.update(a.id, { order: b.order })
      this.update(b.id, { order: tmp })
    },

    resetToDefaults() {
      this.entries = defaultEntries()
      this.persist()
    },
  },
})
