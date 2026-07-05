<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const stats = ref({ articles: 0, products: 0, featured: 0, footerLinks: 0 })
const lastImports = ref([])
const loading = ref(true)

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const cards = computed(() => [
  { to: '/admin/articles',     label: 'Articles',        value: stats.value.articles,    icon: 'doc' },
  { to: '/admin/products',     label: 'Products',        value: stats.value.products,    icon: 'box' },
  { to: '/admin/featured',     label: 'Featured slides', value: stats.value.featured,    icon: 'star' },
  { to: '/admin/footer-links', label: 'Footer links',    value: stats.value.footerLinks, icon: 'link' },
])

const lastBySource = computed(() => {
  const map = {}
  for (const l of lastImports.value) {
    if (!map[l.source]) map[l.source] = l
  }
  return ['substack', 'payhip'].map((s) => ({ source: s, log: map[s] || null }))
})

onMounted(async () => {
  try {
    const [articles, products, featured, imports, footerLinks] = await Promise.all([
      api.admin.articles(),
      api.admin.products(),
      api.admin.featured(),
      api.admin.imports(),
      api.admin.footerLinks().catch(() => []),
    ])
    stats.value = {
      articles: articles.length,
      products: products.length,
      featured: featured.length,
      footerLinks: footerLinks.length,
    }
    lastImports.value = imports.slice(0, 6)
  } finally {
    loading.value = false
  }
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function relTime(d) {
  if (!d) return 'never'
  const mins = Math.round((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `${hrs} h ago`
  return `${Math.round(hrs / 24)} d ago`
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page dash">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">{{ today }}</p>
          <h1 class="adm-title">Control room</h1>
          <p class="adm-sub">The Agile Periodization ecosystem at a glance — content, imports, and site controls.</p>
        </div>
      </header>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Gathering the numbers…
      </div>

      <template v-else>
        <!-- Stat cards -->
        <div class="dash__stats">
          <router-link v-for="(c, i) in cards" :key="c.to" :to="c.to" class="adm-card adm-card--hover dash__stat" :style="{ '--d': i }">
            <span class="dash__stat-ring" aria-hidden="true">
              <svg viewBox="0 0 44 44">
                <circle class="bg" cx="22" cy="22" r="18" />
                <circle class="fg" cx="22" cy="22" r="18" />
              </svg>
              <span class="dash__stat-icon">
                <svg v-if="c.icon === 'doc'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 2.5h7l3 3V15.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z" stroke-linejoin="round"/><path d="M6.5 9h5M6.5 12h5"/></svg>
                <svg v-else-if="c.icon === 'box'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 5.7L9 2.3l6.5 3.4v6.6L9 15.7l-6.5-3.4V5.7z"/><path d="M2.5 5.7L9 9m0 0l6.5-3.3M9 9v6.7"/></svg>
                <svg v-else-if="c.icon === 'star'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M9 2.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L9 13l-4.2 2.2.8-4.7L2.2 7.2l4.7-.7L9 2.2z"/></svg>
                <svg v-else viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M7.5 10.5a3.4 3.4 0 0 0 4.8 0l2.7-2.7a3.4 3.4 0 1 0-4.8-4.8l-1 1"/><path d="M10.5 7.5a3.4 3.4 0 0 0-4.8 0L3 10.2A3.4 3.4 0 1 0 7.8 15l1-1"/></svg>
              </span>
            </span>
            <span class="dash__stat-num">{{ c.value }}</span>
            <span class="dash__stat-label">{{ c.label }}</span>
            <span class="dash__stat-go" aria-hidden="true">→</span>
          </router-link>
        </div>

        <div class="dash__grid">
          <!-- Import health -->
          <section class="adm-card adm-card--pad dash__panel">
            <div class="dash__panel-head">
              <h2 class="dash__panel-title">Import health</h2>
              <router-link to="/admin/imports" class="dash__panel-link">Open imports →</router-link>
            </div>
            <ul class="dash__health">
              <li v-for="h in lastBySource" :key="h.source" class="dash__health-row">
                <span class="dash__health-source">{{ h.source }}</span>
                <template v-if="h.log">
                  <span class="adm-badge" :class="{
                    'adm-badge--ok': h.log.status === 'completed',
                    'adm-badge--warn': h.log.status === 'running',
                    'adm-badge--danger': h.log.status === 'failed',
                  }">
                    <span v-if="h.log.status === 'running'" class="pulse"></span>
                    {{ h.log.status }}
                  </span>
                  <span class="dash__health-when">{{ relTime(h.log.started_at) }}</span>
                </template>
                <template v-else>
                  <span class="adm-badge adm-badge--mute">never ran</span>
                  <span class="dash__health-when">—</span>
                </template>
              </li>
            </ul>
          </section>

          <!-- Quick actions -->
          <section class="adm-card adm-card--pad dash__panel">
            <div class="dash__panel-head">
              <h2 class="dash__panel-title">Quick actions</h2>
            </div>
            <div class="dash__actions">
              <router-link to="/admin/imports" class="dash__action">Run imports</router-link>
              <router-link to="/admin/featured" class="dash__action">Edit banner</router-link>
              <router-link to="/admin/articles" class="dash__action">New article</router-link>
              <router-link to="/admin/products" class="dash__action">New product</router-link>
              <router-link to="/admin/footer-links" class="dash__action">Footer links</router-link>
              <router-link to="/admin/settings" class="dash__action">API keys</router-link>
            </div>
          </section>
        </div>

        <!-- Recent imports -->
        <section class="dash__section">
          <div class="dash__panel-head" style="margin-bottom: 14px">
            <h2 class="dash__panel-title">Recent imports</h2>
            <router-link to="/admin/imports" class="dash__panel-link">View all →</router-link>
          </div>
          <div v-if="lastImports.length === 0" class="adm-empty">No imports yet — run the first one from the Imports page.</div>
          <div v-else class="adm-table-wrap">
            <table class="adm-table">
              <thead>
                <tr><th>Source</th><th>Status</th><th>Created</th><th>Updated</th><th>Started</th></tr>
              </thead>
              <tbody>
                <tr v-for="l in lastImports" :key="l.id">
                  <td style="text-transform: capitalize">{{ l.source }}</td>
                  <td>
                    <span class="adm-badge" :class="{
                      'adm-badge--ok': l.status === 'completed',
                      'adm-badge--warn': l.status === 'running',
                      'adm-badge--danger': l.status === 'failed',
                    }">{{ l.status }}</span>
                  </td>
                  <td>{{ l.items_created }}</td>
                  <td>{{ l.items_updated }}</td>
                  <td>{{ fmtDate(l.started_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
.dash__stats {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px;
  margin-bottom: 18px;
}
@media (max-width: 1080px) { .dash__stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .dash__stats { grid-template-columns: 1fr; } }

.dash__stat {
  position: relative; padding: 20px; display: flex; flex-direction: column; gap: 2px;
  text-decoration: none; color: var(--adm-ink);
  animation: admPageIn 420ms var(--adm-ease) both;
  animation-delay: calc(var(--d, 0) * 60ms);
}
.dash__stat-ring { position: relative; width: 44px; height: 44px; margin-bottom: 14px; display: block; }
.dash__stat-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.dash__stat-ring .bg { fill: none; stroke: var(--adm-line); stroke-width: 2.5; }
.dash__stat-ring .fg {
  fill: none; stroke: var(--adm-teal); stroke-width: 2.5; stroke-linecap: round;
  stroke-dasharray: 82 113; stroke-dashoffset: 113;
  animation: dashRing 900ms var(--adm-ease) forwards;
  animation-delay: calc(var(--d, 0) * 60ms + 200ms);
}
@keyframes dashRing { to { stroke-dashoffset: 31; } }
.dash__stat-icon {
  position: absolute; inset: 0; display: grid; place-items: center; color: var(--adm-teal-deep);
}
.dash__stat-icon svg { width: 17px; height: 17px; }

.dash__stat-num {
  font-family: var(--font-display); font-size: 34px; font-weight: 700;
  line-height: 1; letter-spacing: -0.02em; color: var(--adm-ink);
}
.dash__stat-label {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--adm-mute); margin-top: 6px;
}
.dash__stat-go {
  position: absolute; top: 18px; right: 18px; color: var(--adm-mute-2);
  transition: transform 200ms var(--adm-ease), color 200ms var(--adm-ease);
}
.dash__stat:hover .dash__stat-go { transform: translateX(3px); color: var(--adm-teal); }

.dash__grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 30px;
}
@media (max-width: 900px) { .dash__grid { grid-template-columns: 1fr; } }

.dash__panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
.dash__panel-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.dash__panel-link { font-family: var(--font-mono); font-size: 11.5px; color: var(--adm-teal-deep); text-decoration: none; }
.dash__panel-link:hover { text-decoration: underline; }

.dash__health { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.dash__health-row {
  display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 14px;
  padding: 12px 2px; border-bottom: 1px solid var(--adm-line);
}
.dash__health-row:last-child { border-bottom: none; }
.dash__health-source { font-weight: 550; font-size: 14px; text-transform: capitalize; }
.dash__health-when { font-family: var(--font-mono); font-size: 11px; color: var(--adm-mute); min-width: 72px; text-align: right; }

.dash__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dash__action {
  padding: 11px 14px; border-radius: 10px; border: 1px solid var(--adm-line);
  background: var(--adm-canvas); color: var(--adm-ink-soft);
  font-size: 13px; font-weight: 520; text-decoration: none; text-align: center;
  transition: border-color 160ms var(--adm-ease), background 160ms var(--adm-ease), color 160ms var(--adm-ease);
}
.dash__action:hover { border-color: var(--adm-teal); background: var(--adm-teal-mist); color: var(--adm-teal-deep); }

.dash__section { margin-bottom: 8px; }
</style>
