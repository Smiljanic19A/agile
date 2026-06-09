<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const indicator = ref({ x: 0, w: 0, opacity: 0 })
const wrap = ref(null)
const refs = ref({})

const setRef = (el, id) => { if (el) refs.value[id] = el }

const place = async () => {
  await nextTick()
  const el = refs.value[props.modelValue]
  const container = wrap.value
  if (!el || !container) return
  const elRect = el.getBoundingClientRect()
  const cRect = container.getBoundingClientRect()
  indicator.value = { x: elRect.left - cRect.left, w: elRect.width, opacity: 1 }
}

onMounted(() => { place(); window.addEventListener('resize', place) })
watch(() => props.modelValue, place)
const select = (id) => emit('update:modelValue', id)
</script>

<template>
  <div class="tabs-wrap">
    <div ref="wrap" class="tabs" role="tablist" aria-label="Store categories">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :ref="(el) => setRef(el, tab.id)"
        role="tab"
        :aria-selected="modelValue === tab.id"
        class="tabs__btn"
        :class="{ 'is-active': modelValue === tab.id }"
        @click="select(tab.id)"
      >{{ tab.label }}</button>
      <span
        class="tabs__indicator"
        :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px`, opacity: indicator.opacity }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style scoped>
.tabs-wrap { position: relative; max-width: 100%; }
.tabs-wrap::after {
  content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 40px;
  pointer-events: none;
  background: linear-gradient(to right, rgba(55, 136, 130, 0), var(--teal));
  opacity: 0; transition: opacity 200ms var(--ease); border-radius: 0 999px 999px 0;
}
@media (max-width: 560px) { .tabs-wrap::after { opacity: 1; } }

.tabs {
  position: relative; display: inline-flex; align-items: stretch; gap: 4px;
  padding: 6px; border: 1px solid var(--hairline-light); border-radius: 999px;
  background: rgba(243, 243, 243, 0.04); max-width: 100%;
  overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
}
.tabs::-webkit-scrollbar { display: none; }

.tabs__btn {
  position: relative; z-index: 2; padding: 10px 18px;
  font-family: var(--font-body); font-size: 13px; font-weight: 500; letter-spacing: 0.01em;
  color: rgba(243, 243, 243, 0.7); border-radius: 999px;
  transition: color 200ms var(--ease); white-space: nowrap; cursor: pointer;
}
@media (max-width: 560px) { .tabs__btn { padding: 9px 14px; font-size: 12.5px; } }
.tabs__btn.is-active { color: var(--ink); }
.tabs__btn:hover:not(.is-active) { color: var(--cream); }

.tabs__indicator {
  position: absolute; top: 6px; bottom: 6px; left: 0;
  background: var(--cream); border-radius: 999px;
  transition: transform 320ms var(--ease), width 320ms var(--ease), opacity 200ms var(--ease);
  z-index: 1; pointer-events: none;
}
</style>
