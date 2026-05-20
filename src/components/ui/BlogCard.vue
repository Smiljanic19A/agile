<script setup>
import AbstractCover from './AbstractCover.vue'

defineProps({
  post: { type: Object, required: true },
  variant: { type: String, default: 'standard' }, // 'feature' | 'standard' | 'text'
})
</script>

<template>
  <a
    :href="post.href"
    target="_blank"
    rel="noopener noreferrer"
    class="card"
    :class="[`card--${variant}`]"
  >
    <div v-if="variant !== 'text'" class="card__cover">
      <AbstractCover :seed="post.seed" tone="cream" :label="post.category" />
    </div>

    <div class="card__body">
      <div class="card__meta">
        <span class="card__chip">{{ post.category }}</span>
        <span class="card__dot" aria-hidden="true">·</span>
        <span class="card__time">{{ post.readTime }}</span>
      </div>

      <h3 class="card__title" :class="variant === 'feature' ? 'display-3' : ''">
        {{ post.title }}
      </h3>

      <p v-if="post.dek && variant !== 'text'" class="card__dek">{{ post.dek }}</p>

      <div class="card__foot">
        <span class="card__date">{{ post.date }}</span>
        <span class="card__read">
          Read essay
          <span class="card__arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  background: rgba(243, 243, 243, 0.04);
  border: 1px solid var(--hairline-light);
  border-radius: var(--radius);
  padding: 22px;
  transition: background 220ms var(--ease), border-color 220ms var(--ease),
    transform 220ms var(--ease);
  height: 100%;
}
.card:hover {
  background: rgba(243, 243, 243, 0.08);
  border-color: var(--hairline-light-strong);
}
.card:hover .card__arrow {
  transform: translateX(4px);
}

.card__cover {
  margin-bottom: 22px;
}
.card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.7;
  margin-bottom: 14px;
}
.card__chip {
  display: inline-block;
  padding: 4px 10px;
  border: 1px solid var(--hairline-light-strong);
  border-radius: 999px;
}
.card__dot {
  opacity: 0.5;
}

.card__title {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.018em;
  margin: 0 0 10px;
  font-variation-settings: "SOFT" 30, "opsz" 144;
}

.card__dek {
  color: rgba(243, 243, 243, 0.74);
  font-size: 15px;
  line-height: 1.55;
  margin: 0 0 28px;
  max-width: 56ch;
}

.card__foot {
  margin-top: auto;
  padding-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.78;
  border-top: 1px solid var(--hairline-light);
}
.card__read {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.card__arrow {
  display: inline-block;
  transition: transform 220ms var(--ease);
}

/* feature variant: 2-column on desktop */
.card--feature {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  align-items: stretch;
  gap: 36px;
  padding: 28px;
}
.card--feature .card__cover {
  margin-bottom: 0;
}
.card--feature .card__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card--feature .card__title {
  font-size: clamp(28px, 3.4vw, 48px);
  margin-bottom: 18px;
}
.card--feature .card__dek {
  font-size: 17px;
  line-height: 1.55;
  max-width: 44ch;
  margin-bottom: 36px;
}

/* text-only tile */
.card--text {
  background: transparent;
  border: 1px solid var(--hairline-light);
  padding: 28px;
}
.card--text .card__title {
  font-size: clamp(22px, 2vw, 26px);
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .card--feature {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 720px) {
  .card {
    padding: 18px;
  }
  .card--feature {
    padding: 18px;
  }
  .card--feature .card__title {
    font-size: 26px;
    margin-bottom: 12px;
  }
  .card--feature .card__dek {
    font-size: 15px;
    margin-bottom: 22px;
  }
  .card--text {
    padding: 20px;
  }
  .card__cover {
    margin-bottom: 16px;
  }
  .card__title {
    font-size: 20px;
  }
  .card__dek {
    margin-bottom: 20px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }
  .card__meta {
    margin-bottom: 10px;
  }
  .card__foot {
    padding-top: 14px;
  }
}
</style>
