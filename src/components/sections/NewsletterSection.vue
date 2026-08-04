<script setup>
/**
 * Newsletter signup — served by Kit (formerly ConvertKit).
 *
 * The embed is Kit's own script, so whatever Mladen configures in the Kit
 * dashboard (copy, image, colours, double opt-in) is what renders here; nothing
 * about the form is duplicated in this repo.
 *
 * Because a <script> tag written into a template never executes, the element is
 * created programmatically. Kit's loader inserts the form next to its own
 * script tag, so appending it inside `hostEl` puts the form exactly there.
 *
 * If the script is blocked (ad/tracker blockers routinely eat it) we fall back
 * to a plain form that POSTs to the same Kit endpoint — no JS required.
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const KIT_UID       = '72f847aefe'
const KIT_SCRIPT    = `https://agileperiodization.kit.com/${KIT_UID}/index.js`
const KIT_ACTION    = 'https://app.kit.com/forms/9760554/subscriptions'
const KIT_TIMEOUT   = 4000

const hostEl = ref(null)
const kitReady = ref(false)   // Kit rendered its form
const kitFailed = ref(false)  // blocked or slow — show our own form

let observer = null
let timer = null

onMounted(() => {
  if (!hostEl.value) return

  // Kit paints asynchronously; watch for the form landing in our container.
  observer = new MutationObserver(() => {
    if (hostEl.value?.querySelector('.formkit-form')) {
      kitReady.value = true
      cleanup()
    }
  })
  observer.observe(hostEl.value, { childList: true, subtree: true })

  const script = document.createElement('script')
  script.async = true
  script.src = KIT_SCRIPT
  script.setAttribute('data-uid', KIT_UID)
  script.onerror = () => { kitFailed.value = true; cleanup() }
  hostEl.value.appendChild(script)

  timer = setTimeout(() => {
    if (!kitReady.value) kitFailed.value = true
    cleanup()
  }, KIT_TIMEOUT)
})

onBeforeUnmount(cleanup)

function cleanup() {
  if (observer) { observer.disconnect(); observer = null }
  if (timer) { clearTimeout(timer); timer = null }
}
</script>

<template>
  <section id="updates" class="updates section section--cream" aria-labelledby="updates-title">
    <div class="container">
      <div class="updates__head fade-up">
        <SectionLabel index="08" :label="t('updates.label')" />
        <h2 id="updates-title" class="sr-only">{{ t('updates.title') }}</h2>
      </div>

      <!-- Kit renders here -->
      <div ref="hostEl" class="updates__kit" :class="{ 'is-ready': kitReady }"></div>

      <!-- Shown only if Kit's script never arrives -->
      <div v-if="kitFailed && !kitReady" class="updates__card">
        <div class="updates__copy">
          <h3 class="display-2 updates__title">{{ t('updates.title') }}</h3>
          <p class="updates__desc">{{ t('updates.desc') }}</p>
        </div>

        <form class="updates__form" :action="KIT_ACTION" method="post">
          <div class="updates__fields">
            <div class="updates__field">
              <label for="u-name" class="updates__label">{{ t('updates.name') }}</label>
              <input id="u-name" name="fields[first_name]" type="text"
                     :placeholder="t('updates.namePlaceholder')" class="updates__input" />
            </div>
            <div class="updates__field">
              <label for="u-email" class="updates__label">
                {{ t('updates.email') }} <span class="updates__req" aria-hidden="true">*</span>
              </label>
              <input id="u-email" name="email_address" type="email" required
                     :placeholder="t('updates.emailPlaceholder')" class="updates__input" />
            </div>
          </div>
          <button type="submit" class="updates__btn">{{ t('updates.button') }}</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.updates { background: var(--paper); color: var(--ink); }

.updates__head { margin-bottom: 28px; }

/* Kit ships its own stylesheet scoped to .formkit-form — we only centre it and
   stop the fixed 700px max-width from looking stranded on wide screens. */
.updates__kit { display: flex; justify-content: center; }
.updates__kit :deep(.formkit-form) { width: 100%; max-width: 760px; }
.updates__kit :deep(img) { max-width: 100%; height: auto; }

/* ── Fallback form (Kit blocked) ───────────────────────────────── */
.updates__card {
  background: var(--teal); color: #f3f3f3;
  border-radius: var(--radius-lg); padding: clamp(48px, 6vw, 80px);
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
}

.updates__copy { display: flex; flex-direction: column; gap: 20px; }

.updates__title { color: #f3f3f3; margin: 0; }

.updates__desc {
  font-size: clamp(15px, 1.1vw, 17px); line-height: 1.68;
  color: rgba(243,243,243,0.85); margin: 0;
}

.updates__form { display: flex; flex-direction: column; gap: 16px; }
.updates__fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.updates__field { display: flex; flex-direction: column; gap: 6px; }

.updates__label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(243,243,243,0.6);
}
.updates__req { color: rgba(243,243,243,0.5); }

.updates__input {
  background: rgba(243,243,243,0.1); border: 1.5px solid rgba(243,243,243,0.2);
  border-radius: var(--radius-sm); padding: 13px 15px;
  font-size: 15px; color: #f3f3f3; width: 100%;
  transition: border-color 180ms var(--ease);
}
.updates__input::placeholder { color: rgba(243,243,243,0.4); }
.updates__input:focus { outline: none; border-color: rgba(243,243,243,0.6); }

.updates__btn {
  background: #f3f3f3; color: var(--ink); border: none; border-radius: var(--radius);
  padding: 15px 28px; font-family: var(--font-display); font-size: 15px; font-weight: 600;
  letter-spacing: -0.01em; cursor: pointer; align-self: flex-start;
  transition: background 200ms var(--ease), transform 180ms var(--ease);
}
.updates__btn:hover { background: rgba(243,243,243,0.88); transform: translateY(-1px); }

@media (max-width: 900px) {
  .updates__card { grid-template-columns: 1fr; gap: 40px; }
  .updates__fields { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .updates__card { padding: clamp(36px, 8vw, 52px); }
  .updates__btn { width: 100%; justify-content: center; }
}
</style>
