<script setup>
import HexLattice from './HexLattice.vue'

defineProps({
  index: { type: String, required: true },
  label: { type: String, required: true },
  tone: { type: String, default: 'on-teal' }, // on-teal | on-paper | on-cream
})
</script>

<template>
  <div class="section-label">
    <span class="section-label__glyph" aria-hidden="true">
      <HexLattice variant="glyph" :tone="tone" :size="6" :pulse="false" mask="none" />
    </span>
    <span class="section-label__index">{{ index }}</span>
    <span class="section-label__line" aria-hidden="true" />
    <span class="section-label__text">{{ label }}</span>
  </div>
</template>

<style scoped>
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.78;
}
.section-label__glyph { display: inline-flex; width: 26px; height: 18px; margin-right: 2px; opacity: 0.85; }
.section-label__line { width: 32px; height: 1px; background: currentColor; opacity: 0.4; }
</style>
