<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
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
        <p class="prose">
          You need enough structure to move forward, and enough flexibility to
          adapt. Models, but not model worship. Plans, but not attachment to the
          plan. That intersection — sports science, skill acquisition, physical
          preparation, and practical coaching — is what this work sits inside.
        </p>
        <p class="prose">
          For strength and conditioning coaches, sport scientists, physios and
          rehab practitioners, combat sports coaches, team-sport practitioners,
          and serious athletes who want the logic behind the training.
        </p>
      </div>

      <aside class="about__card fade-up" aria-label="About Mladen Jovanović">
        <div class="about__card-head">
          <span class="about__card-eyebrow">About</span>
          <span class="about__card-id">MJ — 001</span>
        </div>

        <h3 class="about__card-name">Mladen Jovanović, PhD</h3>
        <p class="about__card-role">
          Strength &amp; conditioning coach. Sport scientist. Performance manager. Author.
        </p>

        <ul class="about__list">
          <li>
            <span>Port Adelaide FC</span>
            <span>Australia</span>
          </li>
          <li>
            <span>Aspire Academy</span>
            <span>Qatar</span>
          </li>
          <li>
            <span>Hammarby IF</span>
            <span>Sweden</span>
          </li>
          <li>
            <span>Complementary Training</span>
            <span>Founder</span>
          </li>
        </ul>

        <p class="about__quote">
          “Coaching is not just prescription. It is problem-solving under
          uncertainty. You need a way to think, not just a template to follow.”
        </p>
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

.about__card {
  background: var(--cream);
  border: 1px solid var(--hairline);
  border-radius: var(--radius);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

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

@media (max-width: 960px) {
  .about__grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}
</style>
