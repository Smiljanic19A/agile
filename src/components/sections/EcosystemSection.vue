<script setup>
import SectionLabel from '@/components/ui/SectionLabel.vue'
import { externalLinks } from '@/stores/content.js'

const cards = [
  {
    tag: 'Main door',
    title: 'Skool Community',
    desc: 'The main workshop for discussions, Q&As, early-access resources, tools, drafts, and implementation.',
    cta: 'Join Skool',
    href: externalLinks.skool,
    external: true,
    primary: true,
  },
  {
    tag: 'Articles',
    title: 'Substack',
    desc: 'Long-form essays and field notes on planning, conditioning, monitoring, skill acquisition, theory, and coaching under uncertainty.',
    cta: 'Read Articles',
    href: '#substack',
    external: false,
  },
  {
    tag: 'Digital resources',
    title: 'Payhip',
    desc: 'Courses, PDFs, tools, templates, and working resources.',
    cta: 'Browse Resources',
    href: '#resources',
    external: false,
  },
  {
    tag: 'Paperback books',
    title: 'Amazon',
    desc: 'Physical and manual formats for long-form reading.',
    cta: 'View Books',
    href: '#amazon',
    external: false,
  },
  {
    tag: 'Updates',
    title: 'Stay in the loop',
    desc: 'New articles, tools, releases, rehab/RTP work, workshops, and community updates.',
    cta: 'Get Updates',
    href: '#updates',
    external: false,
  },
  {
    tag: 'Direct work',
    title: 'Contact',
    desc: 'Consulting, workshops, staff education, athlete programming, individual performance management, and audits.',
    cta: 'Work With Me',
    href: '#contact',
    external: false,
  },
]
</script>

<template>
  <section id="ecosystem" class="eco section section--teal" aria-labelledby="eco-title">
    <div class="container">
      <header class="eco__head fade-up">
        <SectionLabel index="03" label="The Ecosystem" />
        <div class="eco__head-row">
          <h2 id="eco-title" class="display-2 eco__title">One philosophy. <em>Multiple doors in.</em></h2>
          <p class="eco__sub">Skool is the main door. Articles, products, books, updates, and direct work support the journey.</p>
        </div>
      </header>

      <div class="eco__grid fade-up">
        <a
          v-for="card in cards"
          :key="card.title"
          :href="card.href"
          :target="card.external ? '_blank' : undefined"
          :rel="card.external ? 'noopener noreferrer' : undefined"
          class="eco__card"
          :class="{ 'eco__card--primary': card.primary }"
        >
          <span class="eco__card-tag">{{ card.tag }}</span>
          <h3 class="eco__card-title">{{ card.title }}</h3>
          <p class="eco__card-desc">{{ card.desc }}</p>
          <span class="eco__card-cta">{{ card.cta }} <span class="eco__card-arrow" aria-hidden="true">→</span></span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.eco { background: var(--teal); color: var(--cream); }

.eco__head { display: flex; flex-direction: column; gap: 28px; margin-bottom: 48px; }
.eco__head-row { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; }

.eco__title { max-width: 22ch; color: var(--cream); margin: 0; }
.eco__title em { font-style: italic; font-weight: 500; color: rgba(243,243,243,0.72); }
.eco__sub { font-size: clamp(15px, 1.1vw, 17px); line-height: 1.68; color: rgba(243,243,243,0.82); margin: 0; max-width: 44ch; }

.eco__grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}

.eco__card {
  display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit;
  background: rgba(243,243,243,0.04); border: 1px solid var(--hairline-light);
  border-radius: var(--radius); padding: 24px;
  transition: background 220ms var(--ease), border-color 220ms var(--ease), transform 220ms var(--ease);
}
.eco__card:hover { background: rgba(243,243,243,0.08); border-color: var(--hairline-light-strong); transform: translateY(-2px); }
.eco__card:hover .eco__card-arrow { transform: translateX(4px); }

.eco__card--primary {
  background: rgba(243,243,243,0.1); border-color: rgba(243,243,243,0.25);
}
.eco__card--primary:hover { background: rgba(243,243,243,0.15); }

.eco__card-tag {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--cream); opacity: 0.55; display: block;
}
.eco__card--primary .eco__card-tag { opacity: 0.8; }

.eco__card-title {
  font-family: var(--font-display); font-size: clamp(18px, 1.5vw, 22px); font-weight: 700;
  letter-spacing: -0.016em; line-height: 1.15; color: var(--cream); margin: 0;
}

.eco__card-desc { font-size: 14px; line-height: 1.6; color: rgba(243,243,243,0.78); margin: 0; flex: 1; }

.eco__card-cta {
  margin-top: auto; display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--cream); opacity: 0.72; padding-top: 12px; border-top: 1px solid var(--hairline-light);
}
.eco__card-arrow { display: inline-block; transition: transform 220ms var(--ease); }

@media (max-width: 1100px) { .eco__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) { .eco__head-row { grid-template-columns: 1fr; gap: 20px; } }
@media (max-width: 640px) { .eco__grid { grid-template-columns: 1fr; } }
</style>
