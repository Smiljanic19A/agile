<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import { ref, computed } from 'vue'

const name = ref('')
const email = ref('')
const role = ref('')
const interest = ref('')
const message = ref('')
const sent = ref(false)

const interestOptions = [
  'Consulting',
  'Workshop / staff education',
  'Performance-system audit',
  'Athlete programming',
  'Individual athlete performance management',
  'Speaking / conference',
  'Software/tool/workflow design',
  'Other',
]

const canSubmit = computed(() => email.value.trim() && interest.value)

function submit() {
  if (!canSubmit.value) return
  const sub = encodeURIComponent(interest.value || 'Message via agileperiodization.com')
  const body = encodeURIComponent(`Name: ${name.value || '—'}\nEmail: ${email.value}\nRole: ${role.value || '—'}\n\nInterest: ${interest.value}\n\nMessage:\n${message.value || '—'}`)
  window.open(`mailto:mladen@agileperiodization.com?subject=${sub}&body=${body}`)
  sent.value = true
}

const proofPoints = [
  'Head of Performance, Serbia Women\'s National Football Team',
  'Former Port Adelaide FC, Aspire Academy, Hammarby IF',
  'Author of Strength Training Manual and HIIT Manual',
  'Developer of AthleteSR, Strength Card Builder, HIT Builder',
  'Founder/author at Complementary Training',
]
</script>

<template>
  <section id="contact" class="contact section section--cream" aria-labelledby="contact-title">
    <div class="container contact__grid">

      <!-- Mladen bio card -->
      <div class="contact__about fade-up">
        <div class="contact__photo-wrap">
          <img src="/assets/images/mladen-profile.jpg" alt="Mladen Jovanović" class="contact__photo" />
        </div>
        <SectionLabel index="09" label="Why trust this?" />
        <h2 id="contact-title" class="contact__bio-title">Built by a coach, sport scientist, and toolmaker.</h2>
        <p class="contact__bio-text">
          Mladen Jovanović, PhD, works at the intersection of coaching, sport science, software, and performance management.
        </p>
        <ul class="contact__proof">
          <li v-for="p in proofPoints" :key="p">{{ p }}</li>
        </ul>
      </div>

      <!-- Contact form card -->
      <div class="contact__form-card fade-up">
        <p class="contact__form-eyebrow">Direct work</p>
        <h3 class="contact__form-title">Work with me directly.</h3>
        <p class="contact__form-desc">
          If you want help applying Agile Periodization inside your team, club, clinic, or individual performance environment, get in touch.
        </p>

        <Transition name="fade-soft" mode="out-in">
          <div v-if="sent" class="contact__confirm">
            Got it. I'll be in touch soon.
          </div>
          <form v-else class="contact__form" @submit.prevent="submit" novalidate>
            <div class="contact__field">
              <label for="c-name" class="contact__label">Name</label>
              <input id="c-name" v-model="name" type="text" placeholder="Your name" class="contact__input" autocomplete="name" />
            </div>
            <div class="contact__field">
              <label for="c-email" class="contact__label">Email <span class="contact__req" aria-hidden="true">*</span></label>
              <input id="c-email" v-model="email" type="email" placeholder="you@example.com" required class="contact__input" autocomplete="email" />
            </div>
            <div class="contact__field">
              <label for="c-role" class="contact__label">Role / organization</label>
              <input id="c-role" v-model="role" type="text" placeholder="Coach, physio, athlete, club..." class="contact__input" />
            </div>
            <div class="contact__field">
              <label for="c-interest" class="contact__label">What are you interested in? <span class="contact__req" aria-hidden="true">*</span></label>
              <div class="contact__select-wrap">
                <select id="c-interest" v-model="interest" required class="contact__select">
                  <option value="">Select one</option>
                  <option v-for="opt in interestOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <span class="contact__select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>
            <div class="contact__field">
              <label for="c-message" class="contact__label">Message</label>
              <textarea id="c-message" v-model="message" rows="4" placeholder="Tell me what you are trying to solve." class="contact__input contact__textarea"></textarea>
            </div>
            <button type="submit" class="contact__submit" :disabled="!canSubmit">
              Send Inquiry <span aria-hidden="true">→</span>
            </button>
            <p class="contact__fine">Opens your mail client.</p>
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

.fade-soft-enter-active, .fade-soft-leave-active { transition: opacity 200ms var(--ease); }
.fade-soft-enter-from, .fade-soft-leave-to { opacity: 0; }

@media (max-width: 960px) { .contact__grid { grid-template-columns: 1fr; gap: 48px; } }
@media (max-width: 640px) { .contact__photo-wrap { max-width: 100%; } }
</style>
