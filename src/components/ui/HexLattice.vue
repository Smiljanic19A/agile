<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'grid' }, // grid | cluster | ring | glyph
  tone: { type: String, default: 'on-teal' }, // on-teal | on-cream | on-deep
  size: { type: Number, default: 80 },
  mask: { type: String, default: 'radial' }, // radial | top | bottom | none
  accents: { type: Number, default: 4 },
  seed: { type: Number, default: 1 },
  pulse: { type: Boolean, default: true },
})

const sqrt3 = Math.sqrt(3)

const mulberry32 = (a) => {
  let s = a >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const palette = computed(() => {
  if (props.tone === 'on-cream') return { stroke: '#0E1A1A', base: 0.06, accent: 0.14, fill: 0.04 }
  if (props.tone === 'on-deep')  return { stroke: '#5BA39D', base: 0.16, accent: 0.34, fill: 0.08 }
  return { stroke: '#9bd0cb', base: 0.18, accent: 0.42, fill: 0.10 }
})

const uid = computed(() => `hex-${props.seed}-${props.variant}-${props.size}`)

const hexPoints = (cx, cy, r = props.size) => {
  const h = (r * sqrt3) / 2
  return [[cx+r,cy],[cx+r/2,cy+h],[cx-r/2,cy+h],[cx-r,cy],[cx-r/2,cy-h],[cx+r/2,cy-h]]
    .map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ')
}

const tile = computed(() => ({ w: 3 * props.size, h: sqrt3 * props.size }))

const tilePoints = computed(() => {
  const r = props.size
  const tw = 3 * r
  const th = sqrt3 * r
  return {
    center: hexPoints(1.5 * r, th / 2),
    tl: hexPoints(0, 0),
    tr: hexPoints(tw, 0),
    bl: hexPoints(0, th),
    br: hexPoints(tw, th),
  }
})

const gridAccents = computed(() => {
  if (props.variant !== 'grid') return []
  const r = props.size
  const rand = mulberry32(props.seed)
  const cols = 18; const rows = 12
  const picked = new Set(); const out = []; let attempts = 0
  while (out.length < props.accents && attempts < 200) {
    attempts++
    const c = Math.floor(rand() * cols)
    const rr = Math.floor(rand() * rows)
    const key = `${c}-${rr}`
    if (picked.has(key)) continue
    picked.add(key)
    const x = c * 1.5 * r
    const y = rr * sqrt3 * r + (c % 2 ? (sqrt3 * r) / 2 : 0)
    out.push({ key, x, y, points: hexPoints(x, y) })
  }
  return out
})

const clusterCells = computed(() => {
  if (props.variant !== 'cluster') return []
  const r = props.size; const h = (r * sqrt3) / 2
  const offsets = [[0,0],[1.5*r,-h],[1.5*r,h],[0,sqrt3*r],[-1.5*r,h],[-1.5*r,-h],[0,-sqrt3*r]]
  const rand = mulberry32(props.seed); const accent = new Set()
  while (accent.size < Math.min(props.accents, offsets.length - 2)) accent.add(Math.floor(rand() * offsets.length))
  return offsets.map(([x, y], i) => ({ key: `c${i}`, x, y, points: hexPoints(x, y), accent: accent.has(i) }))
})

const ringCells = computed(() => {
  if (props.variant !== 'ring') return []
  const r = props.size; const radius = r * 2.8
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return { key: `r${i}`, x: Math.cos(a)*radius, y: Math.sin(a)*radius, points: hexPoints(Math.cos(a)*radius, Math.sin(a)*radius) }
  })
})

const glyphCells = computed(() => {
  if (props.variant !== 'glyph') return []
  const r = props.size; const h = (r * sqrt3) / 2
  return [[0,-h],[-1.5*r,h],[1.5*r,h]].map(([x, y], i) => ({ key: `g${i}`, x, y, points: hexPoints(x, y) }))
})

const viewBox = computed(() => {
  const r = props.size
  if (props.variant === 'grid') return '0 0 1200 800'
  if (props.variant === 'cluster') { const w=r*7; const h=r*5; return `${-w/2} ${-h/2} ${w} ${h}` }
  if (props.variant === 'ring') { const w=r*9; const h=r*9; return `${-w/2} ${-h/2} ${w} ${h}` }
  if (props.variant === 'glyph') { const w=r*5.6; const h=r*4; return `${-w/2} ${-h/2} ${w} ${h}` }
  return '0 0 100 100'
})

const preserveAspect = computed(() => props.variant === 'grid' ? 'xMidYMid slice' : 'xMidYMid meet')
const strokeWidth = computed(() => Math.max(1, props.size * 0.012))
</script>

<template>
  <svg
    class="hex"
    :class="[`hex--${variant}`, `hex--${tone}`, pulse ? 'hex--pulse' : '']"
    :viewBox="viewBox"
    :preserveAspectRatio="preserveAspect"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <pattern v-if="variant === 'grid'" :id="`${uid}-pat`" :width="tile.w" :height="tile.h" patternUnits="userSpaceOnUse">
        <polygon :points="tilePoints.center" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
        <polygon :points="tilePoints.tl" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
        <polygon :points="tilePoints.tr" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
        <polygon :points="tilePoints.bl" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
        <polygon :points="tilePoints.br" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
      </pattern>
      <mask v-if="mask === 'radial'" :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="800">
        <radialGradient :id="`${uid}-rad`" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="black" /><stop offset="35%" stop-color="#222" /><stop offset="60%" stop-color="white" /><stop offset="100%" stop-color="#0a0a0a" />
        </radialGradient>
        <rect x="0" y="0" width="1200" height="800" :fill="`url(#${uid}-rad)`" />
      </mask>
      <mask v-else-if="mask === 'top'" :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="800">
        <linearGradient :id="`${uid}-lin`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" /><stop offset="35%" stop-color="white" /><stop offset="100%" stop-color="white" />
        </linearGradient>
        <rect x="0" y="0" width="1200" height="800" :fill="`url(#${uid}-lin)`" />
      </mask>
      <mask v-else-if="mask === 'bottom'" :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="800">
        <linearGradient :id="`${uid}-lin`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white" /><stop offset="65%" stop-color="white" /><stop offset="100%" stop-color="black" />
        </linearGradient>
        <rect x="0" y="0" width="1200" height="800" :fill="`url(#${uid}-lin)`" />
      </mask>
    </defs>

    <g :mask="mask !== 'none' ? `url(#${uid}-mask)` : undefined">
      <rect v-if="variant === 'grid'" x="0" y="0" width="1200" height="800" :fill="`url(#${uid}-pat)`" />
      <g v-if="variant === 'grid'" class="hex__accents">
        <polygon v-for="a in gridAccents" :key="a.key+'-f'" :points="a.points" :fill="palette.stroke" :fill-opacity="palette.fill" :stroke="palette.stroke" :stroke-opacity="palette.accent" :stroke-width="strokeWidth" stroke-linejoin="round" />
      </g>
      <g v-if="variant === 'cluster'" class="hex__accents">
        <polygon v-for="c in clusterCells" :key="c.key" :points="c.points" :fill="c.accent ? palette.stroke : 'none'" :fill-opacity="c.accent ? palette.fill : 0" :stroke="palette.stroke" :stroke-opacity="c.accent ? palette.accent : palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
      </g>
      <g v-if="variant === 'ring'">
        <polygon v-for="c in ringCells" :key="c.key" :points="c.points" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.base" :stroke-width="strokeWidth" stroke-linejoin="round" />
      </g>
      <g v-if="variant === 'glyph'">
        <polygon v-for="c in glyphCells" :key="c.key" :points="c.points" fill="none" :stroke="palette.stroke" :stroke-opacity="palette.accent" :stroke-width="strokeWidth" stroke-linejoin="round" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.hex { display: block; width: 100%; height: 100%; pointer-events: none; }
.hex--pulse .hex__accents { animation: hexPulse 10s ease-in-out infinite; }
@keyframes hexPulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hex--pulse .hex__accents { animation: none; } }
</style>
