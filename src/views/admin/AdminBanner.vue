<script setup>
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AdminLayout from './AdminLayout.vue'
import { useContentStore } from '@/stores/content.js'
import { useFeaturedStore, entryFromItem } from '@/stores/featured.js'
import RichEditor from '@/components/admin/RichEditor.vue'
import AssetPicker from '@/components/admin/AssetPicker.vue'
import { youtubeId, youtubeThumb } from '@/lib/youtube.js'

const content  = useContentStore()
const featured = useFeaturedStore()

onMounted(async () => {
  await Promise.all([content.fetch(), featured.loadFromApi()])
})

const { entries } = storeToRefs(featured)

const sortedEntries = computed(() =>
  [...entries.value].sort((a, b) => (a.order || 0) - (b.order || 0))
)
const sourceItems = computed(() => content.items)

// ── Editor state ────────────────────────────────────────────
const draft = ref(null)         // null = closed (showing list)
const draftMode = ref('new')    // 'new' | 'edit'
const dirty = ref(false)

const TABS = [
  { id: 'copy',   label: 'Copy' },
  { id: 'layout', label: 'Layout & style' },
  { id: 'cta',    label: 'Links & visibility' },
]
const activeTab = ref('copy')

function startNew() {
  activeTab.value = 'copy'
  draft.value = {
    id: null,
    sourceItemId: null,
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    type: '',
    badge: '',
    ctaLabel: 'Learn more',
    ctaUrl: '',
    layout: 'overlay',
    textAlign: 'left',
    verticalAlign: 'bottom',
    showText: true,
    showCta: true,
    enabled: true,
  }
  draftMode.value = 'new'
  dirty.value = false
}

function editEntry(entry) {
  activeTab.value = 'copy'
  draft.value = { ...entry }
  draftMode.value = 'edit'
  dirty.value = false
}

function backToList() {
  if (dirty.value && !confirm('Discard unsaved changes?')) return
  draft.value = null
  dirty.value = false
}

function pickSourceItem(itemId) {
  if (!itemId) {
    if (!draft.value) return
    draft.value.sourceItemId = null
    dirty.value = true
    return
  }
  const item = content.items.find((i) => i.id === itemId)
  if (!item) return
  const seed = entryFromItem(item)
  draft.value = {
    ...draft.value,
    ...seed,
    layout: draft.value?.layout || seed.layout,
    textAlign: draft.value?.textAlign || seed.textAlign,
    verticalAlign: draft.value?.verticalAlign || seed.verticalAlign,
    badge: draft.value?.badge || seed.badge,
  }
  dirty.value = true
}

const draftVideoId = computed(() => (draft.value ? youtubeId(draft.value.videoUrl) : ''))

// Mirrors the public banner: text sits beside the video when "Show text" is on
// and there's real copy ("YouTube video" is just the auto-filled placeholder).
const previewVideoHasText = computed(() => {
  if (!draft.value || !draftVideoId.value || draft.value.showText === false) return false
  const t = stripTags(draft.value.title).trim()
  const realTitle = t && t.toLowerCase() !== 'youtube video'
  return !!(realTitle || draft.value.description || draft.value.badge || draft.value.type)
})

function save() {
  if (!draft.value) return
  if (!draft.value.title || draft.value.title.replace(/<[^>]+>/g, '').trim() === '') {
    // Video slides show no text, but the title still names the entry in this list.
    if (draftVideoId.value) draft.value.title = 'YouTube video'
    else {
      alert('Title is required.')
      return
    }
  }
  if (draftMode.value === 'new') {
    const created = featured.create({ ...draft.value, id: undefined })
    draft.value = { ...created }
    draftMode.value = 'edit'
  } else {
    const { id, ...patch } = draft.value
    featured.update(id, patch)
  }
  dirty.value = false
}

function saveAndClose() {
  save()
  if (!dirty.value) backToList()
}

function removeEntry(entry) {
  if (!confirm(`Delete "${stripTags(entry.title) || '(untitled)'}"? This cannot be undone.`)) return
  featured.remove(entry.id)
  if (draft.value?.id === entry.id) draft.value = null
}

function deleteCurrent() {
  if (!draft.value?.id) return
  removeEntry(draft.value)
}

function move(entry, direction) { featured.move(entry.id, direction) }
function toggleEnabled(entry)   { featured.toggleEnabled(entry.id) }

function resetAll() {
  if (!confirm('Reset all featured entries to defaults? This cannot be undone.')) return
  featured.resetToDefaults()
  draft.value = null
}

function stripTags(html) {
  if (!html) return ''
  return String(html).replace(/<[^>]+>/g, '')
}

function markDirty() { dirty.value = true }

// ── Inline color overrides ──────────────────────────────────
const titleStyle = computed(() => {
  if (!draft.value) return {}
  const s = {}
  if (draft.value.titleColor)  s.color = draft.value.titleColor
  if (draft.value.accentColor) s['--em-color'] = draft.value.accentColor
  return s
})
const descStyle = computed(() => {
  if (!draft.value) return {}
  const s = {}
  if (draft.value.descColor)   s.color = draft.value.descColor
  if (draft.value.accentColor) s['--em-color'] = draft.value.accentColor
  return s
})
function clearColor(key) {
  if (!draft.value) return
  draft.value[key] = ''
  markDirty()
}

// ── Source item picker ──────────────────────────────────────
const itemPickerOpen = ref(false)
const pickerCategory = ref('all')
const pickerQuery = ref('')

const pickerCategories = computed(() => {
  const cats = [...new Set(sourceItems.value.map((i) => i.category).filter(Boolean))]
  return ['all', ...cats]
})
const pickerItems = computed(() => {
  let list = sourceItems.value
  if (pickerCategory.value !== 'all') list = list.filter((i) => i.category === pickerCategory.value)
  const q = pickerQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (i) => (i.title || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q),
    )
  }
  return list
})
const linkedItem = computed(() =>
  draft.value?.sourceItemId ? sourceItems.value.find((i) => i.id === draft.value.sourceItemId) : null,
)

function openItemPicker() {
  pickerCategory.value = 'all'
  pickerQuery.value = ''
  itemPickerOpen.value = true
}
function closeItemPicker() { itemPickerOpen.value = false }

function chooseItem(item) {
  if (!draft.value) startNew() // "+ From item" in the list view starts a fresh entry
  pickSourceItem(item.id)
  closeItemPicker()
}
function unlinkItem() { pickSourceItem(null) }

// ── Asset picker ────────────────────────────────────────────
const pickerOpen = ref(false)
function openPicker() { pickerOpen.value = true }
function closePicker() { pickerOpen.value = false }
function onAssetSelected(url) {
  if (!draft.value) return
  draft.value.image = url
  markDirty()
}
function clearImage() {
  if (!draft.value) return
  draft.value.image = ''
  markDirty()
}
</script>

<template>
  <AdminLayout>
  <div class="admin">
    <!-- ═══════════════════════ LIST VIEW ═══════════════════════ -->
    <main v-if="!draft" class="admin__main">
      <section class="admin__panel">
        <header class="admin__panel-head">
          <div>
            <p class="eyebrow">Featured Banner</p>
            <h1>Entries</h1>
            <p class="admin__lead">
              Each entry is a slide on the homepage banner. Editing entries does <em>not</em> change the underlying items — entries are independent presets.
            </p>
          </div>
          <div class="admin__panel-actions">
            <button class="button button-secondary" @click="resetAll">Reset to defaults</button>
            <button class="button button-secondary" @click="openItemPicker">+ From item</button>
            <button class="button button-primary" @click="startNew">+ New entry</button>
          </div>
        </header>

        <ul v-if="sortedEntries.length" class="entry-list">
          <li v-for="entry in sortedEntries" :key="entry.id"
              class="entry"
              :class="{ 'is-off': !entry.enabled }">
            <div class="entry__thumb">
              <img v-if="entry.image" :src="entry.image" alt="" />
              <img v-else-if="youtubeId(entry.videoUrl)" :src="youtubeThumb(entry.videoUrl)" alt="" />
              <span v-else class="entry__thumb-empty">no image</span>
            </div>
            <div class="entry__body">
              <div class="entry__meta">
                <span class="dot" :class="entry.enabled ? 'on' : 'off'"></span>
                <template v-if="youtubeId(entry.videoUrl)">
                  <span>▶ video</span>
                </template>
                <template v-else>
                  <span>{{ entry.layout }}</span>
                  <span class="sep">·</span>
                  <span>align {{ entry.textAlign }}{{ entry.layout === 'overlay' ? ' / ' + entry.verticalAlign : '' }}</span>
                </template>
                <span class="sep">·</span>
                <span v-if="entry.sourceItemId">from item · <span class="entry__source-id">{{ entry.sourceItemId }}</span></span>
                <span v-else>standalone</span>
              </div>
              <h3 class="entry__title" v-html="entry.title || '(untitled)'"></h3>
              <p class="entry__desc">{{ stripTags(entry.description) || '—' }}</p>
            </div>
            <div class="entry__actions">
              <button title="Move up" @click="move(entry, -1)">↑</button>
              <button title="Move down" @click="move(entry, 1)">↓</button>
              <button @click="toggleEnabled(entry)">
                {{ entry.enabled ? 'Disable' : 'Enable' }}
              </button>
              <button @click="editEntry(entry)" class="primary">Edit</button>
              <button @click="removeEntry(entry)" class="danger">Delete</button>
            </div>
          </li>
        </ul>
        <div v-else class="empty">
          <p>No entries yet.</p>
          <button class="button button-primary" @click="startNew">+ New entry</button>
        </div>
      </section>
    </main>

    <!-- ═══════════════════════ EDITOR VIEW ═══════════════════════ -->
    <div v-else class="editor">
      <header class="editor__head">
        <button class="editor__back" @click="backToList">← Back to entries</button>
        <div class="editor__title">
          <p class="eyebrow">{{ draftMode === 'new' ? 'New entry' : 'Editing' }}</p>
          <h2 v-html="draftMode === 'edit' ? (draft.title || '(untitled)') : 'New banner entry'"></h2>
        </div>
        <div class="editor__head-actions">
          <span v-if="dirty" class="editor__dirty">● Unsaved</span>
          <button v-if="draftMode === 'edit'" class="button button-secondary danger" @click="deleteCurrent">Delete</button>
          <button class="button button-secondary" @click="save" :disabled="!dirty && draftMode === 'edit'">
            {{ draftMode === 'new' ? 'Create' : 'Save' }}
          </button>
          <button class="button button-primary" @click="saveAndClose">
            {{ draftMode === 'new' ? 'Create &amp; close' : 'Save &amp; close' }}
            <span class="arrow">→</span>
          </button>
        </div>
      </header>

      <div class="editor__body">
        <!-- ═══════ LIVE PREVIEW (sticky) ═══════ -->
        <aside class="editor__preview-col">
          <div class="editor__preview-sticky">
            <p class="eyebrow">Live preview</p>
            <div class="preview"
                 :class="[
                   'preview--' + draft.layout,
                   'preview--align-' + draft.textAlign,
                   draft.layout === 'overlay' ? 'preview--v-' + draft.verticalAlign : '',
                 ]">
              <!-- Video slide -->
              <template v-if="draftVideoId">
                <div v-if="previewVideoHasText" class="preview__video preview__video--with-text">
                  <div class="preview__body preview__body--split">
                    <div class="preview__meta" v-if="draft.badge || draft.type">
                      <span v-if="draft.badge" class="preview__badge">{{ draft.badge }}</span>
                      <span v-if="draft.type" class="preview__type">{{ draft.type }}</span>
                    </div>
                    <div class="preview__title" :style="titleStyle" v-html="draft.title"></div>
                    <div v-if="draft.description" class="preview__desc" :style="descStyle" v-html="draft.description"></div>
                    <span v-if="draft.showCta !== false && (draft.ctaUrl || draft.ctaLabel)" class="preview__cta">
                      {{ draft.ctaLabel || 'Learn more' }} →
                    </span>
                  </div>
                  <figure class="preview__media preview__media--video">
                    <img :src="youtubeThumb(draft.videoUrl)" alt="" />
                    <span class="preview__video-play preview__video-play--sm" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
                    </span>
                  </figure>
                </div>
                <div v-else class="preview__video">
                  <img class="preview__video-thumb" :src="youtubeThumb(draft.videoUrl)" alt="" />
                  <div class="preview__video-scrim"></div>
                  <span class="preview__video-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
                  </span>
                  <span class="preview__video-note">Pure video slide — write copy &amp; enable “Show text” to place it beside the video</span>
                </div>
              </template>

              <!-- Overlay -->
              <template v-else-if="draft.layout === 'overlay'">
                <div class="preview__bg" aria-hidden="true">
                  <img v-if="draft.image" :src="draft.image" alt="" />
                  <div class="preview__scrim"></div>
                </div>
                <div class="preview__body preview__body--overlay">
                  <template v-if="draft.showText !== false">
                    <div class="preview__meta">
                      <span v-if="draft.badge" class="preview__badge">{{ draft.badge }}</span>
                      <span v-if="draft.type" class="preview__type">{{ draft.type }}</span>
                    </div>
                    <div class="preview__title" :style="titleStyle" v-html="draft.title || '<span class=\'placeholder\'>(title)</span>'"></div>
                    <div v-if="draft.description" class="preview__desc" :style="descStyle" v-html="draft.description"></div>
                  </template>
                  <span v-if="draft.showCta !== false && (draft.ctaUrl || draft.ctaLabel)" class="preview__cta">
                    {{ draft.ctaLabel || 'Learn more' }} →
                  </span>
                </div>
              </template>

              <!-- Split right -->
              <template v-else-if="draft.layout === 'split-right'">
                <div class="preview__body preview__body--split">
                  <template v-if="draft.showText !== false">
                    <div class="preview__meta">
                      <span v-if="draft.badge" class="preview__badge">{{ draft.badge }}</span>
                      <span v-if="draft.type" class="preview__type">{{ draft.type }}</span>
                    </div>
                    <div class="preview__title" :style="titleStyle" v-html="draft.title || '<span class=\'placeholder\'>(title)</span>'"></div>
                    <div v-if="draft.description" class="preview__desc" :style="descStyle" v-html="draft.description"></div>
                  </template>
                  <span v-if="draft.showCta !== false && (draft.ctaUrl || draft.ctaLabel)" class="preview__cta">
                    {{ draft.ctaLabel || 'Learn more' }} →
                  </span>
                </div>
                <figure class="preview__media">
                  <img v-if="draft.image" :src="draft.image" alt="" />
                  <span v-else class="preview__media-empty">no image</span>
                </figure>
              </template>

              <!-- Split left -->
              <template v-else-if="draft.layout === 'split-left'">
                <figure class="preview__media">
                  <img v-if="draft.image" :src="draft.image" alt="" />
                  <span v-else class="preview__media-empty">no image</span>
                </figure>
                <div class="preview__body preview__body--split">
                  <template v-if="draft.showText !== false">
                    <div class="preview__meta">
                      <span v-if="draft.badge" class="preview__badge">{{ draft.badge }}</span>
                      <span v-if="draft.type" class="preview__type">{{ draft.type }}</span>
                    </div>
                    <div class="preview__title" :style="titleStyle" v-html="draft.title || '<span class=\'placeholder\'>(title)</span>'"></div>
                    <div v-if="draft.description" class="preview__desc" :style="descStyle" v-html="draft.description"></div>
                  </template>
                  <span v-if="draft.showCta !== false && (draft.ctaUrl || draft.ctaLabel)" class="preview__cta">
                    {{ draft.ctaLabel || 'Learn more' }} →
                  </span>
                </div>
              </template>
            </div>

            <div class="editor__preview-meta">
              <template v-if="draftVideoId">
                <span>▶ video</span>
              </template>
              <template v-else>
                <span>{{ draft.layout }}</span>
                <span class="sep">·</span>
                <span>align {{ draft.textAlign }}{{ draft.layout === 'overlay' ? ' / ' + draft.verticalAlign : '' }}</span>
              </template>
              <span class="sep">·</span>
              <span :class="['state', draft.enabled ? 'on' : 'off']">
                {{ draft.enabled ? 'enabled' : 'disabled' }}
              </span>
            </div>
          </div>
        </aside>

        <!-- ═══════ FORM ═══════ -->
        <section class="editor__form">
          <nav class="editor__tabs" role="tablist">
            <button v-for="tab in TABS" :key="tab.id"
                    type="button" role="tab"
                    :aria-selected="activeTab === tab.id"
                    :class="{ 'is-on': activeTab === tab.id }"
                    @click="activeTab = tab.id">
              {{ tab.label }}
            </button>
          </nav>

          <!-- ── Tab: Copy ── -->
          <div v-show="activeTab === 'copy'" class="editor__panel">
          <fieldset class="field">
            <legend>Source item (optional)</legend>
            <div v-if="draft.sourceItemId" class="src-card">
              <div class="src-card__thumb" :class="{ 'is-empty': !linkedItem?.image }">
                <img v-if="linkedItem?.image" :src="linkedItem.image" alt="" />
                <span v-else>—</span>
              </div>
              <div class="src-card__body">
                <span class="src-card__meta">{{ linkedItem ? `${linkedItem.category} · ${linkedItem.source}` : 'linked item' }}</span>
                <span class="src-card__title">{{ linkedItem?.title || draft.sourceItemId }}</span>
              </div>
              <div class="src-card__actions">
                <button type="button" class="button button-secondary button-small" @click="openItemPicker">Change</button>
                <button type="button" class="button button-ghost button-small" @click="unlinkItem">Unlink</button>
              </div>
            </div>
            <button v-else type="button" class="src-pick button button-secondary" @click="openItemPicker">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 6h13M5.5 9.5h5"/>
              </svg>
              Create from item…
            </button>
            <p class="field__hint">
              Pick an existing item and the title, description, image, type, and CTA URL auto-fill from it. Override any field below freely — the original item is never touched.
            </p>
          </fieldset>

          <fieldset class="field">
            <legend>Title <span class="req">*</span></legend>
            <RichEditor v-model="draft.title"
                        placeholder="What is Agile Periodization?"
                        min-height="64px"
                        @update:modelValue="markDirty" />
            <p class="field__hint">
              Wrap a phrase in italic for the teal accent (or use <code>&lt;em&gt;</code> in the HTML view).
            </p>
          </fieldset>

          <fieldset class="field">
            <legend>Description</legend>
            <RichEditor v-model="draft.description"
                        placeholder="Short, sharp explanation. Headings, lists, links, images and embeds all work."
                        @update:modelValue="markDirty" />
          </fieldset>

          <div class="row">
            <fieldset class="field">
              <legend>Badge label</legend>
              <input v-model="draft.badge" type="text"
                     placeholder="e.g. Start here"
                     @input="markDirty" />
            </fieldset>
            <fieldset class="field">
              <legend>Type label</legend>
              <input v-model="draft.type" type="text"
                     placeholder="e.g. Tool · Conditioning"
                     @input="markDirty" />
            </fieldset>
          </div>
          </div>

          <!-- ── Tab: Layout & style ── -->
          <div v-show="activeTab === 'layout'" class="editor__panel">
          <fieldset class="field">
            <legend>Layout preset</legend>
            <div class="seg">
              <button v-for="opt in ['overlay', 'split-right', 'split-left']" :key="opt"
                      :class="{ 'is-on': draft.layout === opt }"
                      @click="draft.layout = opt; markDirty()">
                {{ opt }}
              </button>
            </div>
            <p class="field__hint">
              <strong>overlay</strong> — image fills the slide, text overlaid.
              <strong>split-right</strong> — text left, media right.
              <strong>split-left</strong> — media left, text right.
            </p>
          </fieldset>

          <div class="row">
            <fieldset class="field">
              <legend>Text alignment</legend>
              <div class="seg">
                <button v-for="opt in ['left', 'center', 'right']" :key="opt"
                        :class="{ 'is-on': draft.textAlign === opt }"
                        @click="draft.textAlign = opt; markDirty()">{{ opt }}</button>
              </div>
            </fieldset>
            <fieldset class="field" v-if="draft.layout === 'overlay'">
              <legend>Vertical anchor</legend>
              <div class="seg">
                <button v-for="opt in ['top', 'center', 'bottom']" :key="opt"
                        :class="{ 'is-on': draft.verticalAlign === opt }"
                        @click="draft.verticalAlign = opt; markDirty()">{{ opt }}</button>
              </div>
            </fieldset>
          </div>

          <fieldset class="field">
            <legend>Text colors (optional)</legend>
            <div class="color-row">
              <div class="color-field">
                <span class="color-label">Title</span>
                <div class="color-input">
                  <input type="color"
                         :value="draft.titleColor || '#faf8f3'"
                         @input="draft.titleColor = $event.target.value; markDirty()" />
                  <input type="text"
                         class="color-hex"
                         placeholder="default"
                         :value="draft.titleColor"
                         @input="draft.titleColor = $event.target.value; markDirty()" />
                  <button type="button" class="color-clear"
                          :disabled="!draft.titleColor"
                          @click="clearColor('titleColor')" title="Use default">×</button>
                </div>
              </div>
              <div class="color-field">
                <span class="color-label">Description</span>
                <div class="color-input">
                  <input type="color"
                         :value="draft.descColor || '#dbe2df'"
                         @input="draft.descColor = $event.target.value; markDirty()" />
                  <input type="text"
                         class="color-hex"
                         placeholder="default"
                         :value="draft.descColor"
                         @input="draft.descColor = $event.target.value; markDirty()" />
                  <button type="button" class="color-clear"
                          :disabled="!draft.descColor"
                          @click="clearColor('descColor')" title="Use default">×</button>
                </div>
              </div>
              <div class="color-field">
                <span class="color-label">Accent (italic)</span>
                <div class="color-input">
                  <input type="color"
                         :value="draft.accentColor || '#c8e2dc'"
                         @input="draft.accentColor = $event.target.value; markDirty()" />
                  <input type="text"
                         class="color-hex"
                         placeholder="default"
                         :value="draft.accentColor"
                         @input="draft.accentColor = $event.target.value; markDirty()" />
                  <button type="button" class="color-clear"
                          :disabled="!draft.accentColor"
                          @click="clearColor('accentColor')" title="Use default">×</button>
                </div>
              </div>
            </div>
            <p class="field__hint">Blank fields fall back to brand defaults. The accent applies to italic emphasis inside title and description.</p>
          </fieldset>

          <fieldset class="field">
            <legend>Image</legend>
            <div class="image-row">
              <div class="image-row__thumb" :class="{ 'is-empty': !draft.image }">
                <img v-if="draft.image" :src="draft.image" alt="" />
                <span v-else>—</span>
              </div>
              <div class="image-row__main">
                <input v-model="draft.image" type="text"
                       placeholder="/assets/images/your-image.png or paste a URL"
                       @input="markDirty" />
                <div class="image-row__actions">
                  <button type="button" class="button button-secondary button-small" @click="openPicker">
                    Browse / Upload
                  </button>
                  <button type="button" class="button button-ghost button-small"
                          :disabled="!draft.image" @click="clearImage">
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <p class="field__hint">
              Type a path, click <strong>Browse / Upload</strong> to pick from the gallery, or upload a file (browser-only until backend).
            </p>
          </fieldset>

          </div>

          <AssetPicker :open="pickerOpen"
                       :current-value="draft.image"
                       @close="closePicker"
                       @selected="onAssetSelected" />

          <!-- ── Tab: Links & visibility ── -->
          <div v-show="activeTab === 'cta'" class="editor__panel">
          <fieldset class="field">
            <legend>YouTube video</legend>
            <input v-model="draft.videoUrl" type="text"
                   placeholder="https://www.youtube.com/watch?v=…"
                   @input="markDirty" />
            <p class="field__hint">
              Paste a YouTube link to turn this slide into a video slide.
              With <strong>Show text</strong> on, your title, description, badges, and CTA sit <strong>beside</strong> the video — never over it.
              Turn it off for a pure video slide.
            </p>
            <p v-if="draft.videoUrl && !draftVideoId" class="field__hint field__hint--warn">
              That doesn't look like a YouTube link — the slide will fall back to its normal layout.
            </p>
          </fieldset>

          <div class="row">
            <fieldset class="field">
              <legend>CTA label</legend>
              <input v-model="draft.ctaLabel" type="text"
                     placeholder="e.g. Watch the overview"
                     @input="markDirty" />
            </fieldset>
            <fieldset class="field">
              <legend>CTA URL</legend>
              <input v-model="draft.ctaUrl" type="text"
                     placeholder="https://…"
                     @input="markDirty" />
            </fieldset>
          </div>

          <fieldset class="field">
            <legend>Visibility</legend>
            <label class="toggle">
              <input type="checkbox" v-model="draft.showText" @change="markDirty" />
              <span>Show text — title, description, and badges</span>
            </label>
            <label class="toggle">
              <input type="checkbox" v-model="draft.showCta" @change="markDirty" />
              <span>Show the CTA button</span>
            </label>
            <p class="field__hint">
              Turn both off for a pure-image slide — the background image stands alone.
            </p>
          </fieldset>

          <fieldset class="field">
            <legend>State</legend>
            <label class="toggle">
              <input type="checkbox" v-model="draft.enabled" @change="markDirty" />
              <span>Enabled — show on the public banner</span>
            </label>
          </fieldset>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- ═══════ SOURCE ITEM PICKER ═══════ -->
  <div v-if="itemPickerOpen" class="ipicker" @click.self="closeItemPicker">
    <div class="ipicker__panel" role="dialog" aria-modal="true" aria-label="Pick a source item">
      <header class="ipicker__head">
        <div>
          <p class="eyebrow">Create from item</p>
          <h3>Pick a source item</h3>
        </div>
        <button class="ipicker__close" aria-label="Close" @click="closeItemPicker">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </header>

      <div class="ipicker__filters">
        <div class="seg">
          <button
            v-for="c in pickerCategories" :key="c" type="button"
            :class="{ 'is-on': pickerCategory === c }"
            @click="pickerCategory = c"
          >{{ c }}</button>
        </div>
        <input v-model="pickerQuery" class="ipicker__search" type="search" placeholder="Search titles…" />
      </div>

      <div class="ipicker__grid">
        <div
          v-for="item in pickerItems" :key="item.id"
          class="ipicker__card"
          :class="{ 'is-current': draft && draft.sourceItemId === item.id }"
          role="button" tabindex="0"
          @click="chooseItem(item)"
          @keydown.enter="chooseItem(item)"
        >
          <div class="ipicker__thumb">
            <img v-if="item.image" :src="item.image" alt="" loading="lazy" />
            <span v-else class="ipicker__thumb-empty">{{ item.type }}</span>
          </div>
          <div class="ipicker__body">
            <span class="ipicker__meta">{{ item.category }} · {{ item.source }}</span>
            <span class="ipicker__title">{{ item.title }}</span>
            <span v-if="item.price || item.readTime" class="ipicker__sub">{{ item.price || item.readTime }}</span>
          </div>
        </div>
        <p v-if="!pickerItems.length" class="ipicker__empty">Nothing matches — try another category or search.</p>
      </div>

      <footer class="ipicker__foot">
        Picking an item pre-fills the title, description, image, type, and CTA — you can override everything afterwards.
      </footer>
    </div>
  </div>
  </AdminLayout>
</template>

<style scoped>
.admin {
  height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--cream);
  color: var(--ink);
  overflow: hidden;
}

/* ── Top bar ─────────────────────────────────── */
.admin__topbar {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px;
  background: var(--ink);
  color: var(--paper);
  border-bottom: 1px solid rgba(247, 242, 233, 0.08);
}
.admin__topbar-left { display: inline-flex; align-items: center; gap: 14px; min-width: 0; }
.admin__brand {
  display: inline-flex; align-items: center; gap: 12px;
  color: var(--paper);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.96rem;
}
.admin__brand img { width: 26px; height: 26px; filter: brightness(0) invert(1) opacity(0.9); }
.admin__brand strong { font-weight: 600; }
.admin__crumb {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: rgba(247, 242, 233, 0.55);
  white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.admin__topbar-right { display: inline-flex; align-items: center; gap: 14px; }
.admin__user {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: rgba(247, 242, 233, 0.6);
}
.admin__topbar-btn {
  padding: 7px 12px;
  background: transparent;
  border: 1px solid rgba(247, 242, 233, 0.24);
  border-radius: 999px;
  color: var(--paper);
  font-family: var(--font-body);
  font-size: 0.86rem;
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.admin__topbar-btn:hover { border-color: var(--paper); background: rgba(247, 242, 233, 0.08); }

/* ═══════════════════════ LIST VIEW ═══════════════════════ */
.admin__main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 24px 80px;
}
.admin__main > .admin__panel {
  max-width: 1240px;
  margin: 0 auto;
}
.admin__panel {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  padding: 28px;
}
.admin__panel-head {
  display: flex; justify-content: space-between; gap: 20px;
  align-items: flex-end; flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.admin__panel-head h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 6px 0 8px; }
.admin__lead { color: var(--ink-quiet); font-size: 0.95rem; max-width: 56ch; margin: 0; }
.admin__lead em { color: var(--rust-deep); font-style: italic; }
.admin__panel-actions { display: inline-flex; gap: 10px; flex-wrap: wrap; }

.entry-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.entry {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
}
.entry:hover { border-color: var(--line-strong); box-shadow: var(--shadow-sm); }
.entry.is-off { opacity: 0.55; }

.entry__thumb {
  width: 90px; height: 70px;
  border-radius: var(--radius-sm);
  background: rgba(14, 26, 26, 0.06);
  border: 1px solid rgba(14, 26, 26, 0.1);
  overflow: hidden;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.entry__thumb img { width: 100%; height: 100%; object-fit: cover; }
.entry__thumb-empty {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--ink-quiet);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.entry__body { min-width: 0; }
.entry__meta {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-quiet);
  margin-bottom: 6px;
}
.entry__meta .sep { opacity: 0.4; }
.entry__meta .dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--rust);
  margin-right: 2px;
}
.entry__meta .dot.on { background: var(--teal); }
.entry__meta .dot.off { background: var(--rust); }
.entry__source-id {
  font-family: var(--font-mono); font-size: 0.7rem;
  background: rgba(14,26,26,0.08); color: var(--ink-soft);
  border-radius: 4px; padding: 1px 6px;
}
.entry__meta code {
  font-family: var(--font-mono);
  text-transform: none;
  letter-spacing: 0;
  background: var(--cream);
  padding: 1px 5px;
  border-radius: 3px;
}
.entry__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.08rem;
  line-height: 1.25;
  letter-spacing: -0.014em;
  color: var(--ink);
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.entry__title :deep(em) { font-style: italic; color: var(--teal-deep); font-weight: 500; }
.entry__desc {
  color: var(--ink-quiet);
  font-size: 0.9rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry__actions { display: inline-flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
.entry__actions button {
  padding: 6px 10px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.entry__actions button:hover { border-color: var(--ink); }
.entry__actions button.primary { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.entry__actions button.primary:hover { background: var(--teal); border-color: var(--teal); }
.entry__actions button.danger { color: var(--rust-deep); border-color: rgba(196, 106, 58, 0.3); }
.entry__actions button.danger:hover { background: rgba(196, 106, 58, 0.08); border-color: var(--rust); }

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-quiet);
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  display: grid; gap: 16px; justify-items: center;
}

/* ═══════════════════════ EDITOR VIEW ═══════════════════════ */
.editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor__head {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 14px 24px;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  z-index: 5;
}
.editor__back {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.editor__back:hover { background: var(--cream); border-color: var(--ink); }
.editor__title { min-width: 0; }
.editor__title .eyebrow { margin-bottom: 2px; }
.editor__title h2 {
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.editor__title h2 :deep(em) { font-style: italic; color: var(--teal-deep); font-weight: 500; }
.editor__head-actions {
  display: inline-flex; align-items: center; gap: 10px;
}
.editor__dirty {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--rust-deep);
}
.editor__head-actions .button.danger {
  color: var(--rust-deep);
  border-color: rgba(196, 106, 58, 0.4);
}
.editor__head-actions .button.danger:hover { background: rgba(196, 106, 58, 0.08); }

/* ── Editor body: 2-col, only form scrolls ─── */
.editor__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  gap: 24px;
  padding: 24px;
  max-width: 1480px;
  width: 100%;
  margin: 0 auto;
  align-items: stretch;
  overflow: hidden;
}

/* ── LEFT: live preview — locked, never scrolls ─── */
.editor__preview-col {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
}
.editor__preview-sticky {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.editor__preview-sticky .eyebrow { margin-bottom: 0; }
.editor__preview-meta {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
.editor__preview-meta .sep { opacity: 0.4; }
.editor__preview-meta .state.on { color: var(--teal-deep); }
.editor__preview-meta .state.off { color: var(--rust-deep); }

.preview {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, #1a302d 0%, var(--ink) 100%);
  color: var(--paper);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(247, 242, 233, 0.08);
}

/* Overlay layout */
.preview--overlay { flex-direction: column; }
.preview--overlay.preview--v-top    { justify-content: flex-start; }
.preview--overlay.preview--v-center { justify-content: center; }
.preview--overlay.preview--v-bottom { justify-content: flex-end; }

.preview__bg { position: absolute; inset: 0; z-index: 0; }
.preview__bg img {
  width: 100%; height: 100%; object-fit: cover; opacity: 0.45;
  filter: saturate(0.85) contrast(0.96);
}
.preview__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(17, 32, 30, 0.4) 0%, rgba(17, 32, 30, 0.85) 100%);
}

/* Split layouts */
.preview--split-right { flex-direction: row; }
.preview--split-left  { flex-direction: row; }
.preview--split-right .preview__body--split { flex: 1.1; padding: 28px; align-self: center; }
.preview--split-right .preview__media       { flex: 0.9; }
.preview--split-left  .preview__body--split { flex: 1.1; padding: 28px; align-self: center; }
.preview--split-left  .preview__media       { flex: 0.9; }

.preview__media {
  background: rgba(247, 242, 233, 0.04);
  border-left: 1px solid rgba(247, 242, 233, 0.08);
  display: grid; place-items: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}
.preview--split-left .preview__media {
  border-left: none;
  border-right: 1px solid rgba(247, 242, 233, 0.08);
}
.preview__media img {
  max-width: 100%;
  max-height: 280px;
  border-radius: var(--radius);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.45);
}
.preview__media-empty {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: rgba(247, 242, 233, 0.4);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview__body {
  position: relative;
  z-index: 1;
  padding: 36px 32px;
  display: grid;
  gap: 14px;
  align-content: end;
}
.preview__body--overlay { max-width: 640px; }

/* Alignment */
.preview--align-left   .preview__body { text-align: left; }
.preview--align-center .preview__body {
  text-align: center;
  margin-left: auto; margin-right: auto;
  justify-items: center;
}
.preview--align-right  .preview__body {
  text-align: right;
  margin-left: auto;
}
.preview--align-center .preview__title,
.preview--align-center .preview__desc { margin-left: auto; margin-right: auto; }
.preview--align-right .preview__title,
.preview--align-right .preview__desc { margin-left: auto; }

/* Meta is a flex container, so justify-content centers its children. */
.preview--align-center .preview__meta { justify-content: center; }
.preview--align-right  .preview__meta { justify-content: flex-end; }

/* CTA is a single grid child — must use justify-self for own placement. */
.preview--align-left   .preview__cta { justify-self: start; }
.preview--align-center .preview__cta { justify-self: center; }
.preview--align-right  .preview__cta { justify-self: end; }

.preview__meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.preview__badge {
  padding: 5px 11px;
  background: rgba(111, 165, 160, 0.22);
  border: 1px solid rgba(111, 165, 160, 0.35);
  border-radius: 999px;
  color: var(--accent-on-dark);
}
.preview__type { color: rgba(247, 242, 233, 0.7); }
.preview__title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.022em;
  color: var(--paper);
  max-width: 16ch;
}
.preview__title :deep(em) {
  font-style: italic; font-weight: 500;
  color: var(--em-color, var(--accent-on-dark));
}
.preview__title :deep(.placeholder) {
  color: rgba(247, 242, 233, 0.4);
  font-style: normal;
}
.preview__desc {
  font-size: 0.96rem;
  line-height: 1.55;
  color: rgba(247, 242, 233, 0.86);
  max-width: 54ch;
}
.preview__desc :deep(em) { font-style: italic; color: var(--em-color, var(--accent-on-dark)); font-weight: 500; }
.preview__desc :deep(strong) { font-weight: 700; color: inherit; }
/* The copy is full HTML now — keep rich content inside the preview frame. */
.preview__desc :deep(p) { margin: 0 0 0.6em; }
.preview__desc :deep(p:last-child) { margin-bottom: 0; }
.preview__desc :deep(a) { color: var(--em-color, var(--accent-on-dark)); text-decoration: underline; }
.preview__desc :deep(h1),
.preview__desc :deep(h2),
.preview__desc :deep(h3),
.preview__desc :deep(h4) { font-size: 1.15em; margin: 0.5em 0 0.3em; color: inherit; }
.preview__desc :deep(ul), .preview__desc :deep(ol) { margin: 0 0 0.6em; padding-left: 1.3em; }
.preview__desc :deep(img) { max-width: 100%; height: auto; border-radius: 6px; }
.preview__desc :deep(iframe) { max-width: 100%; border: none; }
.preview__desc :deep(.rte-embed iframe) { width: 100%; aspect-ratio: 16 / 9; height: auto; border-radius: 6px; }
.preview__desc :deep(table) { width: 100%; border-collapse: collapse; font-size: 0.9em; }
.preview__desc :deep(th), .preview__desc :deep(td) { border: 1px solid rgba(247, 242, 233, 0.25); padding: 4px 7px; }
.preview__title :deep(img), .preview__title :deep(iframe) { max-width: 100%; }
.preview__cta {
  display: inline-flex;
  align-items: center; gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  align-self: flex-start;
  width: fit-content;
}

/* Video slide preview */
.preview__video { position: absolute; inset: 0; z-index: 1; }
.preview__video--with-text { display: flex; align-items: stretch; }
.preview__video--with-text .preview__body--split { flex: 1; align-self: center; padding: 28px; }
.preview__media--video { flex: 1; margin: 0; }
.preview__media--video img { max-height: 240px; border-radius: var(--radius-sm); }
.preview__video-play--sm {
  width: 46px; height: 46px;
  top: 50%;
}
.preview__video-play--sm svg { margin-left: 2px; }
.preview__video-thumb {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0.75;
}
.preview__video-scrim {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.55) 90%);
}
.preview__video-play {
  position: absolute; top: 45%; left: 50%;
  transform: translate(-50%, -50%);
  width: 64px; height: 64px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: rgba(247, 242, 233, 0.92);
  color: var(--ink);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}
.preview__video-play svg { margin-left: 3px; }
.preview__video-note {
  position: absolute; bottom: 18px; left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(247, 242, 233, 0.85);
}

/* split layouts on mobile collapse */
@media (max-width: 720px) {
  .preview { min-height: 420px; }
  .preview--split-right,
  .preview--split-left { flex-direction: column; }
  .preview--split-left .preview__media,
  .preview--split-right .preview__media {
    border: none;
    border-bottom: 1px solid rgba(247, 242, 233, 0.08);
    flex: 0 0 auto;
    min-height: 180px;
  }
  .preview--split-left .preview__media { order: 0; }
  .preview__body { padding: 26px 22px; }
  .preview__title { font-size: 1.5rem; max-width: none; }
}

/* ── RIGHT: form (only thing that scrolls) ─── */
.editor__form {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: grid;
  gap: 22px;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  align-content: start;
}
/* ── Form tabs ──────────────────────────────── */
.editor__tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--cream);
}
.editor__tabs button {
  flex: 1;
  padding: 9px 12px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--ink-quiet);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.editor__tabs button:hover { color: var(--ink); }
.editor__tabs button.is-on { background: var(--ink); color: var(--paper); }

.editor__panel {
  display: grid;
  gap: 22px;
  min-width: 0;
}

.editor__form::-webkit-scrollbar { width: 10px; }
.editor__form::-webkit-scrollbar-thumb { background: rgba(17, 32, 30, 0.18); border-radius: 999px; }
.editor__form::-webkit-scrollbar-thumb:hover { background: rgba(17, 32, 30, 0.32); }
.editor__form::-webkit-scrollbar-track { background: transparent; }

/* ── Source item card + picker ──────────────── */
.src-pick { display: inline-flex; align-items: center; gap: 8px; width: fit-content; }

.src-card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--cream);
}
.src-card__thumb {
  width: 64px; height: 52px;
  border-radius: 8px;
  border: 1px solid var(--line);
  overflow: hidden;
  display: grid; place-items: center;
  background: var(--paper);
  color: var(--ink-quiet);
}
.src-card__thumb img { width: 100%; height: 100%; object-fit: cover; }
.src-card__body { display: grid; gap: 2px; min-width: 0; }
.src-card__meta {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
.src-card__title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.src-card__actions { display: inline-flex; gap: 6px; }
.src-card__actions .button { min-height: 34px; padding: 6px 12px; font-size: 0.82rem; }
.src-card__actions .button.button-ghost {
  background: transparent; border: 1px solid transparent; color: var(--ink-quiet);
}
.src-card__actions .button.button-ghost:hover {
  color: var(--rust-deep); border-color: rgba(196, 106, 58, 0.3);
}

.ipicker {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(14, 26, 26, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: center;
  padding: 24px;
}
.ipicker__panel {
  width: min(920px, 100%);
  max-height: min(82svh, 780px);
  display: flex; flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.ipicker__head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--line);
}
.ipicker__head h3 {
  font-family: var(--font-display);
  font-size: 1.3rem; font-weight: 600; letter-spacing: -0.015em;
  margin: 4px 0 0; color: var(--ink);
}
.ipicker__close {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.ipicker__close:hover { background: var(--cream); border-color: var(--ink); }

.ipicker__filters {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 14px 24px;
  border-bottom: 1px solid var(--line);
}
.ipicker__search {
  flex: 1;
  min-width: 180px;
  padding: 9px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.9rem;
}
.ipicker__search:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18);
}

.ipicker__grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: max-content;
  gap: 12px;
  padding: 18px 24px;
  align-content: start;
}
.ipicker__card {
  display: flex; flex-direction: column;
  text-align: left;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}
.ipicker__card:hover {
  border-color: var(--teal);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
.ipicker__card.is-current {
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(69, 124, 119, 0.3);
}
.ipicker__thumb {
  height: 120px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--cream), var(--paper-warm));
  display: grid; place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}
.ipicker__thumb img { width: 100%; height: 100%; object-fit: cover; }
.ipicker__thumb-empty {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
.ipicker__body { display: grid; gap: 3px; padding: 10px 12px 12px; }
.ipicker__meta {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
.ipicker__title {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ipicker__sub {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--teal-deep);
}
.ipicker__empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--ink-quiet);
  padding: 40px 0;
  margin: 0;
}
.ipicker__foot {
  padding: 12px 24px;
  border-top: 1px solid var(--line);
  font-size: 0.8rem;
  color: var(--ink-quiet);
}

@media (max-width: 720px) {
  .ipicker { padding: 10px; }
  .ipicker__grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); padding: 14px; }
  .src-card { grid-template-columns: 52px minmax(0, 1fr); }
  .src-card__actions { grid-column: 1 / -1; }
}

/* ── Image field row ────────────────────────── */
.image-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}
.image-row__thumb {
  width: 88px;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  background: linear-gradient(135deg, var(--cream), var(--paper-warm));
  overflow: hidden;
  display: grid; place-items: center;
}
.image-row__thumb img {
  width: 100%; height: 100%; object-fit: cover;
}
.image-row__thumb.is-empty {
  background: var(--cream);
  color: var(--ink-quiet);
  font-family: var(--font-mono);
  font-size: 1.1rem;
}
.image-row__main {
  display: flex; flex-direction: column; gap: 8px;
  min-width: 0;
}
.image-row__main input { width: 100%; }
.image-row__actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.image-row__actions .button { min-height: 36px; padding: 8px 14px; font-size: 0.84rem; }
.image-row__actions .button.button-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--ink-quiet);
}
.image-row__actions .button.button-ghost:hover:not(:disabled) {
  color: var(--rust-deep);
  border-color: rgba(196, 106, 58, 0.3);
}
.image-row__actions .button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Color picker rows ──────────────────────── */
.color-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 760px) { .color-row { grid-template-columns: 1fr; } }
.color-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.color-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
.color-input {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--paper);
}
.color-input input[type="color"] {
  width: 36px; height: 32px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--paper);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}
.color-input input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; border-radius: 4px; overflow: hidden; }
.color-input input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
.color-input input[type="color"]::-moz-color-swatch { border: none; border-radius: 4px; }

.color-hex {
  width: 100%;
  padding: 6px 8px;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink);
  min-width: 0;
}
.color-hex:focus { outline: none; }
.color-hex::placeholder { color: var(--ink-quiet); opacity: 0.55; }

.color-clear {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 50%;
  color: var(--ink-quiet);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.color-clear:hover:not(:disabled) {
  background: rgba(196, 106, 58, 0.1);
  border-color: rgba(196, 106, 58, 0.3);
  color: var(--rust-deep);
}
.color-clear:disabled { opacity: 0.25; cursor: default; }

.field {
  border: none;
  padding: 0;
  margin: 0;
  display: grid; gap: 8px;
  min-width: 0;
}
.field legend {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
  padding: 0;
}
.field legend .req { color: var(--rust); margin-left: 4px; }
.field input[type="text"],
.field select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.96rem;
}
.field input:focus, .field select:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18);
}
.field__hint {
  font-size: 0.82rem;
  color: var(--ink-quiet);
  margin: 0;
  line-height: 1.5;
}
.field__hint strong { color: var(--ink); font-weight: 600; }
.field__hint--warn { color: var(--rust-deep); }
.field__hint code {
  font-family: var(--font-mono);
  font-size: 0.78em;
  background: var(--cream);
  padding: 1px 5px;
  border-radius: 3px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 640px) { .row { grid-template-columns: 1fr; } }

.seg {
  display: inline-flex;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  padding: 3px;
  background: var(--cream);
  width: fit-content;
  flex-wrap: wrap;
  gap: 0;
}
.seg button {
  padding: 7px 14px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.86rem;
  color: var(--ink-quiet);
  border-radius: 999px;
  cursor: pointer;
  text-transform: capitalize;
  transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.seg button:hover { color: var(--ink); }
.seg button.is-on { background: var(--ink); color: var(--paper); }

.toggle {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--ink);
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
}
.toggle input { width: 18px; height: 18px; accent-color: var(--teal); }

@media (max-width: 1080px) {
  .editor__body {
    grid-template-columns: 1fr;
    grid-template-rows: clamp(280px, 42svh, 460px) 1fr;
  }
}

@media (max-width: 720px) {
  .admin__topbar { padding: 10px 16px; }
  .admin__crumb { display: none; }
  .editor__head {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px 16px;
  }
  .editor__head-actions { flex-wrap: wrap; gap: 8px; }
  .editor__head-actions .button { flex: 1; min-height: 40px; }
  .editor__body { padding: 14px; gap: 12px; }
  .admin__panel { padding: 20px; }
  .entry { grid-template-columns: 70px 1fr; }
  .entry__actions { grid-column: 1 / -1; justify-content: flex-start; }
  .editor__form { padding: 18px; }
}
</style>
