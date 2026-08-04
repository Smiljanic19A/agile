<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import ImageField from '@/components/admin/ImageField.vue'
import { api } from '@/lib/api.js'

const loading = ref(true)
const error = ref('')
const saving = ref(false)
const savedFlash = ref(false)

const form = ref({
  photo_url: '',
  title: { en: '', sr: '' },
  text: { en: '', sr: '' },
  bullets: [],
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const bio = await api.contactBio()
    form.value = {
      photo_url: bio.photo_url || '',
      title: { en: bio.title?.en || '', sr: bio.title?.sr || '' },
      text: { en: bio.text?.en || '', sr: bio.text?.sr || '' },
      bullets: (bio.bullets || []).map((b) => ({ en: b.en || '', sr: b.sr || '' })),
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function addBullet() {
  form.value.bullets.push({ en: '', sr: '' })
}
function removeBullet(i) {
  form.value.bullets.splice(i, 1)
}
function moveBullet(i, dir) {
  const j = i + dir
  if (j < 0 || j >= form.value.bullets.length) return
  const list = form.value.bullets
  ;[list[i], list[j]] = [list[j], list[i]]
}

const problems = computed(() => {
  const out = []
  if (!form.value.title.en.trim() || !form.value.title.sr.trim()) out.push('Title needs both EN and SR.')
  if (!form.value.text.en.trim() || !form.value.text.sr.trim()) out.push('Intro text needs both EN and SR.')
  form.value.bullets.forEach((b, i) => {
    if (!b.en.trim() || !b.sr.trim()) out.push(`Bullet ${i + 1} needs both EN and SR.`)
  })
  return out
})

async function save() {
  if (problems.value.length) {
    error.value = problems.value[0]
    return
  }
  saving.value = true
  error.value = ''
  try {
    const bio = await api.admin.updateContactBio(form.value)
    form.value = {
      photo_url: bio.photo_url || '',
      title: { en: bio.title.en, sr: bio.title.sr },
      text: { en: bio.text.en, sr: bio.text.sr },
      bullets: bio.bullets.map((b) => ({ en: b.en, sr: b.sr })),
    }
    savedFlash.value = true
    setTimeout(() => (savedFlash.value = false), 1800)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page bio">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Content</p>
          <h1 class="adm-title">Contact Bio</h1>
          <p class="adm-sub">
            The "why trust this?" card next to the contact form — headshot, title, intro text, and the
            credential bullets. Every text is bilingual: fill in both EN and SR.
          </p>
        </div>
        <button class="adm-btn adm-btn--primary" :disabled="saving || loading" @click="save">
          {{ saving ? 'Saving…' : savedFlash ? 'Saved ✓' : 'Save changes' }}
        </button>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Loading bio…
      </div>

      <template v-else>
        <div class="adm-card bio__card">
          <ImageField
            v-model="form.photo_url"
            label="Headshot"
            hint="Shown above the bio. Leave the default path in place to keep the current photo."
          />
        </div>

        <div class="adm-card bio__card">
          <p class="bio__legend">Title</p>
          <div class="bio__pair">
            <label class="bio__lang">
              <span class="bio__chip">EN</span>
              <input v-model="form.title.en" class="adm-input" placeholder="Built by a coach…" />
            </label>
            <label class="bio__lang">
              <span class="bio__chip">SR</span>
              <input v-model="form.title.sr" class="adm-input" placeholder="Napravio trener…" />
            </label>
          </div>

          <p class="bio__legend">Intro text</p>
          <div class="bio__pair">
            <label class="bio__lang">
              <span class="bio__chip">EN</span>
              <textarea v-model="form.text.en" class="adm-input bio__textarea" rows="3"></textarea>
            </label>
            <label class="bio__lang">
              <span class="bio__chip">SR</span>
              <textarea v-model="form.text.sr" class="adm-input bio__textarea" rows="3"></textarea>
            </label>
          </div>
        </div>

        <div class="adm-card bio__card">
          <div class="bio__bullets-head">
            <p class="bio__legend">Credential bullets</p>
            <button class="adm-btn adm-btn--sm" @click="addBullet">+ Add bullet</button>
          </div>
          <p class="adm-hint bio__bullets-hint">
            Each bullet is one line in the "—" list. Both languages are required per bullet.
          </p>

          <div v-if="!form.bullets.length" class="bio__empty">No bullets — the list is hidden on the site.</div>

          <div v-for="(b, i) in form.bullets" :key="i" class="bio__bullet">
            <span class="bio__bullet-num">{{ i + 1 }}</span>
            <div class="bio__pair bio__pair--grow">
              <label class="bio__lang">
                <span class="bio__chip">EN</span>
                <input v-model="b.en" class="adm-input" placeholder="Head of Performance…" />
              </label>
              <label class="bio__lang">
                <span class="bio__chip">SR</span>
                <input v-model="b.sr" class="adm-input" placeholder="Šef pripreme…" />
              </label>
            </div>
            <div class="bio__bullet-tools">
              <button class="bio__tool" :disabled="i === 0" title="Move up" @click="moveBullet(i, -1)">↑</button>
              <button class="bio__tool" :disabled="i === form.bullets.length - 1" title="Move down" @click="moveBullet(i, 1)">↓</button>
              <button class="bio__tool bio__tool--danger" title="Remove" @click="removeBullet(i)">✕</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
.bio__card { padding: 20px 22px; margin-bottom: 16px; display: block; }

.bio__legend {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--adm-mute);
  margin: 0 0 10px;
}
.bio__legend + .bio__pair { margin-bottom: 20px; }
.bio__card > .bio__pair:last-child { margin-bottom: 0; }

.bio__pair {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.bio__pair--grow { flex: 1; min-width: 0; }

.bio__lang { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.bio__lang .adm-input { flex: 1; min-width: 0; }
.bio__chip {
  flex-shrink: 0; margin-top: 9px;
  font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em;
  color: var(--adm-teal-deep); background: var(--adm-teal-mist);
  border: 1px solid rgba(55, 136, 130, 0.25); border-radius: 6px;
  padding: 2px 5px;
}
.bio__textarea { resize: vertical; min-height: 72px; font-family: var(--font-body); }

.bio__bullets-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bio__bullets-head .bio__legend { margin-bottom: 0; }
.bio__bullets-hint { margin: 8px 0 16px; }

.bio__empty {
  font-size: 13px; color: var(--adm-mute);
  border: 1px dashed var(--adm-line); border-radius: 10px;
  padding: 18px; text-align: center;
}

.bio__bullet {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--adm-line);
}
.bio__bullet-num {
  flex-shrink: 0; width: 22px; height: 22px; margin-top: 7px;
  display: grid; place-items: center;
  font-family: var(--font-mono); font-size: 10.5px; color: var(--adm-mute);
  border: 1px solid var(--adm-line); border-radius: 50%;
}
.bio__bullet-tools { display: flex; gap: 4px; flex-shrink: 0; margin-top: 4px; }
.bio__tool {
  width: 28px; height: 28px;
  border: 1px solid var(--adm-line); border-radius: 7px;
  background: var(--adm-surface); color: var(--adm-ink-soft);
  font-size: 12px; cursor: pointer;
  transition: color 140ms, border-color 140ms, background 140ms;
}
.bio__tool:hover:not(:disabled) { color: var(--adm-teal-deep); border-color: var(--adm-teal); background: var(--adm-teal-mist); }
.bio__tool:disabled { opacity: 0.35; cursor: default; }
.bio__tool--danger:hover:not(:disabled) { color: #b3402a; border-color: rgba(179, 64, 42, 0.4); background: rgba(179, 64, 42, 0.06); }

@media (max-width: 860px) {
  .bio__pair { grid-template-columns: 1fr; }
  .bio__bullet { flex-wrap: wrap; }
}
</style>
