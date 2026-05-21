<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'

const content = useContentStore()
const { threads, channels, communityStats } = storeToRefs(content)

const activeChannel = ref(channels.value[0]?.id ?? 'planning')

const activeThreads = computed(() =>
  threads.value.filter((t) => t.channel === activeChannel.value)
)

const countByChannel = computed(() =>
  Object.fromEntries(
    channels.value.map((ch) => [
      ch.id,
      threads.value.filter((t) => t.channel === ch.id).length,
    ])
  )
)

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
        <SectionLabel index="04" label="The Center" />

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

      <div class="comm__right is-desktop-only fade-up">
        <div class="comm__channels" role="tablist" aria-label="Community channels">
          <button
            v-for="ch in channels"
            :key="ch.id"
            class="comm__channel"
            :class="{ 'is-active': activeChannel === ch.id }"
            role="tab"
            :aria-selected="activeChannel === ch.id"
            @click="activeChannel = ch.id"
          >
            {{ ch.label }}
            <span class="comm__channel-count">{{ countByChannel[ch.id] }}</span>
          </button>
        </div>

        <Transition name="comm-slide" mode="out-in">
          <div :key="activeChannel" class="comm__threads" role="tabpanel">
            <article
              v-for="t in activeThreads"
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
                  <span class="comm__reply">Reply</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ t.replies }} in thread</span>
                </footer>
              </div>
            </article>
          </div>
        </Transition>

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

/* right panel */
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

/* channel tabs */
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
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 180ms var(--ease), background 180ms var(--ease),
    border-color 180ms var(--ease);
}
.comm__channel:hover:not(.is-active) {
  color: var(--ink);
  border-color: var(--hairline-strong);
}
.comm__channel.is-active {
  color: #f3f3f3;
  background: var(--teal);
  border-color: var(--teal);
}
.comm__channel-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0;
  background: rgba(0, 0, 0, 0.12);
  line-height: 1;
}
.comm__channel.is-active .comm__channel-count {
  background: rgba(255, 255, 255, 0.22);
}

/* thread list transition */
.comm-slide-enter-active {
  transition: opacity 200ms var(--ease), transform 200ms var(--ease);
}
.comm-slide-leave-active {
  transition: opacity 140ms var(--ease);
}
.comm-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.comm-slide-leave-to {
  opacity: 0;
}

.comm__threads {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comm__thread {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius);
  background: var(--paper);
  transition: border-color 180ms var(--ease);
}
.comm__thread:hover {
  border-color: var(--hairline-strong);
}
.comm__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--teal);
  color: #f3f3f3;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 15px;
  flex-shrink: 0;
}
.comm__thread-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.comm__thread-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  color: var(--mute);
  flex-wrap: wrap;
}
.comm__handle {
  color: var(--ink);
  font-weight: 500;
}
.comm__role::before {
  content: '·';
  margin-right: 6px;
}
.comm__time {
  margin-left: auto;
  opacity: 0.65;
}
.comm__text {
  font-size: 13.5px;
  line-height: 1.48;
  color: var(--ink-soft);
  margin: 0;
  /* limit to 2 lines so all threads have similar height */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.comm__thread-foot {
  display: flex;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--mute);
  padding-top: 4px;
}
.comm__reply {
  color: var(--teal);
}

.comm__floating-card {
  position: absolute;
  right: -10px;
  bottom: -10px;
  background: var(--ink);
  color: #f3f3f3;
  padding: 14px 18px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid rgba(243, 243, 243, 0.1);
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
    gap: 10px;
  }
  .comm__floating-card {
    position: static;
    align-self: flex-start;
    margin-top: 4px;
  }
}
</style>
