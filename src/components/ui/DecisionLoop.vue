<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from '@/i18n'

/**
 * The Agile Decision Loop — the brand's segmented ring from the
 * campaign creatives: six thick arc segments with directional
 * arrowheads, a numbered icon node per phase, and the rabbit in a
 * glowing center. Used at full size by the splash screen and as the
 * hero board's focal point (the splash pans out onto it).
 *
 * The arc ring rotates continuously. With `interactive`, one phase at
 * a time is "in focus" (auto-advancing on a timer, hover/tap to pin)
 * and each change is emitted as a `step` event so the parent can show
 * the phase description.
 */
const props = defineProps({
  animate: { type: Boolean, default: false },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['step'])

const { t } = useI18n()

// ── Phase focus cycle (interactive only) ────────────────────
const STEP_MS = 4200
const focus = ref(0)
const pinned = ref(false)
let stepTimer = null

function emitStep() {
  const labels = t('hero.loop')
  emit('step', { i: focus.value, key: ICON_KEYS[focus.value], label: labels[focus.value] })
}
function startCycle() {
  stopCycle()
  stepTimer = setInterval(() => { focus.value = (focus.value + 1) % 6 }, STEP_MS)
}
function stopCycle() {
  if (stepTimer) { clearInterval(stepTimer); stepTimer = null }
}
function pinFocus(i) {
  pinned.value = true
  focus.value = i
  stopCycle()
}
function unpinFocus() {
  pinned.value = false
  startCycle()
}

watch(focus, emitStep)

onMounted(() => {
  if (props.interactive) {
    emitStep()
    startCycle()
  }
})
onBeforeUnmount(stopCycle)

// Geometry — viewBox 340×340, ring at r=128, 18 thick
const C = 170
const R = 128
const HALF_W = 9    // ring half-thickness — slimmer than the old 30-wide stroke
const SEG_DEG = 44  // arc body span
const TIP_DEG = 8   // arrowhead reach beyond the body
const BARB = 4.5    // how far the barbs flare past the ring edges

function pt(r, deg) {
  const rad = (deg * Math.PI) / 180
  return `${(C + r * Math.cos(rad)).toFixed(2)} ${(C + r * Math.sin(rad)).toFixed(2)}`
}

/** One continuous piece per phase: an annular arc ending in an arrowhead. */
function segPath(start, end) {
  const Ro = R + HALF_W
  const Ri = R - HALF_W
  return [
    `M ${pt(Ro, start)}`,
    `A ${Ro} ${Ro} 0 0 1 ${pt(Ro, end)}`,
    `L ${pt(Ro + BARB, end)}`,
    `L ${pt(R, end + TIP_DEG)}`,
    `L ${pt(Ri - BARB, end)}`,
    `L ${pt(Ri, end)}`,
    `A ${Ri} ${Ri} 0 0 0 ${pt(Ri, start)}`,
    'Z',
  ].join(' ')
}

// Alternating teal tones, like the printed loop
const TONES = ['#5aa89f', '#2e7a74', '#47968e', '#286c66', '#54a29a', '#377f79']

const ICONS = {
  plan: 'M7 4.5h6a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1zM8.5 3.5h3v2h-3zM8.5 9.2l1.2 1.2 2-2.4M8.5 13h3.4',
  train: 'M3.5 10h13M5.5 6.8v6.4M7.5 5.6v8.8M12.5 5.6v8.8M14.5 6.8v6.4',
  monitor: 'M10 15.6L5.2 10.8a3 3 0 0 1 4.2-4.2l.6.6.6-.6a3 3 0 0 1 4.2 4.2L10 15.6zM6.8 9.6h1.8l.9-1.4 1.4 2.6.9-1.2h1.6',
  review: 'M12.4 12.4L16 16M12.9 8.7a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0zM7.2 10v-1.6M8.7 10V6.9M10.2 10V8.4',
  adapt: 'M4 6.2h12M4 10h12M4 13.8h12M8 6.2v0M12 10v0M7 13.8v0',
  repeat: 'M5.3 8.2a5 5 0 0 1 8.7-1.9l1 1.3M14.7 11.8a5 5 0 0 1-8.7 1.9l-1-1.3M14.8 4v3.6h-3.6M5.2 16v-3.6h3.6',
}
const ICON_KEYS = ['plan', 'train', 'monitor', 'review', 'adapt', 'repeat']

const segments = computed(() => {
  const labels = t('hero.loop')
  return ICON_KEYS.map((key, i) => {
    const mid = -90 + i * 60
    const rad = (mid * Math.PI) / 180
    return {
      key,
      i,
      label: labels[i],
      tone: TONES[i],
      d: segPath(mid - SEG_DEG / 2, mid + SEG_DEG / 2),
      nx: C + R * Math.cos(rad),
      ny: C + R * Math.sin(rad),
      icon: ICONS[key],
    }
  })
})
</script>

<template>
  <div class="dl" :class="{ 'dl--animate': animate }">
    <svg class="dl__svg" viewBox="0 0 340 340" aria-hidden="true">
      <defs>
        <radialGradient id="dl-center" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="rgba(226, 240, 238, 0.20)" />
          <stop offset="55%" stop-color="rgba(226, 240, 238, 0.07)" />
          <stop offset="100%" stop-color="rgba(226, 240, 238, 0)" />
        </radialGradient>
      </defs>

      <!-- outer dashed orbit, always slowly turning -->
      <g class="dl__orbit-spin">
        <circle class="dl__orbit" cx="170" cy="170" r="166" fill="none"
          stroke="rgba(243,243,243,0.16)" stroke-width="1" stroke-dasharray="4 7"
          pathLength="980" />
      </g>

      <!-- glowing center plate -->
      <circle class="dl__center-glow" cx="170" cy="170" r="86" fill="url(#dl-center)" />
      <circle class="dl__center-rim" cx="170" cy="170" r="86" fill="none"
        stroke="rgba(243,243,243,0.10)" stroke-width="1" />

      <!-- six single-piece arrow segments — the ring itself keeps turning -->
      <g class="dl__ring-spin">
        <path
          v-for="s in segments" :key="'arc-' + s.key"
          class="dl__seg" :style="{ '--i': s.i }"
          :d="s.d" :fill="s.tone"
        />
      </g>

      <!-- numbered icon nodes stay put so their labels remain readable -->
      <g v-for="s in segments" :key="'node-' + s.key" class="dl__phase" :style="{ '--i': s.i }">
        <g
          class="dl__node"
          :class="{ 'is-interactive': interactive, 'is-focus': interactive && focus === s.i, 'is-dim': interactive && focus !== s.i }"
          @mouseenter="interactive && pinFocus(s.i)"
          @mouseleave="interactive && unpinFocus()"
          @click="interactive && pinFocus(s.i)"
        >
          <circle class="dl__node-halo" :cx="s.nx" :cy="s.ny" r="37" fill="none" :stroke="s.tone" stroke-width="1.6" />
          <circle :cx="s.nx" :cy="s.ny" r="31" fill="#0f201e" stroke="rgba(243,243,243,0.22)" stroke-width="1.2" />
          <circle :cx="s.nx" :cy="s.ny - 31" r="8" :fill="s.tone" stroke="#0f201e" stroke-width="1.4" />
          <text :x="s.nx" :y="s.ny - 28.2" class="dl__num" text-anchor="middle">{{ s.i + 1 }}</text>
          <path
            :d="s.icon" fill="none" stroke="#f3f3f3" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"
            :transform="`translate(${s.nx - 10}, ${s.ny - 17})`"
          />
          <text :x="s.nx" :y="s.ny + 16.5" class="dl__label" text-anchor="middle">{{ s.label }}</text>
        </g>
      </g>
    </svg>

    <!-- the rabbit -->
    <img class="dl__rabbit" src="/rabbit-mark.png" alt="" />
  </div>
</template>

<style scoped>
.dl { position: relative; width: 100%; aspect-ratio: 1; }
.dl__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

.dl__num {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  fill: #0e1a1a;
}
.dl__label {
  font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.05em;
  text-transform: uppercase; fill: rgba(243, 243, 243, 0.95);
}

.dl__rabbit {
  position: absolute; top: 50%; left: 50%;
  width: 33%; height: 33%; object-fit: contain;
  transform: translate(-50%, -52%);
  filter: drop-shadow(0 8px 26px rgba(0, 0, 0, 0.4));
}

/* slow ambient rotation of the dashed orbit */
.dl__orbit-spin {
  transform-origin: 50% 50%;
  animation: dlOrbit 46s linear infinite;
}
@keyframes dlOrbit { to { transform: rotate(360deg); } }

/* the loop itself keeps turning — arcs and arrowheads only,
   the labelled nodes stay upright and readable */
.dl__ring-spin {
  transform-origin: 50% 50%;
  animation: dlOrbit 36s linear infinite;
}

/* ═══ Interactive phase focus ═══ */
.dl__node.is-interactive { cursor: pointer; pointer-events: auto; }
.dl__node {
  transform-box: fill-box; transform-origin: center;
  transition: transform 420ms cubic-bezier(0.34, 1.3, 0.5, 1), opacity 420ms ease;
}
.dl__node.is-dim { opacity: 0.62; }
.dl__node.is-focus { transform: scale(1.12); opacity: 1; }

.dl__node-halo {
  opacity: 0;
  transform-box: fill-box; transform-origin: center;
  transform: scale(0.82);
  transition: opacity 420ms ease, transform 420ms cubic-bezier(0.34, 1.3, 0.5, 1);
}
.dl__node.is-focus .dl__node-halo { opacity: 0.9; transform: scale(1); }

/* ═══ Entrance choreography (splash only) ═══ */
.dl--animate .dl__orbit {
  stroke-dashoffset: 980;
  animation: dlDrawOrbit 1000ms cubic-bezier(0.4, 0, 0.2, 1) 250ms forwards;
}
@keyframes dlDrawOrbit { to { stroke-dashoffset: 0; } }

.dl--animate .dl__center-glow,
.dl--animate .dl__center-rim {
  opacity: 0;
  animation: dlFade 800ms ease 150ms forwards;
}

/* each arc pops in sequence around the loop */
.dl--animate .dl__seg {
  opacity: 0;
  transform-box: fill-box; transform-origin: center;
  transform: scale(0.86);
  animation: dlSegIn 460ms cubic-bezier(0.33, 0, 0.2, 1) forwards;
  animation-delay: calc(750ms + var(--i) * 170ms);
}
@keyframes dlSegIn { to { opacity: 1; transform: scale(1); } }

.dl--animate .dl__node {
  opacity: 0;
  transform-box: fill-box; transform-origin: center;
  transform: scale(0.45);
  animation: dlNode 480ms cubic-bezier(0.34, 1.45, 0.5, 1) forwards;
  animation-delay: calc(900ms + var(--i) * 170ms);
}
@keyframes dlNode { to { opacity: 1; transform: scale(1); } }

.dl--animate .dl__rabbit {
  opacity: 0; filter: blur(6px) drop-shadow(0 8px 26px rgba(0, 0, 0, 0.4));
  transform: translate(-50%, -52%) scale(0.85);
  animation: dlRabbit 900ms cubic-bezier(0.22, 0.61, 0.36, 1) 120ms forwards;
}
@keyframes dlRabbit {
  to {
    opacity: 1;
    filter: blur(0) drop-shadow(0 8px 26px rgba(0, 0, 0, 0.4));
    transform: translate(-50%, -52%) scale(1);
  }
}

@keyframes dlFade { to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .dl--animate .dl__seg,
  .dl--animate .dl__node,
  .dl--animate .dl__rabbit,
  .dl--animate .dl__orbit,
  .dl--animate .dl__center-glow,
  .dl--animate .dl__center-rim {
    animation-duration: 0.001ms; animation-delay: 0ms;
  }
  .dl__orbit-spin { animation: none; }
  .dl__ring-spin { animation: none; }
}
</style>
