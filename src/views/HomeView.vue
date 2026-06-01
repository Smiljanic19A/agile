<script setup>
import { onMounted, ref } from 'vue'

const SKOOL_URL = 'https://www.skool.com/agileperiodization'
const SUBSTACK_URL = 'https://agileperiodization.substack.com'
const PAYHIP_URL = 'https://payhip.com/mjovanovic'
const AMAZON_URL = 'https://www.amazon.com/stores/author/B07MYX4Y13'

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

const products = ref([])
const productsFallback = [
  { title: 'Philosophical Foundations', type: 'Course', tag: 'Philosophy', description: 'The mental models behind Agile Periodization.', image: '/assets/images/philosophical-foundations.png', url: PAYHIP_URL },
  { title: 'Endurance Map Builder',   type: 'Tool',   tag: 'Conditioning', description: 'Map domains, thresholds, CP/W′, MAS, and conditioning decisions.', image: '/assets/images/endurance-map-builder.png', url: PAYHIP_URL },
  { title: 'Badger Protocol',         type: 'PDF',    tag: 'Strength',     description: 'Simple, flexible loading ideas and isoSandwich variations.', image: '/assets/images/badger-protocol.png', url: PAYHIP_URL },
  { title: 'Conditioning for MMA',    type: 'Course', tag: 'Conditioning', description: 'Agile microcycle planning and conditioning under combat sport constraints.', image: '/assets/images/conditioning-mma.png', url: PAYHIP_URL },
]

onMounted(async () => {
  try {
    const res = await fetch('/assets/data/products.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    const featured = data.filter((p) => p.featured)
    const list = (featured.length ? featured : data).slice(0, 6)
    products.value = list.length ? list : productsFallback
  } catch {
    products.value = productsFallback
  }
})

const newsletter = ref({ name: '', email: '', interest: '' })
const newsletterNote = ref('No spam. Just useful updates from the Agile Periodization ecosystem.')
const newsletterSent = ref(false)
function submitNewsletter() {
  if (!newsletter.value.email) return
  newsletterNote.value = `Thanks${newsletter.value.name ? ', ' + newsletter.value.name : ''}. You're on the list — useful updates only.`
  newsletterSent.value = true
}

const inquiry = ref({ name: '', email: '', role: '', interest: '', message: '' })
const inquiryNote = ref('Share the context, constraints, and what you are trying to improve. The more specific you are, the easier it is to see whether I can help.')
const inquirySent = ref(false)
function submitInquiry() {
  if (!inquiry.value.name || !inquiry.value.email) return
  inquiryNote.value = `Thanks, ${inquiry.value.name}. Your inquiry has been received. I will get back to you if it looks like a good fit.`
  inquirySent.value = true
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="#top" aria-label="Agile Periodization home" @click="closeNav">
        <img class="brand-logo" src="/assets/images/ap-logo.svg" alt="Agile Periodization logo" />
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
      <a class="button button-small button-primary nav-cta" :href="SKOOL_URL" target="_blank" rel="noopener">Join Skool</a>
    </nav>
  </header>

  <main id="main">
    <!-- HERO -->
    <section class="hero" id="top">
      <div class="section-inner hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Agile Periodization</p>
          <h1>Build training systems that survive contact with reality.</h1>
          <p class="hero-subtitle">
            Agile Periodization helps coaches, sport scientists, physios, and performance teams turn fragile plans into adaptive systems: plan, train, monitor, review, adapt, repeat.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">Join the Community</a>
            <a class="button button-secondary" href="#updates">Get Updates</a>
          </div>
          <p class="hero-note">Tired of annual plans dying after the first injury, travel week, fatigue spike, or staff meeting?</p>
          <div class="value-strip" aria-label="What Agile Periodization provides">
            <span>Philosophy</span><span>Frameworks</span><span>Tools</span>
            <span>Education</span><span>Community</span><span>Field notes</span>
          </div>
        </div>

        <div class="hero-visual" aria-label="Adaptive operating system visual">
          <div class="system-board">
            <p class="board-kicker">Adaptive operating system</p>
            <div class="loop-map" aria-hidden="true">
              <span class="loop-node node-plan">Plan</span>
              <span class="loop-node node-train">Train</span>
              <span class="loop-node node-monitor">Monitor</span>
              <span class="loop-node node-review">Review</span>
              <span class="loop-node node-adapt">Adapt</span>
              <span class="loop-node node-repeat">Repeat</span>
              <span class="loop-center">Decision<br />Loop</span>
            </div>
            <div class="reality-panel">
              <strong>Reality pushing in</strong>
              <div class="messy-tags">
                <span>Injuries</span><span>Fatigue</span><span>Travel</span>
                <span>Rehab setbacks</span><span>Noisy data</span><span>Competition</span>
              </div>
            </div>
          </div>
          <div class="product-stack" aria-hidden="true">
            <img src="/assets/images/philosophical-foundations.png" alt="" />
            <img src="/assets/images/strength-training-manual.png" alt="" />
            <img src="/assets/images/endurance-map-builder.png" alt="" />
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED -->
    <section class="featured section-tight" id="featured">
      <div class="section-inner">
        <div class="section-header narrow">
          <p class="eyebrow">Featured</p>
          <h2>One thing worth your attention right now.</h2>
          <p>One image. One message. One action. Update it when the current priority changes.</p>
        </div>
        <article class="featured-panel">
          <div class="featured-panel-copy">
            <span class="badge">Video orientation</span>
            <h3>What is Agile Periodization?</h3>
            <p>A short overview of the idea: why fixed plans break, why training needs feedback loops, and how Agile Periodization turns planning into a learning system.</p>
            <div class="featured-actions">
              <a class="button button-primary button-small" href="#what-is-ap">See the overview</a>
              <a class="text-link" href="#updates">Get future updates →</a>
            </div>
          </div>
          <figure class="featured-panel-media">
            <img src="/assets/images/philosophical-foundations.png" alt="Agile Periodization featured orientation visual" />
          </figure>
        </article>
      </div>
    </section>

    <!-- WHAT IS AP -->
    <section class="ap-definition section-tight" id="what-is-ap">
      <div class="section-inner ap-grid">
        <div class="ap-copy">
          <p class="eyebrow">What is Agile Periodization?</p>
          <h2>Your problem is not that you need another template.</h2>
          <p class="lead">Most training systems are built for a clean world. Coaching happens in a messy one. The annual plan dies early. Monitoring becomes decoration. Rehab does not follow a straight line. Conditioning does not transfer automatically. Athletes respond differently. And the staff still needs to make a decision by Monday morning.</p>

          <div class="problem-strip" aria-label="Common problems Agile Periodization addresses">
            <span>The annual plan dies early</span>
            <span>Monitoring becomes decoration</span>
            <span>Dose becomes the religion</span>
            <span>Transfer is assumed</span>
            <span>The coach carries the system</span>
          </div>

          <h3>Agile Periodization is planning under uncertainty.</h3>
          <p>It turns the plan from a prediction into a learning system. Instead of pretending we can control the whole season in advance, AP uses short iterative cycles, review rhythms, simple decision rules, and practical tools to keep the system moving without becoming random.</p>
          <div class="pillars compact">
            <article><strong>Philosophy</strong><span>Mental models for uncertainty, robustness, adaptation, transfer, and decision-making.</span></article>
            <article><strong>Frameworks</strong><span>Microcycles, reviews, pivots, decision rules, and structures that adapt without becoming random.</span></article>
            <article><strong>Tools</strong><span>Courses, books, templates, software, articles, and community experiments that turn ideas into practice.</span></article>
          </div>
        </div>
        <aside class="reframe-card sticky-card">
          <h3>Stop worshipping the plan. Improve the system.</h3>
          <div class="compare simple-compare">
            <div>
              <b>Traditional planning</b>
              <span>Locks in the season too early</span>
              <span>Starts with blocks, dose, and calendar</span>
              <span>Reacts after the plan breaks</span>
            </div>
            <div>
              <b>Agile Periodization</b>
              <span>Plans in short, rolling cycles</span>
              <span>Starts with the problem to solve</span>
              <span>Reviews, learns, and adapts the next step</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ECOSYSTEM -->
    <section class="ecosystem section-tight" id="ecosystem">
      <div class="section-inner">
        <div class="section-header narrow">
          <p class="eyebrow">The Ecosystem</p>
          <h2>One philosophy. Multiple doors in.</h2>
          <p>Skool is the main door. Articles, products, books, updates, and direct work support the journey.</p>
        </div>
        <div class="ecosystem-grid">
          <article class="eco-card primary">
            <span>Main door</span>
            <h3>Skool Community</h3>
            <p>The main workshop for discussions, Q&amp;As, early-access resources, tools, drafts, and implementation.</p>
            <a :href="SKOOL_URL" target="_blank" rel="noopener">Join Skool →</a>
          </article>
          <article class="eco-card">
            <span>Articles</span>
            <h3>Substack</h3>
            <p>Long-form essays and field notes on planning, conditioning, monitoring, skill acquisition, and coaching under uncertainty.</p>
            <a href="#articles">Read Articles →</a>
          </article>
          <article class="eco-card">
            <span>Digital resources</span>
            <h3>Payhip</h3>
            <p>Courses, PDFs, tools, templates, and working resources.</p>
            <a href="#resources">Browse Resources →</a>
          </article>
          <article class="eco-card">
            <span>Paperback books</span>
            <h3>Amazon</h3>
            <p>Physical/manual formats for long-form reading.</p>
            <a href="#books">View Books →</a>
          </article>
          <article class="eco-card">
            <span>Updates</span>
            <h3>Stay in the loop</h3>
            <p>New articles, tools, releases, rehab/RTP work, workshops, and community updates.</p>
            <a href="#updates">Get Updates →</a>
          </article>
          <article class="eco-card">
            <span>Direct work</span>
            <h3>Contact</h3>
            <p>Consulting, workshops, staff education, athlete programming, individual performance management, and audits.</p>
            <a href="#contact">Work With Me →</a>
          </article>
        </div>
      </div>
    </section>

    <!-- SKOOL -->
    <section class="platform-section skool-section section-tight" id="skool">
      <div class="section-inner split-section">
        <div>
          <p class="eyebrow">Skool Community</p>
          <h2>The workshop, not just another content library.</h2>
          <p class="lead">Join the Agile Periodization community for discussions, Q&amp;As, early-access resources, working drafts, implementation questions, and the practical mess of applying these ideas with real athletes and real constraints.</p>
          <div class="mini-list">
            <span>Weekly discussions</span><span>Early-access resources</span>
            <span>Courses and drafts</span><span>Community feedback</span>
          </div>
          <a class="button button-primary" :href="SKOOL_URL" target="_blank" rel="noopener">Join the Community</a>
        </div>
        <div class="visual-panel">
          <img src="/assets/images/philosophical-foundations.png" alt="Agile Periodization Philosophical Foundations course cover" />
          <div>
            <strong>Best first door</strong>
            <p>If someone wants context, discussion, and implementation help, send them here first.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ARTICLES -->
    <section class="platform-section section-tight" id="articles">
      <div class="section-inner">
        <div class="section-header row-header">
          <div>
            <p class="eyebrow">Substack Articles</p>
            <h2>Latest from the blog.</h2>
          </div>
          <a class="button button-secondary" :href="SUBSTACK_URL" target="_blank" rel="noopener">Read all articles</a>
        </div>
        <div class="article-grid">
          <article class="article-card">
            <img src="/assets/images/conditioning-mma.png" alt="Conditioning for MMA cover" />
            <div class="article-body">
              <span>Field note</span>
              <h3>Problemming, practice design, and messy transfer</h3>
              <p>Why "transfer" is rarely a property of the gym exercise itself, and what to do about it on Monday.</p>
              <a :href="SUBSTACK_URL" target="_blank" rel="noopener">Read article →</a>
            </div>
          </article>
          <article class="article-card">
            <img src="/assets/images/endurance-map-builder.png" alt="Endurance Map Builder cover" />
            <div class="article-body">
              <span>Conditioning</span>
              <h3>Thresholds, domains, and practical endurance maps</h3>
              <p>An applied take on intensity domains, CP/W′, and how to use them without becoming a lab.</p>
              <a :href="SUBSTACK_URL" target="_blank" rel="noopener">Read article →</a>
            </div>
          </article>
          <article class="article-card">
            <img src="/assets/images/decoding-fatigue.png" alt="Decoding Fatigue cover" />
            <div class="article-body">
              <span>Theory</span>
              <h3>Fatigue, monitoring, and decisions under uncertainty</h3>
              <p>Monitoring is not decision-making. Here is how to bridge the gap on the staff whiteboard.</p>
              <a :href="SUBSTACK_URL" target="_blank" rel="noopener">Read article →</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- PAYHIP -->
    <section class="platform-section section-tight product-section" id="resources">
      <div class="section-inner">
        <div class="section-header row-header">
          <div>
            <p class="eyebrow">Payhip Resources</p>
            <h2>Courses, tools, PDFs, and working resources.</h2>
          </div>
          <a class="button button-primary" :href="PAYHIP_URL" target="_blank" rel="noopener">Browse all resources</a>
        </div>
        <div class="resource-grid">
          <article class="resource-card" v-for="product in products" :key="product.title">
            <img :src="product.image" :alt="product.title + ' cover'" />
            <span class="resource-meta">{{ product.type }}{{ product.tag ? ' · ' + product.tag : '' }}</span>
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <a :href="product.url" target="_blank" rel="noopener">View Resource →</a>
          </article>
        </div>
      </div>
    </section>

    <!-- AMAZON -->
    <section class="platform-section section-tight" id="books">
      <div class="section-inner split-section reverse">
        <div class="book-row">
          <img src="/assets/images/strength-training-manual.png" alt="Strength Training Manual cover" />
          <img src="/assets/images/hiit-manual.jpg" alt="HIIT Manual cover" />
        </div>
        <div>
          <p class="eyebrow">Amazon Paperback Books</p>
          <h2>Long-form manuals for people who still like paper.</h2>
          <p class="lead">Some resources are available as paperback for coaches and practitioners who prefer reading, annotating, and destroying margins with notes.</p>
          <div class="mini-list">
            <span>Strength Training Manual</span><span>HIIT Manual</span><span>bmbstats</span>
          </div>
          <a class="button button-secondary" :href="AMAZON_URL" target="_blank" rel="noopener">View Books on Amazon</a>
        </div>
      </div>
    </section>

    <!-- UPDATES -->
    <section class="updates-section section-tight" id="updates">
      <div class="section-inner updates-card">
        <div>
          <p class="eyebrow eyebrow-light">Updates</p>
          <h2>Stay in the loop.</h2>
          <p>Get new articles, tools, product releases, rehab/RTP work, workshops, and community updates. No spam.</p>
        </div>
        <form class="newsletter-form" @submit.prevent="submitNewsletter">
          <label>Name
            <input v-model="newsletter.name" name="name" type="text" placeholder="Your name" />
          </label>
          <label>Email
            <input v-model="newsletter.email" name="email" type="email" placeholder="you@example.com" required />
          </label>
          <button class="button button-primary" type="submit">Get Updates</button>
          <p class="form-note" :class="{ submitted: newsletterSent }">{{ newsletterNote }}</p>
        </form>
      </div>
    </section>

    <!-- CONTACT + ABOUT -->
    <section class="contact-about section-tight" id="contact">
      <div class="section-inner contact-grid">
        <div class="about-card">
          <img src="/assets/images/mladen-profile.jpg" alt="Mladen Jovanović" />
          <p class="eyebrow">Why trust this?</p>
          <h2>Built by a coach, sport scientist, and toolmaker.</h2>
          <p>Mladen Jovanović, PhD, works at the intersection of coaching, sport science, software, and performance management.</p>
          <ul>
            <li>Head of Performance, Serbia Women's National Football Team</li>
            <li>Former Port Adelaide FC, Aspire Academy, Hammarby IF</li>
            <li>Author of Strength Training Manual and HIIT Manual</li>
            <li>Developer of AthleteSR, Strength Card Builder, HIT Builder</li>
            <li>Founder/author at Complementary Training</li>
            <li>R package author: shorts and STMr</li>
          </ul>
        </div>
        <div class="contact-card">
          <p class="eyebrow">Direct work</p>
          <h2>Work with me directly.</h2>
          <p>If you want help applying Agile Periodization inside your team, club, clinic, or individual performance environment, get in touch.</p>
          <form class="contact-form" @submit.prevent="submitInquiry">
            <label>Name
              <input v-model="inquiry.name" name="name" type="text" placeholder="Your name" required />
            </label>
            <label>Email
              <input v-model="inquiry.email" name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>Role / organization
              <input v-model="inquiry.role" name="role" type="text" placeholder="Coach, physio, athlete, club..." />
            </label>
            <label>What are you interested in?
              <select v-model="inquiry.interest" name="interest" required>
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
              <textarea v-model="inquiry.message" name="message" rows="4" placeholder="Tell me what you are trying to solve."></textarea>
            </label>
            <button class="button button-primary" type="submit">Send Inquiry</button>
            <p class="form-note" :class="{ submitted: inquirySent }">{{ inquiryNote }}</p>
          </form>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta" id="join">
      <div class="section-inner final-card">
        <p class="eyebrow eyebrow-light">Final Call</p>
        <h2>Reality will break the plan. Build a system that learns.</h2>
        <p>Join coaches, sport scientists, physios, and performance practitioners building better training systems through discussion, tools, courses, and shared experiments.</p>
        <div class="hero-actions center">
          <a class="button button-primary light" :href="SKOOL_URL" target="_blank" rel="noopener">Join the Agile Periodization Community</a>
          <a class="button button-secondary dark" href="#updates">Get Updates</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="section-inner footer-grid">
      <span>© Agile Periodization</span>
      <span>Skool · Substack · Payhip · Amazon · Updates · Contact</span>
    </div>
  </footer>
</template>
