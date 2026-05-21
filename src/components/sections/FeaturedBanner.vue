<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content.js'
import HeroCard from '@/components/ui/HeroCard.vue'

const content = useContentStore()
const { pinnedHeroItems } = storeToRefs(content)

const idx = ref(0)
const multi = computed(() => pinnedHeroItems.value.length > 1)

function prev() {
  idx.value = (idx.value - 1 + pinnedHeroItems.value.length) % pinnedHeroItems.value.length
}
function next() {
  idx.value = (idx.value + 1) % pinnedHeroItems.value.length
}
function goTo(i) {
  idx.value = i
}

function onKey(e) {
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
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
  >
    <!-- Wrapper div is the transition target — keeps transition CSS in scoped context -->
    <Transition name="ft" mode="out-in">
      <div :key="pinnedHeroItems[idx].id" class="featured__slide">
        <HeroCard :item="pinnedHeroItems[idx]" />
      </div>
    </Transition>

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
}

.featured__slide {
  width: 100%;
}

/* Transition — applied to .featured__slide (a scoped div, not the child component) */
.ft-enter-active {
  transition: opacity 400ms var(--ease), transform 400ms var(--ease);
}
.ft-leave-active {
  transition: opacity 260ms var(--ease);
}
.ft-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.ft-leave-to {
  opacity: 0;
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
