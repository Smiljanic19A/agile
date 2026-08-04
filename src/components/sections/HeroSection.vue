<script setup>
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'
import DecisionLoop from '@/components/ui/DecisionLoop.vue'
import { externalLinks } from '@/stores/content.js'
import { useI18n } from '@/i18n'

const { t } = useI18n()

// Phase currently in focus on the Decision Loop (emitted by the ring)
const phase = ref(0)
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="110" :accents="7" :seed="11" />
    </div>

    <div class="container hero__inner">
      <div class="hero__copy fade-up">
        <p class="hero__eyebrow">{{ t('hero.eyebrow') }}</p>

        <h1 id="hero-title" class="hero__title">
          {{ t('hero.title') }}
        </h1>

        <p class="hero__sub">
          {{ t('hero.sub') }}
        </p>

        <div class="hero__cta">
          <AppButton variant="onTeal" :href="externalLinks.skool" external>{{ t('hero.joinCommunity') }}</AppButton>
          <AppButton variant="ghostOnTeal" href="#updates">{{ t('hero.getUpdates') }}</AppButton>
        </div>

        <p class="hero__note">{{ t('hero.note') }}</p>

        <div class="hero__tags" aria-label="What Agile Periodization provides">
          <span v-for="tag in t('hero.tags')" :key="tag" class="hero__tag">{{ tag }}</span>
        </div>
      </div>

      <div class="hero__visual fade-up" aria-hidden="true">
        <div class="hero__board">
          <p class="hero__board-kicker">{{ t('hero.boardKicker') }}</p>

          <!-- The Decision Loop — splash screen lands here -->
          <div id="hero-loop" class="hero__ring-wrap">
            <DecisionLoop interactive @step="phase = $event.i" />
          </div>

          <!-- The focused phase, explained; advances as the loop cycles -->
          <div class="hero__phase">
            <Transition name="phase" mode="out-in">
              <div class="hero__phase-body" :key="phase">
                <span class="hero__phase-num">{{ String(phase + 1).padStart(2, '0') }}</span>
                <div class="hero__phase-text">
                  <strong>{{ t('hero.loop')[phase] }}</strong>
                  <p>{{ t('hero.loopSteps')[phase] }}</p>
                </div>
              </div>
            </Transition>
            <div class="hero__phase-track">
              <span class="hero__phase-bar" :key="phase"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hero__scroll" aria-hidden="true">
      <span class="hero__scroll-line"></span>
      <span class="hero__scroll-label">{{ t('hero.scroll') }}</span>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative; background: var(--teal); color: var(--cream);
  min-height: 100svh; padding: 80px 0 80px; overflow: hidden; isolation: isolate;
}
.hero__hex { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

.hero__inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(36px, 5vw, 72px);
  align-items: center; padding-top: 80px; min-height: calc(100svh - 160px);
}

/* Copy column */
.hero__copy { display: flex; flex-direction: column; align-items: flex-start; }

.hero__eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--cream); opacity: 0.72; margin-bottom: 20px;
}

.hero__title {
  font-family: var(--font-display); font-weight: 700; color: var(--cream);
  font-size: clamp(30px, 3.6vw, 52px); line-height: 1.08; letter-spacing: -0.022em;
  margin: 0 0 24px; max-width: 18ch;
}

.hero__sub {
  font-size: clamp(15px, 1.15vw, 17px); line-height: 1.65; color: rgba(243, 243, 243, 0.88);
  max-width: 48ch; margin: 0 0 36px;
}

.hero__cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }

.hero__note {
  font-size: 13px; line-height: 1.55; color: rgba(243, 243, 243, 0.65);
  font-style: italic; max-width: 42ch; margin: 0 0 32px;
}

.hero__tags { display: flex; gap: 6px; flex-wrap: wrap; }
.hero__tag {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  border: 1px solid var(--hairline-light); border-radius: 999px; padding: 5px 11px;
  color: var(--cream); opacity: 0.72;
}

/* Visual column */
.hero__visual { display: flex; flex-direction: column; gap: 18px; }

.hero__board {
  background: var(--teal-deep); border: 1px solid rgba(243, 243, 243, 0.1);
  border-radius: var(--radius-lg); padding: 28px;
}

.hero__board-kicker {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(243, 243, 243, 0.55); margin: 0 0 18px;
}

.hero__ring-wrap {
  position: relative;
  width: min(320px, 100%); aspect-ratio: 1;
  margin: 0 auto 18px;
}

/* Focused phase caption — sits below "Reality pushing in" */
.hero__phase {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(243, 243, 243, 0.1);
}
.hero__phase-body {
  display: flex; align-items: baseline; gap: 12px;
  min-height: 44px;
}
.hero__phase-num {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; color: rgba(243, 243, 243, 0.55);
  flex-shrink: 0;
}
/* The board stays dark in every theme — keep this text explicitly light
   (var(--cream) flips to dark ink under theme-v3). */
.hero__phase-text strong {
  display: block;
  font-family: var(--font-display); font-size: 15px; font-weight: 700;
  letter-spacing: -0.01em; color: #f3f3f3; margin-bottom: 2px;
}
.hero__phase-text p {
  font-size: 12.5px; line-height: 1.5; color: rgba(243, 243, 243, 0.72); margin: 0;
}
.hero__phase-track {
  margin-top: 12px; height: 2px; border-radius: 999px;
  background: rgba(243, 243, 243, 0.12); overflow: hidden;
}
.hero__phase-bar {
  display: block; height: 100%; width: 100%;
  border-radius: inherit;
  background: rgba(243, 243, 243, 0.55);
  transform: scaleX(0); transform-origin: left;
  animation: heroPhaseFill 4.2s linear forwards;
}
@keyframes heroPhaseFill { to { transform: scaleX(1); } }

.phase-enter-active, .phase-leave-active { transition: opacity 240ms ease, transform 240ms ease; }
.phase-enter-from { opacity: 0; transform: translateY(5px); }
.phase-leave-to { opacity: 0; transform: translateY(-5px); }

@media (prefers-reduced-motion: reduce) {
  .hero__phase-bar { animation: none; transform: scaleX(1); }
  .phase-enter-active, .phase-leave-active { transition: none; }
}

.hero__scroll {
  position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  opacity: 0.60;
}
.hero__scroll-line {
  width: 1px; height: 36px; background: linear-gradient(to bottom, transparent, var(--cream));
  animation: scrollLine 2.6s ease-in-out infinite; transform-origin: top;
}
@keyframes scrollLine { 0%,100% { transform: scaleY(0.4); opacity: 0.4; } 50% { transform: scaleY(1); opacity: 0.85; } }
@media (prefers-reduced-motion: reduce) {
  .hero__scroll-line { animation: none; }
}

@media (max-width: 960px) {
  .hero__inner { grid-template-columns: 1fr; gap: 48px; padding-top: 20px; }
  .hero__visual { max-width: 520px; }
  .hero { padding-bottom: 100px; }
}

@media (max-width: 720px) {
  .hero { padding: 96px 0 80px; }
  .hero__title { margin-bottom: 20px; }
  .hero__sub { margin-bottom: 28px; font-size: 15px; }
  .hero__cta { flex-direction: column; width: 100%; gap: 10px; }
  .hero__cta :deep(.btn) { width: 100%; justify-content: center; }
  .hero__scroll { bottom: 20px; }
}

/* Theme-v3 overrides — hero becomes white canvas */
html[data-theme="v3"] .hero .hero__sub { color: rgba(14, 26, 26, 0.72); }
html[data-theme="v3"] .hero .hero__note { color: rgba(14, 26, 26, 0.55); }
html[data-theme="v3"] .hero .hero__tag { color: var(--ink); border-color: var(--hairline-strong); opacity: 0.85; }
html[data-theme="v3"] .hero .hero__scroll { color: var(--ink); }
html[data-theme="v3"] .hero .hero__scroll-line { background: linear-gradient(to bottom, transparent, var(--ink)); }
</style>
