<script setup>
import { nextTick, ref, watch } from 'vue'
import { sanitizeHtml } from '@/stores/featured.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Type here…' },
  multiline: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const editorEl = ref(null)
const rawMode = ref(false)
const rawText = ref(props.modelValue || '')

function syncFromEditor() {
  if (!editorEl.value) return
  const clean = sanitizeHtml(editorEl.value.innerHTML)
  emit('update:modelValue', clean)
}

function syncFromRaw() {
  const clean = sanitizeHtml(rawText.value)
  emit('update:modelValue', clean)
}

// Keep editor DOM in sync when value changes from outside (e.g., picking a new
// source item resets fields). Don't fight the user's caret while they type.
watch(() => props.modelValue, (val) => {
  if (rawMode.value) {
    if (rawText.value !== val) rawText.value = val
  } else if (editorEl.value && editorEl.value.innerHTML !== val) {
    editorEl.value.innerHTML = val || ''
  }
})

function toggleRaw() {
  if (rawMode.value) {
    // leaving raw — sanitize and push back
    const clean = sanitizeHtml(rawText.value)
    emit('update:modelValue', clean)
    rawMode.value = false
    nextTick(() => { if (editorEl.value) editorEl.value.innerHTML = clean })
  } else {
    // entering raw
    rawText.value = props.modelValue
    rawMode.value = true
  }
}

function exec(cmd) {
  if (rawMode.value) return
  if (!editorEl.value) return
  editorEl.value.focus()
  // execCommand is deprecated-but-still-supported; falls back gracefully.
  try { document.execCommand(cmd, false, null) } catch {}
  syncFromEditor()
}
function insertBr() {
  if (rawMode.value) return
  if (!editorEl.value) return
  editorEl.value.focus()
  try { document.execCommand('insertLineBreak', false, null) } catch {
    try { document.execCommand('insertHTML', false, '<br>') } catch {}
  }
  syncFromEditor()
}

function onKeydown(e) {
  if (!props.multiline && e.key === 'Enter') {
    e.preventDefault()
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
    e.preventDefault(); exec('bold')
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
    e.preventDefault(); exec('italic')
  }
}

function onPaste(e) {
  e.preventDefault()
  const text = (e.clipboardData || window.clipboardData).getData('text')
  try { document.execCommand('insertText', false, text) } catch {}
  syncFromEditor()
}

// Initialize DOM content on mount-ish
function mountInit(el) {
  editorEl.value = el
  if (el) el.innerHTML = props.modelValue || ''
}
</script>

<template>
  <div class="rte" :class="{ 'is-raw': rawMode }">
    <div class="rte__toolbar">
      <button type="button" class="rte__btn" title="Bold (Ctrl+B)"
              @click="exec('bold')" :disabled="rawMode">
        <strong>B</strong>
      </button>
      <button type="button" class="rte__btn" title="Italic (Ctrl+I)"
              @click="exec('italic')" :disabled="rawMode">
        <em>I</em>
      </button>
      <button type="button" class="rte__btn" title="Line break"
              @click="insertBr" :disabled="rawMode">↵</button>
      <span class="rte__spacer"></span>
      <button type="button" class="rte__btn rte__raw" :class="{ 'is-on': rawMode }"
              title="Toggle raw HTML" @click="toggleRaw">{ }</button>
    </div>

    <div v-show="!rawMode"
         class="rte__editor"
         :data-placeholder="placeholder"
         contenteditable="true"
         spellcheck="true"
         :ref="mountInit"
         @input="syncFromEditor"
         @blur="syncFromEditor"
         @paste="onPaste"
         @keydown="onKeydown"></div>

    <textarea v-show="rawMode"
              class="rte__raw-input"
              v-model="rawText"
              @input="syncFromRaw"
              @blur="syncFromRaw"
              spellcheck="false"
              :placeholder="placeholder"
              rows="4"></textarea>

    <p class="rte__hint">
      <span v-if="!rawMode">Allowed: <code>em</code>, <code>strong</code>, line breaks.</span>
      <span v-else>Raw HTML — everything outside <code>em strong b i br</code> is stripped on save.</span>
    </p>
  </div>
</template>

<style scoped>
.rte {
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: var(--paper);
  overflow: hidden;
}
.rte:focus-within { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18); }

.rte__toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px;
  background: var(--cream);
  border-bottom: 1px solid var(--line);
}
.rte__btn {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.rte__btn:hover { background: rgba(17, 32, 30, 0.06); border-color: var(--line); }
.rte__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rte__btn.is-on { background: var(--teal); color: var(--paper); border-color: var(--teal); }
.rte__btn.rte__raw {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  width: auto; padding: 0 10px;
}
.rte__spacer { flex: 1; }

.rte__editor,
.rte__raw-input {
  display: block;
  width: 100%;
  min-height: 90px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 0.98rem;
  line-height: 1.55;
  color: var(--ink);
  background: var(--paper);
  border: none;
  outline: none;
  resize: vertical;
}
.rte__editor :deep(em) { font-style: italic; color: var(--teal-deep); font-weight: 500; }
.rte__editor :deep(strong) { font-weight: 700; }

.rte__editor:empty::before {
  content: attr(data-placeholder);
  color: var(--ink-quiet);
  opacity: 0.6;
  pointer-events: none;
}

.rte__raw-input {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  white-space: pre-wrap;
}

.rte__hint {
  margin: 0;
  padding: 6px 12px 8px;
  font-size: 0.78rem;
  color: var(--ink-quiet);
  background: var(--cream);
  border-top: 1px solid var(--line);
}
.rte__hint code {
  font-family: var(--font-mono);
  font-size: 0.78em;
  background: rgba(17, 32, 30, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
  margin: 0 2px;
}
</style>
