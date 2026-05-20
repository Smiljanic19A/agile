<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { externalLinks } from '@/stores/content.js'

const scrolled = ref(false)
const open = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})

watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

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
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <span class="nav__burger-line" :class="{ 'is-open': open }"></span>
        <span class="nav__burger-line" :class="{ 'is-open': open }"></span>
      </button>
    </div>
  </header>

  <Transition name="menu">
    <div v-if="open" class="menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="menu__head container">
        <a href="#top" class="menu__brand" @click="close">
          <span class="menu__logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="1.2" />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
            </svg>
          </span>
          <span class="menu__wordmark"><strong>Agile</strong> Periodization</span>
        </a>
        <button class="menu__close" @click="close" aria-label="Close menu">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="menu__links container" aria-label="Mobile primary">
        <a
          v-for="(l, i) in links"
          :key="l.href"
          :href="l.href"
          class="menu__link"
          :style="{ '--i': i }"
          @click="close"
        >
          <span class="menu__link-index">0{{ i + 1 }}</span>
          <span class="menu__link-label">{{ l.label }}</span>
        </a>
        <a
          href="#newsletter"
          class="menu__link menu__link--minor"
          :style="{ '--i': links.length }"
          @click="close"
        >
          <span class="menu__link-index">—</span>
          <span class="menu__link-label">Subscribe<span class="menu__arrow" aria-hidden="true"> →</span></span>
        </a>
      </nav>

      <div class="menu__foot container">
        <div class="menu__cta">
          <AppButton variant="onTeal" :href="externalLinks.skool" external>
            Join the community
          </AppButton>
          <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>
            Read the writing
          </AppButton>
        </div>
        <div class="menu__meta">
          <span>Agile Periodization</span>
          <span>MJ · Belgrade / Global</span>
        </div>
      </div>
    </div>
  </Transition>
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
  border-radius: 999px;
}
.nav__burger:hover {
  background: rgba(243, 243, 243, 0.06);
}
.nav__burger-line {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 1.5px;
  background: currentColor;
  border-radius: 1px;
  transition: opacity 200ms var(--ease);
}
.nav__burger-line:nth-of-type(1) {
  top: 17px;
}
.nav__burger-line:nth-of-type(2) {
  top: 23px;
}
.nav__burger-line.is-open {
  opacity: 0;
}

/* full-screen menu overlay */
.menu {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: var(--teal);
  color: var(--cream);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.menu__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  flex-shrink: 0;
}
.menu__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: currentColor;
  font-size: 13px;
}
.menu__wordmark {
  opacity: 0.94;
}
.menu__wordmark strong {
  font-weight: 600;
}
.menu__close {
  width: 44px;
  height: 44px;
  margin-right: -10px;
  display: grid;
  place-items: center;
  color: currentColor;
  border-radius: 999px;
  transition: background 200ms var(--ease);
}
.menu__close:hover {
  background: rgba(243, 243, 243, 0.08);
}

.menu__links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  gap: 4px;
}
.menu__link {
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: baseline;
  gap: 14px;
  padding: 14px 0;
  color: var(--cream);
  text-decoration: none;
  border-bottom: 1px solid var(--hairline-light);
  transition: opacity 200ms var(--ease);
  opacity: 0;
  transform: translateY(8px);
  animation: menuLinkIn 360ms var(--ease) forwards;
  animation-delay: calc(60ms * var(--i, 0) + 80ms);
}
.menu__link:last-child {
  border-bottom: none;
}
.menu__link:active,
.menu__link:hover {
  opacity: 0.72;
}
.menu__link-index {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(243, 243, 243, 0.5);
  text-transform: uppercase;
}
.menu__link-label {
  font-family: var(--font-display);
  font-size: clamp(36px, 9vw, 56px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variation-settings: "SOFT" 50, "opsz" 144;
}
.menu__link--minor .menu__link-label {
  font-size: clamp(22px, 5.4vw, 30px);
  color: rgba(243, 243, 243, 0.78);
}
.menu__arrow {
  display: inline-block;
  margin-left: 6px;
  font-family: var(--font-body);
  font-size: 0.6em;
}

@keyframes menuLinkIn {
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .menu__link {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.menu__foot {
  flex-shrink: 0;
  padding-top: 24px;
  padding-bottom: 28px;
  border-top: 1px solid var(--hairline-light);
}
.menu__cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu__cta :deep(.btn) {
  width: 100%;
  justify-content: center;
  padding: 16px 22px;
  font-size: 14px;
}
.menu__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(243, 243, 243, 0.55);
}

/* menu transition */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 280ms var(--ease), transform 320ms var(--ease);
}
.menu-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
}

@media (max-width: 899px) {
  .nav__inner {
    height: 60px;
    grid-template-columns: 1fr auto;
    gap: 12px;
  }
  .nav__wordmark {
    font-size: 13px;
  }
  .nav.is-scrolled {
    background: var(--teal);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom-color: transparent;
  }
}

@media (max-width: 380px) {
  .nav__wordmark {
    font-size: 12px;
  }
  .nav__logo svg {
    width: 18px;
    height: 18px;
  }
}
</style>
