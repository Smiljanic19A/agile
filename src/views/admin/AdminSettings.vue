<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const KEY_META = {
  payhip_api_key: {
    name: 'Payhip API key',
    service: 'Payhip',
    desc: 'Authenticates against the Payhip developer API. Products are imported from your public storefront, so imports run even without a key — the key lets the panel verify your account connection.',
    placeholder: 'Paste your Payhip API key…',
    href: 'https://payhip.com/settings/developer',
    verifiable: true,
  },
  payhip_store_url: {
    name: 'Payhip store URL',
    service: 'Payhip',
    desc: 'The public storefront the product import reads from.',
    placeholder: 'https://payhip.com/your-store',
    href: null,
    verifiable: false,
  },
  substack_feed_url: {
    name: 'Substack feed URL',
    service: 'Substack',
    desc: 'The RSS feed the article import reads from. No key required — Substack feeds are public.',
    placeholder: 'https://yourname.substack.com/feed',
    href: null,
    verifiable: false,
  },
  amazon_api_key: {
    name: 'Amazon PA-API key',
    service: 'Amazon',
    desc: 'Reserved for the Amazon Product Advertising API. Store it now — the import switches on once Amazon approves Associates API access.',
    placeholder: 'Paste your Amazon PA-API key…',
    href: 'https://affiliate-program.amazon.com/assoc_credentials/home',
    verifiable: false,
  },
}

const settings = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const savedFlash = ref(false)
const verify = ref({ busy: false, ok: null, message: '' })
const touched = ref({})

const rows = computed(() =>
  settings.value
    .filter((s) => KEY_META[s.key])
    .map((s) => ({ ...s, meta: KEY_META[s.key] }))
)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    settings.value = await api.admin.settings()
    touched.value = {}
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function markTouched(key) {
  touched.value[key] = true
  savedFlash.value = false
}

function clearKey(row) {
  row.value = ''
  markTouched(row.key)
}

async function saveAll() {
  saving.value = true
  error.value = ''
  try {
    const payload = settings.value.map((s) => ({ key: s.key, value: s.value ?? '' }))
    settings.value = await api.admin.updateSettings(payload)
    touched.value = {}
    savedFlash.value = true
    setTimeout(() => (savedFlash.value = false), 2600)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function verifyPayhip() {
  verify.value = { busy: true, ok: null, message: '' }
  try {
    const res = await api.admin.verifyPayhipKey()
    verify.value = { busy: false, ok: res.ok, message: res.message }
  } catch (e) {
    verify.value = { busy: false, ok: false, message: e.data?.message || e.message }
  }
}

const dirty = computed(() => Object.keys(touched.value).length > 0)
</script>

<template>
  <AdminLayout>
    <div class="adm-page st">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Operations</p>
          <h1 class="adm-title">API keys &amp; sources</h1>
          <p class="adm-sub">
            Credentials and source URLs the imports run on. Keys are stored server-side and
            masked here — paste a new value to replace one.
          </p>
        </div>
        <div class="st__head-actions">
          <transition name="st-flash">
            <span v-if="savedFlash" class="adm-badge adm-badge--ok">Saved</span>
          </transition>
          <button class="adm-btn adm-btn--primary" :disabled="saving || !dirty" @click="saveAll">
            <span v-if="saving" class="adm-loop" style="width:16px;height:16px">
              <svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg>
            </span>
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Loading keys…
      </div>

      <div v-else class="st__list">
        <article v-for="row in rows" :key="row.key" class="adm-card st__card" :class="{ 'is-touched': touched[row.key] }">
          <div class="st__card-main">
            <div class="st__card-head">
              <span class="st__service">{{ row.meta.service }}</span>
              <h2 class="st__name">{{ row.meta.name }}</h2>
              <span v-if="row.has_value && !touched[row.key]" class="adm-badge adm-badge--ok">
                {{ row.from_env ? 'Set via environment' : 'Configured' }}
              </span>
              <span v-else-if="!row.has_value && !touched[row.key]" class="adm-badge adm-badge--mute">Not set</span>
              <span v-else class="adm-badge adm-badge--warn">Unsaved</span>
            </div>
            <p class="st__desc">
              {{ row.meta.desc }}
              <a v-if="row.meta.href" :href="row.meta.href" target="_blank" rel="noopener" class="st__where">
                Where do I find this? ↗
              </a>
            </p>

            <div class="st__input-row">
              <div class="st__input-wrap">
                <svg v-if="row.is_secret" class="st__input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="5.4" cy="10.6" r="3"/><path d="M7.6 8.4L13.4 2.6m-2.2 2.2l1.8 1.8M9.4 6.6l1.8 1.8"/>
                </svg>
                <svg v-else class="st__input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
                  <circle cx="8" cy="8" r="6"/><path d="M2.5 8h11M8 2.2c1.7 1.6 2.6 3.6 2.6 5.8S9.7 12.2 8 13.8M8 2.2C6.3 3.8 5.4 5.8 5.4 8s.9 4.2 2.6 5.8"/>
                </svg>
                <input
                  v-model="row.value"
                  :type="'text'"
                  class="adm-input adm-input--mono st__input"
                  :placeholder="row.meta.placeholder"
                  spellcheck="false"
                  autocomplete="off"
                  @input="markTouched(row.key)"
                />
              </div>
              <button
                v-if="row.value"
                class="adm-btn adm-btn--ghost adm-btn--sm"
                title="Clear value"
                @click="clearKey(row)"
              >Clear</button>
              <button
                v-if="row.meta.verifiable"
                class="adm-btn adm-btn--sm"
                :disabled="verify.busy || touched[row.key]"
                :title="touched[row.key] ? 'Save first, then verify' : 'Check this key against Payhip'"
                @click="verifyPayhip"
              >
                {{ verify.busy ? 'Checking…' : 'Verify' }}
              </button>
            </div>

            <p
              v-if="row.meta.verifiable && verify.ok !== null"
              class="adm-alert st__verify"
              :class="verify.ok ? 'adm-alert--ok' : 'adm-alert--danger'"
            >
              {{ verify.message }}
            </p>
          </div>
        </article>
      </div>

      <div class="st__note adm-card adm-card--pad">
        <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <circle cx="9" cy="9" r="7"/><path d="M9 8v4.2M9 5.6v.2"/>
        </svg>
        <p>
          Values saved here take precedence over server environment variables. Secrets are
          never sent back in full — only the last four characters are shown once saved.
        </p>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.st__head-actions { display: flex; align-items: center; gap: 12px; }

.st__list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px; }

.st__card { padding: 22px 24px; position: relative; overflow: hidden; }
.st__card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: transparent; transition: background 220ms var(--adm-ease);
}
.st__card.is-touched::before { background: var(--adm-teal); }

.st__card-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
.st__service {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--adm-teal);
  background: var(--adm-teal-mist); padding: 3px 9px; border-radius: 999px;
}
.st__name { font-family: var(--font-display); font-size: 17px; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
.st__desc { font-size: 13.5px; color: var(--adm-mute); line-height: 1.6; margin: 0 0 16px; max-width: 72ch; }
.st__where { color: var(--adm-teal-deep); font-weight: 500; margin-left: 6px; white-space: nowrap; }
.st__where:hover { text-decoration: underline; }

.st__input-row { display: flex; gap: 10px; align-items: center; }
.st__input-wrap { position: relative; flex: 1; min-width: 0; }
.st__input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: var(--adm-mute-2); pointer-events: none;
}
.st__input { padding-left: 38px; }

.st__verify { margin: 12px 0 0; }

.st__note {
  display: flex; gap: 12px; align-items: flex-start;
  color: var(--adm-mute); background: var(--adm-surface);
}
.st__note svg { flex-shrink: 0; margin-top: 2px; color: var(--adm-teal); }
.st__note p { font-size: 13px; line-height: 1.6; margin: 0; }

.st-flash-enter-active, .st-flash-leave-active { transition: opacity 300ms, transform 300ms; }
.st-flash-enter-from, .st-flash-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 640px) {
  .st__input-row { flex-wrap: wrap; }
}
</style>
