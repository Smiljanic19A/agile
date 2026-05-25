<script setup>
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const hasVideo   = computed(() => !!props.item.videoUrl)
const hasImage   = computed(() => !hasVideo.value && !!props.item.coverImage)
const layout     = computed(() => props.item.layout ?? 'overlay')
const mediaFirst = computed(() => layout.value === 'split-start')

function youtubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? m[1] : null
}
const ytId     = computed(() => youtubeId(props.item.videoUrl))
const embedUrl = computed(() =>
  ytId.value
    ? `https://www.youtube.com/embed/${ytId.value}?rel=0&modestbranding=1&color=white`
    : props.item.videoUrl
)
</script>

<template>

  <!-- ═══════════════════════════════════════════ OVERLAY ══ -->
  <div v-if="layout === 'overlay'" class="hcard hcard--overlay">
    <div class="hcard__bg" aria-hidden="true">
      <img v-if="hasImage" class="hcard__bg-img" :src="item.coverImage" alt="" />
      <div v-else class="hcard__bg-hex">
        <HexLattice variant="grid" tone="on-teal" mask="radial" :size="110" :accents="7" :seed="42" />
      </div>
    </div>
    <div class="hcard__scrim" aria-hidden="true" />

    <div class="container hcard__overlay-body">
      <div class="hcard__overlay-content">
        <p v-if="item.price" class="hcard__price-badge">{{ item.price }}</p>
        <div v-if="item.title" class="hcard__title" v-html="item.title" />
        <div v-if="item.description" class="hcard__desc" v-html="item.description" />
        <div v-if="item.ctaUrl" class="hcard__actions">
          <AppButton variant="onTeal" :href="item.ctaUrl" external>
            {{ item.ctaLabel ?? 'Learn more' }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════ SPLIT (end / start) ══ -->
  <div
    v-else-if="layout === 'split-end' || layout === 'split-start'"
    class="hcard hcard--split"
    :class="{ 'hcard--split-reversed': mediaFirst }"
  >
    <div class="hcard__text-panel">
      <div class="hcard__text-hex" aria-hidden="true">
        <HexLattice variant="grid" tone="on-teal" mask="radial" :size="80" :accents="5" :seed="17" />
      </div>
      <div class="hcard__text-inner">
        <p v-if="item.price" class="hcard__price-badge">{{ item.price }}</p>
        <div v-if="item.title" class="hcard__title" v-html="item.title" />
        <div v-if="item.description" class="hcard__desc" v-html="item.description" />
        <div v-if="item.ctaUrl" class="hcard__actions">
          <AppButton variant="onTeal" :href="item.ctaUrl" external>
            {{ item.ctaLabel ?? 'Learn more' }}
          </AppButton>
        </div>
      </div>
    </div>

    <div class="hcard__media-panel">
      <img v-if="hasImage" class="hcard__media-img" :src="item.coverImage" alt="" />
      <div v-else-if="hasVideo" class="hcard__media-video">
        <iframe
          :src="embedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          loading="lazy"
          title="Video"
        />
      </div>
      <div v-else class="hcard__media-fallback">
        <HexLattice variant="cluster" tone="on-teal" :size="72" :accents="4" :seed="88" :pulse="false" />
      </div>
    </div>
  </div>

  <!-- fallback: treat unknown layout as overlay -->
  <div v-else class="hcard hcard--overlay">
    <div class="hcard__bg" aria-hidden="true">
      <img v-if="hasImage" class="hcard__bg-img" :src="item.coverImage" alt="" />
      <div v-else class="hcard__bg-hex">
        <HexLattice variant="grid" tone="on-teal" mask="radial" :size="110" :accents="7" :seed="42" />
      </div>
    </div>
    <div class="hcard__scrim" aria-hidden="true" />
    <div class="container hcard__overlay-body">
      <div class="hcard__overlay-content">
        <p v-if="item.price" class="hcard__price-badge">{{ item.price }}</p>
        <div v-if="item.title" class="hcard__title" v-html="item.title" />
        <div v-if="item.description" class="hcard__desc" v-html="item.description" />
        <div v-if="item.ctaUrl" class="hcard__actions">
          <AppButton variant="onTeal" :href="item.ctaUrl" external>
            {{ item.ctaLabel ?? 'Learn more' }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
/* ─── Base ─────────────────────────────────────────────────────── */
.hcard {
  width: 100%;
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  /* Always light text — dark teal bg on both split and overlay */
  --hcard-text: #f3f3f3;
  --hcard-text-soft: rgba(243, 243, 243, 0.92);
  --hcard-bg: #23615c;
  --hcard-bg-deep: #0e1a1a;
  color: var(--hcard-text);
}

/* ─── Price badge ──────────────────────────────────────────────── */
.hcard__price-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hcard-text);
  border: 1px solid rgba(243, 243, 243, 0.28);
  padding: 5px 12px;
  border-radius: 999px;
  margin: 0 0 20px;
  opacity: 0.85;
}

/* ─── Title (v-html — styles the div itself + any em inside) ───── */
.hcard__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(38px, 5vw, 76px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--hcard-text);
  margin: 0 0 22px;
  max-width: 16ch;
}
.hcard__title :deep(em) {
  font-style: italic;
  font-weight: 500;
  opacity: 0.88;
}
.hcard__title :deep(strong) {
  font-weight: 700;
}

/* ─── Description ──────────────────────────────────────────────── */
.hcard__desc {
  margin: 0 0 32px;
  max-width: 50ch;
}
.hcard__desc :deep(p),
.hcard__desc :deep(*) {
  font-size: clamp(16px, 1.25vw, 19px);
  line-height: 1.65;
  color: var(--hcard-text-soft);
  margin: 0;
}

/* ─── Actions ──────────────────────────────────────────────────── */
.hcard__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ═══════════════════════════════════════════════ OVERLAY ═══════ */
.hcard--overlay {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--hcard-bg-deep);
}

.hcard__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hcard__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  animation: kenBurns 20s ease-in-out infinite alternate;
}
@keyframes kenBurns {
  from { transform: scale(1); }
  to   { transform: scale(1.07); }
}
@media (prefers-reduced-motion: reduce) {
  .hcard__bg-img { animation: none; }
}
.hcard__bg-hex {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

/* Multi-layer scrim: readable bottom, cinematic top */
.hcard__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to top, rgba(14,26,26,0.92) 0%, rgba(14,26,26,0.55) 38%, rgba(14,26,26,0.1) 70%, transparent 100%),
    linear-gradient(to right, rgba(14,26,26,0.4) 0%, transparent 60%);
}

.hcard__overlay-body {
  position: relative;
  z-index: 2;
  padding-top: 120px;
  padding-bottom: 100px;
}
.hcard__overlay-content {
  max-width: 680px;
}

/* ═══════════════════════════════════════════════ SPLIT ═════════ */
.hcard--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.hcard--split-reversed {
  direction: rtl;
}
.hcard--split-reversed > * {
  direction: ltr;
}

.hcard__text-panel {
  position: relative;
  background: var(--hcard-bg);
  display: flex;
  align-items: center;
  overflow: hidden;
  min-height: 100svh;
}
.hcard__text-hex {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  pointer-events: none;
}
.hcard__text-inner {
  position: relative;
  z-index: 1;
  padding: clamp(48px, 7vh, 96px) clamp(36px, 5vw, 80px);
}

.hcard__media-panel {
  position: relative;
  overflow: hidden;
  background: var(--hcard-bg-deep);
  min-height: 100svh;
}
.hcard__media-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  animation: kenBurns 20s ease-in-out infinite alternate;
}
.hcard__media-video {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: var(--hcard-bg-deep);
}
.hcard__media-video iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(243,243,243,0.06);
}
.hcard__media-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* ─── Responsive ────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hcard--split {
    grid-template-columns: 1fr;
  }
  .hcard--split-reversed {
    direction: ltr;
  }
  .hcard__text-panel {
    min-height: auto;
    padding: 0;
  }
  .hcard__text-inner {
    padding: 56px 24px 48px;
  }
  .hcard__media-panel {
    min-height: 50vw;
    max-height: 420px;
  }
}

@media (max-width: 640px) {
  .hcard--overlay .hcard__overlay-body {
    padding-top: 96px;
    padding-bottom: 72px;
  }
  .hcard__title {
    font-size: clamp(32px, 9vw, 52px);
  }
  .hcard__media-video {
    padding: 28px 20px;
  }
}
</style>
