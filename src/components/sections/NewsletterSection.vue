<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { externalLinks } from '@/stores/content.js'

// ── Modal state ──────────────────────────────────────────────
const modalOpen = ref(false)
const name      = ref('')
const email     = ref('')
const subject   = ref('Make a training plan')
const customSub = ref('')

const subjectOptions = [
  'Make a training plan',
  'Ask a question',
  'Work together',
  'Other',
]

const isOther      = computed(() => subject.value === 'Other')
const finalSubject = computed(() => isOther.value ? customSub.value.trim() : subject.value)

// ── Focus trap refs ──────────────────────────────────────────
const modalEl    = ref(null)
const firstFocus = ref(null)

function openModal() {
  modalOpen.value = true
  nextTick(() => firstFocus.value?.focus())
}

function closeModal() {
  modalOpen.value = false
  name.value      = ''
  email.value     = ''
  subject.value   = 'Make a training plan'
  customSub.value = ''
}

function handleKey(e) {
  if (!modalOpen.value) return
  if (e.key === 'Escape') { closeModal(); return }
  if (e.key !== 'Tab') return

  const focusable = modalEl.value?.querySelectorAll(
    'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable?.length) return
  const first = focusable[0]
  const last  = focusable[focusable.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus() }
  }
}

onMounted(()       => document.addEventListener('keydown', handleKey))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKey))

// ── Submit ───────────────────────────────────────────────────
function submit() {
  if (!email.value.trim()) return
  const sub  = encodeURIComponent(finalSubject.value || 'Message via agileperiodization.com')
  const body = encodeURIComponent(
    `Name: ${name.value || '—'}\nEmail: ${email.value}\n\nSubject: ${finalSubject.value || '—'}`
  )
  window.open(`mailto:mladen@agileperiodization.com?subject=${sub}&body=${body}`)
  closeModal()
}
</script>

<template>
  <!-- ── Section ──────────────────────────────────────────── -->
  <section id="newsletter" class="ctc" aria-label="Contact and Newsletter">
    <div class="container ctc__grid">

      <!-- Contact panel -->
      <div class="ctc__panel fade-up">
        <p class="ctc__label">Contact</p>
        <h2 class="ctc__heading">Get in<br>touch.</h2>
        <p class="ctc__desc">A question, a collaboration, or something worth thinking through.</p>
        <button class="ctc__btn ctc__btn--solid" @click="openModal">
          Send a message <span aria-hidden="true">→</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="ctc__divider" aria-hidden="true"></div>

      <!-- Newsletter panel -->
      <div class="ctc__panel fade-up">
        <p class="ctc__label">Newsletter</p>
        <h2 class="ctc__heading">Read the<br>writing.</h2>
        <p class="ctc__desc">Essays on training, planning, and coaching judgment. Published on Substack.</p>
        <a
          :href="externalLinks.substack"
          target="_blank"
          rel="noopener noreferrer"
          class="ctc__btn ctc__btn--ghost"
        >
          Subscribe on Substack <span aria-hidden="true">↗</span>
        </a>
      </div>

    </div>
  </section>

  <!-- ── Modal ────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        @click.self="closeModal"
      >
        <div class="modal" ref="modalEl">

          <button class="modal__close" @click="closeModal" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <p class="modal__eyebrow">Send a message</p>
          <h3 id="modal-title" class="modal__title">
            What's on<br><em>your mind?</em>
          </h3>

          <form class="modal__form" @submit.prevent="submit" novalidate>

            <div class="modal__field">
              <label for="m-email" class="modal__label">
                Email <span class="modal__req" aria-hidden="true">*</span>
              </label>
              <input
                id="m-email"
                ref="firstFocus"
                v-model="email"
                type="email"
                required
                placeholder="your@email.com"
                class="modal__input"
                autocomplete="email"
              />
            </div>

            <div class="modal__field">
              <label for="m-name" class="modal__label">Name</label>
              <input
                id="m-name"
                v-model="name"
                type="text"
                placeholder="Your name"
                class="modal__input"
                autocomplete="name"
              />
            </div>

            <div class="modal__field">
              <label for="m-subject" class="modal__label">Subject</label>
              <div class="modal__select-wrap">
                <select id="m-subject" v-model="subject" class="modal__select">
                  <option v-for="opt in subjectOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <span class="modal__select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>

            <Transition name="slide-down">
              <div class="modal__field" v-if="isOther">
                <label for="m-custom" class="modal__label">Your subject</label>
                <input
                  id="m-custom"
                  v-model="customSub"
                  type="text"
                  placeholder="Describe your topic..."
                  class="modal__input"
                />
              </div>
            </Transition>

            <button type="submit" class="modal__submit" :disabled="!email.trim()">
              <span>Send message</span>
              <span aria-hidden="true">→</span>
            </button>

            <p class="modal__fine">Opens your mail client.</p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Section shell ──────────────────────────────────────────── */
.ctc {
  background: #0e1a1a;
  color: #f3f3f3;
}

.ctc__grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  min-height: 480px;
}

/* ── Panels ──────────────────────────────────────────────────── */
.ctc__panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(52px, 7vw, 88px) clamp(28px, 4vw, 64px);
}

/* ── Vertical divider ────────────────────────────────────────── */
.ctc__divider {
  width: 1px;
  background: rgba(243, 243, 243, 0.1);
  align-self: stretch;
}

/* ── Typography ─────────────────────────────────────────────── */
.ctc__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(91, 163, 157, 0.9);
  margin: 0 0 20px;
}

.ctc__heading {
  font-family: var(--font-display);
  font-size: clamp(40px, 5vw, 76px);
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.032em;
  color: #f3f3f3;
  margin: 0 0 20px;
}

.ctc__desc {
  font-family: var(--font-body);
  font-size: clamp(15px, 1.1vw, 17px);
  line-height: 1.65;
  color: rgba(243, 243, 243, 0.88);
  margin: 0 0 40px;
  max-width: 38ch;
}

/* ── Buttons ─────────────────────────────────────────────────── */
.ctc__btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  align-self: flex-start;
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease, transform 150ms ease, border-color 180ms ease;
}
.ctc__btn span {
  transition: transform 200ms ease;
}
.ctc__btn:hover span {
  transform: translateX(3px);
}

.ctc__btn--solid {
  background: #378882;
  color: #f3f3f3;
  border: 1.5px solid #378882;
}
.ctc__btn--solid:hover {
  background: #2f7672;
  border-color: #2f7672;
  transform: translateY(-2px);
}

.ctc__btn--ghost {
  background: transparent;
  color: #f3f3f3;
  border: 1.5px solid rgba(243, 243, 243, 0.22);
}
.ctc__btn--ghost:hover {
  border-color: rgba(243, 243, 243, 0.5);
  transform: translateY(-2px);
}

/* ── Modal backdrop ──────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 18, 18, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ── Modal card ──────────────────────────────────────────────── */
.modal {
  background: #ffffff;
  color: #0e1a1a;
  border-radius: 16px;
  padding: clamp(36px, 5vw, 56px) clamp(28px, 4vw, 48px);
  width: 100%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.12);
}

.modal__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(14, 26, 26, 0.06);
  color: rgba(14, 26, 26, 0.6);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}
.modal__close:hover {
  background: rgba(14, 26, 26, 0.12);
  color: #0e1a1a;
}

.modal__eyebrow {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(14, 26, 26, 0.4);
  margin: 0 0 14px;
}

.modal__title {
  font-family: var(--font-display);
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: #0e1a1a;
  margin: 0 0 32px;
}
.modal__title em {
  font-style: italic;
  font-weight: 500;
  color: #378882;
}

/* ── Form ────────────────────────────────────────────────────── */
.modal__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal__label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(14, 26, 26, 0.48);
}
.modal__req {
  color: #378882;
}

.modal__input {
  background: #f8f8f8;
  border: 1.5px solid rgba(14, 26, 26, 0.12);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 15px;
  font-family: var(--font-body);
  color: #0e1a1a;
  width: 100%;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.modal__input:focus {
  outline: none;
  border-color: #378882;
  box-shadow: 0 0 0 3px rgba(55, 136, 130, 0.14);
}
.modal__input::placeholder {
  color: rgba(14, 26, 26, 0.3);
}

.modal__select-wrap {
  position: relative;
}
.modal__select {
  appearance: none;
  -webkit-appearance: none;
  background: #f8f8f8;
  border: 1.5px solid rgba(14, 26, 26, 0.12);
  border-radius: 8px;
  padding: 14px 44px 14px 16px;
  font-size: 15px;
  font-family: var(--font-body);
  color: #0e1a1a;
  width: 100%;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.modal__select:focus {
  outline: none;
  border-color: #378882;
  box-shadow: 0 0 0 3px rgba(55, 136, 130, 0.14);
}
.modal__select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: rgba(14, 26, 26, 0.45);
  pointer-events: none;
}

.modal__submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 24px;
  background: #0e1a1a;
  color: #f3f3f3;
  border: none;
  border-radius: 9px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  margin-top: 4px;
  transition: opacity 180ms ease, transform 150ms ease;
}
.modal__submit:hover:not(:disabled) {
  opacity: 0.88;
  transform: translateY(-1px);
}
.modal__submit:disabled {
  opacity: 0.38;
  cursor: default;
}

.modal__fine {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  color: rgba(14, 26, 26, 0.35);
  margin: 0;
  text-align: center;
}

/* ── Transitions ─────────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 240ms ease;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: opacity 240ms ease, transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal {
  opacity: 0;
  transform: scale(0.94) translateY(12px);
}
.modal-leave-to .modal {
  opacity: 0;
  transform: scale(0.97) translateY(6px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 180ms ease, max-height 220ms ease;
  overflow: hidden;
  max-height: 100px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 720px) {
  .ctc__grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
  }

  .ctc__divider {
    width: auto;
    height: 1px;
    align-self: auto;
  }

  .ctc__panel {
    padding: clamp(48px, 10vw, 72px) clamp(24px, 6vw, 48px);
  }

  .ctc__btn {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .modal {
    padding: 32px 22px;
    border-radius: 12px;
  }
}
</style>
