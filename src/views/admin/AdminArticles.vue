<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import ImageField from '@/components/admin/ImageField.vue'
import { api } from '@/lib/api.js'

const articles = ref([])
const loading = ref(true)
const error = ref('')
const editing = ref(null)
const saving = ref(false)
const deleteConfirm = ref(null)
const search = ref('')
const typeFilter = ref('')
const sortBy = ref('newest')
const selected = ref([])
const bulkConfirm = ref(false)
const bulkBusy = ref(false)

const TYPES = ['Article', 'Essay', 'Field note', 'Field Notes', 'Theory', 'Conditioning', 'Tool']

const blank = () => ({
  id: null,
  title: '',
  type: 'Article',
  description: '',
  image_url: '',
  url: '',
  read_time: '',
  is_featured: false,
  display_order: 0,
  published_at: '',
})

const presentTypes = computed(() =>
  [...new Set(articles.value.map((a) => a.type).filter(Boolean))].sort(),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = articles.value
  if (typeFilter.value) list = list.filter((a) => a.type === typeFilter.value)
  if (q) {
    list = list.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.type || '').toLowerCase().includes(q),
    )
  }
  const arr = [...list]
  switch (sortBy.value) {
    case 'oldest': arr.sort((a, b) => new Date(a.published_at || 0) - new Date(b.published_at || 0)); break
    case 'title':  arr.sort((a, b) => a.title.localeCompare(b.title)); break
    case 'order':  arr.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)); break
    default:       arr.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
  }
  return arr
})

// ── Bulk selection ──────────────────────────────────────────
function toggleSelect(id) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id]
}
const allSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((a) => selected.value.includes(a.id)),
)
function toggleSelectAll() {
  selected.value = allSelected.value ? [] : filtered.value.map((a) => a.id)
}

async function bulkDelete() {
  bulkBusy.value = true
  error.value = ''
  try {
    for (const id of selected.value) await api.admin.deleteArticle(id)
    selected.value = []
    bulkConfirm.value = false
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    bulkBusy.value = false
  }
}

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    articles.value = await api.admin.articles()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openNew() { editing.value = blank() }

function openEdit(a) {
  editing.value = {
    ...a,
    published_at: a.published_at ? a.published_at.slice(0, 10) : '',
    image_url: a.image_url || '',
    read_time: a.read_time || '',
    description: a.description || '',
  }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      title:         editing.value.title,
      type:          editing.value.type,
      description:   editing.value.description || null,
      image_url:     editing.value.image_url || null,
      url:           editing.value.url,
      read_time:     editing.value.read_time || null,
      is_featured:   editing.value.is_featured,
      display_order: Number(editing.value.display_order) || 0,
      published_at:  editing.value.published_at || null,
    }
    if (editing.value.id) await api.admin.updateArticle(editing.value.id, payload)
    else await api.admin.createArticle(payload)
    editing.value = null
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteConfirm.value) return
  try {
    await api.admin.deleteArticle(deleteConfirm.value.id)
    deleteConfirm.value = null
    editing.value = null
    await load()
  } catch (e) {
    error.value = e.message
  }
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' })
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page aa">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Content</p>
          <h1 class="adm-title">Articles</h1>
          <p class="adm-sub">Everything the Writing section shows — imported from Substack or written by hand.</p>
        </div>
        <button class="adm-btn adm-btn--primary" @click="openNew">+ New article</button>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div class="aa__toolbar">
        <div class="aa__search">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <circle cx="7" cy="7" r="4.6"/><path d="M10.6 10.6L14 14"/>
          </svg>
          <input v-model="search" class="adm-input" placeholder="Search by title or type…" />
        </div>
        <select v-model="typeFilter" class="adm-input aa__select" title="Filter by type">
          <option value="">All types</option>
          <option v-for="ty in presentTypes" :key="ty" :value="ty">{{ ty }}</option>
        </select>
        <select v-model="sortBy" class="adm-input aa__select" title="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
          <option value="order">Display order</option>
        </select>
        <button
          v-if="selected.length"
          class="adm-btn adm-btn--danger adm-btn--sm"
          @click="bulkConfirm = true"
        >Delete selected ({{ selected.length }})</button>
        <span class="aa__count">{{ filtered.length }} of {{ articles.length }}</span>
      </div>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14"/></svg></span>
        Loading articles…
      </div>

      <div v-else-if="filtered.length" class="adm-table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th class="aa__th-check">
                <input type="checkbox" :checked="allSelected" title="Select all shown" @change="toggleSelectAll" />
              </th>
              <th>Title</th><th>Type</th><th>Published</th><th>Order</th><th>Featured</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in filtered" :key="a.id"
              class="aa__row"
              :class="{ 'is-selected': selected.includes(a.id) }"
              @click="openEdit(a)"
            >
              <td class="aa__td-check" @click.stop>
                <input type="checkbox" :checked="selected.includes(a.id)" @change="toggleSelect(a.id)" />
              </td>
              <td class="aa__td-title">
                <span class="aa__title-text">{{ a.title }}</span>
                <a :href="a.url" target="_blank" rel="noopener" class="aa__open" title="Open article" @click.stop>↗</a>
              </td>
              <td><span class="adm-badge adm-badge--teal">{{ a.type }}</span></td>
              <td>{{ fmtDate(a.published_at) }}</td>
              <td>
                <span v-if="a.display_order > 0" class="adm-badge adm-badge--teal">#{{ a.display_order }}</span>
                <span v-else style="opacity: 0.45">auto</span>
              </td>
              <td>
                <span v-if="a.is_featured" class="adm-badge adm-badge--ok">Featured</span>
              </td>
              <td class="aa__td-actions" @click.stop>
                <button class="adm-btn adm-btn--ghost adm-btn--sm" @click="openEdit(a)">Edit</button>
                <button class="adm-btn adm-btn--ghost adm-btn--sm aa__del" @click="deleteConfirm = a">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="adm-empty">
        <p>{{ search ? 'Nothing matches that search.' : 'No articles yet. Run a Substack import or create one by hand.' }}</p>
        <button v-if="!search" class="adm-btn adm-btn--primary" @click="openNew">+ New article</button>
      </div>
    </div>

    <!-- Editor drawer -->
    <template v-if="editing">
      <div class="adm-drawer-bg" @click="editing = null"></div>
      <aside class="adm-drawer" role="dialog" aria-modal="true">
        <header class="adm-drawer__head">
          <h2>{{ editing.id ? 'Edit article' : 'New article' }}</h2>
          <button class="adm-close" aria-label="Close" @click="editing = null">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        </header>

        <form class="adm-drawer__body" @submit.prevent="save">
          <!-- Live preview -->
          <div class="aa__preview">
            <p class="adm-label" style="margin-bottom: 8px">Live preview</p>
            <div class="aa__preview-card">
              <div class="aa__preview-media" :class="{ 'has-img': editing.image_url }">
                <img v-if="editing.image_url" :src="editing.image_url" alt="" />
                <span v-else class="aa__preview-noimg">Abstract cover is generated automatically</span>
              </div>
              <div class="aa__preview-body">
                <div class="aa__preview-meta">
                  <span class="aa__preview-chip">{{ editing.type }}</span>
                  <span v-if="editing.read_time">{{ editing.read_time }}</span>
                </div>
                <p class="aa__preview-title">{{ editing.title || 'Article title…' }}</p>
                <p v-if="editing.description" class="aa__preview-desc">{{ editing.description }}</p>
              </div>
            </div>
          </div>

          <div class="adm-field">
            <label class="adm-label">Title <span class="req">*</span></label>
            <input v-model="editing.title" required class="adm-input" placeholder="e.g. Planning with intent, adjusting without panic" />
          </div>
          <div class="adm-grid-2">
            <div class="adm-field">
              <label class="adm-label">Type</label>
              <select v-model="editing.type" class="adm-select">
                <option v-for="t in TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div class="adm-field">
              <label class="adm-label">Read time</label>
              <input v-model="editing.read_time" class="adm-input" placeholder="e.g. 12 min" />
            </div>
          </div>
          <div class="adm-field">
            <label class="adm-label">Description</label>
            <textarea v-model="editing.description" class="adm-textarea" rows="3" placeholder="Short excerpt shown on the card…"></textarea>
          </div>
          <div class="adm-field">
            <label class="adm-label">URL <span class="req">*</span></label>
            <input v-model="editing.url" required type="url" class="adm-input adm-input--mono" placeholder="https://…" />
          </div>
          <ImageField v-model="editing.image_url" label="Image" hint="Paste a URL, or browse the media library / upload." />
          <div class="adm-grid-2">
            <div class="adm-field">
              <label class="adm-label">Published date</label>
              <input v-model="editing.published_at" type="date" class="adm-input" />
            </div>
            <div class="adm-field">
              <label class="adm-label">Display order</label>
              <input v-model="editing.display_order" type="number" min="0" class="adm-input" />
              <p class="adm-hint">0 = automatic (newest first). Set 1, 2, 3… to pin articles to the front in that order.</p>
            </div>
          </div>
          <label class="adm-switch">
            <input v-model="editing.is_featured" type="checkbox" />
            <span class="track"></span>
            <span class="lbl">Featured — leads the Writing section</span>
          </label>
        </form>

        <footer class="adm-drawer__foot">
          <button
            v-if="editing.id"
            class="adm-btn adm-btn--danger"
            style="margin-right: auto"
            @click="deleteConfirm = editing"
          >Delete</button>
          <button class="adm-btn" @click="editing = null">Cancel</button>
          <button class="adm-btn adm-btn--primary" :disabled="saving || !editing.title || !editing.url" @click="save">
            {{ saving ? 'Saving…' : editing.id ? 'Save article' : 'Create article' }}
          </button>
        </footer>
      </aside>
    </template>

    <!-- Delete confirm -->
    <div v-if="deleteConfirm" class="adm-modal-bg" @click.self="deleteConfirm = null">
      <div class="adm-modal">
        <h3>Delete this article?</h3>
        <p><strong>{{ deleteConfirm.title }}</strong> will be removed. This cannot be undone.</p>
        <div class="adm-modal-actions">
          <button class="adm-btn" @click="deleteConfirm = null">Keep it</button>
          <button class="adm-btn adm-btn--danger" @click="confirmDelete">Delete article</button>
        </div>
      </div>
    </div>

    <!-- Bulk delete confirm -->
    <div v-if="bulkConfirm" class="adm-modal-bg" @click.self="bulkConfirm = false">
      <div class="adm-modal">
        <h3>Delete {{ selected.length }} article{{ selected.length === 1 ? '' : 's' }}?</h3>
        <p>All selected articles will be removed. This cannot be undone.</p>
        <div class="adm-modal-actions">
          <button class="adm-btn" :disabled="bulkBusy" @click="bulkConfirm = false">Keep them</button>
          <button class="adm-btn adm-btn--danger" :disabled="bulkBusy" @click="bulkDelete">
            {{ bulkBusy ? 'Deleting…' : `Delete ${selected.length}` }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.aa__toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.aa__search { position: relative; flex: 1; max-width: 360px; }
.aa__search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--adm-mute-2); pointer-events: none; }
.aa__search .adm-input { padding-left: 36px; }
.aa__count { font-family: var(--font-mono); font-size: 11px; color: var(--adm-mute); margin-left: auto; }
.aa__select { width: auto; padding-top: 9px; padding-bottom: 9px; }

.aa__th-check, .aa__td-check { width: 34px; }
.aa__th-check input, .aa__td-check input {
  width: 15px; height: 15px; accent-color: var(--adm-teal); cursor: pointer;
}
.aa__row.is-selected td { background: var(--adm-teal-mist); }

.aa__row { cursor: pointer; }
.aa__td-title { max-width: 380px; }
.aa__title-text { font-weight: 550; }
.aa__open {
  margin-left: 8px; color: var(--adm-mute-2); text-decoration: none; font-size: 12px;
  transition: color 140ms;
}
.aa__open:hover { color: var(--adm-teal); }
.aa__td-actions { white-space: nowrap; text-align: right; }
.aa__del:hover { color: var(--adm-danger) !important; }

/* Live preview card */
.aa__preview { margin-bottom: 4px; }
.aa__preview-card {
  border: 1px solid var(--adm-line); border-radius: var(--adm-r-md); overflow: hidden;
  background: var(--adm-canvas);
}
.aa__preview-media {
  height: 110px; display: grid; place-items: center;
  background: linear-gradient(135deg, var(--adm-teal-mist), #dcebe9);
  overflow: hidden;
}
.aa__preview-media img { width: 100%; height: 100%; object-fit: cover; }
.aa__preview-noimg { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--adm-teal-deep); opacity: 0.7; padding: 0 20px; text-align: center; }
.aa__preview-body { padding: 14px 16px; }
.aa__preview-meta {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  font-family: var(--font-mono); font-size: 10px; color: var(--adm-mute);
}
.aa__preview-chip {
  border: 1px solid var(--adm-teal); color: var(--adm-teal-deep);
  border-radius: 999px; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.06em;
}
.aa__preview-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; line-height: 1.25; margin: 0 0 6px; color: var(--adm-ink); }
.aa__preview-desc { font-size: 12.5px; color: var(--adm-mute); line-height: 1.55; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
