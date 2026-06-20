<script setup>
import { ref } from 'vue'
import SectionLabel from '@/components/ui/SectionLabel.vue'

const name = ref('')
const email = ref('')
const sent = ref(false)

function submit() {
  if (!email.value.trim()) return
  sent.value = true
}
</script>

<template>
  <section id="updates" class="updates section section--cream" aria-labelledby="updates-title">
    <div class="container">
      <div class="updates__card fade-up">
        <div class="updates__copy">
          <SectionLabel index="08" label="Updates" />
          <h2 id="updates-title" class="display-2 updates__title">Stay in the loop.</h2>
          <p class="updates__desc">
            Get new articles, tools, product releases, rehab/RTP work, workshops, and community updates.
          </p>
        </div>

        <Transition name="fade-soft" mode="out-in">
          <div v-if="sent" class="updates__confirm">
            You're on the list. I'll send useful updates, not daily noise.
          </div>
          <form v-else class="updates__form" @submit.prevent="submit" novalidate>
            <div class="updates__fields">
              <div class="updates__field">
                <label for="u-name" class="updates__label">Name</label>
                <input id="u-name" v-model="name" type="text" placeholder="Your name" class="updates__input" />
              </div>
              <div class="updates__field">
                <label for="u-email" class="updates__label">Email <span class="updates__req" aria-hidden="true">*</span></label>
                <input id="u-email" v-model="email" type="email" placeholder="you@example.com" required class="updates__input" />
              </div>
            </div>
            <button type="submit" class="updates__btn" :disabled="!email.trim()">Get Updates</button>
          </form>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.updates { background: var(--paper); color: var(--ink); }

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
.updates__btn:hover:not(:disabled) { background: rgba(243,243,243,0.88); transform: translateY(-1px); }
.updates__btn:disabled { opacity: 0.38; cursor: default; }

.updates__confirm {
  font-family: var(--font-display); font-size: 20px; font-weight: 600; line-height: 1.4;
  color: rgba(243,243,243,0.95); padding: 24px 0;
}

.fade-soft-enter-active, .fade-soft-leave-active { transition: opacity 200ms var(--ease); }
.fade-soft-enter-from, .fade-soft-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .updates__card { grid-template-columns: 1fr; gap: 40px; }
  .updates__fields { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .updates__card { padding: clamp(36px, 8vw, 52px); }
  .updates__btn { width: 100%; justify-content: center; }
}
</style>
