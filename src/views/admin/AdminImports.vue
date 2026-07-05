<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const logs = ref([])
const settings = ref([])
const loading = ref(true)
const running = ref({ substack: false, payhip: false })
const error = ref('')
const lastResult = ref(null)

const substackFeed = computed(() => settings.value.find((s) => s.key === 'substack_feed_url'))
const payhipStore  = computed(() => settings.value.find((s) => s.key === 'payhip_store_url'))
const payhipKey    = computed(() => settings.value.find((s) => s.key === 'payhip_api_key'))

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [l, s] = await Promise.all([
      api.admin.imports(),
      api.admin.settings().catch(() => []),
    ])
    logs.value = l
    settings.value = s
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function refresh() {
  try { logs.value = await api.admin.imports() } catch (e) { error.value = e.message }
}

async function runImport(source) {
  running.value[source] = true
  error.value = ''
  lastResult.value = null
  try {
    const log = source === 'substack'
      ? await api.admin.importSubstack()
      : await api.admin.importPayhip()
    lastResult.value = log
  } catch (e) {
    lastResult.value = e.data?.id ? e.data : null
    if (!lastResult.value) error.value = e.message
  } finally {
    running.value[source] = false
    await refresh()
  }
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function duration(log) {
  if (!log.started_at || !log.completed_at) return '—'
  const ms = new Date(log.completed_at) - new Date(log.started_at)
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page ai">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Operations</p>
          <h1 class="adm-title">Imports</h1>
          <p class="adm-sub">
            Pull the latest content from your platforms. Sources and keys live in
            <router-link to="/admin/settings" class="ai__settings-link">API keys</router-link>.
          </p>
        </div>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <!-- Import cards -->
      <div class="ai__cards">
        <!-- Substack -->
        <article class="adm-card ai__card">
          <header class="ai__card-head">
            <div class="ai__card-id">
              <span class="ai__card-logo" aria-hidden="true">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 2.5h7l3 3V15.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z" stroke-linejoin="round"/><path d="M6.5 9h5M6.5 12h5"/></svg>
              </span>
              <div>
                <h2 class="ai__card-source">Substack → Articles</h2>
                <p class="ai__card-desc">Reads the public RSS feed. No key required.</p>
              </div>
            </div>
            <span class="adm-badge adm-badge--ok">Ready</span>
          </header>
          <p v-if="substackFeed?.value" class="ai__card-src">{{ substackFeed.value }}</p>
          <button class="adm-btn adm-btn--primary ai__run" :disabled="running.substack" @click="runImport('substack')">
            <span v-if="running.substack" class="adm-loop" style="width:16px;height:16px">
              <svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14"/></svg>
            </span>
            {{ running.substack ? 'Importing articles…' : 'Run Substack import' }}
          </button>
        </article>

        <!-- Payhip -->
        <article class="adm-card ai__card">
          <header class="ai__card-head">
            <div class="ai__card-id">
              <span class="ai__card-logo" aria-hidden="true">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 5.7L9 2.3l6.5 3.4v6.6L9 15.7l-6.5-3.4V5.7z"/><path d="M2.5 5.7L9 9m0 0l6.5-3.3M9 9v6.7"/></svg>
              </span>
              <div>
                <h2 class="ai__card-source">Payhip → Products</h2>
                <p class="ai__card-desc">Reads your public storefront — titles, prices, covers, links.</p>
              </div>
            </div>
            <span v-if="payhipKey?.has_value" class="adm-badge adm-badge--ok">Key configured</span>
            <router-link v-else to="/admin/settings" class="adm-badge adm-badge--warn ai__badge-link">Key optional — add</router-link>
          </header>
          <p v-if="payhipStore?.value" class="ai__card-src">{{ payhipStore.value }}</p>
          <button class="adm-btn adm-btn--primary ai__run" :disabled="running.payhip" @click="runImport('payhip')">
            <span v-if="running.payhip" class="adm-loop" style="width:16px;height:16px">
              <svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14"/></svg>
            </span>
            {{ running.payhip ? 'Importing products…' : 'Run Payhip import' }}
          </button>
        </article>

        <!-- Amazon (info only) -->
        <article class="adm-card ai__card ai__card--disabled">
          <header class="ai__card-head">
            <div class="ai__card-id">
              <span class="ai__card-logo" aria-hidden="true">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 6.5h12M3 6.5V14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6.5M3 6.5L4.5 3h9L15 6.5M7.5 9.5h3"/></svg>
              </span>
              <div>
                <h2 class="ai__card-source">Amazon → Books</h2>
                <p class="ai__card-desc">
                  PA-API access unlocks after Amazon Associates approval. Until then, manage books in
                  <router-link to="/admin/products">Products</router-link>.
                </p>
              </div>
            </div>
            <span class="adm-badge adm-badge--mute">Awaiting approval</span>
          </header>
        </article>

        <!-- Skool (info only) -->
        <article class="adm-card ai__card ai__card--disabled">
          <header class="ai__card-head">
            <div class="ai__card-id">
              <span class="ai__card-logo" aria-hidden="true">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6" r="2.6"/><circle cx="12" cy="7.5" r="2"/><path d="M2.5 14.5c.5-2.3 2-3.6 4-3.6s3.5 1.3 4 3.6M10.8 11.5c1.9.1 3.2 1.1 3.7 3"/></svg>
              </span>
              <div>
                <h2 class="ai__card-source">Skool → Community</h2>
                <p class="ai__card-desc">Skool has no public API. Community numbers stay hand-curated.</p>
              </div>
            </div>
            <span class="adm-badge adm-badge--mute">No API</span>
          </header>
        </article>
      </div>

      <!-- Last result -->
      <div v-if="lastResult" class="adm-alert" :class="lastResult.status === 'completed' ? 'adm-alert--ok' : 'adm-alert--danger'">
        <strong style="text-transform: capitalize">{{ lastResult.source }} import {{ lastResult.status }}</strong>
        <span v-if="lastResult.status === 'completed'">
          — found {{ lastResult.items_found }} · created {{ lastResult.items_created }} ·
          updated {{ lastResult.items_updated }} · skipped {{ lastResult.items_skipped }}
        </span>
        <span v-else>— {{ lastResult.error_message }}</span>
      </div>

      <!-- History -->
      <section class="ai__history">
        <div class="ai__history-head">
          <h2 class="ai__section-title">Import history</h2>
          <button class="adm-btn adm-btn--sm" @click="refresh">↻ Refresh</button>
        </div>

        <div v-if="loading" class="adm-loading">
          <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14"/></svg></span>
          Loading history…
        </div>

        <div v-else-if="logs.length > 0" class="adm-table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Source</th><th>Status</th><th>Found</th><th>Created</th>
                <th>Updated</th><th>Skipped</th><th>Duration</th><th>Started</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in logs" :key="l.id">
                <td style="text-transform: capitalize">{{ l.source }}</td>
                <td>
                  <span class="adm-badge" :class="{
                    'adm-badge--ok': l.status === 'completed',
                    'adm-badge--warn': l.status === 'running',
                    'adm-badge--danger': l.status === 'failed',
                  }">
                    <span v-if="l.status === 'running'" class="pulse"></span>
                    {{ l.status }}
                  </span>
                </td>
                <td>{{ l.items_found }}</td>
                <td>{{ l.items_created }}</td>
                <td>{{ l.items_updated }}</td>
                <td>{{ l.items_skipped }}</td>
                <td>{{ duration(l) }}</td>
                <td>{{ fmtDate(l.started_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="adm-empty">No import history yet — run the first import above.</p>
      </section>
    </div>
  </AdminLayout>
</template>

<style scoped>
.ai__settings-link { color: var(--adm-teal-deep); font-weight: 550; }
.ai__settings-link:hover { text-decoration: underline; }

.ai__cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
@media (max-width: 860px) { .ai__cards { grid-template-columns: 1fr; } }

.ai__card { padding: 22px; display: flex; flex-direction: column; gap: 16px; }
.ai__card--disabled { opacity: 0.62; }

.ai__card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.ai__card-id { display: flex; gap: 13px; align-items: flex-start; min-width: 0; }
.ai__card-logo {
  width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px;
  background: var(--adm-teal-mist); color: var(--adm-teal-deep);
  display: grid; place-items: center;
}
.ai__card-logo svg { width: 18px; height: 18px; }
.ai__card-source { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em; }
.ai__card-desc { font-size: 13px; color: var(--adm-mute); margin: 0; line-height: 1.55; }
.ai__card-desc a { color: var(--adm-teal-deep); font-weight: 500; }
.ai__card-desc a:hover { text-decoration: underline; }

.ai__card-src {
  font-family: var(--font-mono); font-size: 11px; color: var(--adm-mute);
  background: var(--adm-canvas); border: 1px solid var(--adm-line);
  padding: 7px 11px; border-radius: 8px; margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.ai__badge-link { text-decoration: none; cursor: pointer; }
.ai__badge-link:hover { filter: brightness(0.92); }

.ai__run { align-self: flex-start; }

.ai__history { margin-top: 10px; }
.ai__history-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.ai__section-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
</style>
