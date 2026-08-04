<script setup>
import { computed, ref } from 'vue'
import { useContentStore, sources } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import ProductCard from '@/components/ui/ProductCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const content = useContentStore()

// Tabs come from whatever categories actually exist on the products
const CATEGORY_ORDER = ['books', 'courses', 'tools']
const activeTab = ref('all')

const tabs = computed(() => {
  const present = [...new Set(content.products.map(p => p.category).filter(Boolean))]
  const known = CATEGORY_ORDER.filter(c => present.includes(c))
  const rest = present.filter(c => !CATEGORY_ORDER.includes(c)).sort()
  return ['all', ...known, ...rest]
})

function tabLabel(c) {
  const labels = t('store.tabs')
  return (labels && labels[c]) || c.charAt(0).toUpperCase() + c.slice(1)
}

const resources = computed(() => {
  const list = activeTab.value === 'all'
    ? content.products
    : content.products.filter(i => i.category === activeTab.value)
  return list.slice(0, 4)
})

// Browse button: only on a specific category tab, pointing at that
// category's own storefront (Amazon for books, Payhip for the rest).
const browse = computed(() => {
  if (activeTab.value === 'all') return null
  const items = content.products.filter(i => i.category === activeTab.value)
  const src = items.find(i => sources[i.source])?.source || 'payhip'
  const s = sources[src]
  return s ? { url: s.url, label: `${t('store.browsePrefix')} ${s.name}` } : null
})
</script>

<template>
  <section id="resources" class="store section section--teal" aria-labelledby="store-title">
    <div class="container">
      <header class="store__head fade-up">
        <div class="store__head-left">
          <SectionLabel index="06" :label="t('store.label')" />
          <h2 id="store-title" class="display-2 store__title" v-html="t('store.title')"></h2>
        </div>
        <div v-if="browse" class="store__head-right is-desktop-only">
          <AppButton variant="onTeal" :href="browse.url" external>{{ browse.label }}</AppButton>
        </div>
      </header>

      <div v-if="tabs.length > 2" class="store__tabs" role="tablist" aria-label="Resource types">
        <button
          v-for="c in tabs" :key="c" type="button" role="tab"
          :aria-selected="activeTab === c"
          :class="{ 'is-on': activeTab === c }"
          @click="activeTab = c"
        >{{ tabLabel(c) }}</button>
      </div>

      <div class="store__grid is-desktop-only fade-up">
        <ProductCard v-for="item in resources" :key="item.id" :item="item" />
      </div>

      <div class="store__rail snap-rail snap-rail--narrow is-mobile-only fade-up">
        <ProductCard v-for="item in resources" :key="item.id" :item="item" />
      </div>

      <div v-if="browse" class="store__mobile-cta is-mobile-only">
        <AppButton variant="ghostOnTeal" :href="browse.url" external>{{ browse.label }}</AppButton>
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

.store__tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.store__tabs button {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 8px 16px; border-radius: 999px;
  border: 1px solid var(--hairline-light-strong);
  background: transparent; color: var(--cream);
  opacity: 0.75; cursor: pointer;
  transition: opacity 180ms var(--ease), background 180ms var(--ease), color 180ms var(--ease), border-color 180ms var(--ease);
}
.store__tabs button:hover { opacity: 1; }
.store__tabs button.is-on {
  background: #f3f3f3; color: #23615c;
  border-color: transparent; opacity: 1;
}

/* v3 white canvas: the light active pill would vanish — flip it to teal */
:global(html[data-theme="v3"]) .store__tabs button.is-on {
  background: var(--teal);
  color: #f3f3f3;
}

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
