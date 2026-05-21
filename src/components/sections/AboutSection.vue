<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SectionLabel from '@/components/ui/SectionLabel.vue'

const route = useRoute()
const variant = computed(() => route.meta?.variant ?? 'v1')
</script>

<template>
  <section id="work" class="about section section--cream" aria-labelledby="about-title">
    <div class="container about__grid">
      <header class="about__head">
        <SectionLabel index="01" label="The Work" />
        <h2 id="about-title" class="display-2 about__title fade-up">
          Not a fixed program. <em>An operating framework</em> for the messy world coaches actually work in.
        </h2>
      </header>

      <div class="about__copy fade-up">
        <p class="prose">
          Agile Periodization is an attempt to build a more useful way of thinking
          about planning, coaching, monitoring, and decision-making — not in the
          clean world of textbooks, but in the messy one, where athletes get hurt,
          schedules change, readiness fluctuates, and coaches still need to make
          good calls.
        </p>
        <p class="prose about__copy-extra">
          You need enough structure to move forward, and enough flexibility to
          adapt. Models, but not model worship. Plans, but not attachment to the
          plan. That intersection — sports science, skill acquisition, physical
          preparation, and practical coaching — is what this work sits inside.
        </p>
        <p class="prose about__copy-extra">
          For strength and conditioning coaches, sport scientists, physios and
          rehab practitioners, combat sports coaches, team-sport practitioners,
          and serious athletes who want the logic behind the training.
        </p>
      </div>

      <aside class="about__card fade-up" aria-label="About Mladen Jovanović">

        <!-- V1 default — File Card -->
        <template v-if="variant === 'v1'">
          <div class="about__card-head">
            <span class="about__card-eyebrow">About</span>
            <span class="about__card-id">MJ — 001</span>
          </div>
          <h3 class="about__card-name">Mladen Jovanović, PhD</h3>
          <p class="about__card-role">
            Strength &amp; conditioning coach · Sport scientist · Author
          </p>
          <ul class="about__creds" aria-label="Credentials">
            <li>PhD</li>
            <li>20+ Years</li>
            <li>3 Continents</li>
          </ul>
          <ul class="about__list">
            <li>
              <span>Port Adelaide FC</span>
              <span>Australia · 2010–14</span>
            </li>
            <li>
              <span>Aspire Academy</span>
              <span>Qatar · 2014–18</span>
            </li>
            <li>
              <span>Hammarby IF</span>
              <span>Sweden · 2018–22</span>
            </li>
          </ul>
          <p class="about__quote">
            "The goal isn't the perfect program. It's building a coach who can
            always make a better one."
          </p>
        </template>

        <!-- V2 — Raw Dossier (no box, floats on dark teal) -->
        <template v-else-if="variant === 'v2'">
          <div class="about-v2-namerow">
            <span class="about-v2-name">Mladen Jovanović</span>
            <span class="about-v2-phd">PhD</span>
          </div>
          <ul class="about-v2-positions">
            <li>
              <span class="about-v2-arrow">→</span>
              <div>
                <div class="about-v2-club">Port Adelaide FC</div>
                <div class="about-v2-meta">S&amp;C Coach · Australia · 2010–14</div>
              </div>
            </li>
            <li>
              <span class="about-v2-arrow">→</span>
              <div>
                <div class="about-v2-club">Aspire Academy</div>
                <div class="about-v2-meta">Performance Director · Qatar · 2014–18</div>
              </div>
            </li>
            <li>
              <span class="about-v2-arrow">→</span>
              <div>
                <div class="about-v2-club">Hammarby IF</div>
                <div class="about-v2-meta">Head of Science · Sweden · 2018–22</div>
              </div>
            </li>
          </ul>
          <p class="about-v2-quote">
            "The goal isn't the perfect program. It's building a coach who can
            always make a better one."
          </p>
        </template>

        <!-- V3 — Numbers First (stats dominate) -->
        <template v-else-if="variant === 'v3'">
          <div class="about-v3-stats" aria-label="Key stats">
            <div class="about-v3-stat">
              <div class="about-v3-stat-value">20+</div>
              <div class="about-v3-stat-label">Years</div>
            </div>
            <div class="about-v3-stat">
              <div class="about-v3-stat-value">3</div>
              <div class="about-v3-stat-label">Continents</div>
            </div>
            <div class="about-v3-stat">
              <div class="about-v3-stat-value">1,200+</div>
              <div class="about-v3-stat-label">Coaches</div>
            </div>
          </div>
          <h3 class="about-v3-name">Mladen Jovanović, PhD</h3>
          <p class="about-v3-role">S&amp;C Coach · Sport Scientist · Author</p>
          <p class="about-v3-positions">Port Adelaide FC · Aspire Academy · Hammarby IF</p>
        </template>

        <!-- V4 — Career Timeline (bronze dots) -->
        <template v-else-if="variant === 'v4'">
          <div class="about-v4-header">
            <span class="about-v4-eyebrow">Career</span>
            <span class="about-v4-avatar" aria-hidden="true">MJ</span>
          </div>
          <ul class="about-v4-timeline">
            <li>
              <div class="about-v4-club">Port Adelaide FC</div>
              <div class="about-v4-meta">S&amp;C Coach · Australia · 2010–14</div>
            </li>
            <li>
              <div class="about-v4-club">Aspire Academy</div>
              <div class="about-v4-meta">Performance Director · Qatar · 2014–18</div>
            </li>
            <li class="about-v4-timeline-last">
              <div class="about-v4-club">Hammarby IF</div>
              <div class="about-v4-meta">Head of Science · Sweden · 2018–22</div>
            </li>
          </ul>
          <p class="about-v4-quote">
            "The goal isn't the perfect program. It's building a coach who can
            always make a better one."
          </p>
        </template>

      </aside>
    </div>
  </section>
</template>

<style scoped>
.about {
  background: var(--paper);
  color: var(--ink);
}

.about__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

.about__head {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 24px;
}

.about__title {
  max-width: 22ch;
  font-variation-settings: "SOFT" 40, "opsz" 144;
}
.about__title em {
  font-style: italic;
  font-weight: 300;
  color: var(--teal-deep);
  font-variation-settings: "SOFT" 100, "opsz" 144;
}

.about__copy {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 56ch;
}

/* ── Card outer (shared wrapper) ── */
.about__card {
  background: var(--cream);
  border: 1px solid var(--hairline);
  border-radius: var(--radius);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── V1: File Card ── */
.about__card-head {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mute);
}
.about__card-name {
  font-family: var(--font-display);
  font-size: clamp(26px, 2.4vw, 34px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 4px 0 0;
  font-variation-settings: "SOFT" 30, "opsz" 144;
}
.about__card-role {
  color: var(--mute);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
.about__creds {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mute);
}
.about__creds li + li::before {
  content: '·';
  margin: 0 8px;
  opacity: 0.5;
}
.about__list {
  list-style: none;
  margin: 8px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--hairline);
}
.about__list li {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
.about__list li span:last-child {
  color: var(--mute);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}
.about__quote {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 17px;
  line-height: 1.45;
  color: var(--ink-soft);
  border-left: 2px solid var(--teal);
  padding-left: 16px;
  margin: 6px 0 0;
  font-variation-settings: "SOFT" 100, "opsz" 144;
}

/* ── V2: Raw Dossier ── */
.about-v2-namerow {
  display: flex;
  align-items: baseline;
  gap: 0;
  flex-wrap: wrap;
}
.about-v2-name {
  font-family: var(--font-mono);
  font-size: clamp(16px, 1.8vw, 24px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  font-weight: 400;
}
.about-v2-phd {
  display: inline-block;
  margin-left: 12px;
  border: 1px solid var(--hairline-strong);
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mute);
  border-radius: 2px;
}
.about-v2-positions {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.about-v2-positions li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.about-v2-arrow {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--teal);
  flex-shrink: 0;
  margin-top: 1px;
}
.about-v2-club {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 3px;
}
.about-v2-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--mute);
}
.about-v2-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 8px 0 0;
  font-variation-settings: "SOFT" 100, "opsz" 144;
}

/* ── V3: Numbers First ── */
.about-v3-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--teal);
}
.about-v3-stat-value {
  font-family: var(--font-display);
  font-size: clamp(32px, 3.2vw, 48px);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--ink);
  font-variation-settings: "SOFT" 0, "opsz" 144;
}
.about-v3-stat-label {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mute);
}
.about-v3-name {
  font-family: var(--font-display);
  font-size: clamp(22px, 2vw, 28px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ink);
  margin: 4px 0 0;
  font-variation-settings: "SOFT" 30, "opsz" 144;
}
.about-v3-role {
  font-size: 13px;
  color: var(--mute);
  margin: 0;
}
.about-v3-positions {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
  margin: 4px 0 0;
}

/* ── V4: Career Timeline ── */
.about-v4-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.about-v4-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mute);
}
.about-v4-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bronze, #b58b5b);
  color: #fff;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.about-v4-timeline {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.about-v4-timeline li {
  position: relative;
  padding: 0 0 22px 22px;
}
.about-v4-timeline li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bronze, #b58b5b);
}
.about-v4-timeline li::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 15px;
  width: 1px;
  height: calc(100% - 15px);
  background: var(--bronze, #b58b5b);
  opacity: 0.28;
}
.about-v4-timeline-last {
  padding-bottom: 4px !important;
}
.about-v4-timeline-last::after {
  display: none !important;
}
.about-v4-club {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 3px;
}
.about-v4-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--mute);
}
.about-v4-quote {
  border-left: 2px solid var(--bronze, #b58b5b);
  padding-left: 14px;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 300;
  font-size: 15px;
  line-height: 1.48;
  color: var(--ink-soft);
  margin: 6px 0 0;
  font-variation-settings: "SOFT" 100, "opsz" 144;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .about__grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .about__head {
    gap: 20px;
    margin-bottom: 8px;
  }
  .about__copy {
    gap: 18px;
  }
  .about__card {
    padding: 24px;
    gap: 14px;
  }
  .about__quote {
    font-size: 16px;
    padding-left: 14px;
  }
  .about__list li {
    padding: 12px 0;
  }
}

@media (max-width: 720px) {
  .about__grid {
    gap: 32px;
  }
  .about__copy-extra {
    display: none;
  }
  .about__card {
    padding: 20px;
  }
  .about__quote {
    font-size: 15px;
    padding-left: 12px;
  }
  .about-v3-stat-value {
    font-size: clamp(28px, 8vw, 40px);
  }
}
</style>
