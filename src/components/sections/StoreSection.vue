<script setup>
import { computed } from 'vue'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import ProductCard from '@/components/ui/ProductCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()

const featuredIds = ['s1', 's5', 's6', 's2']
const resources = computed(() =>
  featuredIds.map((id) => content.items.find((i) => i.id === id)).filter(Boolean)
)
</script>

<template>
  <section id="resources" class="store section section--teal" aria-labelledby="store-title">
    <div class="container">
      <header class="store__head fade-up">
        <div class="store__head-left">
          <SectionLabel index="06" label="Payhip Resources" />
          <h2 id="store-title" class="display-2 store__title">
            Courses, tools, PDFs, <em>and working resources.</em>
          </h2>
        </div>
        <div class="store__head-right is-desktop-only">
          <AppButton variant="onTeal" :href="externalLinks.payhip" external>Browse Payhip</AppButton>
        </div>
      </header>

      <div class="store__grid is-desktop-only fade-up">
        <ProductCard v-for="item in resources" :key="item.id" :item="item" />
      </div>

      <div class="store__rail snap-rail snap-rail--narrow is-mobile-only fade-up">
        <ProductCard v-for="item in resources" :key="item.id" :item="item" />
      </div>

      <div class="store__mobile-cta is-mobile-only">
        <AppButton variant="ghostOnTeal" :href="externalLinks.payhip" external>Browse all resources</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.store { background: var(--teal); color: var(--cream); }

.store__head {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 32px; margin-bottom: 48px;
}
.store__head-left { display: flex; flex-direction: column; gap: 20px; }
.store__title { color: var(--cream); max-width: 22ch; margin: 0; }
.store__title em { font-style: italic; font-weight: 500; color: rgba(243,243,243,0.72); }

.store__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

@media (max-width: 1100px) {
  .store__head { flex-direction: column; align-items: flex-start; margin-bottom: 36px; }
  .store__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .store__mobile-cta { margin-top: 14px; display: flex; }
  .store__mobile-cta :deep(.btn) { width: 100%; justify-content: center; }
  .store__rail :deep(.prod) { height: clamp(360px, 76vw, 460px); }
}
</style>
