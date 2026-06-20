<script setup>
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'
import { externalLinks } from '@/stores/content.js'
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="110" :accents="7" :seed="11" />
    </div>

    <div class="container hero__inner">
      <div class="hero__copy fade-up">
        <p class="hero__eyebrow">Agile Periodization</p>

        <h1 id="hero-title" class="hero__title">
          Build training systems that survive contact with reality.
        </h1>

        <p class="hero__sub">
          Agile Periodization helps coaches, sport scientists, physios, and performance teams turn fragile plans into adaptive systems: plan, train, monitor, review, adapt, repeat.
        </p>

        <div class="hero__cta">
          <AppButton variant="onTeal" :href="externalLinks.skool" external>Join the Community</AppButton>
          <AppButton variant="ghostOnTeal" href="#updates">Get Updates</AppButton>
        </div>

        <p class="hero__note">Tired of annual plans dying after the first injury, travel week, fatigue spike, or staff meeting?</p>

        <div class="hero__tags" aria-label="What Agile Periodization provides">
          <span v-for="t in ['Philosophy', 'Frameworks', 'Tools', 'Education', 'Community', 'Field notes']" :key="t" class="hero__tag">{{ t }}</span>
        </div>
      </div>

      <div class="hero__visual fade-up" aria-hidden="true">
        <div class="hero__board">
          <p class="hero__board-kicker">Adaptive operating system</p>
          <div class="hero__loop-wrap">
            <div class="hero__loop">
              <span class="hero__node">Plan</span>
              <span class="hero__node">Train</span>
              <span class="hero__node">Monitor</span>
              <span class="hero__node">Review</span>
              <span class="hero__node">Adapt</span>
              <span class="hero__node">Repeat</span>
            </div>
            <div class="hero__loop-center">Decision<br>Loop</div>
          </div>
          <div class="hero__reality">
            <span class="hero__reality-label">Reality pushing in</span>
            <div class="hero__reality-tags">
              <span v-for="t in ['Injuries', 'Fatigue', 'Travel', 'Rehab setbacks', 'Noisy data', 'Competition']" :key="t">{{ t }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="hero__scroll" aria-hidden="true">
      <span class="hero__scroll-line"></span>
      <span class="hero__scroll-label">Scroll</span>
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

.hero__loop-wrap { position: relative; margin-bottom: 18px; }

.hero__loop {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
}

.hero__node {
  padding: 10px 8px; text-align: center;
  background: rgba(243, 243, 243, 0.07); border: 1px solid rgba(243, 243, 243, 0.12);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(243, 243, 243, 0.85);
}

.hero__loop-center {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: var(--teal); border: 1px solid rgba(243, 243, 243, 0.2);
  border-radius: 999px; padding: 9px 16px;
  font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(243, 243, 243, 0.92); text-align: center; line-height: 1.4;
  white-space: nowrap; z-index: 2;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.hero__reality {
  padding-top: 16px; border-top: 1px solid rgba(243, 243, 243, 0.1);
}
.hero__reality-label {
  display: block; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(243, 243, 243, 0.5); margin-bottom: 10px;
}
.hero__reality-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.hero__reality-tags span {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(243, 243, 243, 0.06); border: 1px solid rgba(243, 243, 243, 0.12);
  color: rgba(243, 243, 243, 0.72);
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
@media (prefers-reduced-motion: reduce) { .hero__scroll-line { animation: none; } }

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
  .hero__stack { display: none; }
  .hero__scroll { bottom: 20px; }
}

/* Theme-v3 overrides — hero becomes white canvas */
html[data-theme="v3"] .hero .hero__sub { color: rgba(14, 26, 26, 0.72); }
html[data-theme="v3"] .hero .hero__note { color: rgba(14, 26, 26, 0.55); }
html[data-theme="v3"] .hero .hero__tag { color: var(--ink); border-color: var(--hairline-strong); opacity: 0.85; }
html[data-theme="v3"] .hero .hero__scroll { color: var(--ink); }
html[data-theme="v3"] .hero .hero__scroll-line { background: linear-gradient(to bottom, transparent, var(--ink)); }
</style>
