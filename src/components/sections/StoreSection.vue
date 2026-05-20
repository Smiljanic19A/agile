<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import StoreTabs from '@/components/ui/StoreTabs.vue'
import ProductCard from '@/components/ui/ProductCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()
const { products, tabs } = storeToRefs(content)

const active = ref('all')

const visible = computed(() =>
  active.value === 'all'
    ? products.value
    : products.value.filter((p) => p.category === active.value)
)
</script>

<template>
  <section id="store" class="store section section--teal" aria-labelledby="store-title">
    <div class="container">
      <header class="store__head">
        <div class="store__head-left">
          <SectionLabel index="03" label="Tools & Resources" />
          <h2 id="store-title" class="display-2 store__title fade-up">
            Books, courses, templates, <em>and working material.</em>
          </h2>
        </div>
        <p class="store__lead fade-up">
          Practical resources for coaches who want things they can actually use.
          Hosted on Payhip and Amazon — this is just where you start.
        </p>
      </header>

      <div class="store__tab-row fade-up">
        <StoreTabs v-model="active" :tabs="tabs" />
        <AppButton variant="ghostOnTeal" size="sm" :href="externalLinks.payhip" external>
          Visit full store
        </AppButton>
      </div>

      <Transition name="store-fade" mode="out-in">
        <div :key="active" class="store__grid">
          <ProductCard
            v-for="p in visible"
            :key="p.id"
            :product="p"
          />
        </div>
      </Transition>

      <p v-if="!visible.length" class="store__empty">No items in this category yet.</p>
    </div>
  </section>
</template>

<style scoped>
.store {
  background: var(--teal);
  color: var(--cream);
}

.store__head {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 60px;
  align-items: end;
  margin-bottom: 48px;
}
.store__head-left {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.store__title {
  max-width: 18ch;
  color: var(--cream);
  font-variation-settings: "SOFT" 40, "opsz" 144;
}
.store__title em {
  font-style: italic;
  font-weight: 300;
  color: rgba(243, 243, 243, 0.7);
  font-variation-settings: "SOFT" 100, "opsz" 144;
}
.store__lead {
  color: rgba(243, 243, 243, 0.78);
  font-size: 16px;
  line-height: 1.6;
  max-width: 46ch;
  margin: 0 0 6px;
}

.store__tab-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.store__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.store__empty {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  opacity: 0.7;
  padding: 60px 0;
}

.store-fade-enter-active,
.store-fade-leave-active {
  transition: opacity 220ms var(--ease), transform 220ms var(--ease);
}
.store-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.store-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1100px) {
  .store__head {
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }
  .store__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 820px) {
  .store__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .store__grid {
    grid-template-columns: 1fr;
  }
}
</style>
