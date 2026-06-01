<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { sources, useContentStore, itemUrl, sourceLabel } from '@/stores/content.js'
import FeaturedBanner from '@/components/sections/FeaturedBanner.vue'

const content = useContentStore()
const { articles, resources, books } = storeToRefs(content)

const SKOOL_URL    = sources.skool.url
const SUBSTACK_URL = sources.substack.url
const PAYHIP_URL   = sources.payhip.url
const AMAZON_URL   = sources.amazon.url

// ── Nav state ─────────────────────────────────────────────
const navOpen = ref(false)
function toggleNav() {
  navOpen.value = !navOpen.value
  document.body.classList.toggle('nav-open', navOpen.value)
}
function closeNav() {
  if (!navOpen.value) return
  navOpen.value = false
  document.body.classList.remove('nav-open')
}

// ── Forms ─────────────────────────────────────────────────
const newsletter = ref({ name: '', email: '', interest: '' })
const newsletterNote = ref('No spam. Useful updates only.')
const newsletterSent = ref(false)
function submitNewsletter() {
  if (!newsletter.value.email) return
  newsletterNote.value = `You're on the list${newsletter.value.name ? ', ' + newsletter.value.name : ''}. Useful updates only.`
  newsletterSent.value = true
}

const inquiry = ref({ name: '', email: '', role: '', interest: '', message: '' })
const inquiryNote = ref('Share the context, constraints, and what you are trying to improve.')
const inquirySent = ref(false)
function submitInquiry() {
  if (!inquiry.value.name || !inquiry.value.email) return
  inquiryNote.value = `Thanks, ${inquiry.value.name}. Inquiry received — I will be in touch if it looks like a good fit.`
  inquirySent.value = true
}

// ── Scroll-reveal ─────────────────────────────────────────
let io = null
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  )
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
})
onBeforeUnmount(() => { io?.disconnect() })

// ── Per-item helpers ──────────────────────────────────────
function resourceCta(item) {
  if (item.source === 'amazon') return 'View on Amazon'
  if (item.source === 'payhip') return 'View Resource'
  return 'Open'
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <!-- ═══════════════════════════════ NAV ═══════ -->
  <header class="site-header">
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="#top" @click="closeNav">
        <img class="brand-logo" src="/assets/images/ap-logo.svg" alt="" />
        <span>Agile Periodization</span>
      </a>
      <button class="nav-toggle" type="button"
              :aria-expanded="String(navOpen)" aria-controls="navLinks"
              @click="toggleNav">
        <span class="sr-only">Toggle navigation</span>
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks" :class="{ open: navOpen }">
        <a href="#featured" @click="closeNav">Featured</a>
        <a href="#what-is-ap" @click="closeNav">What is AP?</a>
        <a href="#ecosystem" @click="closeNav">Ecosystem</a>
        <a href="#resources" @click="closeNav">Resources</a>
        <a href="#contact" @click="closeNav">Contact</a>
      </div>
      <a class="button button-primary button-small nav-cta" :href="SKOOL_URL" target="_blank" rel="noopener">
        Join Skool
      </a>
    </nav>
  </header>

  <main id="main">
    <!-- ═══════════════════════════════ HERO ═══════ -->
    <section class="hero" id="top">
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <p class="eyebrow">Agile Periodization</p>
          <h1>Build training systems that survive contact with <em>reality.</em></h1>
          <p class="lead hero-subtitle">
            For coaches, sport scientists, physios, and performance teams — Agile Periodization turns fragile plans into adaptive systems: plan, train, monitor, review, adapt, repeat.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">
              Join the Community
              <span class="arrow" aria-hidden="true">→</span>
            </a>
            <a class="button button-secondary" href="#updates">Get Updates</a>
          </div>
          <div class="value-strip" aria-label="What Agile Periodization provides">
            <span>Philosophy</span><span>Frameworks</span><span>Tools</span>
            <span>Education</span><span>Community</span><span>Field notes</span>
          </div>
          <p class="hero-note">Tired of annual plans dying after the first injury, travel week, or fatigue spike?</p>
        </div>

        <div class="hero-visual reveal" aria-label="Adaptive operating system visual">
          <div class="system-board">
            <div class="board-kicker">
              <span>Adaptive operating system</span>
              <span class="pulse-dot" aria-hidden="true"></span>
            </div>
            <div class="loop-map" aria-hidden="true">
              <span class="loop-node node-plan">Plan</span>
              <span class="loop-node node-train">Train</span>
              <span class="loop-node node-monitor">Monitor</span>
              <span class="loop-node node-review">Review</span>
              <span class="loop-node node-adapt">Adapt</span>
              <span class="loop-node node-repeat">Repeat</span>
              <span class="loop-center">
                Decision
                <small>loop</small>
              </span>
            </div>
            <div class="reality-panel">
              <strong>Reality pushing in</strong>
              <div class="messy-tags">
                <span>Injuries</span><span>Fatigue</span><span>Travel</span>
                <span>Rehab setbacks</span><span>Noisy data</span><span>Competition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ FEATURED BANNER ═══════ -->
    <FeaturedBanner />

    <!-- ═══════════════════════════ WHAT IS AP ═══════ -->
    <section class="ap-definition section" id="what-is-ap">
      <div class="container ap-grid">
        <div class="ap-copy reveal">
          <p class="eyebrow">01 — What is AP?</p>
          <h2>Your problem is not that you need <em>another template.</em></h2>
          <p class="lead">Most training systems are built for a clean world. Coaching happens in a messy one. The annual plan dies early. Monitoring becomes decoration. Rehab does not follow a straight line. Conditioning does not transfer automatically. And the staff still needs to make a decision by Monday morning.</p>

          <div class="problem-grid">
            <div class="problem-card"><span class="num">P · 01</span><span class="body">The annual plan dies early.</span></div>
            <div class="problem-card"><span class="num">P · 02</span><span class="body">Monitoring becomes decoration.</span></div>
            <div class="problem-card"><span class="num">P · 03</span><span class="body">Dose becomes the religion.</span></div>
            <div class="problem-card"><span class="num">P · 04</span><span class="body">Transfer is assumed.</span></div>
            <div class="problem-card"><span class="num">P · 05</span><span class="body">The coach carries the system.</span></div>
          </div>

          <h3>Agile Periodization is <em>planning under uncertainty.</em></h3>
          <p>It turns the plan from a prediction into a learning system. Instead of pretending we can control the whole season in advance, AP uses short iterative cycles, review rhythms, simple decision rules, and practical tools to keep the system moving without becoming random.</p>

          <div class="pillars">
            <article>
              <strong>Philosophy</strong>
              <span>Mental models for uncertainty, robustness, adaptation, transfer, and decision-making.</span>
            </article>
            <article>
              <strong>Frameworks</strong>
              <span>Microcycles, reviews, pivots, decision rules, and structures that adapt without becoming random.</span>
            </article>
            <article>
              <strong>Tools</strong>
              <span>Courses, books, templates, software, articles, and community experiments that turn ideas into practice.</span>
            </article>
          </div>
        </div>

        <aside class="reframe-card reveal">
          <p class="eyebrow">The reframe</p>
          <h3>Stop worshipping the plan. Improve the system.</h3>
          <div class="compare">
            <div>
              <b>Traditional</b>
              <span>Locks in the season too early</span>
              <span>Starts with blocks, dose, calendar</span>
              <span>Reacts after the plan breaks</span>
            </div>
            <div>
              <b>Agile</b>
              <span>Plans in short, rolling cycles</span>
              <span>Starts with the problem to solve</span>
              <span>Reviews, learns, adapts the next step</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ═══════════════════════════ ECOSYSTEM ═══════ -->
    <section class="section surface-paper" id="ecosystem">
      <div class="container">
        <div class="section-header reveal">
          <p class="eyebrow">02 — Ecosystem</p>
          <h2>One philosophy. <em>Multiple doors in.</em></h2>
          <p class="lead">Skool is the main door. Articles, products, books, updates, and direct work support the journey.</p>
        </div>

        <div class="ecosystem-grid">
          <article class="eco-card primary reveal">
            <div class="eco-label"><span>Main door</span><span class="eco-num">01</span></div>
            <h3>Skool Community</h3>
            <p>The main workshop for discussions, Q&amp;As, early-access resources, tools, drafts, and implementation.</p>
            <a class="text-link" :href="SKOOL_URL" target="_blank" rel="noopener">Join Skool →</a>
          </article>
          <article class="eco-card reveal">
            <div class="eco-label"><span>Articles</span><span class="eco-num">02</span></div>
            <h3>Substack</h3>
            <p>Long-form essays and field notes on planning, conditioning, monitoring, skill acquisition, and coaching under uncertainty.</p>
            <a class="text-link" href="#articles">Read Articles →</a>
          </article>
          <article class="eco-card reveal">
            <div class="eco-label"><span>Digital</span><span class="eco-num">03</span></div>
            <h3>Payhip</h3>
            <p>Courses, PDFs, tools, templates, and working resources.</p>
            <a class="text-link" href="#resources">Browse Resources →</a>
          </article>
          <article class="eco-card reveal">
            <div class="eco-label"><span>Paperback</span><span class="eco-num">04</span></div>
            <h3>Amazon</h3>
            <p>Physical manuals for long-form reading and field margins.</p>
            <a class="text-link" href="#books">View Books →</a>
          </article>
          <article class="eco-card reveal">
            <div class="eco-label"><span>Updates</span><span class="eco-num">05</span></div>
            <h3>Stay in the loop</h3>
            <p>New articles, tools, releases, rehab/RTP work, workshops, and community updates.</p>
            <a class="text-link" href="#updates">Get Updates →</a>
          </article>
          <article class="eco-card reveal">
            <div class="eco-label"><span>Direct</span><span class="eco-num">06</span></div>
            <h3>Contact</h3>
            <p>Consulting, workshops, staff education, athlete programming, and performance audits.</p>
            <a class="text-link" href="#contact">Work With Me →</a>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ SKOOL ═══════ -->
    <section class="section surface-cream" id="skool">
      <div class="container split-section">
        <div class="reveal">
          <p class="eyebrow">03 — Skool Community</p>
          <h2>The workshop, not just <em>another content library.</em></h2>
          <p class="lead">Join Agile Periodization for discussions, Q&amp;As, early-access resources, working drafts, implementation questions, and the practical mess of applying these ideas with real athletes and real constraints.</p>
          <div class="mini-list">
            <span>Weekly discussions</span><span>Early-access resources</span>
            <span>Courses &amp; drafts</span><span>Community feedback</span>
          </div>
          <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">
            Join the Community
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="visual-panel reveal">
          <div class="panel-media">
            <img src="/assets/images/philosophical-foundations.png" alt="Philosophical Foundations cover" />
          </div>
          <div class="panel-note">
            <strong>Best first door</strong>
            <p>If someone wants context, discussion, and implementation help, send them here first.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ ARTICLES ═══════ -->
    <section class="section surface-paper" id="articles">
      <div class="container">
        <div class="row-header reveal">
          <div>
            <p class="eyebrow">04 — Articles</p>
            <h2>Field notes from <em>inside the practice.</em></h2>
            <p class="lead">Long-form essays on planning, conditioning, monitoring, skill acquisition, and coaching under uncertainty.</p>
          </div>
          <a class="button button-secondary" :href="SUBSTACK_URL" target="_blank" rel="noopener">
            Read all on Substack
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="article-grid">
          <article class="article-card reveal" v-for="a in articles" :key="a.id">
            <div class="article-media">
              <img :src="a.image" :alt="''" />
            </div>
            <div class="article-body">
              <div class="article-meta">
                <span class="type">{{ a.type }}</span>
                <span class="dot">·</span>
                <span class="meta">{{ a.date }}</span>
                <span v-if="a.readTime" class="dot">·</span>
                <span v-if="a.readTime" class="meta">{{ a.readTime }}</span>
              </div>
              <h3>{{ a.title }}</h3>
              <p>{{ a.description }}</p>
              <a class="text-link" :href="itemUrl(a)" target="_blank" rel="noopener">
                Read on {{ sourceLabel(a) }} →
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ RESOURCES ═══════ -->
    <section class="section surface-cream" id="resources">
      <div class="container">
        <div class="row-header reveal">
          <div>
            <p class="eyebrow">05 — Resources</p>
            <h2>Courses, tools, PDFs, and <em>working resources.</em></h2>
            <p class="lead">Practical resources built around the Agile Periodization framework — for use this week, not next season.</p>
          </div>
          <a class="button button-primary" :href="PAYHIP_URL" target="_blank" rel="noopener">
            Browse all on Payhip
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="resource-grid">
          <article class="resource-card reveal" v-for="r in resources" :key="r.id">
            <div class="res-media">
              <img :src="r.image" :alt="''" />
            </div>
            <div class="res-meta">
              <span>{{ r.type }}</span>
              <span v-if="r.tag" class="dot">·</span>
              <span v-if="r.tag">{{ r.tag }}</span>
            </div>
            <h3>{{ r.title }}</h3>
            <p>{{ r.description }}</p>
            <a class="text-link" :href="itemUrl(r)" target="_blank" rel="noopener">
              {{ resourceCta(r) }} →
            </a>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ BOOKS ═══════ -->
    <section class="section surface-paper" id="books">
      <div class="container split-section reverse">
        <div class="reveal">
          <p class="eyebrow">06 — Books</p>
          <h2>Long-form manuals for people who <em>still like paper.</em></h2>
          <p class="lead">Some resources are available as paperback for coaches and practitioners who prefer reading, annotating, and destroying margins with notes.</p>
          <div class="mini-list">
            <span>Strength Training Manual</span><span>HIIT Manual</span><span>bmbstats</span>
          </div>
          <a class="button button-secondary" :href="AMAZON_URL" target="_blank" rel="noopener">
            View Books on Amazon
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="book-stage reveal">
          <div class="book-row">
            <img v-for="b in books" :key="b.id" :src="b.image" :alt="b.title + ' cover'" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ UPDATES ═══════ -->
    <section class="updates-section section" id="updates">
      <div class="container updates-grid">
        <div class="reveal">
          <p class="eyebrow">07 — Stay in the loop</p>
          <h2>New work, before it gets <em>noisy elsewhere.</em></h2>
          <p class="lead">New articles, tools, product releases, rehab/RTP work, workshops, and community updates. No daily noise.</p>
        </div>
        <form class="newsletter-form reveal" @submit.prevent="submitNewsletter">
          <label>Name
            <input v-model="newsletter.name" type="text" placeholder="Your name" />
          </label>
          <label>Email
            <input v-model="newsletter.email" type="email" placeholder="you@example.com" required />
          </label>
          <label class="full">Main interest
            <select v-model="newsletter.interest">
              <option value="">Pick what you care about most</option>
              <option>Planning under uncertainty</option>
              <option>Strength training</option>
              <option>Conditioning and endurance</option>
              <option>Skill acquisition / problemming</option>
              <option>Monitoring, testing, and data</option>
              <option>Rehab / return-to-play</option>
              <option>Philosophy and decision-making</option>
              <option>Tools and templates</option>
              <option>Workshops / direct work</option>
            </select>
          </label>
          <div class="form-actions">
            <p class="form-note" :class="{ submitted: newsletterSent }">{{ newsletterNote }}</p>
            <button class="button button-primary" type="submit">
              Get Updates
              <span class="arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- ═══════════════════════════ CONTACT + ABOUT ═══════ -->
    <section class="section surface-cream" id="contact">
      <div class="container contact-grid">
        <div class="about-card reveal">
          <div class="about-portrait">
            <img src="/assets/images/mladen-profile.jpg" alt="Mladen Jovanović" />
            <div>
              <strong>Mladen Jovanović, PhD</strong>
              <span>Coach · Sport scientist · Toolmaker</span>
            </div>
          </div>
          <p class="eyebrow">Why trust this?</p>
          <h2>Built by a coach, sport scientist, and toolmaker.</h2>
          <p>Twenty years across professional and national-team environments. Books, courses, software, and research on sprint profiling, monitoring, modeling, and training decision-making.</p>
          <ul>
            <li>Head of Performance, Serbia Women's National Football Team</li>
            <li>Former Port Adelaide FC, Aspire Academy, Hammarby IF</li>
            <li>Author of Strength Training Manual and HIIT Manual</li>
            <li>Developer of AthleteSR, Strength Card Builder, HIT Builder</li>
            <li>Founder/author at Complementary Training</li>
            <li>R package author: shorts and STMr</li>
          </ul>
        </div>

        <div class="contact-card reveal">
          <p class="eyebrow">08 — Direct work</p>
          <h2>Work with me <em>directly.</em></h2>
          <p>If you want help applying Agile Periodization inside your team, club, clinic, or individual performance environment — get in touch.</p>
          <form class="contact-form" @submit.prevent="submitInquiry">
            <label>Name
              <input v-model="inquiry.name" type="text" placeholder="Your name" required />
            </label>
            <label>Email
              <input v-model="inquiry.email" type="email" placeholder="you@example.com" required />
            </label>
            <label>Role / organization
              <input v-model="inquiry.role" type="text" placeholder="Coach, physio, athlete, club..." />
            </label>
            <label>Interest
              <select v-model="inquiry.interest" required>
                <option value="">Select one</option>
                <option>Consulting</option>
                <option>Workshop / staff education</option>
                <option>Performance-system audit</option>
                <option>Athlete programming</option>
                <option>Individual athlete performance management</option>
                <option>Speaking / conference</option>
                <option>Software, tool, or workflow design</option>
                <option>Rehab / return-to-play system design</option>
                <option>Other</option>
              </select>
            </label>
            <label class="full">Message
              <textarea v-model="inquiry.message" rows="4" placeholder="Tell me what you are trying to solve."></textarea>
            </label>
            <div class="form-actions">
              <p class="form-note" :class="{ submitted: inquirySent }">{{ inquiryNote }}</p>
              <button class="button button-primary" type="submit">
                Send Inquiry
                <span class="arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ FINAL CTA ═══════ -->
    <section class="final-cta">
      <div class="container">
        <p class="eyebrow no-rule reveal">Final Call</p>
        <h2 class="reveal">Reality will break the plan. <em>Build a system that learns.</em></h2>
        <p class="reveal">Join coaches, sport scientists, physios, and performance practitioners building better training systems through discussion, tools, courses, and shared experiments.</p>
        <div class="hero-actions center reveal">
          <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">
            Join the Community
            <span class="arrow" aria-hidden="true">→</span>
          </a>
          <a class="button button-secondary" href="#updates">Get Updates</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <span>© Agile Periodization · Mladen Jovanović</span>
      <nav class="footer-links" aria-label="Footer">
        <a :href="SKOOL_URL" target="_blank" rel="noopener">Skool</a>
        <a :href="SUBSTACK_URL" target="_blank" rel="noopener">Substack</a>
        <a :href="PAYHIP_URL" target="_blank" rel="noopener">Payhip</a>
        <a :href="AMAZON_URL" target="_blank" rel="noopener">Amazon</a>
        <a href="#updates">Updates</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  </footer>

  <!-- Mobile sticky CTA -->
  <div class="mobile-cta-bar" aria-hidden="false">
    <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">Join Skool</a>
    <a class="button button-secondary" href="#updates">Updates</a>
  </div>
</template>
