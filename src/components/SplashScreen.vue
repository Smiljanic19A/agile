<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DecisionLoop from '@/components/ui/DecisionLoop.vue'
import { useI18n } from '@/i18n'

const emit = defineEmits(['done'])
const { t } = useI18n()

const loop = ref(null)
const leaving = ref(false)
const flying = ref(false)

let timers = []
const later = (fn, ms) => timers.push(setTimeout(fn, ms))

const HOLD_MS = 3350          // full choreography before the pan
const FLY_MS = 900            // pan-to-hero duration

function reducedMotion() {
  return typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function finish() {
  emit('done')
}

/** FLIP the loop assembly onto the hero's #hero-loop, then fade out. */
function exitToHero() {
  const target = document.getElementById('hero-loop')
  const el = loop.value
  if (!target || !el) return fadeOut()

  const from = el.getBoundingClientRect()
  const to = target.getBoundingClientRect()

  // If the hero loop isn't really on screen (small viewports), just fade.
  const visible =
    to.width > 40 &&
    to.top < window.innerHeight * 0.95 && to.bottom > 60 &&
    to.left >= -40 && to.right <= window.innerWidth + 40
  if (!visible) return fadeOut()

  const dx = (to.left + to.width / 2) - (from.left + from.width / 2)
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2)
  const scale = to.width / from.width

  flying.value = true          // wordmark fades while the loop is in flight
  el.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.6, 0, 0.22, 1)`
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`

  // background dissolves while the loop is in flight
  later(() => { leaving.value = true }, FLY_MS - 430)
  later(finish, FLY_MS + 70)
}

function fadeOut() {
  leaving.value = true
  later(finish, 480)
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  if (reducedMotion()) {
    later(fadeOut, 900)
    return
  }
  later(exitToHero, HOLD_MS)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="splash" :class="{ 'is-leaving': leaving, 'is-flying': flying }" aria-hidden="true">
    <!-- ambient hex texture, like the campaign backgrounds -->
    <svg class="splash__hex" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="sp-hex" width="104" height="90" patternUnits="userSpaceOnUse">
          <polygon
            points="52,2 97,27 97,63 52,88 7,63 7,27"
            fill="none" stroke="rgba(155,208,203,0.07)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#sp-hex)" />
    </svg>

    <!-- the decision loop (this is what pans onto the hero) -->
    <div ref="loop" class="splash__loop">
      <DecisionLoop animate />
    </div>

    <!-- wordmark, straight off the creative -->
    <div class="splash__word">
      <p class="splash__kicker">{{ t('splash.loopLabel') }}</p>
      <p class="splash__brand"><strong>Agile</strong> Periodization</p>
      <p class="splash__tagline">{{ t('splash.tagline') }}</p>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed; inset: 0; z-index: 9999;
  background:
    radial-gradient(120% 90% at 50% 18%, rgba(55, 136, 130, 0.4), transparent 62%),
    radial-gradient(90% 60% at 50% 110%, rgba(35, 97, 92, 0.35), transparent 60%),
    linear-gradient(170deg, #17322f 0%, #0d1b1a 78%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: clamp(22px, 4vh, 38px);
  transition: opacity 430ms ease;
}
.splash.is-leaving { opacity: 0; pointer-events: none; }

.splash__hex { position: absolute; inset: 0; width: 100%; height: 100%; }

.splash__loop {
  position: relative;
  width: min(430px, 82vw, 62vh); aspect-ratio: 1;
  will-change: transform;
}

/* ── Wordmark ─────────────────────────────────── */
.splash__word {
  position: relative; text-align: center; z-index: 1;
  transition: opacity 320ms ease, transform 320ms ease;
}
.is-flying .splash__word { opacity: 0; transform: translateY(10px); }

.splash__kicker {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.34em; text-indent: 0.34em;
  color: rgba(155, 208, 203, 0.8); margin: 0 0 12px;
  opacity: 0;
  animation: spUp 700ms cubic-bezier(0.22, 0.61, 0.36, 1) 1250ms forwards;
}
.splash__brand {
  font-family: var(--font-display); font-size: clamp(22px, 3.6vw, 30px);
  color: #f3f3f3; font-weight: 400; letter-spacing: -0.01em; margin: 0 0 10px;
  opacity: 0; transform: translateY(10px);
  animation: spUp 700ms cubic-bezier(0.22, 0.61, 0.36, 1) 900ms forwards;
}
.splash__brand strong { font-weight: 700; }

.splash__tagline {
  font-size: clamp(13px, 1.6vw, 15px);
  color: rgba(243, 243, 243, 0.72); margin: 0;
  opacity: 0;
  animation: spUp 800ms ease 1650ms forwards;
}
@keyframes spUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .splash__kicker, .splash__brand, .splash__tagline {
    animation-duration: 0.001ms; animation-delay: 0ms;
  }
}
</style>
