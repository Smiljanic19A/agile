<script setup>
/**
 * Rich text / HTML editor for the admin panel.
 *
 * Two rules keep the caret where the user put it:
 *
 *  1. The contenteditable DOM is the source of truth while it has focus.
 *     We emit what the user typed verbatim and never write back into the
 *     element mid-edit. (Sanitizing on every keystroke made the emitted value
 *     differ from the live DOM, which forced a rewrite, which reset the caret.)
 *  2. The element is bound with a *string* ref, not a function ref. Vue
 *     re-invokes function refs on every patch, so the old `:ref="mountInit"`
 *     re-assigned innerHTML on each render — that was the jump-to-start bug.
 *
 * Content is sanitized on blur, when leaving source view, and again in the
 * store before it is sent to the API — never while the user is typing.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { sanitizeHtml } from '@/lib/sanitize.js'
import { youtubeEmbedUrl, youtubeId } from '@/lib/youtube.js'
import AssetPicker from '@/components/admin/AssetPicker.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Type here…' },
  /** false = single-line headline field: Enter is swallowed, block tools hidden */
  multiline: { type: Boolean, default: true },
  minHeight: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const editorEl = ref(null)
const rawEl = ref(null)
const rawMode = ref(false)
const rawText = ref(props.modelValue || '')

// ── Value plumbing ─────────────────────────────────────────────────────────

function emitFromEditor() {
  if (!editorEl.value) return
  emit('update:modelValue', editorEl.value.innerHTML)
}

/** Sanitize + normalize, then write back. Only ever called when not typing. */
function normalizeNow() {
  if (!editorEl.value) return
  const clean = sanitizeHtml(normalizeTags(editorEl.value.innerHTML))
  if (clean !== editorEl.value.innerHTML) editorEl.value.innerHTML = clean
  emit('update:modelValue', clean)
}

function onBlur() {
  // Blur into our own toolbar/dialog isn't really leaving the editor.
  if (dialog.value) return
  normalizeNow()
}

/**
 * execCommand emits <b>/<i>; the site styles <em>/<strong> (the teal accent
 * hangs off `em`). Swap them so both editors and the live site agree.
 */
function normalizeTags(html) {
  if (!html || typeof document === 'undefined') return html || ''
  const holder = document.createElement('template')
  holder.innerHTML = html
  for (const [from, to] of [['b', 'strong'], ['i', 'em']]) {
    for (const el of Array.from(holder.content.querySelectorAll(from))) {
      const swap = document.createElement(to)
      while (el.firstChild) swap.appendChild(el.firstChild)
      for (const a of Array.from(el.attributes)) swap.setAttribute(a.name, a.value)
      el.replaceWith(swap)
    }
  }
  return holder.innerHTML
}

// Outside changes (picking a source item resets the draft) must reach the DOM,
// but never while the caret lives there.
watch(() => props.modelValue, (val) => {
  const v = val || ''
  if (rawMode.value) {
    if (rawText.value !== v && document.activeElement !== rawEl.value) rawText.value = v
  } else if (
    editorEl.value &&
    editorEl.value.innerHTML !== v &&
    document.activeElement !== editorEl.value
  ) {
    editorEl.value.innerHTML = v
  }
})

onMounted(() => {
  if (editorEl.value) editorEl.value.innerHTML = props.modelValue || ''
  document.addEventListener('selectionchange', syncToolbarState)
})
onBeforeUnmount(() => document.removeEventListener('selectionchange', syncToolbarState))

// ── Source view ────────────────────────────────────────────────────────────

function toggleRaw() {
  if (rawMode.value) {
    const clean = sanitizeHtml(rawText.value)
    emit('update:modelValue', clean)
    rawMode.value = false
    nextTick(() => { if (editorEl.value) editorEl.value.innerHTML = clean })
  } else {
    rawText.value = sanitizeHtml(normalizeTags(props.modelValue || ''))
    rawMode.value = true
    nextTick(() => rawEl.value?.focus())
  }
}

function syncFromRaw() {
  emit('update:modelValue', rawText.value)
}

function formatSource() {
  rawText.value = prettyPrint(sanitizeHtml(rawText.value))
  syncFromRaw()
}

/** Cheap pretty-printer: one block-level tag per line, two-space indents. */
function prettyPrint(html) {
  const BLOCK = /^(div|p|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|blockquote|pre|figure|figcaption|section|article|iframe|hr|br)$/i
  const tokens = String(html).split(/(<[^>]+>)/g).filter((t) => t.trim() !== '')
  let depth = 0
  const lines = []
  for (const tok of tokens) {
    const close = /^<\//.test(tok)
    const tag = (tok.match(/^<\/?\s*([a-z0-9]+)/i) || [])[1] || ''
    const selfClose = /\/>$/.test(tok) || /^(br|hr|img|input|source)$/i.test(tag)
    const isBlock = BLOCK.test(tag)
    if (close && isBlock) depth = Math.max(0, depth - 1)
    lines.push('  '.repeat(depth) + tok.trim())
    if (!close && isBlock && !selfClose) depth++
  }
  return lines.join('\n')
}

// ── Commands ───────────────────────────────────────────────────────────────

const state = ref({ bold: false, italic: false, underline: false, strikeThrough: false, insertUnorderedList: false, insertOrderedList: false, block: 'p' })

function inEditor(node) {
  return !!(node && editorEl.value && editorEl.value.contains(node.nodeType === 1 ? node : node.parentNode))
}

function syncToolbarState() {
  if (rawMode.value || !editorEl.value) return
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode || !inEditor(sel.anchorNode)) return
  const next = { block: 'p' }
  for (const c of ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList']) {
    try { next[c] = document.queryCommandState(c) } catch { next[c] = false }
  }
  let node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode
  while (node && node !== editorEl.value) {
    const tag = node.tagName?.toLowerCase()
    if (['h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'pre'].includes(tag)) { next.block = tag; break }
    node = node.parentNode
  }
  state.value = next
}

function cmd(name, value = null) {
  if (rawMode.value || !editorEl.value) return
  editorEl.value.focus()
  try {
    document.execCommand('styleWithCSS', false, false)
    document.execCommand(name, false, value)
  } catch { /* command unsupported — leave content untouched */ }
  emitFromEditor()
  syncToolbarState()
}

function setBlock(tag) {
  cmd('formatBlock', `<${tag}>`)
}

function insertHtml(html) {
  if (!editorEl.value) return
  restoreSelection()
  try {
    document.execCommand('insertHTML', false, html)
  } catch {
    editorEl.value.innerHTML += html
  }
  // The saved range points at where the content *was*; re-applying it after an
  // insert would drop the caret somewhere arbitrary.
  savedRange = null
  emitFromEditor()
}

function clearFormatting() {
  cmd('removeFormat')
  cmd('unlink')
}

// ── Insert dialogs (link / image / embed / table) ───────────────────────────

const dialog = ref('')          // '' | 'link' | 'image' | 'embed' | 'table'
const linkUrl = ref('')
const linkText = ref('')
const linkBlank = ref(true)
const imageUrl = ref('')
const imageAlt = ref('')
const embedSrc = ref('')
const tableRows = ref(3)
const tableCols = ref(3)
const pickerOpen = ref(false)

let savedRange = null

function saveSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount && inEditor(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange()
}

function restoreSelection() {
  if (!editorEl.value) return
  editorEl.value.focus()
  if (!savedRange) return
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(savedRange)
}

function openDialog(name) {
  if (rawMode.value) return
  saveSelection()
  if (name === 'link') {
    const sel = window.getSelection()
    linkText.value = sel && !sel.isCollapsed ? sel.toString() : ''
    const anchor = closestTag('a')
    linkUrl.value = anchor?.getAttribute('href') || ''
    linkBlank.value = anchor ? anchor.getAttribute('target') === '_blank' : true
  }
  dialog.value = name
}

function closeDialog() {
  dialog.value = ''
  linkUrl.value = ''; linkText.value = ''
  imageUrl.value = ''; imageAlt.value = ''
  embedSrc.value = ''
  nextTick(restoreSelection)
}

function closestTag(tag) {
  const sel = window.getSelection()
  let node = sel?.anchorNode
  node = node?.nodeType === 1 ? node : node?.parentNode
  while (node && node !== editorEl.value) {
    if (node.tagName?.toLowerCase() === tag) return node
    node = node.parentNode
  }
  return null
}

function applyLink() {
  const url = linkUrl.value.trim()
  if (!url) return closeDialog()
  const label = linkText.value.trim()
  const attrs = linkBlank.value ? ' target="_blank" rel="noopener noreferrer"' : ''
  const href = escapeAttr(url)
  dialog.value = ''
  if (label) {
    insertHtml(`<a href="${href}"${attrs}>${escapeHtml(label)}</a>`)
  } else {
    restoreSelection()
    cmd('createLink', url)
    const a = closestTag('a')
    if (a && linkBlank.value) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer') }
    emitFromEditor()
  }
  closeDialog()
}

function applyImage() {
  const url = imageUrl.value.trim()
  if (!url) return closeDialog()
  dialog.value = ''
  insertHtml(`<img src="${escapeAttr(url)}" alt="${escapeAttr(imageAlt.value.trim())}" />`)
  closeDialog()
}

/**
 * Accepts either a URL or a full embed snippet pasted from YouTube/Vimeo/
 * Spotify/Maps/anywhere. Snippets go in sanitized and untouched; bare URLs get
 * wrapped in a responsive 16:9 frame.
 */
function applyEmbed() {
  const input = embedSrc.value.trim()
  if (!input) return closeDialog()
  dialog.value = ''

  let html
  if (input.includes('<')) {
    html = sanitizeHtml(input)
  } else {
    const src = youtubeId(input) ? youtubeEmbedUrl(input) : input
    html = `<iframe src="${escapeAttr(src)}" loading="lazy" allowfullscreen `
      + `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" `
      + `frameborder="0"></iframe>`
  }
  insertHtml(`<div class="rte-embed">${html}</div><p><br></p>`)
  closeDialog()
}

function applyTable() {
  const rows = Math.min(20, Math.max(1, Number(tableRows.value) || 1))
  const cols = Math.min(10, Math.max(1, Number(tableCols.value) || 1))
  const head = '<tr>' + '<th>Heading</th>'.repeat(cols) + '</tr>'
  const body = ('<tr>' + '<td>&nbsp;</td>'.repeat(cols) + '</tr>').repeat(Math.max(0, rows - 1))
  dialog.value = ''
  insertHtml(`<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br></p>`)
  closeDialog()
}

function onPickerSelected(url) {
  pickerOpen.value = false
  imageUrl.value = url
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}
function escapeAttr(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// ── Keyboard & paste ───────────────────────────────────────────────────────

function onKeydown(e) {
  if (!props.multiline && e.key === 'Enter') { e.preventDefault(); return }

  const mod = e.ctrlKey || e.metaKey
  if (!mod) return
  const k = e.key.toLowerCase()
  if (k === 'b') { e.preventDefault(); cmd('bold') }
  else if (k === 'i') { e.preventDefault(); cmd('italic') }
  else if (k === 'u') { e.preventDefault(); cmd('underline') }
  else if (k === 'k') { e.preventDefault(); openDialog('link') }
}

/**
 * Keep pasted formatting (that is the point of a rich editor) but run it
 * through the sanitizer first. Ctrl/Cmd+Shift+V pastes as plain text.
 */
function onPaste(e) {
  const cb = e.clipboardData || window.clipboardData
  if (!cb) return
  const html = cb.getData('text/html')
  const text = cb.getData('text/plain')

  if (e.shiftKey || !html) {
    e.preventDefault()
    try { document.execCommand('insertText', false, text) } catch {}
    emitFromEditor()
    return
  }

  e.preventDefault()
  const clean = sanitizeHtml(normalizeTags(stripOfficeCruft(html)))
  try { document.execCommand('insertHTML', false, clean) } catch {}
  emitFromEditor()
}

/** Word/Docs paste ships megabytes of <o:p>, class="Mso…" and comments. */
function stripOfficeCruft(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:[^>]*>/gi, '')
    .replace(/\sclass="Mso[^"]*"/gi, '')
    .replace(/<meta[^>]*>/gi, '')
}

const blockLabel = computed(() => ({
  p: 'Paragraph', h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', h4: 'Heading 4',
  blockquote: 'Quote', pre: 'Code block',
}[state.value.block] || 'Paragraph'))
</script>

<template>
  <div class="rte" :class="{ 'is-raw': rawMode, 'is-inline': !multiline }">
    <div class="rte__toolbar" @mousedown.prevent>
      <template v-if="multiline">
        <select class="rte__select" :value="state.block" :disabled="rawMode"
                :title="blockLabel" @change="setBlock($event.target.value)">
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>
        <span class="rte__sep"></span>
      </template>

      <button type="button" class="rte__btn" :class="{ 'is-on': state.bold }" title="Bold (Ctrl+B)"
              :disabled="rawMode" @click="cmd('bold')"><strong>B</strong></button>
      <button type="button" class="rte__btn" :class="{ 'is-on': state.italic }" title="Italic (Ctrl+I)"
              :disabled="rawMode" @click="cmd('italic')"><em>I</em></button>
      <button type="button" class="rte__btn" :class="{ 'is-on': state.underline }" title="Underline (Ctrl+U)"
              :disabled="rawMode" @click="cmd('underline')"><u>U</u></button>
      <button type="button" class="rte__btn" :class="{ 'is-on': state.strikeThrough }" title="Strikethrough"
              :disabled="rawMode" @click="cmd('strikeThrough')"><s>S</s></button>

      <span class="rte__sep"></span>

      <template v-if="multiline">
        <button type="button" class="rte__btn" :class="{ 'is-on': state.insertUnorderedList }" title="Bulleted list"
                :disabled="rawMode" @click="cmd('insertUnorderedList')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="2.5" cy="4" r="1.2"/><circle cx="2.5" cy="8" r="1.2"/><circle cx="2.5" cy="12" r="1.2"/><path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="rte__btn" :class="{ 'is-on': state.insertOrderedList }" title="Numbered list"
                :disabled="rawMode" @click="cmd('insertOrderedList')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><text x="0" y="5.6" font-size="5.4" fill="currentColor">1</text><text x="0" y="10" font-size="5.4" fill="currentColor">2</text><text x="0" y="14.4" font-size="5.4" fill="currentColor">3</text><path d="M6 4h8M6 8.4h8M6 12.8h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Outdent" :disabled="rawMode" @click="cmd('outdent')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M6 6.5h8M6 9.5h8M2 13h12M4 8L1.5 6v4z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Indent" :disabled="rawMode" @click="cmd('indent')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M6 6.5h8M6 9.5h8M2 13h12M1.5 8L4 6v4z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"/></svg>
        </button>

        <span class="rte__sep"></span>

        <button type="button" class="rte__btn" title="Align left" :disabled="rawMode" @click="cmd('justifyLeft')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 7h8M2 10.5h12M2 14h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Align centre" :disabled="rawMode" @click="cmd('justifyCenter')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M4 7h8M2 10.5h12M4 14h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Align right" :disabled="rawMode" @click="cmd('justifyRight')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M6 7h8M2 10.5h12M6 14h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>

        <span class="rte__sep"></span>
      </template>

      <button type="button" class="rte__btn" title="Link (Ctrl+K)" :disabled="rawMode" @click="openDialog('link')">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1"/></svg>
      </button>
      <button type="button" class="rte__btn" title="Remove link" :disabled="rawMode" @click="cmd('unlink')">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2"/><path d="M2 2l12 12"/></svg>
      </button>

      <template v-if="multiline">
        <button type="button" class="rte__btn" title="Insert image" :disabled="rawMode" @click="openDialog('image')">
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><circle cx="5.6" cy="6.4" r="1.1"/><path d="M2.4 11.4l3.3-3 2.6 2.3 2.2-1.8 3.1 2.6"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Embed iframe / video" :disabled="rawMode" @click="openDialog('embed')">
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M6.6 6.2l3.4 2.3-3.4 2.3z" fill="currentColor" stroke="none"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Insert table" :disabled="rawMode" @click="openDialog('table')">
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="2.5" width="13" height="11" rx="1.2"/><path d="M1.5 6.2h13M1.5 9.8h13M6 6.2v7.3M10.5 6.2v7.3"/></svg>
        </button>
        <button type="button" class="rte__btn" title="Horizontal rule" :disabled="rawMode" @click="cmd('insertHorizontalRule')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </template>

      <span class="rte__sep"></span>

      <button type="button" class="rte__btn" title="Clear formatting" :disabled="rawMode" @click="clearFormatting">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M5.5 13h7"/><path d="M4 3h9M8.6 3L6.4 10.6"/><path d="M11 8l3.2 3.2M14.2 8L11 11.2"/></svg>
      </button>
      <button type="button" class="rte__btn" title="Undo (Ctrl+Z)" :disabled="rawMode" @click="cmd('undo')">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6.5a3.5 3.5 0 0 1 0 7H6"/><path d="M5.5 4.5L3 7l2.5 2.5"/></svg>
      </button>
      <button type="button" class="rte__btn" title="Redo (Ctrl+Shift+Z)" :disabled="rawMode" @click="cmd('redo')">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7H6.5a3.5 3.5 0 0 0 0 7H10"/><path d="M10.5 4.5L13 7l-2.5 2.5"/></svg>
      </button>

      <span class="rte__spacer"></span>

      <button v-if="rawMode" type="button" class="rte__btn rte__btn--wide" title="Tidy the markup"
              @click="formatSource">Format</button>
      <button type="button" class="rte__btn rte__raw" :class="{ 'is-on': rawMode }"
              title="Toggle HTML source" @click="toggleRaw">&lt;/&gt;</button>
    </div>

    <div v-show="!rawMode"
         ref="editorEl"
         class="rte__editor"
         :style="minHeight ? { minHeight } : null"
         :data-placeholder="placeholder"
         contenteditable="true"
         spellcheck="true"
         @input="emitFromEditor"
         @blur="onBlur"
         @paste="onPaste"
         @keydown="onKeydown"
         @keyup="syncToolbarState"
         @mouseup="syncToolbarState"></div>

    <textarea v-show="rawMode"
              ref="rawEl"
              class="rte__raw-input"
              v-model="rawText"
              @input="syncFromRaw"
              @blur="syncFromRaw"
              spellcheck="false"
              :placeholder="placeholder"
              rows="10"></textarea>

    <!-- ── Insert dialogs ───────────────────────────────────────────── -->
    <div v-if="dialog" class="rte__dialog" @mousedown.stop>
      <template v-if="dialog === 'link'">
        <label class="rte__flabel">URL</label>
        <input v-model="linkUrl" type="url" class="rte__input" placeholder="https://…"
               @keydown.enter.prevent="applyLink" />
        <label class="rte__flabel">Text <span class="rte__opt">(leave blank to link the selection)</span></label>
        <input v-model="linkText" type="text" class="rte__input" placeholder="Link text"
               @keydown.enter.prevent="applyLink" />
        <label class="rte__check"><input v-model="linkBlank" type="checkbox" /> Open in a new tab</label>
      </template>

      <template v-else-if="dialog === 'image'">
        <label class="rte__flabel">Image URL</label>
        <div class="rte__row">
          <input v-model="imageUrl" type="url" class="rte__input" placeholder="https://… or /assets/…"
                 @keydown.enter.prevent="applyImage" />
          <button type="button" class="rte__ghost" @click="pickerOpen = true">Browse…</button>
        </div>
        <label class="rte__flabel">Alt text</label>
        <input v-model="imageAlt" type="text" class="rte__input" placeholder="Describes the image"
               @keydown.enter.prevent="applyImage" />
      </template>

      <template v-else-if="dialog === 'embed'">
        <label class="rte__flabel">Embed URL or code</label>
        <textarea v-model="embedSrc" class="rte__input rte__input--area" rows="4"
                  placeholder="https://youtube.com/watch?v=… or paste the full <iframe> snippet"></textarea>
        <p class="rte__note">
          YouTube links become a privacy-friendly responsive player. Anything else is embedded as-is.
        </p>
      </template>

      <template v-else-if="dialog === 'table'">
        <div class="rte__row">
          <div>
            <label class="rte__flabel">Rows</label>
            <input v-model.number="tableRows" type="number" min="1" max="20" class="rte__input rte__input--num" />
          </div>
          <div>
            <label class="rte__flabel">Columns</label>
            <input v-model.number="tableCols" type="number" min="1" max="10" class="rte__input rte__input--num" />
          </div>
        </div>
      </template>

      <div class="rte__dialog-actions">
        <button type="button" class="rte__ghost" @click="closeDialog">Cancel</button>
        <button type="button" class="rte__primary"
                @click="dialog === 'link' ? applyLink() : dialog === 'image' ? applyImage() : dialog === 'embed' ? applyEmbed() : applyTable()">
          Insert
        </button>
      </div>
    </div>

    <p class="rte__hint">
      <span v-if="rawMode">Full HTML — iframes, tables and inline styles are kept. Scripts and event handlers are stripped.</span>
      <span v-else>Rich text with full HTML support. Paste keeps formatting; Ctrl+Shift+V pastes plain.</span>
    </p>

    <AssetPicker :open="pickerOpen" :current-value="imageUrl"
                 @close="pickerOpen = false" @selected="onPickerSelected" />
  </div>
</template>

<style scoped>
.rte {
  position: relative;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: var(--paper);
}
.rte:focus-within { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18); }

.rte__toolbar {
  display: flex; align-items: center; flex-wrap: wrap; gap: 2px;
  padding: 6px 8px;
  background: var(--cream);
  border-bottom: 1px solid var(--line);
  border-radius: var(--radius) var(--radius) 0 0;
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
.rte__btn svg { width: 16px; height: 16px; display: block; }
.rte__btn:hover:not(:disabled) { background: rgba(17, 32, 30, 0.06); border-color: var(--line); }
.rte__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.rte__btn.is-on { background: var(--teal); color: var(--paper); border-color: var(--teal); }
.rte__btn--wide, .rte__btn.rte__raw {
  width: auto; padding: 0 10px;
  font-family: var(--font-mono); font-size: 0.78rem;
}

.rte__select {
  height: 30px; padding: 0 6px;
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  background: var(--paper); color: var(--ink);
  font-family: var(--font-body); font-size: 0.82rem;
  cursor: pointer;
}
.rte__sep { width: 1px; height: 18px; background: var(--line); margin: 0 4px; }
.rte__spacer { flex: 1; min-width: 8px; }

.rte__editor,
.rte__raw-input {
  display: block;
  width: 100%;
  min-height: 120px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--paper);
  border: none;
  outline: none;
  resize: vertical;
}
.rte.is-inline .rte__editor { min-height: 56px; }

/* Author-facing rendering of the content itself. */
.rte__editor :deep(em) { font-style: italic; color: var(--teal-deep); font-weight: 500; }
.rte__editor :deep(strong) { font-weight: 700; }
.rte__editor :deep(a) { color: var(--teal); text-decoration: underline; }
.rte__editor :deep(h1) { font-family: var(--font-display); font-size: 1.6rem; line-height: 1.2; margin: 0.6em 0 0.3em; }
.rte__editor :deep(h2) { font-family: var(--font-display); font-size: 1.35rem; line-height: 1.25; margin: 0.6em 0 0.3em; }
.rte__editor :deep(h3) { font-family: var(--font-display); font-size: 1.15rem; margin: 0.6em 0 0.3em; }
.rte__editor :deep(h4) { font-family: var(--font-display); font-size: 1rem; margin: 0.6em 0 0.3em; }
.rte__editor :deep(p) { margin: 0 0 0.7em; }
.rte__editor :deep(ul), .rte__editor :deep(ol) { margin: 0 0 0.7em; padding-left: 1.5em; }
.rte__editor :deep(li) { margin: 0.2em 0; }
.rte__editor :deep(blockquote) {
  margin: 0.7em 0; padding: 4px 0 4px 14px;
  border-left: 3px solid var(--teal); color: var(--ink-quiet); font-style: italic;
}
.rte__editor :deep(pre) {
  background: rgba(17, 32, 30, 0.06); border-radius: var(--radius-sm);
  padding: 10px 12px; font-family: var(--font-mono); font-size: 0.85rem;
  white-space: pre-wrap; overflow-x: auto;
}
.rte__editor :deep(hr) { border: none; border-top: 1px solid var(--line-strong); margin: 1em 0; }
.rte__editor :deep(img) { max-width: 100%; height: auto; border-radius: var(--radius-sm); }
.rte__editor :deep(iframe) { max-width: 100%; border: none; }
.rte__editor :deep(.rte-embed) { position: relative; margin: 0.8em 0; }
.rte__editor :deep(.rte-embed iframe) { width: 100%; aspect-ratio: 16 / 9; height: auto; border-radius: var(--radius-sm); }
.rte__editor :deep(table) { width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 0.9rem; }
.rte__editor :deep(th), .rte__editor :deep(td) { border: 1px solid var(--line-strong); padding: 6px 9px; text-align: left; }
.rte__editor :deep(th) { background: var(--cream); font-weight: 600; }

.rte__editor:empty::before {
  content: attr(data-placeholder);
  color: var(--ink-quiet);
  opacity: 0.6;
  pointer-events: none;
}

.rte__raw-input {
  font-family: var(--font-mono);
  font-size: 0.84rem;
  line-height: 1.5;
  white-space: pre;
  tab-size: 2;
}

/* ── Dialogs ─────────────────────────────────────────────────────── */
.rte__dialog {
  position: absolute; z-index: 20; left: 8px; right: 8px; top: 44px;
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px;
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  box-shadow: 0 14px 38px rgba(17, 32, 30, 0.18);
}
.rte__flabel {
  font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--ink-quiet);
}
.rte__opt { text-transform: none; letter-spacing: 0; opacity: 0.8; }
.rte__input {
  width: 100%; padding: 8px 10px;
  border: 1px solid var(--line-strong); border-radius: var(--radius-sm);
  background: var(--paper); color: var(--ink);
  font-family: var(--font-body); font-size: 0.9rem;
}
.rte__input:focus { outline: none; border-color: var(--teal); }
.rte__input--area { font-family: var(--font-mono); font-size: 0.82rem; resize: vertical; }
.rte__input--num { width: 90px; }
.rte__row { display: flex; gap: 8px; align-items: flex-end; }
.rte__row .rte__input { flex: 1; }
.rte__check {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: var(--ink-quiet); margin-top: 2px;
}
.rte__note { margin: 2px 0 0; font-size: 0.78rem; color: var(--ink-quiet); }
.rte__dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.rte__ghost, .rte__primary {
  padding: 7px 14px; border-radius: var(--radius-sm);
  font-family: var(--font-body); font-size: 0.85rem; cursor: pointer;
  border: 1px solid var(--line-strong); background: var(--paper); color: var(--ink);
}
.rte__primary { background: var(--teal); border-color: var(--teal); color: var(--paper); font-weight: 600; }
.rte__ghost:hover { background: var(--cream); }
.rte__primary:hover { filter: brightness(1.06); }

.rte__hint {
  margin: 0;
  padding: 6px 12px 8px;
  font-size: 0.78rem;
  color: var(--ink-quiet);
  background: var(--cream);
  border-top: 1px solid var(--line);
  border-radius: 0 0 var(--radius) var(--radius);
}
</style>
