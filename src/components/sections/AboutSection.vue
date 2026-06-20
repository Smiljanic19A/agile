<script setup>
import HexLattice from '@/components/ui/HexLattice.vue'
import SectionLabel from '@/components/ui/SectionLabel.vue'

const problems = [
  'The annual plan dies early',
  'Monitoring becomes decoration',
  'Dose becomes the religion',
  'Transfer is assumed',
  'The coach carries the system',
]

const pillars = [
  { name: 'Philosophy', desc: 'Mental models for uncertainty, robustness, adaptation, transfer, and decision-making.' },
  { name: 'Frameworks', desc: 'Roll-on planning, microcycles, reviews, pivots, minimum viable plans, and explore/exploit cycles.' },
  { name: 'Tools', desc: 'Courses, books, templates, software, articles, and community experiments that turn ideas into practice.' },
]
</script>

<template>
  <section id="what-is-ap" class="about" aria-labelledby="ap-heading">
    <div class="about__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="100" :accents="6" :seed="29" />
    </div>

    <div class="container about__inner">
      <div class="about__col-main">
        <SectionLabel index="02" label="What is AP?" />

        <h2 id="ap-heading" class="about__headline display-2 fade-up">
          Your problem is not that you need another template.
        </h2>

        <p class="about__lead fade-up">
          Most training systems are built for a clean world. Coaching happens in a messy one. The annual plan dies early. Monitoring becomes decoration. Rehab does not follow a straight line. Conditioning does not transfer automatically. Athletes respond differently. And the staff still needs to make a decision by Monday morning.
        </p>

        <div class="about__problem-strip fade-up" aria-label="Common problems Agile Periodization addresses">
          <span v-for="p in problems" :key="p">{{ p }}</span>
        </div>

        <h3 class="about__sub-heading fade-up">Agile Periodization is planning under uncertainty.</h3>
        <p class="about__body fade-up">
          It turns the plan from a prediction into a learning system. Instead of pretending we can control the whole season in advance, AP uses short iterative cycles, review rhythms, simple decision rules, and practical tools to keep the system moving without becoming random.
        </p>

        <div class="about__pillars fade-up">
          <div v-for="p in pillars" :key="p.name" class="about__pillar">
            <strong class="about__pillar-name">{{ p.name }}</strong>
            <span class="about__pillar-desc">{{ p.desc }}</span>
          </div>
        </div>
      </div>

      <div class="about__col-side">
        <div class="about__reframe fade-up">
          <h3 class="about__reframe-title">Stop worshipping the plan. Improve the system.</h3>
          <div class="about__compare">
            <div class="about__compare-col">
              <span class="about__compare-label">Traditional planning</span>
              <ul>
                <li>Locks in the season too early</li>
                <li>Starts with blocks, dose, and calendar</li>
                <li>Reacts after the plan breaks</li>
              </ul>
            </div>
            <div class="about__compare-col about__compare-col--ap">
              <span class="about__compare-label">Agile Periodization</span>
              <ul>
                <li>Plans in short, rolling cycles</li>
                <li>Starts with the problem to solve</li>
                <li>Reviews, learns, and adapts the next step</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style scoped>
.about {
  position: relative; background: var(--teal); color: var(--cream);
  overflow: hidden; isolation: isolate; padding: clamp(72px, 10vh, 120px) 0;
}
.about__hex { position: absolute; inset: 0; opacity: 0.18; pointer-events: none; z-index: 0; }

.about__inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 0.72fr; gap: clamp(48px, 6vw, 88px); align-items: start;
}

/* Main copy column */
.about__col-main { display: flex; flex-direction: column; gap: 28px; }

.about__headline { color: var(--cream); max-width: 20ch; margin: 0; }

.about__lead {
  font-size: clamp(15px, 1.15vw, 17px); line-height: 1.72; color: var(--cream); opacity: 0.92; margin: 0;
}

.about__problem-strip {
  display: flex; flex-wrap: wrap; gap: 8px; padding: 20px 0;
  border-top: 1px solid rgba(243, 243, 243, 0.1); border-bottom: 1px solid rgba(243, 243, 243, 0.1);
}
.about__problem-strip span {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
  padding: 6px 14px; border-radius: 999px;
  border: 1px solid rgba(243, 243, 243, 0.22); color: var(--cream); opacity: 0.88;
}

.about__sub-heading {
  font-family: var(--font-display); font-size: clamp(20px, 1.8vw, 26px); font-weight: 700;
  letter-spacing: -0.018em; color: var(--cream); margin: 0;
}

.about__body {
  font-size: clamp(15px, 1.1vw, 17px); line-height: 1.72; color: var(--cream); opacity: 0.9; margin: 0;
}

.about__pillars {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  padding-top: 20px; border-top: 1px solid rgba(243, 243, 243, 0.1);
}
.about__pillar { display: flex; flex-direction: column; gap: 8px; }
.about__pillar-name {
  font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--cream);
}
.about__pillar-desc { font-size: 13px; line-height: 1.6; color: var(--cream); opacity: 0.82; }

/* Side / sticky column */
.about__col-side { position: sticky; top: 100px; }

.about__reframe {
  background: var(--teal-deep); border: 1px solid rgba(243, 243, 243, 0.1);
  border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; gap: 24px;
}

.about__reframe-title {
  font-family: var(--font-display); font-size: clamp(18px, 1.6vw, 22px); font-weight: 700;
  line-height: 1.25; letter-spacing: -0.015em; color: #f3f3f3; margin: 0;
}

.about__compare { display: flex; flex-direction: column; gap: 18px; }
.about__compare-col { display: flex; flex-direction: column; gap: 10px; }
.about__compare-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(243, 243, 243, 0.5);
}
.about__compare-col--ap .about__compare-label { color: rgba(200, 226, 220, 0.9); }

.about__compare-col ul {
  list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;
  padding: 14px 16px; border-radius: var(--radius-sm);
  background: rgba(243, 243, 243, 0.05); border: 1px solid rgba(243, 243, 243, 0.08);
}
.about__compare-col--ap ul {
  background: rgba(200, 226, 220, 0.08); border-color: rgba(200, 226, 220, 0.18);
}
.about__compare-col li {
  font-size: 13.5px; line-height: 1.45; color: rgba(243, 243, 243, 0.85);
  padding-left: 16px; position: relative;
}
.about__compare-col li::before {
  content: '—'; position: absolute; left: 0; opacity: 0.4;
  font-family: var(--font-mono); font-size: 11px;
}
.about__compare-col--ap li { color: rgba(200, 226, 220, 0.95); }
.about__compare-col--ap li::before { content: '✓'; opacity: 0.7; color: rgba(200, 226, 220, 0.9); }

@media (max-width: 1060px) {
  .about__inner { grid-template-columns: 1fr; }
  .about__col-side { position: static; max-width: 560px; }
  .about__pillars { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .about__pillars { grid-template-columns: 1fr; gap: 16px; }
}
</style>
