<script setup>
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'

const content = useContentStore()
const { threads, communityStats } = storeToRefs(content)

const initial = (h) => h.charAt(0).toUpperCase()
</script>

<template>
  <section
    id="community"
    class="comm section section--cream"
    aria-labelledby="comm-title"
  >
    <div class="container comm__grid">
      <div class="comm__left">
        <div class="comm__left-hex" aria-hidden="true">
          <HexLattice variant="cluster" tone="on-cream" :size="56" :accents="3" :seed="44" :pulse="false" />
        </div>
        <SectionLabel index="02.5" label="The Center" />

        <h2 id="comm-title" class="display-2 comm__title fade-up">
          The community is the <em>center of the project.</em>
        </h2>

        <p class="prose fade-up">
          Coaches and practitioners share ideas, ask questions, discuss
          implementation, and get access to ongoing work, course material, and
          tools. It is where the real conversation happens — and where most of
          this work gets pressure-tested before it ends up in an essay.
        </p>

        <div class="comm__stats fade-up">
          <div v-for="s in communityStats" :key="s.label" class="comm__stat">
            <div class="comm__stat-value">{{ s.value }}</div>
            <div class="comm__stat-label">{{ s.label }}</div>
          </div>
        </div>

        <div class="comm__cta fade-up">
          <AppButton variant="primary" :href="externalLinks.skool" external>
            Join on Skool
          </AppButton>
          <span class="comm__cta-note">Free tier · paid tiers from $19/mo</span>
        </div>
      </div>

      <div class="comm__right is-desktop-only fade-up" aria-hidden="true">
        <div class="comm__channels">
          <span class="comm__channel is-active"># planning</span>
          <span class="comm__channel"># monitoring</span>
          <span class="comm__channel"># return-to-play</span>
          <span class="comm__channel"># book-club</span>
        </div>

        <div class="comm__threads">
          <article
            v-for="t in threads"
            :key="t.id"
            class="comm__thread"
          >
            <div class="comm__avatar">{{ initial(t.handle) }}</div>
            <div class="comm__thread-body">
              <header class="comm__thread-head">
                <span class="comm__handle">@{{ t.handle }}</span>
                <span class="comm__role">{{ t.role }}</span>
                <span class="comm__time">{{ t.time }}</span>
              </header>
              <p class="comm__text">{{ t.text }}</p>
              <footer class="comm__thread-foot">
                <span>Reply</span>
                <span>·</span>
                <span>12 in thread</span>
              </footer>
            </div>
          </article>
        </div>

        <div class="comm__floating-card" aria-hidden="true">
          <span class="comm__floating-eyebrow">Live</span>
          <span class="comm__floating-text">Q&amp;A · Wed 18:00 CET</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comm {
  background: var(--paper);
  color: var(--ink);
  position: relative;
  overflow: hidden;
}

.comm__grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 80px;
  align-items: start;
}

.comm__left {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 8px;
  position: relative;
}

.comm__left-hex {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 360px;
  height: 280px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.85;
}
.comm__left > :not(.comm__left-hex) {
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .comm__left-hex {
    right: -60px;
    top: -20px;
    width: 240px;
    height: 200px;
    opacity: 0.7;
  }
}

.comm__title {
  max-width: 18ch;
  font-variation-settings: "SOFT" 40, "opsz" 144;
}
.comm__title em {
  font-style: italic;
  font-weight: 300;
  color: var(--teal-deep);
  font-variation-settings: "SOFT" 100, "opsz" 144;
}

.comm__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin-top: 12px;
  border-top: 1px solid var(--hairline-strong);
  border-bottom: 1px solid var(--hairline-strong);
}
.comm__stat {
  padding: 22px 0;
  border-right: 1px solid var(--hairline);
}
.comm__stat:last-child {
  border-right: none;
}
.comm__stat-value {
  font-family: var(--font-display);
  font-size: clamp(32px, 3vw, 44px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
  font-variation-settings: "SOFT" 30, "opsz" 144;
}
.comm__stat-label {
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
}

.comm__cta {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.comm__cta-note {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
}

/* right side — mock community panel */
.comm__right {
  position: relative;
  background: var(--cream);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comm__channels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--hairline);
}
.comm__channel {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 6px 10px;
  border-radius: 999px;
  color: var(--mute);
  border: 1px solid var(--hairline);
}
.comm__channel.is-active {
  color: var(--cream);
  background: var(--teal);
  border-color: var(--teal);
}

.comm__threads {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comm__thread {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius);
  background: var(--paper);
}
.comm__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--teal);
  color: var(--cream);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 15px;
}
.comm__thread-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.comm__thread-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--mute);
}
.comm__handle {
  color: var(--ink);
}
.comm__role::before {
  content: '·';
  margin-right: 8px;
}
.comm__time {
  margin-left: auto;
  opacity: 0.7;
}
.comm__text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 0;
}
.comm__thread-foot {
  display: flex;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mute);
  padding-top: 6px;
}

.comm__floating-card {
  position: absolute;
  right: -10px;
  bottom: -10px;
  background: var(--ink);
  color: var(--cream);
  padding: 14px 18px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--ink);
}
.comm__floating-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--teal-soft);
}
.comm__floating-text {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .comm__grid {
    grid-template-columns: 1fr;
    gap: 44px;
  }
}
@media (max-width: 640px) {
  .comm__left {
    gap: 22px;
  }
  .comm__stats {
    grid-template-columns: 1fr;
  }
  .comm__stat {
    padding: 18px 0;
    border-right: none;
    border-bottom: 1px solid var(--hairline);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }
  .comm__stat:last-child {
    border-bottom: none;
  }
  .comm__stat-label {
    margin-top: 0;
    text-align: right;
  }
  .comm__cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .comm__cta :deep(.btn) {
    width: 100%;
    justify-content: center;
  }
  .comm__right {
    padding: 18px;
    border-radius: var(--radius);
  }
  .comm__channels {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    padding-bottom: 12px;
  }
  .comm__channels::-webkit-scrollbar {
    display: none;
  }
  .comm__channel {
    flex-shrink: 0;
  }
  .comm__thread {
    padding: 12px;
    gap: 12px;
  }
  .comm__floating-card {
    position: static;
    align-self: flex-start;
    margin-top: 4px;
  }
}
</style>
