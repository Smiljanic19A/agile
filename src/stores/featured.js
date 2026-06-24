import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api.js'

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

function blankEntry(overrides = {}) {
  return {
    id: null,
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
    titleColor: '',
    descColor: '',
    accentColor: '',
    enabled: true,
    order: 1,
    ...overrides,
  }
}

function fromApi(e) {
  return blankEntry({
    id:            e.id,
    sourceItemId:  e.external_key || null,
    title:         e.title        || '',
    description:   e.description  || '',
    image:         e.image_url    || '',
    type:          e.type         || '',
    badge:         e.badge        || '',
    ctaLabel:      e.cta_label    || 'Learn more',
    ctaUrl:        e.cta_url      || '',
    layout:        e.layout       || 'overlay',
    textAlign:     e.text_align   || 'left',
    verticalAlign: e.vertical_align || 'bottom',
    titleColor:    e.title_color  || '',
    descColor:     e.desc_color   || '',
    accentColor:   e.accent_color || '',
    enabled:       e.enabled      !== false,
    order:         e.display_order || 1,
  })
}

function toApi(entry) {
  return {
    external_key:    entry.sourceItemId || null,
    title:           sanitizeHtml(entry.title),
    description:     sanitizeHtml(entry.description),
    image_url:       entry.image       || null,
    type:            entry.type        || null,
    badge:           entry.badge       || null,
    cta_label:       entry.ctaLabel    || 'Learn more',
    cta_url:         entry.ctaUrl      || null,
    layout:          entry.layout      || 'overlay',
    text_align:      entry.textAlign   || 'left',
    vertical_align:  entry.verticalAlign || 'bottom',
    title_color:     entry.titleColor  || null,
    desc_color:      entry.descColor   || null,
    accent_color:    entry.accentColor || null,
    enabled:         entry.enabled     !== false,
    display_order:   entry.order       || 1,
  }
}

import { itemUrl } from '@/stores/content.js'

function ctaForSource(source) {
  if (source === 'amazon')   return 'View on Amazon'
  if (source === 'payhip')   return 'Get it on Payhip'
  if (source === 'youtube')  return 'Watch on YouTube'
  if (source === 'skool')    return 'Open in Skool'
  if (source === 'substack') return 'Read on Substack'
  return 'Learn more'
}

export function entryFromItem(item) {
  if (!item) return blankEntry()
  return blankEntry({
    sourceItemId:  item.id,
    title:         item.title || '',
    description:   item.description || '',
    image:         item.image || '',
    type:          item.tag ? `${item.type} · ${item.tag}` : (item.type || ''),
    ctaUrl:        itemUrl(item),
    ctaLabel:      ctaForSource(item.source),
    layout:        'overlay',
    textAlign:     'left',
    verticalAlign: 'bottom',
  })
}

export const useFeaturedStore = defineStore('featured', () => {
  const entries = ref([])
  const loading = ref(false)

  const activeEntries = computed(() =>
    [...entries.value]
      .filter(e => e.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  const byId = computed(() => (id) => entries.value.find(e => String(e.id) === String(id)) || null)

  async function loadFromApi() {
    loading.value = true
    try {
      const data = await api.admin.featured()
      entries.value = (data || []).map(fromApi)
    } catch {
      // silently keep current state if API is unavailable
    } finally {
      loading.value = false
    }
  }

  // Public fetch — used by the public FeaturedBanner on the home page
  async function fetchPublic() {
    loading.value = true
    try {
      const data = await api.featured()
      entries.value = (data || []).map(fromApi)
    } catch {
      // keep current state
    } finally {
      loading.value = false
    }
  }

  // persist is a no-op — all writes go to the API immediately
  function persist() {}

  async function create(overrides = {}) {
    const maxOrder = entries.value.reduce((m, e) => Math.max(m, e.order || 0), 0)
    const entry = blankEntry({ order: maxOrder + 1, ...overrides })
    entry.title       = sanitizeHtml(entry.title)
    entry.description = sanitizeHtml(entry.description)
    const created = await api.admin.createFeatured(toApi(entry))
    const normalized = fromApi(created)
    entries.value.push(normalized)
    return normalized
  }

  async function update(id, patch) {
    const current = byId.value(id)
    if (!current) return null
    const merged = { ...current, ...patch }
    if ('title'       in patch) merged.title       = sanitizeHtml(merged.title)
    if ('description' in patch) merged.description = sanitizeHtml(merged.description)
    const updated = await api.admin.updateFeatured(id, toApi(merged))
    const normalized = fromApi(updated)
    const i = entries.value.findIndex(e => String(e.id) === String(id))
    if (i >= 0) entries.value[i] = normalized
    return normalized
  }

  async function remove(id) {
    await api.admin.deleteFeatured(id)
    entries.value = entries.value.filter(e => String(e.id) !== String(id))
  }

  async function toggleEnabled(id) {
    const e = byId.value(id)
    if (e) await update(id, { enabled: !e.enabled })
  }

  async function move(id, direction) {
    const sorted = [...entries.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    const i = sorted.findIndex(e => String(e.id) === String(id))
    if (i < 0) return
    const j = i + direction
    if (j < 0 || j >= sorted.length) return
    const order = sorted.map(e => e.id)
    const [item] = order.splice(i, 1)
    order.splice(j, 0, item)
    await api.admin.reorderFeatured(order)
    await loadFromApi()
  }

  async function resetToDefaults() {
    // No-op — defaults live in the DB seeder now
  }

  return {
    entries, loading, activeEntries, byId,
    loadFromApi, fetchPublic, persist,
    create, update, remove, toggleEnabled, move, resetToDefaults,
  }
})
