<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const products = ref([])
const loading = ref(true)
const error = ref('')
const editing = ref(null)
const saving = ref(false)
const deleteConfirm = ref(null)
const filterCat = ref('')

const TYPES      = ['Course', 'Tool', 'PDF', 'Book']
const CATEGORIES = ['courses', 'tools', 'books']
const SOURCES    = ['payhip', 'amazon', 'manual']

const blank = () => ({
  id: null, source: 'manual', type: 'Course', category: 'courses',
  title: '', description: '', image_url: '', url: '', price: '',
  currency: 'USD', is_active: true, display_order: 0,
})

const filtered = computed(() =>
  filterCat.value ? products.value.filter(p => p.category === filterCat.value) : products.value
)

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
function closeEditor() { editing.value = null }

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
      currency: editing.value.currency || 'USD',
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
  try { await api.admin.deleteProduct(deleteConfirm.value.id); deleteConfirm.value = null; await load() }
  catch (e) { error.value = e.message }
}

function fmtPrice(p) {
  if (!p && p !== 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p)
}
</script>

<template>
  <AdminLayout>
    <div class="ap">

      <!-- Editor -->
      <template v-if="editing">
        <header class="ap__header">
          <button class="ap__back" @click="closeEditor">← Products</button>
          <h1 class="ap__title">{{ editing.id ? 'Edit product' : 'New product' }}</h1>
        </header>

        <form class="ap__form" @submit.prevent="save">
          <p v-if="error" class="ap__error">{{ error }}</p>

          <div class="ap__field">
            <label class="ap__label">Title *</label>
            <input v-model="editing.title" required class="ap__input" />
          </div>
          <div class="ap__row3">
            <div class="ap__field">
              <label class="ap__label">Source</label>
              <select v-model="editing.source" class="ap__select">
                <option v-for="s in SOURCES" :key="s">{{ s }}</option>
              </select>
            </div>
            <div class="ap__field">
              <label class="ap__label">Type</label>
              <select v-model="editing.type" class="ap__select">
                <option v-for="t in TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div class="ap__field">
              <label class="ap__label">Category</label>
              <select v-model="editing.category" class="ap__select">
                <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div class="ap__field">
            <label class="ap__label">Description</label>
            <textarea v-model="editing.description" class="ap__textarea" rows="3"></textarea>
          </div>
          <div class="ap__field">
            <label class="ap__label">URL *</label>
            <input v-model="editing.url" required type="url" class="ap__input" placeholder="https://…" />
          </div>
          <div class="ap__field">
            <label class="ap__label">Image URL</label>
            <input v-model="editing.image_url" class="ap__input" placeholder="https://…" />
          </div>
          <div class="ap__row2">
            <div class="ap__field">
              <label class="ap__label">Price (leave blank = free)</label>
              <input v-model="editing.price" type="number" min="0" step="0.01" class="ap__input" placeholder="0.00" />
            </div>
            <div class="ap__field">
              <label class="ap__label">Display order</label>
              <input v-model="editing.display_order" type="number" class="ap__input" />
            </div>
          </div>
          <div class="ap__field ap__field--check">
            <input id="is_active" v-model="editing.is_active" type="checkbox" />
            <label for="is_active">Active (visible on site)</label>
          </div>

          <div class="ap__actions">
            <button type="submit" class="ap__btn ap__btn--primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" class="ap__btn" @click="closeEditor">Cancel</button>
          </div>
        </form>
      </template>

      <!-- Delete confirm -->
      <div v-if="deleteConfirm" class="ap__modal-bg" @click.self="deleteConfirm = null">
        <div class="ap__modal">
          <p>Delete <strong>{{ deleteConfirm.title }}</strong>?</p>
          <div class="ap__modal-actions">
            <button class="ap__btn ap__btn--danger" @click="confirmDelete">Delete</button>
            <button class="ap__btn" @click="deleteConfirm = null">Cancel</button>
          </div>
        </div>
      </div>

      <!-- List -->
      <template v-if="!editing">
        <header class="ap__header">
          <h1 class="ap__title">Products</h1>
          <div class="ap__header-actions">
            <select v-model="filterCat" class="ap__filter">
              <option value="">All categories</option>
              <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
            </select>
            <button class="ap__btn ap__btn--primary" @click="openNew">+ New product</button>
          </div>
        </header>

        <p v-if="error" class="ap__error">{{ error }}</p>
        <div v-if="loading" class="ap__loading">Loading…</div>

        <table v-else class="ap__table">
          <thead>
            <tr><th>Title</th><th>Type</th><th>Source</th><th>Price</th><th>Active</th><th>Order</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td class="ap__td-title">
                <a :href="p.url" target="_blank" rel="noopener" class="ap__td-link">{{ p.title }}</a>
              </td>
              <td><span class="ap__tag">{{ p.type }}</span></td>
              <td>{{ p.source }}</td>
              <td>{{ fmtPrice(p.price) }}</td>
              <td>{{ p.is_active ? '✓' : '' }}</td>
              <td>{{ p.display_order }}</td>
              <td class="ap__td-actions">
                <button class="ap__row-btn" @click="openEdit(p)">Edit</button>
                <button class="ap__row-btn ap__row-btn--del" @click="deleteConfirm = p">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!loading && filtered.length === 0" class="ap__empty">No products.</p>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
.ap { padding: 40px 48px; max-width: 1100px; }
.ap__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.ap__header-actions { display: flex; gap: 12px; align-items: center; }
.ap__title { font-family: var(--font-display); font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: var(--ink); margin: 0; }
.ap__back { background: none; border: none; color: var(--teal); font-size: 13px; cursor: pointer; padding: 0; }
.ap__loading { color: var(--ink-soft); font-size: 14px; }
.ap__empty { color: var(--ink-soft); font-size: 14px; padding: 24px 0; }
.ap__error { color: #dc2626; font-size: 13px; margin-bottom: 16px; }
.ap__filter { border: 1.5px solid var(--hairline-strong); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 13px; color: var(--ink); background: var(--paper); }

.ap__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ap__table th { text-align: left; padding: 8px 12px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); border-bottom: 2px solid var(--hairline); }
.ap__table td { padding: 12px; border-bottom: 1px solid var(--hairline); color: var(--ink); vertical-align: middle; }
.ap__td-title { max-width: 320px; }
.ap__td-link { color: var(--ink); text-decoration: none; font-weight: 500; }
.ap__td-link:hover { color: var(--teal); }
.ap__td-actions { display: flex; gap: 8px; white-space: nowrap; }
.ap__tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(55,136,130,0.1); color: var(--teal-deep); }

.ap__row-btn { background: none; border: 1px solid var(--hairline-strong); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--ink-soft); cursor: pointer; transition: border-color 120ms, color 120ms; }
.ap__row-btn:hover { border-color: var(--teal); color: var(--teal); }
.ap__row-btn--del:hover { border-color: #dc2626; color: #dc2626; }

.ap__form { max-width: 640px; display: flex; flex-direction: column; gap: 20px; }
.ap__field { display: flex; flex-direction: column; gap: 6px; }
.ap__field--check { flex-direction: row; align-items: center; gap: 8px; }
.ap__label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); }
.ap__input, .ap__select, .ap__textarea {
  background: var(--paper); border: 1.5px solid var(--hairline-strong); border-radius: var(--radius-sm);
  padding: 11px 14px; font-size: 14px; color: var(--ink); font-family: var(--font-body); width: 100%;
  transition: border-color 140ms;
}
.ap__input:focus, .ap__select:focus, .ap__textarea:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(55,136,130,0.1); }
.ap__textarea { resize: vertical; }
.ap__row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ap__row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.ap__actions { display: flex; gap: 12px; margin-top: 8px; }

.ap__btn { padding: 10px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--hairline-strong); background: var(--paper); color: var(--ink); transition: all 140ms; }
.ap__btn:hover { border-color: var(--ink); }
.ap__btn--primary { background: var(--ink); color: #f3f3f3; border-color: var(--ink); }
.ap__btn--primary:hover { background: var(--teal-deep); border-color: var(--teal-deep); }
.ap__btn--danger { background: #dc2626; color: #fff; border-color: #dc2626; }
.ap__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ap__modal-bg { position: fixed; inset: 0; background: rgba(14,26,26,0.5); display: grid; place-items: center; z-index: 100; }
.ap__modal { background: var(--paper); border-radius: var(--radius-lg); padding: 32px; max-width: 400px; width: 90%; }
.ap__modal p { margin: 0 0 24px; }
.ap__modal-actions { display: flex; gap: 12px; }

@media (max-width: 640px) {
  .ap { padding: 24px 20px; }
  .ap__row2, .ap__row3 { grid-template-columns: 1fr; }
}
</style>
