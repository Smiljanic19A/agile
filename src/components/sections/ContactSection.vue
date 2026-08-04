<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { api } from '@/lib/api.js'

const { t, locale } = useI18n()

// ── Bio card (API-driven, i18n as offline fallback) ─────────────
const DEFAULT_PHOTO = '/assets/images/mladen-profile.jpg'
const bio = ref(null)
const bioLoading = ref(true)

onMounted(async () => {
  try {
    bio.value = await api.contactBio()
  } catch {
    /* API unreachable — fall back to the baked-in i18n copy */
  }
  bioLoading.value = false
})

function localized(field) {
  const v = bio.value?.[field]
  return (v && (v[locale.value] || v.en)) || ''
}
const bioTitle = computed(() => (bio.value ? localized('title') : t('contact.bioTitle')))
const bioText = computed(() => (bio.value ? localized('text') : t('contact.bioText')))
const bioBullets = computed(() => {
  if (!bio.value) return t('contact.proofPoints')
  return (bio.value.bullets || []).map((b) => b[locale.value] || b.en).filter(Boolean)
})
const bioPhoto = computed(() => bio.value?.photo_url || DEFAULT_PHOTO)

// ── Form ─────────────────────────────────────────────────────────
const name = ref('')
const email = ref('')
const role = ref('')
const interest = ref('')
const message = ref('')
const sent = ref(false)
const sending = ref(false)
const sendError = ref('')

const interestOptions = computed(() => t('contact.interestOptions'))

const canSubmit = computed(() => email.value.trim() && interest.value)

async function submit() {
  if (!canSubmit.value || sending.value) return
  sending.value = true
  sendError.value = ''
  try {
    await api.submitContact({
      name: name.value || null,
      email: email.value,
      role: role.value || null,
      interest: interest.value || null,
      message: message.value || null,
    })
    sent.value = true
  } catch {
    sendError.value = t('contact.errorSend')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section id="contact" class="contact section section--cream" aria-labelledby="contact-title">
    <div class="container contact__grid">

      <!-- Mladen bio card -->
      <div class="contact__about fade-up">
        <!-- Skeleton while the API-driven copy loads -->
        <template v-if="bioLoading">
          <div class="contact__photo-wrap">
            <div class="contact__skel contact__skel--photo"></div>
          </div>
          <SectionLabel index="09" :label="t('contact.label')" />
          <div class="contact__skel-stack" aria-hidden="true">
            <div class="contact__skel contact__skel--title"></div>
            <div class="contact__skel contact__skel--title" style="width: 58%"></div>
          </div>
          <div class="contact__skel-stack" aria-hidden="true">
            <div class="contact__skel contact__skel--line"></div>
            <div class="contact__skel contact__skel--line" style="width: 92%"></div>
            <div class="contact__skel contact__skel--line" style="width: 64%"></div>
          </div>
          <div class="contact__skel-list" aria-hidden="true">
            <div v-for="i in 5" :key="i" class="contact__skel contact__skel--bullet" :style="{ width: 60 + ((i * 13) % 35) + '%' }"></div>
          </div>
        </template>

        <template v-else>
          <div class="contact__photo-wrap">
            <img :src="bioPhoto" alt="Mladen Jovanović" class="contact__photo" />
          </div>
          <SectionLabel index="09" :label="t('contact.label')" />
          <h2 id="contact-title" class="contact__bio-title">{{ bioTitle }}</h2>
          <p class="contact__bio-text">
            {{ bioText }}
          </p>
          <ul class="contact__proof">
            <li v-for="p in bioBullets" :key="p">{{ p }}</li>
          </ul>
        </template>
      </div>

      <!-- Contact form card -->
      <div class="contact__form-card fade-up">
        <p class="contact__form-eyebrow">{{ t('contact.formEyebrow') }}</p>
        <h3 class="contact__form-title">{{ t('contact.formTitle') }}</h3>
        <p class="contact__form-desc">
          {{ t('contact.formDesc') }}
        </p>

        <Transition name="fade-soft" mode="out-in">
          <div v-if="sent" class="contact__confirm">
            {{ t('contact.confirm') }}
          </div>
          <form v-else class="contact__form" @submit.prevent="submit" novalidate>
            <div class="contact__field">
              <label for="c-name" class="contact__label">{{ t('contact.name') }}</label>
              <input id="c-name" v-model="name" type="text" :placeholder="t('contact.namePlaceholder')" class="contact__input" autocomplete="name" />
            </div>
            <div class="contact__field">
              <label for="c-email" class="contact__label">{{ t('contact.email') }} <span class="contact__req" aria-hidden="true">*</span></label>
              <input id="c-email" v-model="email" type="email" :placeholder="t('contact.emailPlaceholder')" required class="contact__input" autocomplete="email" />
            </div>
            <div class="contact__field">
              <label for="c-role" class="contact__label">{{ t('contact.role') }}</label>
              <input id="c-role" v-model="role" type="text" :placeholder="t('contact.rolePlaceholder')" class="contact__input" />
            </div>
            <div class="contact__field">
              <label for="c-interest" class="contact__label">{{ t('contact.interest') }} <span class="contact__req" aria-hidden="true">*</span></label>
              <div class="contact__select-wrap">
                <select id="c-interest" v-model="interest" required class="contact__select">
                  <option value="">{{ t('contact.selectOne') }}</option>
                  <option v-for="opt in interestOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <span class="contact__select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>
            <div class="contact__field">
              <label for="c-message" class="contact__label">{{ t('contact.message') }}</label>
              <textarea id="c-message" v-model="message" rows="4" :placeholder="t('contact.messagePlaceholder')" class="contact__input contact__textarea"></textarea>
            </div>
            <button type="submit" class="contact__submit" :disabled="!canSubmit || sending">
              {{ sending ? t('contact.sending') : t('contact.send') }} <span aria-hidden="true">→</span>
            </button>
            <p v-if="sendError" class="contact__error" role="alert">{{ sendError }}</p>
            <p class="contact__fine">{{ t('contact.fine') }}</p>
          </form>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact { background: var(--paper); color: var(--ink); }

.contact__grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
}

/* Bio card */
.contact__about { display: flex; flex-direction: column; gap: 24px; }

.contact__photo-wrap { border-radius: var(--radius-lg); overflow: hidden; max-width: 360px; }
.contact__photo { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }

.contact__bio-title {
  font-family: var(--font-display); font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 700; letter-spacing: -0.02em; line-height: 1.12;
  color: var(--ink); margin: 0; max-width: 22ch;
}

.contact__bio-text {
  font-size: clamp(15px, 1.1vw, 17px); line-height: 1.68; color: var(--ink-soft); margin: 0;
}

.contact__proof {
  list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0;
  border-top: 1px solid var(--hairline);
}
.contact__proof li {
  font-size: 14px; line-height: 1.5; color: var(--ink-soft); padding: 13px 0;
  border-bottom: 1px solid var(--hairline); display: flex; align-items: flex-start; gap: 12px;
}
.contact__proof li::before { content: '—'; color: var(--teal); flex-shrink: 0; font-family: var(--font-mono); font-size: 12px; margin-top: 1px; }

/* Form card */
.contact__form-card {
  background: #f3f8f7; border: 1px solid rgba(55, 136, 130, 0.14);
  border-radius: var(--radius-lg); padding: clamp(28px, 4vw, 44px);
  display: flex; flex-direction: column; gap: 20px;
}

.contact__form-eyebrow {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--teal); margin: 0;
}
.contact__form-title {
  font-family: var(--font-display); font-size: clamp(22px, 2.2vw, 30px); font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.15; color: var(--ink); margin: 0;
}
.contact__form-desc { font-size: 15px; line-height: 1.6; color: var(--ink-soft); margin: 0; }

.contact__form { display: flex; flex-direction: column; gap: 16px; }
.contact__field { display: flex; flex-direction: column; gap: 6px; }
.contact__label {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--mute);
}
.contact__req { color: var(--teal); }

.contact__input {
  background: #ffffff; border: 1.5px solid rgba(14,26,26,0.12);
  border-radius: var(--radius-sm); padding: 13px 15px;
  font-size: 15px; color: var(--ink); width: 100%;
  transition: border-color 180ms var(--ease), box-shadow 180ms var(--ease);
  font-family: var(--font-body);
}
.contact__input::placeholder { color: var(--mute); }
.contact__input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(55,136,130,0.12); }
.contact__textarea { resize: vertical; min-height: 100px; }

.contact__select-wrap { position: relative; }
.contact__select {
  appearance: none; -webkit-appearance: none;
  background: #ffffff; border: 1.5px solid rgba(14,26,26,0.12);
  border-radius: var(--radius-sm); padding: 13px 44px 13px 15px;
  font-size: 15px; color: var(--ink); width: 100%; cursor: pointer;
  font-family: var(--font-body);
  transition: border-color 180ms var(--ease);
}
.contact__select:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(55,136,130,0.12); }
.contact__select-chevron {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 12px; color: var(--mute); pointer-events: none;
}

.contact__submit {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; background: var(--ink); color: #f3f3f3;
  border: none; border-radius: var(--radius); cursor: pointer;
  font-family: var(--font-display); font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
  margin-top: 4px; transition: background 200ms var(--ease), transform 180ms var(--ease);
}
.contact__submit:hover:not(:disabled) { background: var(--ink-soft); transform: translateY(-1px); }
.contact__submit:disabled { opacity: 0.35; cursor: default; }

.contact__fine {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.05em;
  color: var(--mute); margin: 0; text-align: center;
}

.contact__confirm {
  font-family: var(--font-display); font-size: 18px; font-weight: 600; line-height: 1.4;
  color: var(--teal-deep); padding: 24px 0;
}

.contact__error {
  font-size: 13.5px; line-height: 1.5; margin: 0; text-align: center;
  color: #b3402a;
}

/* ── Bio skeleton ─────────────────────────────────────────────── */
.contact__skel {
  border-radius: 8px;
  background: var(--hairline);
  animation: contact-skel 1.4s ease-in-out infinite;
}
@keyframes contact-skel {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
.contact__skel--photo { width: 100%; aspect-ratio: 4/3; border-radius: 0; }
.contact__skel--title { height: clamp(22px, 2.4vw, 30px); width: 86%; }
.contact__skel--line { height: 13px; }
.contact__skel--bullet { height: 12px; }
.contact__skel-stack { display: flex; flex-direction: column; gap: 10px; }
.contact__skel-list {
  display: flex; flex-direction: column; gap: 0;
  border-top: 1px solid var(--hairline);
}
.contact__skel-list .contact__skel--bullet {
  margin: 15px 0;
}

.fade-soft-enter-active, .fade-soft-leave-active { transition: opacity 200ms var(--ease); }
.fade-soft-enter-from, .fade-soft-leave-to { opacity: 0; }

@media (max-width: 960px) { .contact__grid { grid-template-columns: 1fr; gap: 48px; } }
@media (max-width: 640px) { .contact__photo-wrap { max-width: 100%; } }
</style>
