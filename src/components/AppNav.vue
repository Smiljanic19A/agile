<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const scrolled = ref(false)
const open = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const links = [
  { href: '#work', label: 'Work' },
  { href: '#writing', label: 'Writing' },
  { href: '#community', label: 'Community' },
  { href: '#store', label: 'Store' },
]

const close = () => (open.value = false)
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }">
    <div class="nav__inner container">
      <a href="#top" class="nav__brand" aria-label="Agile Periodization — home">
        <span class="nav__logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
            <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="1.2" />
            <circle cx="16" cy="16" r="4" fill="currentColor" />
          </svg>
        </span>
        <span class="nav__wordmark">
          <strong>Agile</strong> Periodization
        </span>
      </a>

      <nav class="nav__links" aria-label="Primary">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          class="nav__link"
        >
          {{ l.label }}
        </a>
      </nav>

      <a href="#newsletter" class="nav__cta">
        Subscribe
        <span aria-hidden="true" class="nav__cta-arrow">→</span>
      </a>

      <button
        class="nav__burger"
        :aria-expanded="open"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <span :class="{ 'is-open': open }"></span>
        <span :class="{ 'is-open': open }"></span>
      </button>
    </div>

    <div class="nav__sheet" :class="{ 'is-open': open }">
      <a
        v-for="l in links"
        :key="l.href"
        :href="l.href"
        class="nav__sheet-link"
        @click="close"
      >
        {{ l.label }}
      </a>
      <a href="#newsletter" class="nav__sheet-link nav__sheet-link--cta" @click="close">
        Subscribe →
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  color: var(--cream);
  transition: background 220ms var(--ease), backdrop-filter 220ms var(--ease),
    border-color 220ms var(--ease), color 220ms var(--ease);
  border-bottom: 1px solid transparent;
}
.nav.is-scrolled {
  background: rgba(35, 97, 92, 0.78);
  backdrop-filter: saturate(140%) blur(14px);
  -webkit-backdrop-filter: saturate(140%) blur(14px);
  border-bottom-color: var(--hairline-light);
}

.nav__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 72px;
  gap: 24px;
}

.nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 14px;
  letter-spacing: 0.02em;
  color: currentColor;
}
.nav__wordmark {
  font-family: var(--font-body);
  font-weight: 400;
  opacity: 0.92;
}
.nav__wordmark strong {
  font-weight: 600;
}

.nav__links {
  display: none;
  gap: 28px;
  justify-self: center;
}
.nav__link {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: currentColor;
  opacity: 0.78;
  transition: opacity 200ms var(--ease);
  position: relative;
  padding: 8px 0;
}
.nav__link:hover {
  opacity: 1;
}
.nav__link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 220ms var(--ease);
}
.nav__link:hover::after {
  transform: scaleX(1);
}

.nav__cta {
  justify-self: end;
  display: none;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 16px;
  border: 1px solid var(--hairline-light-strong);
  border-radius: 999px;
  color: currentColor;
  transition: background 200ms var(--ease), color 200ms var(--ease),
    border-color 200ms var(--ease);
}
.nav__cta:hover {
  background: var(--cream);
  color: var(--ink);
  border-color: var(--cream);
}
.nav__cta-arrow {
  transition: transform 220ms var(--ease);
}
.nav__cta:hover .nav__cta-arrow {
  transform: translateX(3px);
}

.nav__burger {
  justify-self: end;
  width: 40px;
  height: 40px;
  position: relative;
}
.nav__burger span {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 1.5px;
  background: currentColor;
  transition: transform 240ms var(--ease), top 240ms var(--ease);
}
.nav__burger span:nth-child(1) {
  top: 16px;
}
.nav__burger span:nth-child(2) {
  top: 23px;
}
.nav__burger span.is-open:nth-child(1) {
  top: 19px;
  transform: rotate(45deg);
}
.nav__burger span.is-open:nth-child(2) {
  top: 19px;
  transform: rotate(-45deg);
}

.nav__sheet {
  position: absolute;
  top: 72px;
  left: 0;
  right: 0;
  background: var(--teal-deep);
  padding: 8px 0 16px;
  display: flex;
  flex-direction: column;
  max-height: 0;
  overflow: hidden;
  transition: max-height 260ms var(--ease), padding 260ms var(--ease);
}
.nav__sheet.is-open {
  max-height: 420px;
  padding: 12px 0 24px;
  border-bottom: 1px solid var(--hairline-light);
}
.nav__sheet-link {
  padding: 14px var(--gutter);
  font-size: 18px;
  color: var(--cream);
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: -0.01em;
}
.nav__sheet-link:hover {
  background: rgba(243, 243, 243, 0.06);
}
.nav__sheet-link--cta {
  margin-top: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  opacity: 0.82;
}

@media (min-width: 900px) {
  .nav__links {
    display: inline-flex;
  }
  .nav__cta {
    display: inline-flex;
  }
  .nav__burger {
    display: none;
  }
  .nav__sheet {
    display: none;
  }
}
</style>
