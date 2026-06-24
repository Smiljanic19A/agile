<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const articles = ref([])
const loading = ref(true)
const error = ref('')
const editing = ref(null)    // null = list view
const saving = ref(false)
const deleteConfirm = ref(null)

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

function closeEditor() { editing.value = null }

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
    if (editing.value.id) {
      await api.admin.updateArticle(editing.value.id, payload)
    } else {
      await api.admin.createArticle(payload)
    }
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
    <div class="aa">

      <!-- Editor -->
      <template v-if="editing">
        <header class="aa__header">
          <button class="aa__back" @click="closeEditor">← Articles</button>
          <h1 class="aa__title">{{ editing.id ? 'Edit article' : 'New article' }}</h1>
        </header>

        <form class="aa__form" @submit.prevent="save">
          <p v-if="error" class="aa__error">{{ error }}</p>

          <div class="aa__field">
            <label class="aa__label">Title *</label>
            <input v-model="editing.title" required class="aa__input" placeholder="Article title" />
          </div>
          <div class="aa__row2">
            <div class="aa__field">
              <label class="aa__label">Type</label>
              <select v-model="editing.type" class="aa__select">
                <option v-for="t in TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div class="aa__field">
              <label class="aa__label">Read time</label>
              <input v-model="editing.read_time" class="aa__input" placeholder="e.g. 12 min" />
            </div>
          </div>
          <div class="aa__field">
            <label class="aa__label">Description</label>
            <textarea v-model="editing.description" class="aa__textarea" rows="3" placeholder="Short excerpt…"></textarea>
          </div>
          <div class="aa__field">
            <label class="aa__label">URL *</label>
            <input v-model="editing.url" required type="url" class="aa__input" placeholder="https://…" />
          </div>
          <div class="aa__field">
            <label class="aa__label">Image URL</label>
            <input v-model="editing.image_url" class="aa__input" placeholder="https://…" />
          </div>
          <div class="aa__row2">
            <div class="aa__field">
              <label class="aa__label">Published date</label>
              <input v-model="editing.published_at" type="date" class="aa__input" />
            </div>
            <div class="aa__field">
              <label class="aa__label">Display order</label>
              <input v-model="editing.display_order" type="number" class="aa__input" />
            </div>
          </div>
          <div class="aa__field aa__field--check">
            <input id="featured" v-model="editing.is_featured" type="checkbox" />
            <label for="featured">Featured article</label>
          </div>

          <div class="aa__actions">
            <button type="submit" class="aa__btn aa__btn--primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" class="aa__btn" @click="closeEditor">Cancel</button>
          </div>
        </form>
      </template>

      <!-- Delete confirm -->
      <div v-if="deleteConfirm" class="aa__modal-bg" @click.self="deleteConfirm = null">
        <div class="aa__modal">
          <p>Delete <strong>{{ deleteConfirm.title }}</strong>? This cannot be undone.</p>
          <div class="aa__modal-actions">
            <button class="aa__btn aa__btn--danger" @click="confirmDelete">Delete</button>
            <button class="aa__btn" @click="deleteConfirm = null">Cancel</button>
          </div>
        </div>
      </div>

      <!-- List -->
      <template v-if="!editing">
        <header class="aa__header">
          <h1 class="aa__title">Articles</h1>
          <button class="aa__btn aa__btn--primary" @click="openNew">+ New article</button>
        </header>

        <p v-if="error" class="aa__error">{{ error }}</p>
        <div v-if="loading" class="aa__loading">Loading…</div>

        <table v-else class="aa__table">
          <thead>
            <tr>
              <th>Title</th><th>Type</th><th>Published</th><th>Order</th><th>Featured</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles" :key="a.id">
              <td class="aa__td-title">
                <a :href="a.url" target="_blank" rel="noopener" class="aa__td-link">{{ a.title }}</a>
              </td>
              <td><span class="aa__tag">{{ a.type }}</span></td>
              <td>{{ fmtDate(a.published_at) }}</td>
              <td>{{ a.display_order }}</td>
              <td>{{ a.is_featured ? '✓' : '' }}</td>
              <td class="aa__td-actions">
                <button class="aa__row-btn" @click="openEdit(a)">Edit</button>
                <button class="aa__row-btn aa__row-btn--del" @click="deleteConfirm = a">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!loading && articles.length === 0" class="aa__empty">
          No articles yet. Run an import or create one manually.
        </p>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
.aa { padding: 40px 48px; max-width: 1000px; }
.aa__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.aa__title { font-family: var(--font-display); font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: var(--ink); margin: 0; }
.aa__back { background: none; border: none; color: var(--teal); font-size: 13px; cursor: pointer; padding: 0; }
.aa__loading { color: var(--ink-soft); font-size: 14px; }
.aa__empty { color: var(--ink-soft); font-size: 14px; padding: 24px 0; }
.aa__error { color: #dc2626; font-size: 13px; margin-bottom: 16px; }

.aa__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.aa__table th { text-align: left; padding: 8px 12px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); border-bottom: 2px solid var(--hairline); }
.aa__table td { padding: 12px; border-bottom: 1px solid var(--hairline); color: var(--ink); vertical-align: middle; }
.aa__td-title { max-width: 360px; }
.aa__td-link { color: var(--ink); text-decoration: none; font-weight: 500; }
.aa__td-link:hover { color: var(--teal); }
.aa__td-actions { display: flex; gap: 8px; white-space: nowrap; }
.aa__tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(55,136,130,0.1); color: var(--teal-deep); }

.aa__row-btn { background: none; border: 1px solid var(--hairline-strong); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--ink-soft); cursor: pointer; transition: border-color 120ms, color 120ms; }
.aa__row-btn:hover { border-color: var(--teal); color: var(--teal); }
.aa__row-btn--del:hover { border-color: #dc2626; color: #dc2626; }

/* Form */
.aa__form { max-width: 640px; display: flex; flex-direction: column; gap: 20px; }
.aa__field { display: flex; flex-direction: column; gap: 6px; }
.aa__field--check { flex-direction: row; align-items: center; gap: 8px; }
.aa__label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); }
.aa__input, .aa__select, .aa__textarea {
  background: var(--paper); border: 1.5px solid var(--hairline-strong); border-radius: var(--radius-sm);
  padding: 11px 14px; font-size: 14px; color: var(--ink); font-family: var(--font-body); width: 100%;
  transition: border-color 140ms;
}
.aa__input:focus, .aa__select:focus, .aa__textarea:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(55,136,130,0.1); }
.aa__textarea { resize: vertical; }
.aa__row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.aa__actions { display: flex; gap: 12px; margin-top: 8px; }

.aa__btn { padding: 10px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--hairline-strong); background: var(--paper); color: var(--ink); transition: all 140ms; }
.aa__btn:hover { border-color: var(--ink); }
.aa__btn--primary { background: var(--ink); color: #f3f3f3; border-color: var(--ink); }
.aa__btn--primary:hover { background: var(--teal-deep); border-color: var(--teal-deep); }
.aa__btn--danger { background: #dc2626; color: #fff; border-color: #dc2626; }
.aa__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.aa__modal-bg { position: fixed; inset: 0; background: rgba(14,26,26,0.5); display: grid; place-items: center; z-index: 100; }
.aa__modal { background: var(--paper); border-radius: var(--radius-lg); padding: 32px; max-width: 400px; width: 90%; }
.aa__modal p { margin: 0 0 24px; }
.aa__modal-actions { display: flex; gap: 12px; }

@media (max-width: 640px) {
  .aa { padding: 24px 20px; }
  .aa__row2 { grid-template-columns: 1fr; }
}
</style>
