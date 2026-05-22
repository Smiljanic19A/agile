<script setup>
import HexLattice from '@/components/ui/HexLattice.vue'
</script>

<template>
  <section id="about" class="bio" aria-labelledby="bio-name">
    <div class="bio__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="100" :accents="6" :seed="29" />
    </div>

    <div class="container bio__inner">

      <!-- ── Header ── -->
      <header class="bio__header fade-up">
        <h2 id="bio-name" class="bio__name">
          Mladen Jovanović<span class="bio__name-phd">, PhD</span>
        </h2>
        <p class="bio__headline">
          Performance Manager&nbsp;&nbsp;·&nbsp;&nbsp;Sports Scientist&nbsp;&nbsp;·&nbsp;&nbsp;S&amp;C Coach
        </p>
      </header>

      <!-- ── Body grid ── -->
      <div class="bio__body">

        <!-- Career timeline -->
        <div class="bio__col bio__col--career fade-up">
          <h3 class="bio__col-label">Career</h3>
          <ul class="bio__timeline">
            <li class="bio__pos">
              <span class="bio__pos-year">2024</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Football Association of Serbia</span>
                <span class="bio__pos-role">Head of Performance, Serbia Women's NT</span>
                <span class="bio__pos-loc">Belgrade, Serbia</span>
              </div>
            </li>
            <li class="bio__pos">
              <span class="bio__pos-year">2017</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Athlete Software Solutions</span>
                <span class="bio__pos-role">Founder &amp; Director</span>
                <span class="bio__pos-loc">Belgrade, Serbia</span>
              </div>
            </li>
            <li class="bio__pos">
              <span class="bio__pos-year">2015</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Port Adelaide FC</span>
                <span class="bio__pos-role">Strength Coach &amp; Data Scientist</span>
                <span class="bio__pos-loc">Adelaide, Australia</span>
              </div>
            </li>
            <li class="bio__pos">
              <span class="bio__pos-year">2014</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Aspire Academy</span>
                <span class="bio__pos-role">Football Physiologist</span>
                <span class="bio__pos-loc">Doha, Qatar</span>
              </div>
            </li>
            <li class="bio__pos">
              <span class="bio__pos-year">2012</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Hammarby IF</span>
                <span class="bio__pos-role">Sport Scientist &amp; Head S&amp;C Coach</span>
                <span class="bio__pos-loc">Stockholm, Sweden</span>
              </div>
            </li>
            <li class="bio__pos bio__pos--minor">
              <span class="bio__pos-year">2010</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Mike Boyle Strength &amp; Conditioning</span>
                <span class="bio__pos-role">Intern Coach</span>
                <span class="bio__pos-loc">Boston, USA</span>
              </div>
            </li>
            <li class="bio__pos bio__pos--minor">
              <span class="bio__pos-year">2008</span>
              <div class="bio__pos-body">
                <span class="bio__pos-org">Volleyball Club Fenerbahçe</span>
                <span class="bio__pos-role">Head S&amp;C Coach</span>
                <span class="bio__pos-loc">Istanbul, Turkey</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Works column -->
        <div class="bio__col bio__col--works fade-up">

          <div class="bio__works-block">
            <h3 class="bio__col-label">Books</h3>
            <ul class="bio__books">
              <li>
                <span class="bio__book-title">HIIT Manual</span>
                <span class="bio__book-meta">High Intensity Interval Training and Agile Periodization · 2018</span>
              </li>
              <li>
                <span class="bio__book-title">Strength Training Manual</span>
                <span class="bio__book-meta">The Agile Periodization Approach · 2020</span>
              </li>
              <li>
                <span class="bio__book-title">bmbstats</span>
                <span class="bio__book-meta">Bootstrap Magnitude-based Statistics for Sports Scientists · 2020</span>
              </li>
              <li>
                <span class="bio__book-title">Manual de Entrenamiento de la Fuerza</span>
                <span class="bio__book-meta">Spanish edition · 2021</span>
              </li>
            </ul>
          </div>

          <div class="bio__works-block">
            <h3 class="bio__col-label">R Packages · CRAN</h3>
            <div class="bio__packages">
              <span class="bio__pkg">STMr</span>
              <span class="bio__pkg">shorts</span>
            </div>
            <p class="bio__pkg-note">Velocity-based training &amp; sprint modelling tools used by researchers worldwide</p>
          </div>

          <div class="bio__works-block">
            <h3 class="bio__col-label">Philosophy</h3>
            <blockquote class="bio__quote">
              "The goal isn't the perfect program. It's building a coach who can always make a better one."
            </blockquote>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section shell ── */
.bio {
  position: relative;
  background: var(--teal);
  color: var(--cream);
  overflow: hidden;
  isolation: isolate;
  padding: clamp(72px, 10vh, 120px) 0;
}

.bio__hex {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  z-index: 0;
}

.bio__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ── */
.bio__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: clamp(40px, 5vh, 64px);
  border-bottom: 1px solid rgba(243, 243, 243, 0.14);
}

.bio__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(48px, 7vw, 108px);
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--cream);
  margin: 0;
}
.bio__name-phd {
  font-size: 0.48em;
  font-family: var(--font-mono);
  font-weight: 400;
  letter-spacing: 0.06em;
  opacity: 0.65;
  vertical-align: super;
  margin-left: 4px;
}

.bio__headline {
  font-family: var(--font-mono);
  font-size: clamp(11px, 1vw, 13px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.6;
  margin: 0;
}


/* ── Body grid ── */
.bio__body {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(40px, 6vw, 96px);
  align-items: start;
  margin-top: clamp(40px, 6vh, 72px);
}

.bio__col-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cream);
  opacity: 0.6;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(243, 243, 243, 0.1);
}

/* ── Career timeline ── */
.bio__timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.bio__pos {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 16px;
  position: relative;
  padding-bottom: 28px;
}
.bio__pos::before {
  content: '';
  position: absolute;
  left: 57px;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cream);
  opacity: 0.7;
}
.bio__pos::after {
  content: '';
  position: absolute;
  left: 60px;
  top: 14px;
  width: 1px;
  height: calc(100% - 14px);
  background: rgba(243, 243, 243, 0.15);
}
.bio__pos:last-child::after {
  display: none;
}
.bio__pos:last-child {
  padding-bottom: 0;
}

.bio__pos--minor .bio__pos-org {
  opacity: 0.65;
}
.bio__pos--minor::before {
  width: 4px;
  height: 4px;
  opacity: 0.4;
  left: 58px;
  top: 8px;
}

.bio__pos-year {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--cream);
  opacity: 0.62;
  padding-top: 2px;
  text-align: right;
}

.bio__pos-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.bio__pos-org {
  font-size: 15px;
  font-weight: 500;
  color: var(--cream);
  line-height: 1.2;
}
.bio__pos-role {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--cream);
  opacity: 0.72;
}
.bio__pos-loc {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--cream);
  opacity: 0.52;
  text-transform: uppercase;
}

/* ── Works column ── */
.bio__col--works {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.bio__works-block {
  display: flex;
  flex-direction: column;
}

/* Books */
.bio__books {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.bio__books li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(243, 243, 243, 0.08);
}
.bio__books li:first-child {
  border-top: none;
  padding-top: 0;
}
.bio__book-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--cream);
  line-height: 1.3;
}
.bio__book-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--cream);
  opacity: 0.58;
}

/* R Packages */
.bio__packages {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.bio__pkg {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--cream);
  border: 1px solid rgba(243, 243, 243, 0.25);
  padding: 4px 12px;
  border-radius: 3px;
}
.bio__pkg-note {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.03em;
  color: var(--cream);
  opacity: 0.58;
  line-height: 1.5;
  margin: 0;
}

/* Quote */
.bio__quote {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(16px, 1.5vw, 20px);
  line-height: 1.52;
  color: var(--cream);
  opacity: 0.82;
  border-left: 2px solid rgba(243, 243, 243, 0.35);
  padding-left: 18px;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .bio__body {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}

@media (max-width: 640px) {
  .bio__name {
    font-size: clamp(40px, 11vw, 72px);
  }
}
</style>
