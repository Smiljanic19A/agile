<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { externalLinks } from '@/stores/content.js'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <section id="skool" class="skool section section--cream" aria-labelledby="skool-title">
    <div class="container skool__grid">
      <div class="skool__copy">
        <SectionLabel index="04" :label="t('skool.label')" />
        <h2 id="skool-title" class="display-2 skool__title fade-up" v-html="t('skool.title')"></h2>
        <p class="prose skool__lead fade-up">
          {{ t('skool.lead') }}
        </p>

        <ul class="skool__features fade-up" aria-label="What you get">
          <li v-for="f in t('skool.features')" :key="f">{{ f }}</li>
        </ul>

        <div class="skool__cta fade-up">
          <AppButton variant="primary" :href="externalLinks.skool" external>{{ t('skool.cta') }}</AppButton>
        </div>
      </div>

      <div class="skool__visual is-desktop-only fade-up">
        <div class="skool__img-wrap">
          <img src="/assets/images/philosophical-foundations.png" alt="Agile Periodization Philosophical Foundations" class="skool__img" />
        </div>
        <div class="skool__badge">
          <strong>{{ t('skool.badgeTitle') }}</strong>
          <p>{{ t('skool.badgeText') }}</p>
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
  background: linear-gradient(150deg, var(--teal) 0%, var(--teal-deep) 120%);
  color: #f3f3f3; border-radius: var(--radius);
  padding: 18px 22px; display: flex; flex-direction: column; gap: 6px;
  border: 1px solid rgba(243, 243, 243, 0.1);
}
.skool__badge strong { font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -0.012em; color: #f3f3f3; }
.skool__badge p { font-size: 13px; line-height: 1.5; color: rgba(243,243,243,0.85); margin: 0; }

@media (max-width: 1024px) { .skool__grid { grid-template-columns: 1fr; gap: 44px; } }
@media (max-width: 640px) { .skool__copy { gap: 22px; } }
</style>
