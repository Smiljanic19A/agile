<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { externalLinks } from '@/stores/content.js'

const books = [
  'Strength Training Manual',
  'HIIT Manual',
  'bmbstats',
  'Other long-form resources',
]
</script>

<template>
  <section id="amazon" class="amz section section--cream" aria-labelledby="amz-title">
    <div class="container amz__grid">
      <div class="amz__books fade-up" aria-hidden="true">
        <img src="/assets/images/strength-training-manual.png" alt="Strength Training Manual cover" class="amz__book" />
        <img src="/assets/images/hiit-manual.jpg" alt="HIIT Manual cover" class="amz__book amz__book--offset" />
      </div>

      <div class="amz__copy fade-up">
        <SectionLabel index="07" label="Amazon Books" />
        <h2 id="amz-title" class="display-2 amz__title">
          Long-form manuals for people who still <em>like paper.</em>
        </h2>
        <p class="prose amz__lead">
          Some resources are available as paperback books for coaches and practitioners who prefer reading, annotating, and destroying margins with notes.
        </p>
        <ul class="amz__list">
          <li v-for="b in books" :key="b">{{ b }}</li>
        </ul>
        <AppButton variant="ghost" :href="externalLinks.amazon" external>View Books on Amazon</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.amz { background: var(--paper); color: var(--ink); }

.amz__grid {
  display: grid; grid-template-columns: auto 1fr; gap: 80px; align-items: center;
}

.amz__books {
  display: flex; gap: 20px; align-items: flex-end; position: relative; flex-shrink: 0;
}
.amz__book {
  width: 48%; max-width: 220px; height: auto; border-radius: var(--radius);
  box-shadow: 0 12px 36px rgba(14,26,26,0.18); display: block; object-fit: cover;
}
.amz__book--offset { margin-top: 40px; }

.amz__copy { display: flex; flex-direction: column; gap: 28px; }

.amz__title { max-width: 20ch; }
.amz__title em { font-style: italic; font-weight: 500; color: var(--teal-deep); }

.amz__lead { color: var(--ink-soft); }

.amz__list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0;
  border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline);
}
.amz__list li {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-soft); padding: 14px 0; border-bottom: 1px solid var(--hairline);
  display: flex; align-items: center; gap: 12px;
}
.amz__list li:last-child { border-bottom: none; }
.amz__list li::before {
  content: '→'; font-size: 12px; color: var(--teal); flex-shrink: 0;
}

@media (max-width: 960px) { .amz__grid { grid-template-columns: 1fr; gap: 48px; } }
@media (max-width: 640px) {
  .amz__books { max-width: 360px; }
  .amz__book--offset { margin-bottom: -20px; }
}
</style>
