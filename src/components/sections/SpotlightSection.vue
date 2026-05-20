<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore, sources } from '@/stores/content.js'
import HexLattice from '@/components/ui/HexLattice.vue'
import AbstractCover from '@/components/ui/AbstractCover.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()
const { featured } = storeToRefs(content)

const current = ref(0)
const paused = ref(false)
const section = ref(null)

const slide = computed(() => featured.value[current.value] ?? featured.value[0])
const total = computed(() => featured.value.length)

const sourceName = (item) => sources[item?.source]?.name ?? 'Store'
const displayPrice = (item) => item?.price ?? 'Free'

function go(i) {
  current.value = ((i % total.value) + total.value) % total.value
}
function prev() { go(current.value - 1) }
function next() { go(current.value + 1) }

function onKey(e) {
  if (!section.value) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
}

let timer = null
function startTimer() {
  if (total.value <= 1) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => { if (!paused.value) next() }, 7000)
}
function stopTimer() { clearInterval(timer); timer = null }

onMounted(() => { startTimer(); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { stopTimer(); window.removeEventListener('keydown', onKey) })
watch(featured, () => { current.value = 0; stopTimer(); startTimer() })
</script>

<template>
  <section
    id="spotlight"
    ref="section"
    class="spot section"
    role="region"
    aria-roledescription="carousel"
    aria-label="Featured"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <!-- hex bg -->
    <div class="spot__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-deep" mask="radial" :size="100" :accents="6" :seed="42" />
    </div>

    <!-- ── DESKTOP carousel ──────────────────────────────────────────────── -->
    <div class="container spot__desktop">

      <!-- top bar -->
      <div class="spot__bar">
        <span class="spot__now">
          <span class="spot__live" aria-hidden="true"></span>
          Now Featured
        </span>
        <span v-if="total > 1" class="spot__counter">{{ current + 1 }} / {{ total }}</span>
      </div>

      <!-- slide content + side arrows -->
      <div class="spot__stage">
        <button
          v-if="total > 1"
          class="spot__nav spot__nav--prev"
          aria-label="Previous slide"
          @click="prev"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <Transition name="spot-fade" mode="out-in">
          <div v-if="slide" :key="slide.id" class="spot__grid">
            <div class="spot__cover">
              <AbstractCover :seed="slide.cover.seed" tone="teal" :label="slide.type" />
            </div>
            <div class="spot__copy">
              <span class="spot__type">{{ slide.type }} · From {{ sourceName(slide) }}</span>
              <h2 class="display-2 spot__title">{{ slide.title }}</h2>
              <p class="prose spot__blurb">{{ slide.description }}</p>
              <div class="spot__pill">{{ displayPrice(slide) }}</div>
              <div class="spot__cta">
                <AppButton variant="onTeal" :href="slide.url" external>
                  View on {{ sourceName(slide) }}
                </AppButton>
              </div>
            </div>
          </div>
        </Transition>

        <button
          v-if="total > 1"
          class="spot__nav spot__nav--next"
          aria-label="Next slide"
          @click="next"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- dots -->
      <div v-if="total > 1" class="spot__dots" role="group" aria-label="Slide indicators">
        <button
          v-for="(item, i) in featured"
          :key="item.id"
          class="spot__dot"
          :class="{ 'is-active': i === current }"
          :aria-label="`Go to slide ${i + 1}`"
          :aria-current="i === current ? 'true' : undefined"
          @click="go(i)"
        />
      </div>
    </div>

    <!-- ── MOBILE swipe rail ─────────────────────────────────────────────── -->
    <div class="spot__rail" aria-label="Featured items">
      <div
        v-for="(item, i) in featured"
        :key="item.id"
        class="spot__slide"
        :aria-label="`Slide ${i + 1} of ${total}`"
      >
        <div class="spot__slide-cover">
          <AbstractCover :seed="item.cover.seed" tone="teal" :label="item.type" />
        </div>
        <span class="spot__type">{{ item.type }} · From {{ sourceName(item) }}</span>
        <h2 class="display-2 spot__title">{{ item.title }}</h2>
        <p class="prose spot__blurb">{{ item.description }}</p>
        <div class="spot__pill">{{ displayPrice(item) }}</div>
        <AppButton variant="onTeal" :href="item.url" external class="spot__slide-btn">
          View on {{ sourceName(item) }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.spot {
  background: var(--teal-deep);
  color: var(--cream);
  position: relative;
  overflow: clip; /* clip so hex bg doesn't scroll, but allow button overflow on x */
  isolation: isolate;
  border-top: 1px solid var(--hairline-light);
  border-bottom: 1px solid var(--hairline-light);
}

.spot__hex {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.95;
}

/* ── DESKTOP ──────────────────────────────────────────────────────────────── */
.spot__desktop {
  display: block;
  position: relative;
  z-index: 1;
}

/* top bar */
.spot__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(243, 243, 243, 0.78);
}

.spot__now {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.spot__live {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal-soft);
  box-shadow: 0 0 0 4px rgba(91, 163, 157, 0.22);
}
.spot__counter {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgba(243, 243, 243, 0.5);
}

/* stage wraps grid + side arrows */
.spot__stage {
  position: relative;
}

.spot__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--cream);
  color: var(--ink);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28);
  transition: transform 200ms var(--ease), box-shadow 200ms var(--ease), background 180ms var(--ease);
}
.spot__nav:hover {
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.38);
}
.spot__nav--prev {
  left: -28px;
}
.spot__nav--next {
  right: -28px;
}

/* grid */
.spot__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 56px;
  align-items: center;
}

.spot__cover {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(243, 243, 243, 0.16);
  aspect-ratio: 4 / 5;
}
.spot__cover :deep(.cover) {
  aspect-ratio: 4 / 5;
  height: 100%;
  width: 100%;
  border-radius: 0;
}

.spot__copy {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.spot__type {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--teal-soft);
}

.spot__title {
  max-width: 22ch;
  color: var(--cream);
  font-variation-settings: "SOFT" 40, "opsz" 144;
  margin: 0;
}

.spot__blurb {
  color: rgba(243, 243, 243, 0.82);
  max-width: 56ch;
  margin: 0;
}

.spot__pill {
  display: inline-flex;
  align-self: flex-start;
  padding: 10px 18px;
  border-radius: var(--radius);
  border: 1px solid rgba(243, 243, 243, 0.2);
  background: rgba(243, 243, 243, 0.04);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--cream);
}

.spot__cta {
  margin-top: 4px;
}

/* dots */
.spot__dots {
  display: flex;
  gap: 8px;
  margin-top: 44px;
}
.spot__dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: rgba(243, 243, 243, 0.22);
  transition: background 220ms var(--ease), width 220ms var(--ease);
  cursor: pointer;
  padding: 0;
  border: none;
}
.spot__dot.is-active {
  background: var(--cream);
  width: 48px;
}

/* crossfade */
.spot-fade-enter-active,
.spot-fade-leave-active {
  transition: opacity 200ms var(--ease);
}
.spot-fade-enter-from,
.spot-fade-leave-to {
  opacity: 0;
}

/* ── MOBILE rail ──────────────────────────────────────────────────────────── */
.spot__rail {
  display: none; /* hidden on desktop */
}

/* ── RESPONSIVE ───────────────────────────────────────────────────────────── */
@media (max-width: 960px) {
  .spot__grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .spot__cover {
    max-width: 380px;
    aspect-ratio: 4 / 3;
  }
  .spot__cover :deep(.cover) {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 720px) {
  /* hide desktop carousel */
  .spot__desktop {
    display: none;
  }

  /* show mobile rail */
  .spot__rail {
    display: flex;
    position: relative;
    z-index: 1;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    gap: 0;
  }
  .spot__rail::-webkit-scrollbar { display: none; }

  .spot__slide {
    flex: 0 0 calc(100% - 2 * var(--gutter));
    margin-left: var(--gutter);
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: clamp(44px, 8vw, 64px);
    padding-top: 8px;
  }
  .spot__slide:last-child {
    margin-right: var(--gutter);
  }

  .spot__slide-cover {
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid rgba(243, 243, 243, 0.16);
    aspect-ratio: 4 / 3;
    margin-bottom: 4px;
  }
  .spot__slide-cover :deep(.cover) {
    aspect-ratio: 4 / 3;
    height: 100%;
    width: 100%;
    border-radius: 0;
  }

  .spot__slide-btn :deep(.btn) {
    width: 100%;
    justify-content: center;
  }

  .spot__title {
    font-size: clamp(28px, 7vw, 40px);
  }
}
</style>
