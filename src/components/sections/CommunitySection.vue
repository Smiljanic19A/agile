<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { externalLinks } from '@/stores/content.js'

const features = [
  'Weekly discussions',
  'Early-access resources',
  'Courses and drafts',
  'Community feedback',
]
</script>

<template>
  <section id="skool" class="skool section section--cream" aria-labelledby="skool-title">
    <div class="container skool__grid">
      <div class="skool__copy">
        <SectionLabel index="04" label="Community" />
        <h2 id="skool-title" class="display-2 skool__title fade-up">
          The workshop, not just <em>another content library.</em>
        </h2>
        <p class="prose skool__lead fade-up">
          Join the Agile Periodization community for discussions, Q&As, early-access resources, working drafts, implementation questions, and the practical mess of applying these ideas with real athletes and real constraints.
        </p>

        <ul class="skool__features fade-up" aria-label="What you get">
          <li v-for="f in features" :key="f">{{ f }}</li>
        </ul>

        <div class="skool__cta fade-up">
          <AppButton variant="primary" :href="externalLinks.skool" external>Join the Community</AppButton>
        </div>
      </div>

      <div class="skool__visual is-desktop-only fade-up">
        <div class="skool__img-wrap">
          <img src="/assets/images/philosophical-foundations.png" alt="Agile Periodization Philosophical Foundations" class="skool__img" />
        </div>
        <div class="skool__badge">
          <strong>Best first door</strong>
          <p>If someone wants context, discussion, and implementation help, send them here first.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skool { background: var(--paper); color: var(--ink); }

.skool__grid {
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: center;
}

.skool__copy { display: flex; flex-direction: column; gap: 28px; }

.skool__title { max-width: 22ch; }
.skool__title em { font-style: italic; font-weight: 500; color: var(--teal-deep); }

.skool__lead { color: var(--ink-soft); max-width: 52ch; }

.skool__features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 8px;
}
.skool__features li {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 7px 14px; border-radius: 999px;
  border: 1px solid var(--hairline-strong); color: var(--ink-soft);
}

/* Visual panel */
.skool__visual { display: flex; flex-direction: column; gap: 16px; }

.skool__img-wrap { border-radius: var(--radius-lg); overflow: hidden; }
.skool__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }

.skool__badge {
  background: var(--ink); color: var(--cream); border-radius: var(--radius);
  padding: 18px 22px; display: flex; flex-direction: column; gap: 6px;
}
.skool__badge strong { font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -0.012em; }
.skool__badge p { font-size: 13px; line-height: 1.5; color: rgba(243,243,243,0.82); margin: 0; }

@media (max-width: 1024px) { .skool__grid { grid-template-columns: 1fr; gap: 44px; } }
@media (max-width: 640px) { .skool__copy { gap: 22px; } }
</style>
