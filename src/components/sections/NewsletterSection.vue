<script setup>
import { ref } from 'vue'
import HexLattice from '@/components/ui/HexLattice.vue'

const email = ref('')
const submitted = ref(false)

const submit = () => {
  if (!email.value.trim()) return
  submitted.value = true
}
</script>

<template>
  <section id="newsletter" class="news section section--teal" aria-labelledby="news-title">
    <div class="news__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="top" :size="80" :accents="5" :seed="22" />
    </div>
    <div class="container news__inner">
      <div class="news__copy">
        <span class="eyebrow news__eyebrow">Stay connected</span>
        <h2 id="news-title" class="display-2 news__title fade-up">
          New essays, tools, and updates — <em>once or twice a month.</em>
        </h2>
      </div>

      <form class="news__form fade-up" @submit.prevent="submit">
        <label for="news-email" class="sr-only">Email</label>
        <input
          id="news-email"
          v-model="email"
          type="email"
          required
          placeholder="you@example.com"
          class="news__input"
          :disabled="submitted"
        />
        <button type="submit" class="news__submit" :disabled="submitted">
          <span v-if="!submitted">Get updates</span>
          <span v-else>Subscribed</span>
          <span class="news__arrow" aria-hidden="true">→</span>
        </button>
        <p class="news__fine">
          One email at a time. Unsubscribe anytime. No noise.
        </p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.news {
  background: var(--teal);
  color: var(--cream);
  padding-top: clamp(60px, 8vw, 120px);
  padding-bottom: clamp(60px, 8vw, 120px);
  border-top: 1px solid var(--hairline-light);
  border-bottom: 1px solid var(--hairline-light);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.news__hex {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.news__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 64px;
  align-items: end;
  position: relative;
  z-index: 1;
}

.news__eyebrow {
  color: rgba(243, 243, 243, 0.75) !important;
}

.news__copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.news__title {
  max-width: 20ch;
  color: var(--cream);
}
.news__title em {
  font-style: italic;
  font-weight: 500;
  color: rgba(243, 243, 243, 0.78);
}

.news__form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  position: relative;
}
.news__input {
  background: transparent;
  border: 1px solid var(--hairline-light-strong);
  border-radius: 999px;
  color: var(--cream);
  padding: 16px 22px;
  font-size: 15px;
  font-family: var(--font-body);
  transition: border-color 200ms var(--ease), background 200ms var(--ease);
}
.news__input::placeholder {
  color: rgba(243, 243, 243, 0.5);
}
.news__input:focus {
  outline: none;
  border-color: var(--cream);
  background: rgba(243, 243, 243, 0.04);
}
.news__submit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--cream);
  color: var(--ink);
  border-radius: 999px;
  padding: 16px 22px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--cream);
  transition: background 200ms var(--ease), color 200ms var(--ease);
}
.news__submit:hover:not(:disabled) {
  background: var(--ink);
  color: var(--cream);
  border-color: var(--ink);
}
.news__submit:hover:not(:disabled) .news__arrow {
  transform: translateX(3px);
}
.news__submit:disabled {
  opacity: 0.6;
  cursor: default;
}
.news__arrow {
  transition: transform 220ms var(--ease);
}
.news__fine {
  grid-column: 1 / -1;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(243, 243, 243, 0.6);
  margin: 6px 4px 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 960px) {
  .news__inner {
    grid-template-columns: 1fr;
    gap: 28px;
    align-items: start;
  }
}
@media (max-width: 720px) {
  .news__form {
    grid-template-columns: 1fr;
  }
  .news__submit {
    justify-content: center;
    padding: 14px 20px;
  }
  .news__input {
    padding: 14px 18px;
  }
}
</style>
