<script setup>
import { computed, ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const items = ref([])
const loading = ref(true)
const error = ref('')
const uploading = ref(0)          // number of files currently uploading
const deleteConfirm = ref(null)
const copiedId = ref(null)
const filter = ref('all')         // all | upload | substack | payhip
const fileInputEl = ref(null)
const search = ref('')
const selected = ref([])
const bulkConfirm = ref(false)
const bulkBusy = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await api.admin.media()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const sources = computed(() => {
  const set = new Set(items.value.map((m) => m.source).filter(Boolean))
  return ['all', ...set]
})
const filtered = computed(() => {
  let list = filter.value === 'all' ? items.value : items.value.filter((m) => m.source === filter.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((m) => (m.original_name || m.path).toLowerCase().includes(q))
  return list
})

// ── Bulk selection ──────────────────────────────────────────
function toggleSelect(id) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id]
}
const allSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((m) => selected.value.includes(m.id)),
)
function toggleSelectAll() {
  selected.value = allSelected.value ? [] : filtered.value.map((m) => m.id)
}

async function bulkDelete() {
  bulkBusy.value = true
  error.value = ''
  try {
    for (const id of selected.value) await api.admin.deleteMedia(id)
    items.value = items.value.filter((m) => !selected.value.includes(m.id))
    selected.value = []
    bulkConfirm.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    bulkBusy.value = false
  }
}

function openFilePicker() { fileInputEl.value?.click() }

async function onFilesChosen(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  error.value = ''
  uploading.value = files.length
  for (const file of files) {
    try {
      const media = await api.admin.uploadMedia(file)
      items.value.unshift(media)
    } catch (err) {
      error.value = `${file.name}: ${err.message}`
    } finally {
      uploading.value--
    }
  }
}

async function copyUrl(m) {
  try {
    await navigator.clipboard.writeText(m.url)
    copiedId.value = m.id
    setTimeout(() => { if (copiedId.value === m.id) copiedId.value = null }, 1600)
  } catch {
    error.value = 'Could not copy — your browser blocked clipboard access.'
  }
}

async function confirmDelete() {
  if (!deleteConfirm.value) return
  try {
    await api.admin.deleteMedia(deleteConfirm.value.id)
    items.value = items.value.filter((m) => m.id !== deleteConfirm.value.id)
    deleteConfirm.value = null
  } catch (e) { error.value = e.message }
}

function fmtSize(b) {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / 1024 / 1024).toFixed(1) + ' MB'
}
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page md">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Content</p>
          <h1 class="adm-title">Media</h1>
          <p class="adm-sub">
            Every image on the project — admin uploads plus copies mirrored automatically during imports.
            Copy a URL and use it anywhere: banner slides, articles, products.
          </p>
        </div>
        <button class="adm-btn adm-btn--primary" :disabled="uploading > 0" @click="openFilePicker">
          {{ uploading > 0 ? `Uploading ${uploading}…` : '+ Upload images' }}
        </button>
        <input ref="fileInputEl" type="file" accept="image/*" multiple class="md__file" @change="onFilesChosen" />
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Loading media…
      </div>

      <template v-else>
        <div class="md__toolbar">
          <div v-if="sources.length > 2" class="adm-seg">
            <button
              v-for="s in sources" :key="s" type="button"
              :class="{ 'is-on': filter === s }"
              @click="filter = s"
            >{{ s }}</button>
          </div>
          <input v-model="search" class="adm-input md__search" placeholder="Search filenames…" />
          <button
            v-if="selected.length"
            class="adm-btn adm-btn--danger adm-btn--sm"
            @click="bulkConfirm = true"
          >Delete selected ({{ selected.length }})</button>
          <label v-else-if="filtered.length" class="md__select-all">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
            Select all
          </label>
        </div>

        <div v-if="filtered.length" class="md__grid">
          <div v-for="m in filtered" :key="m.id" class="adm-card md__card" :class="{ 'is-selected': selected.includes(m.id) }">
            <label class="md__check">
              <input type="checkbox" :checked="selected.includes(m.id)" @change="toggleSelect(m.id)" />
            </label>
            <a class="md__thumb" :href="m.url" target="_blank" rel="noopener" :title="m.original_name || m.path">
              <img :src="m.url" alt="" loading="lazy" />
            </a>
            <div class="md__body">
              <span class="md__name">{{ m.original_name || m.path.split('/').pop() }}</span>
              <span class="md__meta">{{ m.source }} · {{ fmtSize(m.size) }} · {{ fmtDate(m.created_at) }}</span>
            </div>
            <div class="md__actions">
              <button class="md__act" :class="{ 'is-ok': copiedId === m.id }" @click="copyUrl(m)">
                {{ copiedId === m.id ? 'Copied ✓' : 'Copy URL' }}
              </button>
              <button class="md__act md__act--danger" @click="deleteConfirm = m">Delete</button>
            </div>
          </div>
        </div>

        <div v-else class="md__empty adm-card">
          <p><strong>No media yet.</strong></p>
          <p>Upload images here, or run an import — Substack and Payhip covers get mirrored automatically.</p>
          <button class="adm-btn adm-btn--primary" @click="openFilePicker">+ Upload images</button>
        </div>
      </template>
    </div>

    <!-- Bulk delete confirm -->
    <div v-if="bulkConfirm" class="ap-admin">
      <div class="adm-modal-bg" @click.self="bulkConfirm = false">
        <div class="adm-modal">
          <h3>Delete {{ selected.length }} image{{ selected.length === 1 ? '' : 's' }}?</h3>
          <p>The selected files will be removed from storage. Anything still using their URLs will show broken images. This cannot be undone.</p>
          <div class="adm-modal-actions">
            <button class="adm-btn" :disabled="bulkBusy" @click="bulkConfirm = false">Keep them</button>
            <button class="adm-btn adm-btn--danger" :disabled="bulkBusy" @click="bulkDelete">
              {{ bulkBusy ? 'Deleting…' : `Delete ${selected.length}` }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteConfirm" class="ap-admin">
      <div class="adm-modal-bg" @click.self="deleteConfirm = null">
        <div class="adm-modal">
          <h3>Delete this image?</h3>
          <p>
            <strong>{{ deleteConfirm.original_name || deleteConfirm.path }}</strong> will be removed from storage.
            Anything still using its URL will show a broken image. This cannot be undone.
          </p>
          <div class="adm-modal-actions">
            <button class="adm-btn" @click="deleteConfirm = null">Keep it</button>
            <button class="adm-btn adm-btn--danger" @click="confirmDelete()">Delete image</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.md__file { display: none; }

.md__toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.md__search { width: 220px; }
.md__select-all {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: var(--adm-mute); cursor: pointer;
}
.md__select-all input, .md__check input {
  width: 15px; height: 15px; accent-color: var(--adm-teal); cursor: pointer;
}

.md__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: max-content;
  gap: 14px;
}

.md__card { padding: 0; overflow: hidden; display: flex; flex-direction: column; position: relative; }
.md__card.is-selected { box-shadow: 0 0 0 2px var(--adm-teal); }

.md__check {
  position: absolute; top: 8px; left: 8px; z-index: 2;
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--adm-line);
  cursor: pointer;
}

.md__thumb {
  display: block;
  height: 140px;
  flex-shrink: 0;
  background:
    conic-gradient(var(--adm-line) 25%, transparent 0 50%, var(--adm-line) 0 75%, transparent 0) 0 0 / 18px 18px,
    var(--adm-surface);
  border-bottom: 1px solid var(--adm-line);
}
.md__thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }

.md__body { display: grid; gap: 2px; padding: 10px 12px 8px; }
.md__name {
  font-size: 13px; font-weight: 550; color: var(--adm-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.md__meta {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--adm-mute);
}

.md__actions {
  display: flex; gap: 6px;
  padding: 6px 8px 10px;
  margin-top: auto;
}
.md__act {
  flex: 1;
  border: 1px solid var(--adm-line); border-radius: 8px;
  background: var(--adm-surface); color: var(--adm-ink-soft);
  font-size: 12px; padding: 6px 8px; cursor: pointer;
  transition: color 140ms, border-color 140ms, background 140ms;
}
.md__act:hover { color: var(--adm-teal-deep); border-color: var(--adm-teal); background: var(--adm-teal-mist); }
.md__act.is-ok { color: var(--adm-teal-deep); border-color: var(--adm-teal); }
.md__act--danger:hover { color: #b3402a; border-color: rgba(179, 64, 42, 0.4); background: rgba(179, 64, 42, 0.06); }

.md__empty {
  padding: 44px 24px;
  text-align: center;
  display: grid; gap: 8px; justify-items: center;
  color: var(--adm-mute);
}
.md__empty strong { color: var(--adm-ink); }
.md__empty .adm-btn { margin-top: 10px; }
</style>
