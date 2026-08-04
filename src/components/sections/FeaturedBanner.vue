<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeaturedStore } from '@/stores/featured.js'
import { youtubeEmbedUrl } from '@/lib/youtube.js'

const featured = useFeaturedStore()
const { activeEntries } = storeToRefs(featured)

const idx = ref(0)
const n = computed(() => activeEntries.value.length)
const hasMany = computed(() => n.value > 1)

const dragX = ref(0)
const dragging = ref(false)
const containerWidth = ref(0)
const trackEl = ref(null)

function measure() {
  if (trackEl.value) containerWidth.value = trackEl.value.clientWidth
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  if (hasMany.value) startAutoplay()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  stopAutoplay()
})

const trackStyle = computed(() => ({
  width: `${n.value * 100}%`,
  transform: `translateX(calc(${-idx.value * (100 / n.value)}% + ${dragX.value}px))`,
  transition: dragging.value ? 'none' : 'transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1)',
}))
const slideWidth = computed(() => `${100 / Math.max(1, n.value)}%`)

function goTo(i) { idx.value = (i + n.value) % n.value; restartAutoplay() }
function next()  { goTo(idx.value + 1) }
function prev()  { goTo(idx.value - 1) }

function videoSrc(entry) {
  return youtubeEmbedUrl(entry.videoUrl)
}
function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '').trim()
}
// "YouTube video" is the admin's auto-filled placeholder title — not real copy.
function videoTitle(entry) {
  const t = stripHtml(entry.title)
  return t && t.toLowerCase() !== 'youtube video' ? entry.title : ''
}
function videoHasText(entry) {
  return entry.showText !== false && !!(videoTitle(entry) || entry.description || entry.badge || entry.type)
}
const activeIsVideo = computed(() => {
  const entry = activeEntries.value[idx.value]
  return !!(entry && videoSrc(entry))
})

let autoplayId = null
function startAutoplay() {
  if (!hasMany.value || activeIsVideo.value) return
  stopAutoplay()
  autoplayId = setInterval(() => { idx.value = (idx.value + 1) % n.value }, 7500)
}
function stopAutoplay() {
  if (autoplayId) { clearInterval(autoplayId); autoplayId = null }
}
function restartAutoplay() { stopAutoplay(); startAutoplay() }

function onKey(e) {
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
}

let startX = 0, startY = 0, isHorizontal = null
function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isHorizontal = null
  dragging.value = true
  dragX.value = 0
  stopAutoplay()
}
function onTouchMove(e) {
  if (!dragging.value) return
  const dx = e.touches[0].clientX - startX
  const dy = e.touches[0].clientY - startY
  if (isHorizontal === null) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    isHorizontal = Math.abs(dx) > Math.abs(dy)
  }
  if (!isHorizontal) {
    dragging.value = false
    dragX.value = 0
    return
  }
  e.preventDefault()
  const atStart = idx.value === 0 && dx > 0
  const atEnd   = idx.value === n.value - 1 && dx < 0
  dragX.value = (atStart || atEnd) ? dx * 0.2 : dx
}
function onTouchEnd() {
  if (!dragging.value) return
  const committed = dragX.value
  dragging.value = false
  requestAnimationFrame(() => {
    if (committed < -56) next()
    else if (committed > 56) prev()
    else dragX.value = 0
    if (committed >= -56 && committed <= 56) dragX.value = 0
  })
  restartAutoplay()
}

watch(idx, () => { dragX.value = 0 })

// Video slides are meant to be watched — don't auto-advance away from them.
watch(activeIsVideo, (isVideo) => {
  if (isVideo) stopAutoplay()
  else startAutoplay()
})

// Reset to first slide if entries change (e.g., admin removed one)
watch(n, (next) => {
  if (idx.value >= next) idx.value = Math.max(0, next - 1)
})

function titleStyle(entry) {
  const s = {}
  if (entry.titleColor)  s.color = entry.titleColor
  if (entry.accentColor) s['--em-color'] = entry.accentColor
  return s
}
function descStyle(entry) {
  const s = {}
  if (entry.descColor)   s.color = entry.descColor
  if (entry.accentColor) s['--em-color'] = entry.accentColor
  return s
}
</script>

<template>
  <section
    v-if="hasMany || n === 1"
    id="featured"
    class="banner"
    role="region"
    aria-label="Featured spotlight"
    tabindex="0"
    @keydown="onKey"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <div class="banner__viewport" ref="trackEl">
      <div class="banner__track" :style="trackStyle">
        <article
          v-for="entry in activeEntries"
          :key="entry.id"
          class="banner__slide"
          :class="[
            'layout-' + (entry.layout || 'overlay'),
            'align-' + (entry.textAlign || 'left'),
            entry.layout === 'overlay' ? 'v-' + (entry.verticalAlign || 'bottom') : '',
          ]"
          :style="{ width: slideWidth }"
        >
          <!-- ── VIDEO (YouTube embed; optional text beside it) ── -->
          <template v-if="videoSrc(entry)">
            <div class="container banner__video-wrap" :class="{ 'has-text': videoHasText(entry) }">
              <div v-if="videoHasText(entry)" class="banner__split-text banner__video-text">
                <div class="banner__meta" v-if="entry.badge || entry.type">
                  <span v-if="entry.badge" class="banner__badge">{{ entry.badge }}</span>
                  <span v-if="entry.type" class="banner__type">{{ entry.type }}</span>
                </div>
                <h2 v-if="videoTitle(entry)" class="banner__title" :style="titleStyle(entry)" v-html="videoTitle(entry)"></h2>
                <div v-if="entry.description" class="banner__desc" :style="descStyle(entry)" v-html="entry.description"></div>
                <div class="banner__actions" v-if="entry.showCta !== false && entry.ctaUrl">
                  <a class="button button-primary" :href="entry.ctaUrl" target="_blank" rel="noopener">
                    {{ entry.ctaLabel || 'Learn more' }}
                    <span class="arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div class="banner__video">
                <iframe
                  :src="videoSrc(entry)"
                  title="Featured video"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
              <div
                v-if="!videoHasText(entry) && entry.showCta !== false && entry.ctaUrl"
                class="banner__actions banner__video-cta"
              >
                <a class="button button-primary" :href="entry.ctaUrl" target="_blank" rel="noopener">
                  {{ entry.ctaLabel || 'Learn more' }}
                  <span class="arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </template>

          <!-- ── OVERLAY ─────────────────────────────────────── -->
          <template v-else-if="entry.layout === 'overlay' || !entry.layout">
            <div class="banner__bg" aria-hidden="true">
              <img v-if="entry.image" :src="entry.image" :alt="''" />
              <div class="banner__scrim" />
            </div>
            <div class="container banner__overlay-body">
              <template v-if="entry.showText !== false">
                <div class="banner__meta">
                  <span v-if="entry.badge" class="banner__badge">{{ entry.badge }}</span>
                  <span v-if="entry.type" class="banner__type">{{ entry.type }}</span>
                </div>
                <h2 class="banner__title" :style="titleStyle(entry)" v-html="entry.title"></h2>
                <div v-if="entry.description" class="banner__desc" :style="descStyle(entry)" v-html="entry.description"></div>
              </template>
              <div class="banner__actions" v-if="entry.showCta !== false && entry.ctaUrl">
                <a class="button button-primary" :href="entry.ctaUrl" target="_blank" rel="noopener">
                  {{ entry.ctaLabel || 'Learn more' }}
                  <span class="arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </template>

          <!-- ── SPLIT RIGHT (text left, media right) ────────── -->
          <template v-else-if="entry.layout === 'split-right'">
            <div class="container banner__split">
              <div class="banner__split-text">
                <template v-if="entry.showText !== false">
                  <div class="banner__meta">
                    <span v-if="entry.badge" class="banner__badge">{{ entry.badge }}</span>
                    <span v-if="entry.type" class="banner__type">{{ entry.type }}</span>
                  </div>
                  <h2 class="banner__title" v-html="entry.title"></h2>
                  <div v-if="entry.description" class="banner__desc" v-html="entry.description"></div>
                </template>
                <div class="banner__actions" v-if="entry.showCta !== false && entry.ctaUrl">
                  <a class="button button-primary" :href="entry.ctaUrl" target="_blank" rel="noopener">
                    {{ entry.ctaLabel || 'Learn more' }}
                    <span class="arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <figure class="banner__split-media">
                <img v-if="entry.image" :src="entry.image" :alt="''" />
              </figure>
            </div>
          </template>

          <!-- ── SPLIT LEFT (media left, text right) ────────── -->
          <template v-else-if="entry.layout === 'split-left'">
            <div class="container banner__split reverse">
              <figure class="banner__split-media">
                <img v-if="entry.image" :src="entry.image" :alt="''" />
              </figure>
              <div class="banner__split-text">
                <template v-if="entry.showText !== false">
                  <div class="banner__meta">
                    <span v-if="entry.badge" class="banner__badge">{{ entry.badge }}</span>
                    <span v-if="entry.type" class="banner__type">{{ entry.type }}</span>
                  </div>
                  <h2 class="banner__title" v-html="entry.title"></h2>
                  <div v-if="entry.description" class="banner__desc" v-html="entry.description"></div>
                </template>
                <div class="banner__actions" v-if="entry.showCta !== false && entry.ctaUrl">
                  <a class="button button-primary" :href="entry.ctaUrl" target="_blank" rel="noopener">
                    {{ entry.ctaLabel || 'Learn more' }}
                    <span class="arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </template>
        </article>
      </div>
    </div>

    <!-- ── Controls (single bottom-center cluster) ─────────── -->
    <template v-if="hasMany">
      <div class="banner__controls" role="group" aria-label="Slide controls">
        <button class="banner__nav" @click="prev" aria-label="Previous slide">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="banner__dots" role="tablist" aria-label="Slides">
          <button
            v-for="(entry, i) in activeEntries"
            :key="entry.id"
            class="banner__dot"
            :class="{ 'is-active': i === idx }"
            role="tab"
            :aria-selected="i === idx"
            :aria-label="`Go to slide ${i + 1}`"
            @click="goTo(i)"
          />
        </div>
        <button class="banner__nav" @click="next" aria-label="Next slide">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="banner__counter" aria-hidden="true">
        <span>{{ String(idx + 1).padStart(2, '0') }}</span>
        <span class="sep">/</span>
        <span>{{ String(n).padStart(2, '0') }}</span>
      </div>
    </template>
  </section>
</template>

<style scoped>
.banner {
  position: relative;
  background: linear-gradient(135deg, #1a302d 0%, var(--ink) 100%);
  color: var(--paper);
  overflow: hidden;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  --section-pad-y: clamp(72px, 9vw, 132px);
}
.banner__viewport {
  width: 100%;
  overflow: hidden;
}
.banner__track {
  display: flex;
  align-items: stretch;
  will-change: transform;
}
.banner__slide {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: clamp(560px, 80svh, 760px);
  padding-block: var(--section-pad-y) calc(var(--section-pad-y) + 56px);
  padding-inline: clamp(20px, 4vw, 56px);
  position: relative;
}
.banner__slide > .container { padding: 0; }

/* Vertical anchor (overlay only) */
.banner__slide.layout-overlay.v-top    { align-items: flex-start; }
.banner__slide.layout-overlay.v-center { align-items: center; }
.banner__slide.layout-overlay.v-bottom { align-items: flex-end; }

/* Text alignment within content body */
.banner__slide.align-left  .banner__overlay-body,
.banner__slide.align-left  .banner__split-text  { text-align: left; }
.banner__slide.align-center .banner__overlay-body,
.banner__slide.align-center .banner__split-text { text-align: center; }
.banner__slide.align-right .banner__overlay-body,
.banner__slide.align-right .banner__split-text  { text-align: right; }

.banner__slide.align-center .banner__overlay-body,
.banner__slide.align-center .banner__split-text  { margin-left: auto; margin-right: auto; }
.banner__slide.align-right  .banner__overlay-body,
.banner__slide.align-right  .banner__split-text  { margin-left: auto; }

.banner__slide.align-center .banner__title { max-width: none; margin-left: auto; margin-right: auto; }
.banner__slide.align-center .banner__desc  { margin-left: auto; margin-right: auto; }
.banner__slide.align-center .banner__meta,
.banner__slide.align-center .banner__actions { justify-content: center; }
.banner__slide.align-right  .banner__meta,
.banner__slide.align-right  .banner__actions { justify-content: flex-end; }

/* ── Video layout ───────────────────────────────────────── */
.banner__video-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  display: grid;
  justify-items: center;
  gap: 24px;
}
/* text beside the video — never over it */
.banner__video-wrap.has-text {
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
  justify-items: stretch;
}
.banner__video-wrap.has-text .banner__video { width: 100%; }
.banner__video-text { max-width: 560px; }
.banner__video-cta { justify-content: center; }
.banner__video {
  width: min(100%, 1080px);
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(247, 242, 233, 0.12);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
}
.banner__video iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

/* ── Overlay layout ─────────────────────────────────────── */
.banner__bg {
  position: absolute; inset: 0; z-index: 0;
  overflow: hidden;
}
.banner__bg img {
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0.45;
  filter: saturate(0.85) contrast(0.96);
}
.banner__scrim {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.7), transparent 65%),
    linear-gradient(180deg, rgba(17, 32, 30, 0.45) 0%, rgba(17, 32, 30, 0.78) 70%, rgba(17, 32, 30, 0.86) 100%);
  pointer-events: none;
}
.layout-overlay .banner__overlay-body {
  position: relative;
  z-index: 2;
  max-width: 720px;
}

/* ── Split layouts ──────────────────────────────────────── */
.banner__split {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(36px, 6vw, 88px);
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}
.banner__split.reverse { grid-template-columns: 0.95fr 1.05fr; }
.banner__split-text { max-width: 600px; }
.banner__split-media {
  margin: 0;
  position: relative;
  display: grid; place-items: center;
  padding: 24px;
  border-radius: var(--radius-xl);
  background: rgba(247, 242, 233, 0.04);
  border: 1px solid rgba(247, 242, 233, 0.1);
  aspect-ratio: 4 / 5;
  max-height: 560px;
}
.banner__split-media::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 30% 30%, rgba(111, 165, 160, 0.12), transparent 65%);
  pointer-events: none;
}
.banner__split-media img {
  max-height: 100%;
  width: auto;
  max-width: 100%;
  border-radius: var(--radius);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
  position: relative;
  z-index: 1;
}

/* ── Content typography ─────────────────────────────────── */
.banner__meta {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}
.banner__badge {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(111, 165, 160, 0.22);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid rgba(111, 165, 160, 0.35);
}
.banner__type {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(247, 242, 233, 0.7);
}
.banner__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2rem, 4.6vw, 4rem);
  line-height: 1.04;
  letter-spacing: -0.024em;
  color: var(--paper);
  margin: 0 0 22px;
  max-width: 13ch;
  overflow-wrap: break-word;
}
.banner__title :deep(em) {
  font-style: italic;
  font-weight: 500;
  color: var(--em-color, var(--accent-on-dark));
}
.banner__desc {
  margin: 0 0 30px;
  max-width: 54ch;
  color: rgba(247, 242, 233, 0.86);
  font-size: clamp(1rem, 1.3vw, 1.18rem);
  line-height: 1.6;
}
.banner__desc :deep(em) { font-style: italic; color: var(--em-color, var(--accent-on-dark)); font-weight: 500; }
.banner__desc :deep(strong) { font-weight: 700; color: inherit; }
.banner__desc :deep(br) { display: block; content: ""; margin-top: 6px; }

/* Admin copy is authored as full HTML — keep anything it can contain inside
   the slide instead of letting it blow the layout out. */
.banner__desc :deep(p) { margin: 0 0 0.7em; }
.banner__desc :deep(p:last-child) { margin-bottom: 0; }
.banner__desc :deep(a) { color: var(--em-color, var(--accent-on-dark)); text-decoration: underline; }
.banner__desc :deep(h1),
.banner__desc :deep(h2),
.banner__desc :deep(h3),
.banner__desc :deep(h4) {
  font-family: var(--font-display); font-weight: 600; line-height: 1.2;
  margin: 0.6em 0 0.35em; color: var(--paper);
}
.banner__desc :deep(h1) { font-size: 1.5em; }
.banner__desc :deep(h2) { font-size: 1.3em; }
.banner__desc :deep(h3) { font-size: 1.15em; }
.banner__desc :deep(h4) { font-size: 1em; }
.banner__desc :deep(ul), .banner__desc :deep(ol) { margin: 0 0 0.7em; padding-left: 1.4em; }
.banner__desc :deep(li) { margin: 0.25em 0; }
.banner__desc :deep(blockquote) {
  margin: 0.7em 0; padding: 2px 0 2px 14px;
  border-left: 3px solid var(--em-color, var(--accent-on-dark)); font-style: italic;
}
.banner__desc :deep(pre) {
  font-family: var(--font-mono); font-size: 0.86em;
  background: rgba(0, 0, 0, 0.24); border-radius: var(--radius-sm);
  padding: 10px 12px; white-space: pre-wrap; overflow-x: auto;
}
.banner__desc :deep(hr) { border: none; border-top: 1px solid var(--hairline-light); margin: 1em 0; }
.banner__desc :deep(img) { max-width: 100%; height: auto; border-radius: var(--radius-sm); }
.banner__desc :deep(iframe) { max-width: 100%; border: none; }
.banner__desc :deep(.rte-embed) { margin: 0.8em 0; max-width: 100%; }
.banner__desc :deep(.rte-embed iframe) {
  width: 100%; aspect-ratio: 16 / 9; height: auto; border-radius: var(--radius-sm);
}
.banner__desc :deep(table) {
  width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 0.9em;
}
.banner__desc :deep(th), .banner__desc :deep(td) {
  border: 1px solid var(--hairline-light); padding: 6px 9px; text-align: left;
}
.banner__actions {
  display: flex; align-items: center; gap: 18px;
  flex-wrap: wrap;
}
.banner__source {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(247, 242, 233, 0.6);
}

/* ── Controls cluster (bottom-center) ──────────────────── */
.banner__controls {
  position: absolute;
  left: 50%;
  bottom: clamp(20px, 3vw, 32px);
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(14, 26, 24, 0.5);
  border: 1px solid rgba(247, 242, 233, 0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.banner__nav {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(247, 242, 233, 0.06);
  border: 1px solid rgba(247, 242, 233, 0.18);
  color: var(--paper);
  display: grid; place-items: center;
  cursor: pointer;
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}
.banner__nav:hover {
  background: rgba(247, 242, 233, 0.18);
  border-color: rgba(247, 242, 233, 0.42);
  transform: scale(1.05);
}
.banner__dots {
  display: flex; gap: 8px; align-items: center;
  padding: 0 4px;
}
.banner__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(247, 242, 233, 0.36);
  padding: 0;
  cursor: pointer;
  transition: background var(--t-mid) var(--ease), width var(--t-mid) var(--ease);
}
.banner__dot.is-active {
  width: 22px;
  background: var(--paper);
  border-radius: 4px;
}

/* ── Slide counter ──────────────────────────────────────── */
.banner__counter {
  position: absolute;
  top: clamp(20px, 3vw, 36px);
  right: clamp(20px, 3vw, 36px);
  z-index: 10;
  display: flex; gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: rgba(247, 242, 233, 0.7);
}
.banner__counter .sep { color: rgba(247, 242, 233, 0.3); }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 960px) {
  .banner__split,
  .banner__split.reverse,
  .banner__video-wrap.has-text {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .banner__split.reverse > .banner__split-text { order: 2; }
  .banner__split.reverse > .banner__split-media { order: 1; }
  .banner__split-media {
    max-height: 320px;
    aspect-ratio: 4/3;
    padding: 18px;
  }
  .banner__slide { min-height: auto; }
}
@media (max-width: 720px) {
  .banner__title {
    font-size: clamp(1.9rem, 9vw, 2.6rem);
    max-width: 18ch;
  }
  .banner__desc { font-size: 0.98rem; line-height: 1.55; }
  .banner__slide {
    padding-block: clamp(72px, 14vw, 96px) calc(clamp(72px, 14vw, 96px) + 64px);
    padding-inline: 22px;
  }
  .banner__split-media { max-height: 240px; aspect-ratio: 16/10; }
  .banner__counter { top: 18px; right: 18px; font-size: 0.7rem; }
  .banner__controls { padding: 6px 10px; gap: 10px; }
  .banner__nav { width: 32px; height: 32px; }
  .banner__actions { gap: 12px; }
  .banner__actions .button { width: 100%; }
}
</style>
