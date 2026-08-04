<script setup>
import { ref } from 'vue'
import AssetPicker from './AssetPicker.vue'

/**
 * Image input for adm-styled forms: paste a URL, or browse/upload
 * through the shared media library (AssetPicker).
 */
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Image' },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const pickerOpen = ref(false)

function set(url) {
  emit('update:modelValue', url)
}
</script>

<template>
  <div class="adm-field">
    <label class="adm-label">{{ label }}</label>
    <div class="imgf">
      <div class="imgf__thumb" :class="{ 'is-empty': !modelValue }">
        <img v-if="modelValue" :src="modelValue" alt="" />
        <span v-else>—</span>
      </div>
      <div class="imgf__main">
        <input
          :value="modelValue"
          class="adm-input adm-input--mono"
          placeholder="https://… or pick from the library"
          @input="set($event.target.value)"
        />
        <div class="imgf__actions">
          <button type="button" class="adm-btn adm-btn--sm" @click="pickerOpen = true">Browse / Upload</button>
          <button type="button" class="adm-btn adm-btn--sm adm-btn--ghost" :disabled="!modelValue" @click="set('')">Clear</button>
        </div>
      </div>
    </div>
    <p v-if="hint" class="adm-hint">{{ hint }}</p>

    <AssetPicker
      :open="pickerOpen"
      :current-value="modelValue"
      @close="pickerOpen = false"
      @selected="set"
    />
  </div>
</template>

<style scoped>
.imgf {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}
.imgf__thumb {
  width: 64px;
  height: 64px;
  border: 1px solid var(--adm-line);
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--adm-surface);
  color: var(--adm-mute-2);
}
.imgf__thumb img { width: 100%; height: 100%; object-fit: cover; }
.imgf__main { display: grid; gap: 8px; min-width: 0; }
.imgf__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.imgf__actions .adm-btn:disabled { opacity: 0.4; cursor: default; }
</style>
