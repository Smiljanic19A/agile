<script setup>
import { externalLinks } from '@/stores/content.js'
import HexLattice from '@/components/ui/HexLattice.vue'

const year = new Date().getFullYear()

const explore = [
  { href: '#work', label: 'The Work' },
  { href: '#watch', label: 'Watch' },
  { href: '#writing', label: 'Writing' },
  { href: '#community', label: 'Community' },
  { href: '#store', label: 'Store' },
]

const ecosystem = [
  { href: externalLinks.substack, label: 'Substack' },
  { href: externalLinks.skool, label: 'Skool community' },
  { href: externalLinks.payhip, label: 'Payhip store' },
  { href: externalLinks.amazon, label: 'Books on Amazon' },
]

const connect = [
  { href: externalLinks.linkedin, label: 'LinkedIn' },
  { href: externalLinks.instagram, label: 'Instagram' },
  { href: externalLinks.github, label: 'GitHub' },
]
</script>

<template>
  <footer class="ft">
    <div class="container ft__inner">
      <div class="ft__brand">
        <div class="ft__brand-mark">
          <img src="/logo.png" alt="" aria-hidden="true" />
        </div>
        <h3 class="ft__brand-title">Agile Periodization</h3>
        <p class="ft__brand-tag is-desktop-only">
          For practitioners who plan with intent and adapt without panic.
        </p>
      </div>

      <nav class="ft__col" aria-label="Explore">
        <h4 class="ft__col-title">Explore</h4>
        <ul>
          <li v-for="l in explore" :key="l.href">
            <a :href="l.href">{{ l.label }}</a>
          </li>
        </ul>
      </nav>

      <nav class="ft__col" aria-label="Ecosystem">
        <h4 class="ft__col-title">Ecosystem</h4>
        <ul>
          <li v-for="l in ecosystem" :key="l.href">
            <a :href="l.href" target="_blank" rel="noopener noreferrer">
              {{ l.label }}
              <span class="ft__ext" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </nav>

      <nav class="ft__col" aria-label="Connect">
        <h4 class="ft__col-title">Connect</h4>
        <ul>
          <li v-for="l in connect" :key="l.href">
            <a :href="l.href" target="_blank" rel="noopener noreferrer">
              {{ l.label }}
              <span class="ft__ext" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="ft__col ft__col--news">
        <h4 class="ft__col-title">Get updates</h4>
        <form class="ft__form" @submit.prevent>
          <input type="email" placeholder="you@example.com" required />
          <button type="submit" aria-label="Subscribe">
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p class="ft__col-fine">
          New essays and tools. Twice a month at most.
        </p>
      </div>
    </div>

    <div class="ft__watermark" aria-hidden="true">
      <HexLattice variant="cluster" tone="on-deep" :size="180" :accents="3" :seed="33" />
    </div>

    <div class="container ft__bottom">
      <span class="ft__copy">© {{ year }} Agile Periodization · Mladen Jovanović</span>
      <span class="ft__credo">Built by practitioners, for practitioners.</span>
      <span class="ft__build is-desktop-only">
        <span>v 1.0</span>
        <span>·</span>
        <span>Belgrade / Global</span>
      </span>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  position: relative;
  background: var(--teal-deep);
  color: var(--cream);
  padding-top: clamp(80px, 9vw, 130px);
  padding-bottom: 28px;
  overflow: hidden;
}

.ft__inner {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr 1.2fr;
  gap: 56px;
  align-items: start;
  position: relative;
  z-index: 1;
  padding-bottom: clamp(60px, 7vw, 100px);
  border-bottom: 1px solid var(--hairline-light);
}

.ft__brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 36ch;
}
.ft__brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--teal);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.ft__brand-mark img {
  width: 86%;
  height: 86%;
  object-fit: contain;
}
.ft__brand-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.018em;
  margin: 0;
}
.ft__brand-tag {
  font-size: 14px;
  line-height: 1.55;
  color: rgba(243, 243, 243, 0.7);
  margin: 0;
}

.ft__col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ft__col-title {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(243, 243, 243, 0.6);
  margin: 0;
  font-weight: 500;
}
.ft__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ft__col li a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--cream);
  opacity: 0.86;
  transition: opacity 200ms var(--ease);
}
.ft__col li a:hover {
  opacity: 1;
}
.ft__ext {
  font-size: 10px;
  opacity: 0.6;
}

.ft__col--news .ft__form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
}
.ft__col--news input {
  background: transparent;
  border: 1px solid var(--hairline-light-strong);
  border-radius: 999px;
  color: var(--cream);
  padding: 11px 16px;
  font-size: 13px;
  font-family: var(--font-body);
  min-width: 0;
}
.ft__col--news input::placeholder {
  color: rgba(243, 243, 243, 0.5);
}
.ft__col--news input:focus {
  outline: none;
  border-color: var(--cream);
}
.ft__col--news button {
  background: var(--cream);
  color: var(--ink);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 15px;
  transition: transform 220ms var(--ease);
}
.ft__col--news button:hover {
  transform: translateX(3px);
}
.ft__col-fine {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(243, 243, 243, 0.55);
  margin: 0;
}

.ft__watermark {
  position: absolute;
  right: -8vw;
  bottom: -10vw;
  width: clamp(420px, 60vw, 880px);
  height: clamp(380px, 50vw, 760px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.85;
}

.ft__bottom {
  position: relative;
  z-index: 1;
  margin-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(243, 243, 243, 0.6);
  flex-wrap: wrap;
}
.ft__build {
  display: inline-flex;
  gap: 8px;
}

@media (max-width: 1180px) {
  .ft__inner {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 48px;
  }
  .ft__brand {
    grid-column: 1 / -1;
  }
}
@media (max-width: 720px) {
  .ft {
    padding-top: clamp(56px, 11vw, 88px);
  }
  .ft__inner {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    padding-bottom: clamp(36px, 9vw, 64px);
  }
  .ft__brand {
    grid-column: 1 / -1;
    gap: 12px;
  }
  .ft__brand-title {
    font-size: 20px;
  }
  .ft__col-title {
    font-size: 10.5px;
  }
  .ft__col ul {
    gap: 10px;
  }
  .ft__col li a {
    font-size: 13px;
  }
  .ft__col--news {
    grid-column: 1 / -1;
  }
  .ft__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 18px;
    font-size: 10.5px;
  }
}

@media (max-width: 420px) {
  .ft__inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
