<script setup>
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()
const { books } = storeToRefs(content)

const bookGradient = (seed) => {
  const palettes = [
    ['#378882', '#23615C'],
    ['#5BA39D', '#378882'],
    ['#23615C', '#0E1A1A'],
    ['#378882', '#5BA39D'],
    ['#0E1A1A', '#23615C'],
  ]
  const p = palettes[Math.abs(seed) % palettes.length]
  return `linear-gradient(155deg, ${p[0]} 0%, ${p[1]} 100%)`
}
</script>

<template>
  <section id="books" class="books section section--cream" aria-labelledby="books-title">
    <div class="container books__head">
      <div class="books__head-left">
        <SectionLabel index="04" label="Books" />
        <h2 id="books-title" class="display-2 books__title fade-up">
          The long-form work, <em>collected in print.</em>
        </h2>
      </div>
      <div class="books__head-right fade-up">
        <p class="prose">
          Books for readers who prefer a structured long-form format. Available
          through Amazon — international shipping where supported.
        </p>
        <AppButton variant="ghost" :href="externalLinks.amazon" external>
          Browse all books
        </AppButton>
      </div>
    </div>

    <div class="books__scroll-wrap">
      <div class="books__scroll fade-up">
        <a
          v-for="b in books"
          :key="b.id"
          :href="b.href"
          target="_blank"
          rel="noopener noreferrer"
          class="book"
        >
          <div class="book__cover" :style="{ background: bookGradient(b.seed) }">
            <div class="book__spine"></div>
            <div class="book__cover-inner">
              <span class="book__cover-eyebrow">Agile Periodization</span>
              <span class="book__cover-title">{{ b.title }}</span>
              <span class="book__cover-author">Mladen Jovanović</span>
            </div>
            <div class="book__cover-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="32" height="32">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(243,243,243,0.55)" stroke-width="1" />
                <circle cx="20" cy="20" r="4" fill="rgba(243,243,243,0.85)" />
              </svg>
            </div>
          </div>
          <div class="book__meta">
            <div class="book__title">{{ b.title }}</div>
            <div class="book__row">
              <span class="book__year">{{ b.year }}</span>
              <span class="book__cta">
                Find on Amazon
                <span class="book__arrow" aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.books {
  background: var(--paper);
  color: var(--ink);
  overflow: hidden;
}

.books__head {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 60px;
  align-items: end;
  margin-bottom: 56px;
}
.books__head-left {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.books__title {
  max-width: 16ch;
  font-variation-settings: "SOFT" 40, "opsz" 144;
}
.books__title em {
  font-style: italic;
  font-weight: 300;
  color: var(--teal-deep);
  font-variation-settings: "SOFT" 100, "opsz" 144;
}
.books__head-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
}

.books__scroll-wrap {
  padding: 0 var(--gutter);
  max-width: var(--container);
  margin: 0 auto;
}
.books__scroll {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 24px;
}

.book {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: inherit;
  text-decoration: none;
  transition: transform 220ms var(--ease);
}
.book:hover .book__arrow {
  transform: translateX(3px);
}

.book__cover {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 22px;
  color: var(--cream);
  border: 1px solid var(--hairline);
  box-shadow: 0 30px 60px -40px rgba(14, 26, 26, 0.55);
}
.book__spine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 8px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0)
  );
}
.book__cover-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.book__cover-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.7;
}
.book__cover-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 26px;
  line-height: 1.05;
  letter-spacing: -0.018em;
  margin-top: 24px;
  font-variation-settings: "SOFT" 30, "opsz" 144;
}
.book__cover-author {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
}
.book__cover-mark {
  position: absolute;
  bottom: 18px;
  right: 18px;
  opacity: 0.7;
}

.book__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.book__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--ink);
  font-variation-settings: "SOFT" 30, "opsz" 144;
}
.book__row {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mute);
}
.book__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
}
.book__arrow {
  transition: transform 220ms var(--ease);
}

@media (max-width: 1180px) {
  .books__scroll {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
}
@media (max-width: 820px) {
  .books__head {
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }
  .books__scroll-wrap {
    padding: 0;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .books__scroll {
    grid-template-columns: repeat(5, 260px);
    padding: 0 var(--gutter);
  }
  .book {
    scroll-snap-align: start;
  }
}
</style>
