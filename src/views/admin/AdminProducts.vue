<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import ImageField from '@/components/admin/ImageField.vue'
import { api } from '@/lib/api.js'

const products = ref([])
const loading = ref(true)
const error = ref('')
const editing = ref(null)
const saving = ref(false)
const deleteConfirm = ref(null)
const filterCat = ref('')
const filterSource = ref('')
const search = ref('')
const sortBy = ref('title')
const selected = ref([])
const bulkConfirm = ref(false)
const bulkBusy = ref(false)

const TYPES      = ['Course', 'Tool', 'PDF', 'Book']
const CATEGORIES = ['courses', 'tools', 'books']
const SOURCES    = ['payhip', 'amazon', 'manual']
const CURRENCIES = ['USD', 'EUR', 'GBP']

const blank = () => ({
  id: null, source: 'manual', type: 'Course', category: 'courses',
  title: '', description: '', image_url: '', url: '', price: '',
  currency: 'EUR', is_active: true, display_order: 0,
})

const filtered = computed(() => {
  let list = products.value
  if (filterCat.value) list = list.filter((p) => p.category === filterCat.value)
  if (filterSource.value) list = list.filter((p) => p.source === filterSource.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((p) => p.title.toLowerCase().includes(q))
  const arr = [...list]
  switch (sortBy.value) {
    case 'price-asc':  arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break
    case 'price-desc': arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break
    case 'order':      arr.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)); break
    default:           arr.sort((a, b) => a.title.localeCompare(b.title))
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
  () => filtered.value.length > 0 && filtered.value.every((p) => selected.value.includes(p.id)),
)
function toggleSelectAll() {
  selected.value = allSelected.value ? [] : filtered.value.map((p) => p.id)
}

async function bulkDelete() {
  bulkBusy.value = true
  error.value = ''
  try {
    for (const id of selected.value) await api.admin.deleteProduct(id)
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
  loading.value = true; error.value = ''
  try { products.value = await api.admin.products() }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
}

function openNew() { editing.value = blank() }
function openEdit(p) {
  editing.value = { ...p, price: p.price ?? '', image_url: p.image_url || '', description: p.description || '' }
}

async function save() {
  saving.value = true; error.value = ''
  try {
    const payload = {
      source: editing.value.source,
      type: editing.value.type,
      category: editing.value.category,
      title: editing.value.title,
      description: editing.value.description || null,
      image_url: editing.value.image_url || null,
      url: editing.value.url,
      price: editing.value.price !== '' ? Number(editing.value.price) : null,
      currency: editing.value.currency || 'EUR',
      is_active: editing.value.is_active,
      display_order: Number(editing.value.display_order) || 0,
    }
    if (editing.value.id) await api.admin.updateProduct(editing.value.id, payload)
    else await api.admin.createProduct(payload)
    editing.value = null
    await load()
  } catch (e) { error.value = e.message }
  finally { saving.value = false }
}

async function confirmDelete() {
  if (!deleteConfirm.value) return
  try {
    await api.admin.deleteProduct(deleteConfirm.value.id)
    deleteConfirm.value = null
    editing.value = null
    await load()
  } catch (e) { error.value = e.message }
}

function fmtPrice(p, currency) {
  if (p === null || p === undefined || p === '') return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'EUR' }).format(p)
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page pr">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Content</p>
          <h1 class="adm-title">Products</h1>
          <p class="adm-sub">Courses, tools, and books — imported from Payhip or managed by hand.</p>
        </div>
        <button class="adm-btn adm-btn--primary" @click="openNew">+ New product</button>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div class="pr__toolbar">
        <div class="adm-seg">
          <button :class="{ 'is-on': filterCat === '' }" @click="filterCat = ''">All</button>
          <button
            v-for="c in CATEGORIES" :key="c"
            :class="{ 'is-on': filterCat === c }"
            style="text-transform: capitalize"
            @click="filterCat = c"
          >{{ c }}</button>
        </div>
        <input v-model="search" class="adm-input pr__search" placeholder="Search titles…" />
        <select v-model="filterSource" class="adm-input pr__select" title="Filter by source">
          <option value="">All sources</option>
          <option v-for="s in SOURCES" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="sortBy" class="adm-input pr__select" title="Sort">
          <option value="title">Title A–Z</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="order">Display order</option>
        </select>
        <button
          v-if="selected.length"
          class="adm-btn adm-btn--danger adm-btn--sm"
          @click="bulkConfirm = true"
        >Delete selected ({{ selected.length }})</button>
        <label v-else-if="filtered.length" class="pr__select-all">
          <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
          Select all
        </label>
        <span class="pr__count">{{ filtered.length }} of {{ products.length }}</span>
      </div>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14"/></svg></span>
        Loading products…
      </div>

      <div v-else-if="filtered.length" class="pr__grid">
        <article
          v-for="p in filtered" :key="p.id"
          class="adm-card adm-card--hover pr__card"
          :class="{ 'is-inactive': !p.is_active, 'is-selected': selected.includes(p.id) }"
          @click="openEdit(p)"
        >
          <label class="pr__check" @click.stop>
            <input type="checkbox" :checked="selected.includes(p.id)" @change="toggleSelect(p.id)" />
          </label>
          <div class="pr__thumb">
            <img v-if="p.image_url" :src="p.image_url" alt="" loading="lazy" />
            <span v-else class="pr__thumb-empty">{{ p.type }}</span>
          </div>
          <div class="pr__body">
            <div class="pr__meta">
              <span class="adm-badge adm-badge--teal">{{ p.type }}</span>
              <span class="pr__source">{{ p.source }}</span>
            </div>
            <h2 class="pr__title">{{ p.title }}</h2>
            <div class="pr__foot">
              <span class="pr__price">{{ fmtPrice(p.price, p.currency) }}</span>
              <span v-if="!p.is_active" class="adm-badge adm-badge--mute">Hidden</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="adm-empty">
        <p>{{ filterCat ? 'No products in this category.' : 'No products yet. Run the Payhip import or add one by hand.' }}</p>
        <button v-if="!filterCat" class="adm-btn adm-btn--primary" @click="openNew">+ New product</button>
      </div>
    </div>

    <!-- Editor drawer -->
    <template v-if="editing">
      <div class="adm-drawer-bg" @click="editing = null"></div>
      <aside class="adm-drawer" role="dialog" aria-modal="true">
        <header class="adm-drawer__head">
          <h2>{{ editing.id ? 'Edit product' : 'New product' }}</h2>
          <button class="adm-close" aria-label="Close" @click="editing = null">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        </header>

        <form class="adm-drawer__body" @submit.prevent="save">
          <div class="adm-field">
            <label class="adm-label">Title <span class="req">*</span></label>
            <input v-model="editing.title" required class="adm-input" placeholder="e.g. Endurance Map Builder" />
          </div>

          <div class="adm-grid-3">
            <div class="adm-field">
              <label class="adm-label">Source</label>
              <select v-model="editing.source" class="adm-select">
                <option v-for="s in SOURCES" :key="s">{{ s }}</option>
              </select>
            </div>
            <div class="adm-field">
              <label class="adm-label">Type</label>
              <select v-model="editing.type" class="adm-select">
                <option v-for="t in TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div class="adm-field">
              <label class="adm-label">Category</label>
              <select v-model="editing.category" class="adm-select">
                <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="adm-field">
            <label class="adm-label">Description</label>
            <textarea v-model="editing.description" class="adm-textarea" rows="3" placeholder="Short blurb shown on the card…"></textarea>
          </div>
          <div class="adm-field">
            <label class="adm-label">URL <span class="req">*</span></label>
            <input v-model="editing.url" required type="url" class="adm-input adm-input--mono" placeholder="https://…" />
          </div>
          <ImageField v-model="editing.image_url" label="Image" hint="Paste a URL, or browse the media library / upload." />

          <div class="adm-grid-3">
            <div class="adm-field">
              <label class="adm-label">Price</label>
              <input v-model="editing.price" type="number" min="0" step="0.01" class="adm-input" placeholder="Blank = free" />
            </div>
            <div class="adm-field">
              <label class="adm-label">Currency</label>
              <select v-model="editing.currency" class="adm-select">
                <option v-for="c in CURRENCIES" :key="c">{{ c }}</option>
              </select>
            </div>
            <div class="adm-field">
              <label class="adm-label">Display order</label>
              <input v-model="editing.display_order" type="number" min="0" class="adm-input" />
              <p class="adm-hint">0 = automatic (alphabetical). Set 1, 2, 3… to pin products to the front in that order.</p>
            </div>
          </div>

          <label class="adm-switch">
            <input v-model="editing.is_active" type="checkbox" />
            <span class="track"></span>
            <span class="lbl">Active — visible in the store section</span>
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
            {{ saving ? 'Saving…' : editing.id ? 'Save product' : 'Create product' }}
          </button>
        </footer>
      </aside>
    </template>

    <!-- Delete confirm -->
    <div v-if="deleteConfirm" class="adm-modal-bg" @click.self="deleteConfirm = null">
      <div class="adm-modal">
        <h3>Delete this product?</h3>
        <p><strong>{{ deleteConfirm.title }}</strong> will be removed. This cannot be undone.</p>
        <div class="adm-modal-actions">
          <button class="adm-btn" @click="deleteConfirm = null">Keep it</button>
          <button class="adm-btn adm-btn--danger" @click="confirmDelete">Delete product</button>
        </div>
      </div>
    </div>

    <!-- Bulk delete confirm -->
    <div v-if="bulkConfirm" class="adm-modal-bg" @click.self="bulkConfirm = false">
      <div class="adm-modal">
        <h3>Delete {{ selected.length }} product{{ selected.length === 1 ? '' : 's' }}?</h3>
        <p>All selected products will be removed. This cannot be undone.</p>
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
.pr__toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.pr__count { font-family: var(--font-mono); font-size: 11px; color: var(--adm-mute); margin-left: auto; }
.pr__search { width: 200px; }
.pr__select { width: auto; padding-top: 9px; padding-bottom: 9px; }
.pr__select-all {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: var(--adm-mute); cursor: pointer;
}
.pr__select-all input, .pr__check input {
  width: 15px; height: 15px; accent-color: var(--adm-teal); cursor: pointer;
}

.pr__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px;
}

.pr__card { overflow: hidden; cursor: pointer; display: flex; flex-direction: column; position: relative; }
.pr__card.is-inactive { opacity: 0.55; }
.pr__card.is-selected { box-shadow: 0 0 0 2px var(--adm-teal); }

.pr__check {
  position: absolute; top: 8px; left: 8px; z-index: 2;
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--adm-line);
  cursor: pointer;
}

.pr__thumb {
  height: 130px; background: linear-gradient(135deg, var(--adm-teal-mist), #dcebe9);
  display: grid; place-items: center; overflow: hidden;
  border-bottom: 1px solid var(--adm-line);
}
.pr__thumb img { width: 100%; height: 100%; object-fit: cover; }
.pr__thumb-empty {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--adm-teal-deep); opacity: 0.65;
}

.pr__body { padding: 15px 16px 16px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
.pr__meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pr__source { font-family: var(--font-mono); font-size: 10px; color: var(--adm-mute-2); text-transform: uppercase; letter-spacing: 0.08em; }
.pr__title {
  font-family: var(--font-display); font-size: 14.5px; font-weight: 700; line-height: 1.3;
  letter-spacing: -0.01em; margin: 0; color: var(--adm-ink);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pr__foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pr__price { font-family: var(--font-mono); font-size: 12.5px; color: var(--adm-teal-deep); font-weight: 500; }
</style>
