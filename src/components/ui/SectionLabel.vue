<script setup>
defineProps({
  index: { type: String, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <div class="section-label">
    <span class="section-label__index">{{ index }}</span>
    <span class="section-label__line" aria-hidden="true" />
    <span class="section-label__text">{{ label }}</span>
  </div>
</template>

<style scoped>
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.78;
}
.section-label__line {
  width: 38px;
  height: 1px;
  background: currentColor;
  opacity: 0.4;
}
</style>
