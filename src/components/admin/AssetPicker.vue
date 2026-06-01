<script setup>
import { computed, ref, watch } from 'vue'
import { ASSET_IMAGES } from '@/lib/assets.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  currentValue: { type: String, default: '' },
})
const emit = defineEmits(['close', 'selected'])

const MAX_UPLOAD_BYTES = 1024 * 1024  // 1 MB cap

const tab = ref('gallery')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return ASSET_IMAGES
  return ASSET_IMAGES.filter(
    (a) => a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q) || (a.tag || '').toLowerCase().includes(q)
  )
})

function selectAsset(asset) {
  emit('selected', asset.path)
  close()
}

// ── Upload state ─────────────────────────────────────────
const fileInputEl = ref(null)
const uploadPreview = ref(null)
const uploadName = ref('')
const uploadSize = ref(0)
const uploadError = ref('')
const dragging = ref(false)

function openFilePicker() { fileInputEl.value?.click() }

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
  e.target.value = '' // allow re-selecting same file
}

function onDrop(e) {
  e.preventDefault()
  dragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  uploadError.value = ''
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Only image files are supported (PNG, JPG, SVG, WebP).'
    return
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    uploadError.value = `Image too large (${fmtSize(file.size)}). Max 1 MB for browser-only storage.`
    return
  }
  uploadName.value = file.name
  uploadSize.value = file.size
  const reader = new FileReader()
  reader.onload = () => { uploadPreview.value = reader.result }
  reader.onerror = () => { uploadError.value = 'Could not read file.' }
  reader.readAsDataURL(file)
}

function commitUpload() {
  if (!uploadPreview.value) return
  emit('selected', uploadPreview.value)
  close()
}

function resetUpload() {
  uploadPreview.value = null
  uploadName.value = ''
  uploadSize.value = 0
  uploadError.value = ''
}

function close() {
  resetUpload()
  search.value = ''
  emit('close')
}

function fmtSize(b) {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 / 1024).toFixed(2) + ' MB'
}

// Close on escape
function onKey(e) { if (e.key === 'Escape' && props.open) close() }
watch(() => props.open, (now) => {
  if (now) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})

function isCurrent(path) {
  return props.currentValue && props.currentValue === path
}
</script>

<template>
  <Teleport to="body">
    <Transition name="picker">
      <div v-if="open" class="picker" @click.self="close" role="dialog" aria-modal="true" aria-label="Choose image">
        <div class="picker__modal">
          <header class="picker__head">
            <div>
              <p class="eyebrow">Choose image</p>
              <h2>{{ tab === 'gallery' ? 'Browse assets' : 'Upload image' }}</h2>
            </div>
            <button class="picker__close" @click="close" aria-label="Close">×</button>
          </header>

          <nav class="picker__tabs" role="tablist">
            <button :class="{ 'is-on': tab === 'gallery' }" @click="tab = 'gallery'" role="tab">Gallery</button>
            <button :class="{ 'is-on': tab === 'upload' }" @click="tab = 'upload'" role="tab">Upload</button>
          </nav>

          <div class="picker__body">
            <!-- ═════════ GALLERY ═════════ -->
            <section v-if="tab === 'gallery'" class="gallery">
              <div class="gallery__toolbar">
                <input class="gallery__search" type="search" v-model="search"
                       placeholder="Filter by name or path…" />
                <span class="gallery__count">{{ filtered.length }} / {{ ASSET_IMAGES.length }}</span>
              </div>
              <div v-if="filtered.length" class="gallery__grid">
                <button v-for="asset in filtered" :key="asset.path"
                        class="gallery__item"
                        :class="{ 'is-current': isCurrent(asset.path) }"
                        @click="selectAsset(asset)">
                  <div class="gallery__thumb">
                    <img :src="asset.path" :alt="asset.name" loading="lazy" />
                    <span v-if="isCurrent(asset.path)" class="gallery__current-badge">In use</span>
                  </div>
                  <div class="gallery__caption">
                    <span class="gallery__name">{{ asset.name }}</span>
                    <span class="gallery__tag">{{ asset.tag }}</span>
                  </div>
                </button>
              </div>
              <div v-else class="gallery__empty">
                <p>No assets match "<strong>{{ search }}</strong>".</p>
                <button class="button button-secondary button-small" @click="search = ''">Clear filter</button>
              </div>
              <p class="gallery__hint">
                The gallery reads from a manifest in <code>src/lib/assets.js</code>. To add an image to this list, drop the file into <code>/public/assets/images/</code> and append it to the manifest.
              </p>
            </section>

            <!-- ═════════ UPLOAD ═════════ -->
            <section v-if="tab === 'upload'" class="upload">
              <div v-if="!uploadPreview"
                   class="upload__zone"
                   :class="{ 'is-drag': dragging }"
                   @dragenter.prevent="dragging = true"
                   @dragover.prevent="dragging = true"
                   @dragleave.prevent="dragging = false"
                   @drop="onDrop"
                   @click="openFilePicker"
                   role="button"
                   tabindex="0"
                   @keydown.enter="openFilePicker">
                <div class="upload__zone-inner">
                  <p class="upload__zone-title">Drop an image here</p>
                  <p class="upload__zone-sub">or click to choose · PNG / JPG / SVG / WebP · max 1 MB</p>
                </div>
              </div>

              <div v-else class="upload__preview">
                <div class="upload__preview-frame">
                  <img :src="uploadPreview" alt="" />
                </div>
                <div class="upload__meta">
                  <p><strong>{{ uploadName }}</strong></p>
                  <p class="upload__meta-sub">{{ fmtSize(uploadSize) }} · stored as inline data URL</p>
                </div>
                <div class="upload__actions">
                  <button class="button button-secondary" @click="resetUpload">Choose another</button>
                  <button class="button button-primary" @click="commitUpload">
                    Use this image
                    <span class="arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </div>

              <input ref="fileInputEl" type="file" accept="image/*"
                     class="picker__file-input" @change="onFileChange" />

              <p v-if="uploadError" class="upload__error">{{ uploadError }}</p>

              <p class="upload__note">
                Uploads embed the image into the entry as a data URL — works only in this browser. For permanent / shared assets, drop the file into <code>/public/assets/images/</code> and use the Gallery tab.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.picker {
  position: fixed; inset: 0; z-index: 80;
  display: grid; place-items: center;
  background: rgba(14, 26, 24, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 24px;
}
.picker__modal {
  width: 100%;
  max-width: 880px;
  max-height: min(720px, calc(100svh - 48px));
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.picker__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.picker__head h2 {
  font-size: clamp(1.3rem, 2vw, 1.6rem);
  margin: 4px 0 0;
}
.picker__head .eyebrow { margin-bottom: 0; }
.picker__close {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  font-size: 1.4rem; line-height: 1;
  cursor: pointer;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.picker__close:hover { background: var(--cream); border-color: var(--ink); }

.picker__tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px 0;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.picker__tabs button {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-body);
  font-size: 0.94rem;
  font-weight: 500;
  color: var(--ink-quiet);
  cursor: pointer;
  transition: color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.picker__tabs button:hover { color: var(--ink); }
.picker__tabs button.is-on { color: var(--ink); border-bottom-color: var(--teal); }

.picker__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px 24px 24px;
}

.picker__file-input { display: none; }

/* ── Gallery ─────────────────────────────── */
.gallery__toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}
.gallery__search {
  flex: 1;
  padding: 11px 14px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.96rem;
}
.gallery__search:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18);
}
.gallery__count {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--ink-quiet);
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.gallery__item {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  transition: transform var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  padding: 0;
}
.gallery__item:hover {
  transform: translateY(-2px);
  border-color: var(--teal);
  box-shadow: var(--shadow);
}
.gallery__item.is-current {
  border-color: var(--teal);
  box-shadow: 0 0 0 2px var(--teal);
}

.gallery__thumb {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--cream);
  display: grid; place-items: center;
  overflow: hidden;
}
.gallery__thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.gallery__current-badge {
  position: absolute;
  top: 8px; right: 8px;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--teal);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.gallery__caption {
  padding: 10px 12px 12px;
  display: grid;
  gap: 2px;
  min-width: 0;
}
.gallery__name {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.92rem;
  color: var(--ink);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gallery__tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}

.gallery__empty {
  padding: 40px 0;
  text-align: center;
  display: grid;
  gap: 12px;
  justify-items: center;
  color: var(--ink-quiet);
}

.gallery__hint {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 0.82rem;
  color: var(--ink-quiet);
  line-height: 1.5;
}
.gallery__hint code {
  font-family: var(--font-mono);
  font-size: 0.78em;
  background: var(--cream);
  padding: 1px 5px;
  border-radius: 3px;
}

/* ── Upload ──────────────────────────────── */
.upload__zone {
  border: 2px dashed var(--line-strong);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  background: var(--cream);
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.upload__zone:hover,
.upload__zone.is-drag {
  border-color: var(--teal);
  background: var(--teal-fog);
}
.upload__zone-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.15rem;
  color: var(--ink);
  margin: 0 0 6px;
}
.upload__zone-sub {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--ink-quiet);
}

.upload__preview {
  display: grid;
  gap: 14px;
}
.upload__preview-frame {
  background: linear-gradient(135deg, var(--cream), var(--paper-warm));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  display: grid; place-items: center;
  min-height: 180px;
}
.upload__preview-frame img {
  max-width: 100%;
  max-height: 280px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
}
.upload__meta p { margin: 0; color: var(--ink-quiet); font-size: 0.92rem; }
.upload__meta strong { color: var(--ink); font-weight: 600; }
.upload__meta-sub { font-family: var(--font-mono); font-size: 0.8rem; }
.upload__actions {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;
}

.upload__error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(196, 106, 58, 0.1);
  border: 1px solid rgba(196, 106, 58, 0.3);
  color: var(--rust-deep);
  font-size: 0.9rem;
}
.upload__note {
  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 0.82rem;
  color: var(--ink-quiet);
  line-height: 1.5;
}
.upload__note code {
  font-family: var(--font-mono);
  font-size: 0.78em;
  background: var(--cream);
  padding: 1px 5px;
  border-radius: 3px;
}

/* ── Animations ──────────────────────────── */
.picker-enter-active, .picker-leave-active {
  transition: opacity 180ms var(--ease);
}
.picker-enter-active .picker__modal,
.picker-leave-active .picker__modal {
  transition: transform 220ms var(--ease), opacity 180ms var(--ease);
}
.picker-enter-from, .picker-leave-to { opacity: 0; }
.picker-enter-from .picker__modal,
.picker-leave-to .picker__modal { transform: scale(0.96) translateY(8px); opacity: 0; }

@media (max-width: 720px) {
  .picker { padding: 12px; }
  .picker__modal { max-height: calc(100svh - 24px); }
  .picker__head, .picker__body, .picker__tabs { padding-inline: 18px; }
  .gallery__grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .gallery__toolbar { flex-direction: column; align-items: stretch; }
}
</style>
