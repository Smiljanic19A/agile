<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const logs = ref([])
const loading = ref(true)
const running = ref({ substack: false, payhip: false })
const error = ref('')
const lastResult = ref(null)

onMounted(load)

async function load() {
  loading.value = true; error.value = ''
  try { logs.value = await api.admin.imports() }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
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
    await load()
  } catch (e) {
    error.value = e.message
    await load()
  } finally {
    running.value[source] = false
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
    <div class="ai">
      <header class="ai__header">
        <h1 class="ai__title">Imports</h1>
        <p class="ai__sub">Pull the latest content from external services.</p>
      </header>

      <!-- Import cards -->
      <div class="ai__cards">
        <!-- Substack -->
        <div class="ai__card">
          <div class="ai__card-head">
            <div>
              <p class="ai__card-source">Substack</p>
              <p class="ai__card-desc">Pulls articles from the public RSS feed. No API key required.</p>
            </div>
            <span class="ai__card-badge ai__card-badge--free">No key needed</span>
          </div>
          <button
            class="ai__run-btn"
            :disabled="running.substack"
            @click="runImport('substack')"
          >
            {{ running.substack ? 'Importing…' : 'Run Substack import' }}
          </button>
        </div>

        <!-- Payhip -->
        <div class="ai__card">
          <div class="ai__card-head">
            <div>
              <p class="ai__card-source">Payhip</p>
              <p class="ai__card-desc">Pulls products via the Payhip REST API. Requires <code>PAYHIP_API_KEY</code>.</p>
            </div>
            <span class="ai__card-badge ai__card-badge--key">API key required</span>
          </div>
          <button
            class="ai__run-btn"
            :disabled="running.payhip"
            @click="runImport('payhip')"
          >
            {{ running.payhip ? 'Importing…' : 'Run Payhip import' }}
          </button>
        </div>

        <!-- Amazon (info only) -->
        <div class="ai__card ai__card--disabled">
          <div class="ai__card-head">
            <div>
              <p class="ai__card-source">Amazon</p>
              <p class="ai__card-desc">
                Amazon PA-API 5.0 requires an active Associates account with qualifying sales before API access is granted.
                Until approved, manage books manually in the <router-link to="/admin/products">Products</router-link> section.
              </p>
            </div>
            <span class="ai__card-badge ai__card-badge--unavail">Not yet available</span>
          </div>
        </div>

        <!-- Skool (info only) -->
        <div class="ai__card ai__card--disabled">
          <div class="ai__card-head">
            <div>
              <p class="ai__card-source">Skool</p>
              <p class="ai__card-desc">
                Skool has no public API as of mid-2026. Community stats must be updated manually.
              </p>
            </div>
            <span class="ai__card-badge ai__card-badge--unavail">No API</span>
          </div>
        </div>
      </div>

      <!-- Last result -->
      <div v-if="lastResult" class="ai__result" :class="`ai__result--${lastResult.status}`">
        <strong>{{ lastResult.source }} import {{ lastResult.status }}</strong>
        <span v-if="lastResult.status === 'completed'">
          — Found: {{ lastResult.items_found }} · Created: {{ lastResult.items_created }} · Updated: {{ lastResult.items_updated }} · Skipped: {{ lastResult.items_skipped }}
        </span>
        <span v-else>— {{ lastResult.error_message }}</span>
      </div>

      <p v-if="error" class="ai__error">{{ error }}</p>

      <!-- History -->
      <section class="ai__history">
        <div class="ai__history-head">
          <h2 class="ai__section-title">Import history</h2>
          <button class="ai__refresh" @click="load">↻ Refresh</button>
        </div>

        <div v-if="loading" class="ai__loading">Loading…</div>

        <table v-else-if="logs.length > 0" class="ai__table">
          <thead>
            <tr>
              <th>Source</th><th>Status</th><th>Found</th><th>Created</th>
              <th>Updated</th><th>Skipped</th><th>Duration</th><th>Started</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id">
              <td>{{ l.source }}</td>
              <td><span class="ai__badge" :class="`ai__badge--${l.status}`">{{ l.status }}</span></td>
              <td>{{ l.items_found }}</td>
              <td>{{ l.items_created }}</td>
              <td>{{ l.items_updated }}</td>
              <td>{{ l.items_skipped }}</td>
              <td>{{ duration(l) }}</td>
              <td>{{ fmtDate(l.started_at) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="ai__empty">No import history yet.</p>
      </section>
    </div>
  </AdminLayout>
</template>

<style scoped>
.ai { padding: 40px 48px; max-width: 960px; }
.ai__header { margin-bottom: 32px; }
.ai__title { font-family: var(--font-display); font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: var(--ink); margin: 0 0 6px; }
.ai__sub { color: var(--ink-soft); margin: 0; }

.ai__cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.ai__card {
  border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
}
.ai__card--disabled { opacity: 0.6; }
.ai__card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ai__card-source { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); margin: 0 0 6px; }
.ai__card-desc { font-size: 13px; color: var(--ink-soft); margin: 0; line-height: 1.5; }
.ai__card-desc code { font-family: var(--font-mono); font-size: 11px; background: rgba(14,26,26,0.06); padding: 2px 5px; border-radius: 4px; }
.ai__card-desc a { color: var(--teal); }

.ai__card-badge { flex-shrink: 0; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
.ai__card-badge--free    { background: rgba(55,136,130,0.1);  color: var(--teal-deep); }
.ai__card-badge--key     { background: rgba(234,179,8,0.1);   color: #92400e; }
.ai__card-badge--unavail { background: rgba(14,26,26,0.06);   color: var(--ink-soft); }

.ai__run-btn {
  display: inline-block; padding: 11px 20px; background: var(--teal); color: #f3f3f3;
  border: none; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background 140ms; align-self: flex-start;
}
.ai__run-btn:hover:not(:disabled) { background: var(--teal-deep); }
.ai__run-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.ai__result { padding: 14px 18px; border-radius: var(--radius); font-size: 14px; margin-bottom: 24px; }
.ai__result--completed { background: rgba(55,136,130,0.08); color: var(--teal-deep); border: 1px solid rgba(55,136,130,0.2); }
.ai__result--failed    { background: rgba(239,68,68,0.06);  color: #991b1b;         border: 1px solid rgba(239,68,68,0.2); }
.ai__error { color: #dc2626; font-size: 13px; margin-bottom: 16px; }

.ai__history { margin-top: 8px; }
.ai__history-head { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.ai__section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); margin: 0; }
.ai__refresh { background: none; border: 1px solid var(--hairline-strong); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--ink-soft); cursor: pointer; }
.ai__refresh:hover { color: var(--teal); border-color: var(--teal); }
.ai__loading { color: var(--ink-soft); font-size: 14px; }
.ai__empty { color: var(--ink-soft); font-size: 14px; }

.ai__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ai__table th { text-align: left; padding: 8px 12px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); border-bottom: 2px solid var(--hairline); }
.ai__table td { padding: 10px 12px; border-bottom: 1px solid var(--hairline); color: var(--ink); }

.ai__badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.ai__badge--completed { background: rgba(55,136,130,0.12); color: var(--teal-deep); }
.ai__badge--running   { background: rgba(250,204,21,0.15); color: #92400e; }
.ai__badge--failed    { background: rgba(239,68,68,0.1);  color: #991b1b; }

@media (max-width: 720px) {
  .ai { padding: 24px 20px; }
  .ai__cards { grid-template-columns: 1fr; }
}
</style>
