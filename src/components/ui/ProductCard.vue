<script setup>
import { computed } from 'vue'
import AbstractCover from './AbstractCover.vue'
import { sources } from '@/stores/content.js'

const props = defineProps({
  item: { type: Object, required: true },
})

const sourceName = computed(() => sources[props.item.source]?.name ?? 'Store')
const displayPrice = computed(() => props.item.price ?? 'Free')
</script>

<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="prod"
  >
    <div class="prod__cover">
      <AbstractCover :seed="item.cover.seed" tone="cream" :label="item.type" />
    </div>

    <div class="prod__body">
      <div class="prod__meta">
        <span class="prod__type">{{ item.type }}</span>
        <span class="prod__price" :class="{ 'prod__price--free': item.price === null }">{{ displayPrice }}</span>
      </div>
      <h3 class="prod__title">{{ item.title }}</h3>
      <p class="prod__blurb">{{ item.description }}</p>
      <div class="prod__foot">
        <span class="prod__cta">
          View on {{ sourceName }}
          <span class="prod__arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.prod {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  background: rgba(243, 243, 243, 0.04);
  border: 1px solid var(--hairline-light);
  border-radius: var(--radius);
  padding: 18px;
  transition: background 220ms var(--ease), border-color 220ms var(--ease);
  height: 100%;
}
.prod:hover {
  background: rgba(243, 243, 243, 0.08);
  border-color: var(--hairline-light-strong);
}
.prod:hover .prod__arrow {
  transform: translateX(4px);
}

.prod__cover {
  margin-bottom: 20px;
}

.prod__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.78;
  margin-bottom: 12px;
}
.prod__type {
  border: 1px solid var(--hairline-light-strong);
  padding: 4px 10px;
  border-radius: 999px;
}
.prod__price {
  letter-spacing: 0.04em;
}
.prod__price--free {
  color: var(--teal-soft);
}

.prod__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.018em;
  margin: 0 0 10px;
  font-variation-settings: "SOFT" 30, "opsz" 144;
}

.prod__blurb {
  color: rgba(243, 243, 243, 0.74);
  font-size: 14px;
  line-height: 1.55;
  margin: 0 0 22px;
}

.prod__foot {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--hairline-light);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.85;
}
.prod__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.prod__arrow {
  display: inline-block;
  transition: transform 220ms var(--ease);
}

@media (max-width: 720px) {
  .prod {
    padding: 16px;
  }
  .prod__cover {
    margin-bottom: 16px;
  }
  .prod__title {
    font-size: 20px;
  }
  .prod__blurb {
    margin-bottom: 16px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }
  .prod__foot {
    padding-top: 12px;
  }
}
</style>
