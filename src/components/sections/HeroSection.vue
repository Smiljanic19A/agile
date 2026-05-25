<script setup>
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'
import { externalLinks } from '@/stores/content.js'
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__hex" aria-hidden="true">
      <HexLattice
        variant="grid"
        tone="on-teal"
        mask="radial"
        :size="110"
        :accents="7"
        :seed="11"
      />
    </div>

    <div class="hero__meta">
      <div class="hero__meta-row">
        <span class="hero__corner hero__corner--tl">
          <em>Est. —</em> Ecosystem hub
        </span>
        <span class="hero__corner hero__corner--tr">
          MJ / Belgrade · Global
        </span>
      </div>
    </div>

    <div class="container hero__inner">
      <div class="hero__logo fade-up">
        <img src="/logo.png" alt="Agile Periodization" />
      </div>

      <p class="hero__eyebrow fade-up">Coaching under uncertainty</p>

      <h1 id="hero-title" class="hero__title display-1 fade-up">
        The plan is a hypothesis.<br><em>Reality is the feedback loop.</em>
      </h1>

      <p class="hero__sub prose fade-up">
        <span>Writing, tools, and a community — for coaches who plan with intent and adapt without panic.</span>
      </p>

      <div class="hero__cta fade-up">
        <AppButton variant="onTeal" :href="externalLinks.skool" external>
          Join the community
        </AppButton>
        <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>
          Read the writing
        </AppButton>
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
  position: relative;
  background: var(--teal);
  color: var(--cream);
  min-height: 100svh;
  padding: 120px 0 80px;
  overflow: hidden;
  isolation: isolate;
}

.hero__hex {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.hero__meta {
  position: absolute;
  top: 96px;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 0 var(--gutter);
}
.hero__meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
}
.hero__corner em {
  font-style: normal;
  opacity: 0.55;
  margin-right: 2px;
}

.hero__inner {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 70px;
}

.hero__logo {
  width: clamp(96px, 12vw, 142px);
  margin-bottom: 36px;
}
.hero__logo img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 60px rgba(243, 243, 243, 0.06));
}

.hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.72;
  margin-bottom: 22px;
}

.hero__title {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--cream);
  margin: 0 0 32px;
  max-width: 18ch;
}
.hero__title em {
  font-style: italic;
  font-weight: 500;
  color: var(--cream);
  opacity: 0.88;
}

.hero__sub {
  font-size: clamp(16px, 1.2vw, 18px);
  line-height: 1.65;
  color: rgba(243, 243, 243, 0.92);
  max-width: 58ch;
  margin: 0 0 40px;
}

.hero__cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero__scroll {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.70;
}
.hero__scroll-line {
  width: 1px;
  height: 36px;
  background: linear-gradient(to bottom, transparent, var(--cream));
  animation: scrollLine 2.6s ease-in-out infinite;
  transform-origin: top;
}
@keyframes scrollLine {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.4;
  }
  50% {
    transform: scaleY(1);
    opacity: 0.85;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__scroll-line {
    animation: none;
  }
}

@media (max-width: 720px) {
  .hero {
    padding: 96px 0 64px;
    min-height: 100svh;
  }
  .hero__meta,
  .hero__sub-extra {
    display: none;
  }
  .hero__inner {
    padding-top: 24px;
    justify-content: center;
  }
  .hero__logo {
    width: clamp(200px, 56vw, 280px);
    margin: 0 auto 40px;
  }
  .hero__eyebrow {
    margin-bottom: 18px;
    font-size: 11px;
    letter-spacing: 0.16em;
  }
  .hero__title {
    margin-bottom: 22px;
  }
  .hero__sub {
    margin-bottom: 36px;
    font-size: 15px;
  }
  .hero__cta {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
  .hero__cta :deep(.btn) {
    width: 100%;
    justify-content: center;
  }
  .hero__scroll {
    bottom: 20px;
  }
}
</style>
