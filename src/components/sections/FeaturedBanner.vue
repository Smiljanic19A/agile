<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content.js'
import HeroCard from '@/components/ui/HeroCard.vue'

const content = useContentStore()
const { pinnedHeroItems } = storeToRefs(content)

const idx = ref(0)
const n = computed(() => pinnedHeroItems.value.length)
const multi = computed(() => n.value > 1)

const dragX = ref(0)
const dragging = ref(false)

// Track: width = N * 100% of container. Each slide = (100/N)% of track = 100% of container.
// translateX(-i * 100/N %) moves exactly i container-widths left.
const trackStyle = computed(() => ({
  width: `${n.value * 100}%`,
  transform: `translateX(calc(${-idx.value * (100 / n.value)}% + ${dragX.value}px))`,
  transition: dragging.value ? 'none' : 'transform 420ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}))

const slideWidth = computed(() => `${100 / n.value}%`)

function goTo(i) { idx.value = i }
function prev() { idx.value = (idx.value - 1 + n.value) % n.value }
function next() { idx.value = (idx.value + 1) % n.value }

function onKey(e) {
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
}

let startX = 0
let startY = 0
let isHorizontal = null

function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isHorizontal = null
  dragging.value = true
  dragX.value = 0
}

function onTouchMove(e) {
  if (!dragging.value) return
  const dx = e.touches[0].clientX - startX
  const dy = e.touches[0].clientY - startY

  // Wait for enough movement to determine intent
  if (isHorizontal === null) {
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
    isHorizontal = Math.abs(dx) > Math.abs(dy)
  }

  if (!isHorizontal) {
    dragging.value = false
    dragX.value = 0
    return
  }

  e.preventDefault()

  // Rubber-band resistance at the edges
  const atStart = idx.value === 0 && dx > 0
  const atEnd   = idx.value === n.value - 1 && dx < 0
  dragX.value = (atStart || atEnd) ? dx * 0.18 : dx
}

function onTouchEnd() {
  if (!dragging.value) return

  const committed = dragX.value
  dragging.value = false

  // Let transition kick in before snapping
  requestAnimationFrame(() => {
    if (committed < -52) next()
    else if (committed > 52) prev()
    dragX.value = 0
  })
}
</script>

<template>
  <section
    v-if="pinnedHeroItems.length > 0"
    id="now"
    class="featured"
    role="region"
    aria-label="Featured"
    tabindex="0"
    @keydown="onKey"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <div class="featured__track" :style="trackStyle">
      <div
        v-for="item in pinnedHeroItems"
        :key="item.id"
        class="featured__slide"
        :style="{ width: slideWidth }"
      >
        <HeroCard :item="item" />
      </div>
    </div>

    <template v-if="multi">
      <button class="featured__nav featured__nav--prev" @click="prev" aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="featured__nav featured__nav--next" @click="next" aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="featured__dots" role="tablist" aria-label="Slides">
        <button
          v-for="(item, i) in pinnedHeroItems"
          :key="item.id"
          class="featured__dot"
          :class="{ 'is-active': i === idx }"
          role="tab"
          :aria-selected="i === idx"
          :aria-label="`Slide ${i + 1}`"
          @click="goTo(i)"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.featured {
  position: relative;
  overflow: hidden;
  outline: none;
  /* Prevent text selection during drag */
  user-select: none;
  -webkit-user-select: none;
}

.featured__track {
  display: flex;
  align-items: stretch;
  will-change: transform;
}

.featured__slide {
  flex-shrink: 0;
  min-height: 100svh;
}

/* Arrow buttons */
.featured__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(243, 243, 243, 0.12);
  border: 1px solid rgba(243, 243, 243, 0.2);
  color: #f3f3f3;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 180ms var(--ease), border-color 180ms var(--ease), transform 180ms var(--ease);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.featured__nav:hover {
  background: rgba(243, 243, 243, 0.24);
  border-color: rgba(243, 243, 243, 0.38);
  transform: translateY(-50%) scale(1.06);
}
.featured__nav--prev { left: clamp(12px, 2vw, 32px); }
.featured__nav--next { right: clamp(12px, 2vw, 32px); }

/* Dot indicators */
.featured__dots {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
}
.featured__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(243, 243, 243, 0.35);
  border: none;
  cursor: pointer;
  transition: background 200ms var(--ease), width 200ms var(--ease);
  padding: 0;
}
.featured__dot.is-active {
  background: #f3f3f3;
  width: 20px;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .featured__nav { display: none; }
  .featured__dots { bottom: 20px; }
}
</style>
