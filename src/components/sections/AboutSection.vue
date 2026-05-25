<script setup>
import HexLattice from '@/components/ui/HexLattice.vue'
import { externalLinks } from '@/stores/content.js'
</script>

<template>
  <section id="about" class="about" aria-labelledby="about-ap-heading">
    <div class="about__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="100" :accents="6" :seed="29" />
    </div>

    <div class="container about__inner">

      <!-- ── Part 1: What is Agile Periodization? ── -->
      <div class="about__method fade-up">
        <p class="about__eyebrow">The Method</p>

        <div class="about__method-lead">
          <h2 id="about-ap-heading" class="about__question">
            What is<br>Agile<br>Periodization?
          </h2>
          <div class="about__definition">
            <p class="about__def-text">
              Your plan looks perfect on paper. Then real athletes happen. Agile Periodization is the operating framework for what comes next — how to plan with intent, adjust without panic, and make better decisions under uncertainty.
            </p>
            <p class="about__def-text">
              Short cycles. Feedback loops. And the discipline to update your model when reality says otherwise.
            </p>
            <a
              :href="externalLinks.substack"
              target="_blank"
              rel="noopener noreferrer"
              class="about__read-more"
            >
              Read more on Substack <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div class="about__principles">
          <div class="about__principle">
            <span class="about__principle-num" aria-hidden="true">01</span>
            <div class="about__principle-body">
              <strong class="about__principle-title">Adaptive Planning</strong>
              <p class="about__principle-desc">Revised weekly based on readiness, schedule, and what the data says — not a fixed block template.</p>
            </div>
          </div>
          <div class="about__principle">
            <span class="about__principle-num" aria-hidden="true">02</span>
            <div class="about__principle-body">
              <strong class="about__principle-title">Probabilistic Thinking</strong>
              <p class="about__principle-desc">Uncertainty is information, not a planning failure. Work with it.</p>
            </div>
          </div>
          <div class="about__principle">
            <span class="about__principle-num" aria-hidden="true">03</span>
            <div class="about__principle-body">
              <strong class="about__principle-title">Emergent Structure</strong>
              <p class="about__principle-desc">The best programs aren't designed upfront. They emerge from ongoing assessment and small corrections.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Divider ── -->
      <div class="about__divider" aria-hidden="true"></div>

      <!-- ── Part 2: About Me ── -->
      <div class="about__me fade-up">
        <div class="about__me-left">
          <p class="about__eyebrow">About Me</p>
          <h3 class="about__name">
            Mladen<br>Jovanović<span class="about__name-phd">, PhD</span>
          </h3>
          <ul class="about__tags" aria-label="Roles">
            <li>Sports Scientist</li>
            <li>S&amp;C Coach</li>
            <li>Author</li>
            <li>Founder</li>
          </ul>
        </div>
        <div class="about__me-right">
          <p class="about__bio-text">
            Sports scientist, S&amp;C coach, and author. Twenty years across professional sport in Australia, Qatar, and Sweden.
          </p>
          <p class="about__bio-text">
            My work lives between the whiteboard and the spreadsheet — coaching philosophy, statistical modelling, and the gap between theory and a real training week.
          </p>
          <blockquote class="about__quote">
            "The goal isn't the perfect program. It's building a coach who can always make a better one."
          </blockquote>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── Section shell ── */
.about {
  position: relative;
  background: var(--teal);
  color: var(--cream);
  overflow: hidden;
  isolation: isolate;
  padding: clamp(72px, 10vh, 120px) 0;
}

.about__hex {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  z-index: 0;
}

.about__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

/* ── Shared eyebrow ── */
.about__eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.55;
  margin: 0 0 24px;
}

/* ══════════════════════════════════════════
   PART 1 — THE METHOD
   ══════════════════════════════════════════ */

.about__method {
  display: flex;
  flex-direction: column;
}

/* Heading + definition: 2-col */
.about__method-lead {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(40px, 6vw, 88px);
  align-items: start;
  margin-bottom: clamp(48px, 7vh, 80px);
}

.about__question {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(52px, 7.5vw, 116px);
  line-height: 0.93;
  letter-spacing: -0.035em;
  color: var(--cream);
  margin: 0;
}

/* Definition column */
.about__definition {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: clamp(8px, 1.2vw, 18px);
}

.about__def-text {
  font-family: var(--font-body);
  font-size: clamp(15px, 1.15vw, 17px);
  line-height: 1.7;
  color: var(--cream);
  opacity: 0.82;
  margin: 0;
}

.about__read-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.72;
  text-decoration: none;
  position: relative;
  width: fit-content;
  margin-top: 8px;
  transition: opacity 0.2s var(--ease);
}
.about__read-more::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--cream);
  opacity: 0.35;
  transform: scaleX(1);
  transform-origin: left;
  transition: opacity 0.2s var(--ease), transform 0.25s var(--ease);
}
.about__read-more:hover {
  opacity: 1;
}
.about__read-more:hover::after {
  opacity: 0.7;
}

/* Principles: 3-col grid */
.about__principles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(24px, 4vw, 48px);
  border-top: 1px solid rgba(243, 243, 243, 0.1);
  padding-top: clamp(32px, 5vh, 56px);
}

.about__principle {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.about__principle-num {
  font-family: var(--font-mono);
  font-size: clamp(42px, 5vw, 72px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--cream);
  opacity: 0.1;
  display: block;
  user-select: none;
}

.about__principle-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about__principle-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--cream);
  line-height: 1.2;
}

.about__principle-desc {
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.65;
  color: var(--cream);
  opacity: 0.62;
  margin: 0;
}

/* ══════════════════════════════════════════
   DIVIDER
   ══════════════════════════════════════════ */

.about__divider {
  height: 1px;
  background: rgba(243, 243, 243, 0.1);
  margin: clamp(56px, 8vh, 96px) 0;
}

/* ══════════════════════════════════════════
   PART 2 — ABOUT ME
   ══════════════════════════════════════════ */

.about__me {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: clamp(48px, 7vw, 96px);
  align-items: start;
}

/* Identity column */
.about__me-left {
  display: flex;
  flex-direction: column;
}

.about__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(44px, 6.5vw, 100px);
  line-height: 0.95;
  letter-spacing: -0.032em;
  color: var(--cream);
  margin: 0 0 clamp(24px, 3vh, 36px);
}

.about__name-phd {
  font-size: 0.46em;
  font-family: var(--font-mono);
  font-weight: 400;
  letter-spacing: 0.06em;
  opacity: 0.6;
  vertical-align: super;
  margin-left: 3px;
}

.about__tags {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about__tags li {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.72;
  border: 1px solid rgba(243, 243, 243, 0.22);
  padding: 5px 12px;
  border-radius: 2px;
}

/* Bio column */
.about__me-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: clamp(8px, 1.2vw, 18px);
}

.about__bio-text {
  font-family: var(--font-body);
  font-size: clamp(15px, 1.15vw, 17px);
  line-height: 1.72;
  color: var(--cream);
  opacity: 0.82;
  margin: 0;
}

.about__quote {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.52;
  color: var(--cream);
  opacity: 0.78;
  border-left: 2px solid rgba(243, 243, 243, 0.3);
  padding-left: 20px;
  margin: 8px 0 0;
}

/* ── Responsive ── */
@media (max-width: 1000px) {
  .about__principles {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .about__method-lead {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .about__principles {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .about__me {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .about__question {
    font-size: clamp(44px, 13vw, 72px);
  }

  .about__name {
    font-size: clamp(38px, 12vw, 64px);
  }
}
</style>
