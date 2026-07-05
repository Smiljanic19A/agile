<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const GROUPS = [
  { id: 'explore',   name: 'Explore',   hint: 'On-page navigation — anchors like #contact work best.' },
  { id: 'ecosystem', name: 'Ecosystem', hint: 'Your platforms: Substack, Skool, Payhip, Amazon…' },
  { id: 'connect',   name: 'Connect',   hint: 'Social profiles and anywhere else people can reach you.' },
]

const links = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const editing = ref(null)      // { id|null, group, label, url, is_external, enabled }
const deleteConfirm = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    links.value = await api.admin.footerLinks()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const byGroup = computed(() => {
  const map = {}
  for (const g of GROUPS) map[g.id] = []
  for (const l of links.value) (map[l.group] ??= []).push(l)
  return map
})

function openNew(group) {
  editing.value = { id: null, group, label: '', url: '', is_external: group !== 'explore', enabled: true }
}
function openEdit(link) {
  editing.value = { ...link }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      group: editing.value.group,
      label: editing.value.label,
      url: editing.value.url,
      is_external: editing.value.is_external,
      enabled: editing.value.enabled,
      display_order: editing.value.id
        ? editing.value.display_order
        : byGroup.value[editing.value.group].length,
    }
    if (editing.value.id) await api.admin.updateFooterLink(editing.value.id, payload)
    else await api.admin.createFooterLink(payload)
    editing.value = null
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function toggleEnabled(link) {
  try {
    await api.admin.updateFooterLink(link.id, { ...pick(link), enabled: !link.enabled })
    link.enabled = !link.enabled
  } catch (e) { error.value = e.message }
}

function pick(l) {
  return { group: l.group, label: l.label, url: l.url, is_external: l.is_external, enabled: l.enabled, display_order: l.display_order }
}

async function move(link, dir) {
  const group = byGroup.value[link.group]
  const idx = group.findIndex((l) => l.id === link.id)
  const swap = group[idx + dir]
  if (!swap) return
  // reorder within group, then persist a global order (group by group)
  const reordered = [...group]
  reordered[idx] = swap
  reordered[idx + dir] = link
  const order = GROUPS.flatMap((g) => (g.id === link.group ? reordered : byGroup.value[g.id]).map((l) => l.id))
  try {
    links.value = await api.admin.reorderFooterLinks(order)
  } catch (e) { error.value = e.message }
}

async function confirmDelete() {
  if (!deleteConfirm.value) return
  try {
    await api.admin.deleteFooterLink(deleteConfirm.value.id)
    deleteConfirm.value = null
    await load()
  } catch (e) { error.value = e.message }
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page fl">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Content</p>
          <h1 class="adm-title">Footer links</h1>
          <p class="adm-sub">
            Everything in the site footer's three columns. Changes go live the moment you save.
          </p>
        </div>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Loading footer links…
      </div>

      <div v-else class="fl__cols">
        <section v-for="g in GROUPS" :key="g.id" class="adm-card fl__col">
          <header class="fl__col-head">
            <h2 class="fl__col-title">{{ g.name }}</h2>
            <button class="adm-btn adm-btn--sm" @click="openNew(g.id)">+ Add link</button>
          </header>
          <p class="fl__col-hint">{{ g.hint }}</p>

          <TransitionGroup tag="ul" name="fl-list" class="fl__list">
            <li v-for="(l, i) in byGroup[g.id]" :key="l.id" class="fl__item" :class="{ 'is-off': !l.enabled }">
              <div class="fl__item-order">
                <button class="fl__arrow" :disabled="i === 0" title="Move up" @click="move(l, -1)">↑</button>
                <button class="fl__arrow" :disabled="i === byGroup[g.id].length - 1" title="Move down" @click="move(l, 1)">↓</button>
              </div>
              <div class="fl__item-body" @click="openEdit(l)">
                <span class="fl__item-label">
                  {{ l.label }}
                  <svg v-if="l.is_external" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
                    <path d="M5 2H2.6A0.6 0.6 0 0 0 2 2.6v6.8a0.6 0.6 0 0 0 .6.6h6.8a0.6 0.6 0 0 0 .6-.6V7"/>
                    <path d="M7 1.5h3.5V5M10.5 1.5L5.5 6.5"/>
                  </svg>
                </span>
                <span class="fl__item-url">{{ l.url }}</span>
              </div>
              <label class="adm-switch" :title="l.enabled ? 'Shown in footer' : 'Hidden from footer'">
                <input type="checkbox" :checked="l.enabled" @change="toggleEnabled(l)" />
                <span class="track"></span>
              </label>
            </li>
          </TransitionGroup>

          <p v-if="byGroup[g.id].length === 0" class="fl__empty">No links yet — add the first one.</p>
        </section>
      </div>
    </div>

    <!-- Editor drawer -->
    <template v-if="editing">
      <div class="ap-admin">
        <div class="adm-drawer-bg" @click="editing = null"></div>
        <aside class="adm-drawer" role="dialog" aria-modal="true">
          <header class="adm-drawer__head">
            <h2>{{ editing.id ? 'Edit link' : 'New link' }}</h2>
            <button class="adm-close" aria-label="Close" @click="editing = null">
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </header>
          <form class="adm-drawer__body" @submit.prevent="save">
            <div class="adm-field">
              <label class="adm-label">Column</label>
              <div class="adm-seg">
                <button
                  v-for="g in GROUPS" :key="g.id" type="button"
                  :class="{ 'is-on': editing.group === g.id }"
                  @click="editing.group = g.id"
                >{{ g.name }}</button>
              </div>
            </div>
            <div class="adm-field">
              <label class="adm-label">Label <span class="req">*</span></label>
              <input v-model="editing.label" class="adm-input" required maxlength="80" placeholder="e.g. Skool Community" />
            </div>
            <div class="adm-field">
              <label class="adm-label">URL <span class="req">*</span></label>
              <input v-model="editing.url" class="adm-input adm-input--mono" required placeholder="https://… or #section-anchor" />
              <p class="adm-hint">Use <code>#anchors</code> for on-page sections, full URLs for everything else.</p>
            </div>
            <label class="adm-switch">
              <input v-model="editing.is_external" type="checkbox" />
              <span class="track"></span>
              <span class="lbl">External link — opens in a new tab with the ↗ marker</span>
            </label>
            <label class="adm-switch">
              <input v-model="editing.enabled" type="checkbox" />
              <span class="track"></span>
              <span class="lbl">Visible in the footer</span>
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
            <button class="adm-btn adm-btn--primary" :disabled="saving || !editing.label || !editing.url" @click="save">
              {{ saving ? 'Saving…' : editing.id ? 'Save link' : 'Add link' }}
            </button>
          </footer>
        </aside>
      </div>
    </template>

    <!-- Delete confirm -->
    <div v-if="deleteConfirm" class="ap-admin">
      <div class="adm-modal-bg" @click.self="deleteConfirm = null">
        <div class="adm-modal">
          <h3>Delete this link?</h3>
          <p><strong>{{ deleteConfirm.label }}</strong> will be removed from the footer. This cannot be undone.</p>
          <div class="adm-modal-actions">
            <button class="adm-btn" @click="deleteConfirm = null">Keep it</button>
            <button class="adm-btn adm-btn--danger" @click="confirmDelete(); editing = null">Delete link</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.fl__cols {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;
  align-items: start;
}
@media (max-width: 1080px) { .fl__cols { grid-template-columns: 1fr; } }

.fl__col { padding: 20px; }
.fl__col-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.fl__col-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.fl__col-hint { font-size: 12px; color: var(--adm-mute); line-height: 1.5; margin: 0 0 14px; }

.fl__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.fl__item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border: 1px solid var(--adm-line); border-radius: 12px;
  background: var(--adm-surface);
  transition: border-color 160ms var(--adm-ease), box-shadow 160ms var(--adm-ease), opacity 160ms var(--adm-ease);
}
.fl__item:hover { border-color: rgba(55, 136, 130, 0.45); box-shadow: var(--adm-shadow-sm); }
.fl__item.is-off { opacity: 0.5; }

.fl__item-order { display: flex; flex-direction: column; gap: 1px; flex-shrink: 0; }
.fl__arrow {
  width: 20px; height: 15px; display: grid; place-items: center;
  border: none; background: transparent; color: var(--adm-mute-2);
  font-size: 10px; line-height: 1; cursor: pointer; border-radius: 4px;
  transition: color 140ms, background 140ms;
}
.fl__arrow:hover:not(:disabled) { color: var(--adm-teal-deep); background: var(--adm-teal-mist); }
.fl__arrow:disabled { opacity: 0.25; cursor: default; }

.fl__item-body { flex: 1; min-width: 0; cursor: pointer; display: flex; flex-direction: column; gap: 1px; }
.fl__item-label {
  font-size: 13.5px; font-weight: 550; color: var(--adm-ink);
  display: inline-flex; align-items: center; gap: 5px;
}
.fl__item-label svg { color: var(--adm-mute-2); }
.fl__item-url {
  font-family: var(--font-mono); font-size: 10.5px; color: var(--adm-mute);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.fl__empty { font-size: 13px; color: var(--adm-mute); text-align: center; padding: 14px 0 6px; margin: 0; }

.fl-list-move { transition: transform 260ms var(--adm-ease); }
</style>
