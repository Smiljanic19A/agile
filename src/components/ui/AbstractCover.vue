<script setup>
import { computed } from 'vue'

const props = defineProps({
  seed: { type: Number, default: 1 },
  tone: { type: String, default: 'teal' }, // 'teal' | 'cream'
  label: { type: String, default: '' },
})

const variant = computed(() => ((Math.abs(props.seed) % 9) + 1))

const palette = computed(() => {
  if (props.tone === 'cream') {
    return {
      bg: '#F3F3F3',
      ink: '#0E1A1A',
      teal: '#378882',
      tealDeep: '#23615C',
      tealSoft: '#5BA39D',
      tealMist: 'rgba(55,136,130,0.16)',
    }
  }
  return {
    bg: '#23615C',
    ink: '#F3F3F3',
    teal: '#378882',
    tealDeep: '#1B4A46',
    tealSoft: '#5BA39D',
    tealMist: 'rgba(243,243,243,0.14)',
  }
})

const seedTag = computed(() => `AP—${String(props.seed).padStart(3, '0')}`)
</script>

<template>
  <div class="cover" :style="{ background: palette.bg }">
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <!-- v1: concentric arcs from bottom-right -->
      <template v-if="variant === 1">
        <circle cx="380" cy="290" r="240" fill="none" :stroke="palette.tealSoft" stroke-width="1" opacity="0.55" />
        <circle cx="380" cy="290" r="180" fill="none" :stroke="palette.tealSoft" stroke-width="1" opacity="0.7" />
        <circle cx="380" cy="290" r="120" fill="none" :stroke="palette.ink" stroke-width="1" opacity="0.9" />
        <circle cx="380" cy="290" r="60" :fill="palette.teal" />
        <line x1="0" y1="30" x2="120" y2="30" :stroke="palette.ink" stroke-width="1" opacity="0.5" />
      </template>

      <!-- v2: stacked horizontal bars -->
      <template v-else-if="variant === 2">
        <rect x="40" y="80" width="320" height="14" :fill="palette.teal" />
        <rect x="40" y="106" width="260" height="14" :fill="palette.tealSoft" opacity="0.7" />
        <rect x="40" y="132" width="200" height="14" :fill="palette.ink" opacity="0.85" />
        <rect x="40" y="158" width="140" height="14" :fill="palette.tealSoft" opacity="0.45" />
        <rect x="40" y="184" width="80" height="14" :fill="palette.ink" opacity="0.7" />
      </template>

      <!-- v3: large disc + line -->
      <template v-else-if="variant === 3">
        <circle cx="280" cy="150" r="100" :fill="palette.teal" />
        <circle cx="280" cy="150" r="100" fill="none" :stroke="palette.ink" stroke-width="1" />
        <line x1="0" y1="220" x2="400" y2="220" :stroke="palette.ink" stroke-width="1" opacity="0.5" />
        <circle cx="90" cy="220" r="6" :fill="palette.ink" />
      </template>

      <!-- v4: contour topography -->
      <template v-else-if="variant === 4">
        <g :stroke="palette.tealSoft" fill="none" stroke-width="1" opacity="0.85">
          <path d="M -20 220 Q 100 160 200 200 T 420 180" />
          <path d="M -20 240 Q 100 180 200 220 T 420 200" />
          <path d="M -20 260 Q 100 200 200 240 T 420 220" />
          <path d="M -20 280 Q 100 220 200 260 T 420 240" />
        </g>
        <g :stroke="palette.ink" fill="none" stroke-width="1.2">
          <path d="M -20 200 Q 100 140 200 180 T 420 160" />
        </g>
        <circle cx="220" cy="170" r="5" :fill="palette.ink" />
      </template>

      <!-- v5: grid of dots, one filled -->
      <template v-else-if="variant === 5">
        <g :fill="palette.ink" opacity="0.7">
          <template v-for="r in 6" :key="`r${r}`">
            <template v-for="c in 9" :key="`c${r}-${c}`">
              <circle :cx="60 + (c - 1) * 35" :cy="80 + (r - 1) * 30" r="2" />
            </template>
          </template>
        </g>
        <circle cx="200" cy="170" r="14" :fill="palette.teal" />
        <circle cx="200" cy="170" r="14" fill="none" :stroke="palette.ink" stroke-width="1" />
      </template>

      <!-- v6: diagonal lines -->
      <template v-else-if="variant === 6">
        <g :stroke="palette.tealSoft" stroke-width="1" opacity="0.6">
          <line v-for="i in 12" :key="i" :x1="-20 + i * 38" y1="0" :x2="40 + i * 38" y2="300" />
        </g>
        <rect x="120" y="100" width="160" height="100" :fill="palette.bg" />
        <rect x="120" y="100" width="160" height="100" fill="none" :stroke="palette.ink" stroke-width="1" />
        <circle cx="200" cy="150" r="22" :fill="palette.teal" />
      </template>

      <!-- v7: half-disc -->
      <template v-else-if="variant === 7">
        <path d="M 0 300 A 200 200 0 0 1 400 300 Z" :fill="palette.teal" />
        <path d="M 60 300 A 140 140 0 0 1 340 300 Z" :fill="palette.bg" />
        <path d="M 60 300 A 140 140 0 0 1 340 300 Z" fill="none" :stroke="palette.ink" stroke-width="1" />
        <line x1="0" y1="80" x2="400" y2="80" :stroke="palette.ink" stroke-width="1" opacity="0.45" />
      </template>

      <!-- v8: orbit -->
      <template v-else-if="variant === 8">
        <ellipse cx="200" cy="160" rx="160" ry="60" fill="none" :stroke="palette.ink" stroke-width="1" opacity="0.7" />
        <ellipse cx="200" cy="160" rx="160" ry="60" fill="none" :stroke="palette.tealSoft" stroke-width="1" transform="rotate(35 200 160)" />
        <circle cx="200" cy="160" r="26" :fill="palette.teal" />
        <circle cx="360" cy="160" r="6" :fill="palette.ink" />
      </template>

      <!-- v9: hex cluster (brand motif) -->
      <template v-else>
        <g transform="translate(200 150)" :stroke="palette.ink" stroke-width="1" stroke-linejoin="round" fill="none">
          <!-- center -->
          <polygon points="34,0 17,29.4 -17,29.4 -34,0 -17,-29.4 17,-29.4" :fill="palette.teal" opacity="0.95" stroke="none" />
          <polygon points="34,0 17,29.4 -17,29.4 -34,0 -17,-29.4 17,-29.4" />
          <!-- ring of 6 -->
          <polygon points="85,0 68,29.4 34,29.4 17,0 34,-29.4 68,-29.4" />
          <polygon points="-17,58.8 -34,88.2 -68,88.2 -85,58.8 -68,29.4 -34,29.4" />
          <polygon points="68,58.8 51,88.2 17,88.2 0,58.8 17,29.4 51,29.4" />
          <polygon points="-17,-58.8 -34,-29.4 -68,-29.4 -85,-58.8 -68,-88.2 -34,-88.2" />
          <polygon points="68,-58.8 51,-29.4 17,-29.4 0,-58.8 17,-88.2 51,-88.2" />
          <polygon points="-68,0 -85,29.4 -119,29.4 -136,0 -119,-29.4 -85,-29.4" opacity="0.6" />
        </g>
        <line x1="0" y1="40" x2="80" y2="40" :stroke="palette.ink" stroke-width="1" opacity="0.45" />
      </template>
    </svg>

    <div class="cover__meta">
      <span class="cover__tag">{{ seedTag }}</span>
      <span v-if="label" class="cover__label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius);
}
@media (max-width: 720px) {
  .cover {
    aspect-ratio: 16 / 9;
  }
}
.cover svg {
  width: 100%;
  height: 100%;
  display: block;
}
.cover__meta {
  position: absolute;
  inset: auto 16px 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.62;
  pointer-events: none;
}
.cover__tag,
.cover__label {
  display: inline-block;
}
</style>
