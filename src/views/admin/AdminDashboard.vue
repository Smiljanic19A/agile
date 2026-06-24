<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const stats = ref({ articles: 0, products: 0, featured: 0 })
const lastImports = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [articles, products, featured, imports] = await Promise.all([
      api.admin.articles(),
      api.admin.products(),
      api.admin.featured(),
      api.admin.imports(),
    ])
    stats.value = {
      articles: articles.length,
      products: products.length,
      featured: featured.length,
    }
    lastImports.value = imports.slice(0, 5)
  } finally {
    loading.value = false
  }
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <AdminLayout>
    <div class="dash">
      <header class="dash__header">
        <h1 class="dash__title">Dashboard</h1>
        <p class="dash__sub">Agile Periodization content overview.</p>
      </header>

      <div v-if="loading" class="dash__loading">Loading…</div>

      <template v-else>
        <div class="dash__stats">
          <router-link to="/admin/articles" class="dash__stat">
            <span class="dash__stat-num">{{ stats.articles }}</span>
            <span class="dash__stat-label">Articles</span>
          </router-link>
          <router-link to="/admin/products" class="dash__stat">
            <span class="dash__stat-num">{{ stats.products }}</span>
            <span class="dash__stat-label">Products</span>
          </router-link>
          <router-link to="/admin/featured" class="dash__stat">
            <span class="dash__stat-num">{{ stats.featured }}</span>
            <span class="dash__stat-label">Featured slides</span>
          </router-link>
        </div>

        <section class="dash__section">
          <div class="dash__row">
            <h2 class="dash__section-title">Recent imports</h2>
            <router-link to="/admin/imports" class="dash__link">View all →</router-link>
          </div>
          <div v-if="lastImports.length === 0" class="dash__empty">No imports yet.</div>
          <table v-else class="dash__table">
            <thead>
              <tr><th>Source</th><th>Status</th><th>Created</th><th>Updated</th><th>Started</th></tr>
            </thead>
            <tbody>
              <tr v-for="l in lastImports" :key="l.id">
                <td>{{ l.source }}</td>
                <td><span class="dash__badge" :class="`dash__badge--${l.status}`">{{ l.status }}</span></td>
                <td>{{ l.items_created }}</td>
                <td>{{ l.items_updated }}</td>
                <td>{{ fmtDate(l.started_at) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="dash__section">
          <h2 class="dash__section-title">Quick actions</h2>
          <div class="dash__actions">
            <router-link to="/admin/imports" class="dash__action">Run imports</router-link>
            <router-link to="/admin/articles" class="dash__action">Manage articles</router-link>
            <router-link to="/admin/products" class="dash__action">Manage products</router-link>
            <router-link to="/admin/featured" class="dash__action">Edit featured banner</router-link>
          </div>
        </section>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
.dash { padding: 40px 48px; max-width: 900px; }
.dash__header { margin-bottom: 36px; }
.dash__title { font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); font-weight: 700; color: var(--ink); margin: 0 0 8px; }
.dash__sub { color: var(--ink-soft); margin: 0; }
.dash__loading { color: var(--ink-soft); font-size: 14px; }

.dash__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
.dash__stat {
  background: var(--paper); border: 1px solid var(--hairline); border-radius: var(--radius-lg);
  padding: 24px; display: flex; flex-direction: column; gap: 6px; text-decoration: none;
  transition: border-color 140ms;
}
.dash__stat:hover { border-color: var(--teal); }
.dash__stat-num { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--teal); line-height: 1; }
.dash__stat-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); }

.dash__section { margin-bottom: 36px; }
.dash__row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.dash__section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); margin: 0; }
.dash__link { font-family: var(--font-mono); font-size: 12px; color: var(--teal); text-decoration: none; }
.dash__empty { color: var(--ink-soft); font-size: 14px; }

.dash__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.dash__table th { text-align: left; padding: 8px 12px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); border-bottom: 1px solid var(--hairline); }
.dash__table td { padding: 10px 12px; border-bottom: 1px solid var(--hairline); color: var(--ink); }

.dash__badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.dash__badge--completed { background: rgba(55,136,130,0.12); color: var(--teal-deep); }
.dash__badge--running   { background: rgba(250,204,21,0.15);  color: #92400e; }
.dash__badge--failed    { background: rgba(239,68,68,0.1);    color: #991b1b; }

.dash__actions { display: flex; gap: 12px; flex-wrap: wrap; }
.dash__action {
  padding: 10px 18px; background: var(--ink); color: #f3f3f3; border-radius: var(--radius);
  font-size: 13px; font-weight: 500; text-decoration: none;
  transition: background 140ms;
}
.dash__action:hover { background: var(--teal-deep); }

@media (max-width: 640px) {
  .dash { padding: 24px 20px; }
  .dash__stats { grid-template-columns: 1fr; }
}
</style>
