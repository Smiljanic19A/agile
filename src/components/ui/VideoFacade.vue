<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, default: '' },
  posterUrl: { type: String, default: null },
})

const playing = ref(false)
const posterError = ref(false)

const computedPoster = computed(() => {
  if (props.posterUrl) return props.posterUrl
  return posterError.value
    ? `https://i.ytimg.com/vi/${props.videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${props.videoId}/maxresdefault.jpg`
})

const iframeSrc = computed(
  () => `https://www.youtube-nocookie.com/embed/${props.videoId}?autoplay=1&rel=0&modestbranding=1`
)

const onPosterError = () => {
  if (!posterError.value) posterError.value = true
}

const play = () => {
  playing.value = true
}
</script>

<template>
  <div class="vfacade" :class="{ 'is-playing': playing }">
    <button
      v-if="!playing"
      class="vfacade__btn"
      type="button"
      :aria-label="`Play video: ${title}`"
      @click="play"
    >
      <img
        class="vfacade__poster"
        :src="computedPoster"
        :alt="title"
        loading="lazy"
        decoding="async"
        @error="onPosterError"
      />
      <span class="vfacade__scrim" aria-hidden="true"></span>
      <span class="vfacade__play" aria-hidden="true">
        <svg viewBox="-50 -44 100 88" width="84" height="74" class="vfacade__play-svg">
          <polygon
            class="vfacade__play-hex"
            points="46,0 23,40 -23,40 -46,0 -23,-40 23,-40"
            stroke-linejoin="round"
          />
          <polygon
            class="vfacade__play-triangle"
            points="-10,-14 -10,14 16,0"
          />
        </svg>
      </span>
      <span v-if="duration" class="vfacade__duration">{{ duration }}</span>
    </button>

    <iframe
      v-else
      class="vfacade__iframe"
      :src="iframeSrc"
      :title="title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</template>

<style scoped>
.vfacade {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--hairline);
  background: var(--ink);
}

.vfacade__btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  display: block;
}

.vfacade__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms var(--ease);
}
.vfacade__btn:hover .vfacade__poster,
.vfacade__btn:focus-visible .vfacade__poster {
  transform: scale(1.02);
}

.vfacade__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(14, 26, 26, 0.08) 0%,
    rgba(14, 26, 26, 0.32) 100%
  );
}

.vfacade__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  transition: transform 220ms var(--ease);
}
.vfacade__btn:hover .vfacade__play,
.vfacade__btn:focus-visible .vfacade__play {
  transform: translate(-50%, -50%) scale(1.06);
}

.vfacade__play-svg {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35));
}

.vfacade__play-hex {
  fill: rgba(243, 243, 243, 0.94);
  stroke: var(--teal);
  stroke-width: 1.5;
  transition: fill 220ms var(--ease), stroke 220ms var(--ease);
}
.vfacade__btn:hover .vfacade__play-hex {
  fill: var(--cream);
  stroke: var(--teal-deep);
}

.vfacade__play-triangle {
  fill: var(--teal-deep);
}

.vfacade__duration {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(14, 26, 26, 0.72);
  color: var(--cream);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.vfacade__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .vfacade__poster,
  .vfacade__play {
    transition: none !important;
  }
  .vfacade__btn:hover .vfacade__poster,
  .vfacade__btn:hover .vfacade__play {
    transform: none;
  }
  .vfacade__btn:hover .vfacade__play {
    transform: translate(-50%, -50%);
  }
}
</style>
