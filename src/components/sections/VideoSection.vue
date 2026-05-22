<script setup>
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import VideoFacade from '@/components/ui/VideoFacade.vue'

const content = useContentStore()
const { video } = storeToRefs(content)
</script>

<template>
  <section
    id="watch"
    class="watch section section--cream"
    aria-labelledby="watch-title"
  >
    <div class="container watch__grid">
      <div class="watch__copy">
        <SectionLabel index="02" label="Watch" />
        <h2 id="watch-title" class="display-2 watch__title fade-up">
          Talks, workshops, <em>and field breakdowns.</em>
        </h2>
        <p class="prose fade-up">{{ video.description }}</p>
        <div class="watch__cta fade-up">
          <AppButton variant="ghost" :href="video.channelHref" external>
            More on YouTube
          </AppButton>
        </div>
      </div>

      <div class="watch__player fade-up">
        <VideoFacade
          :video-id="video.videoId"
          :title="video.title"
          :duration="video.duration"
        />
        <div class="watch__meta">
          <div class="watch__meta-title">{{ video.title }}</div>
          <div class="watch__meta-row">
            <span>{{ video.caption }}</span>
            <span class="watch__meta-dot" aria-hidden="true">·</span>
            <a :href="video.href" target="_blank" rel="noopener noreferrer" class="watch__meta-link">
              Open in YouTube
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.watch {
  background: var(--paper);
  color: var(--ink);
  border-top: 1px solid var(--hairline);
}

.watch__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: 64px;
  align-items: start;
}

.watch__copy {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 4px;
}

.watch__title {
  max-width: 16ch;
}
.watch__title em {
  font-style: italic;
  font-weight: 500;
  color: var(--teal-deep);
}

.watch__cta {
  margin-top: 4px;
}

.watch__player {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.watch__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.watch__meta-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -0.012em;
  color: var(--ink);
}
.watch__meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mute);
}
.watch__meta-dot {
  opacity: 0.6;
}
.watch__meta-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ink);
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  transition: opacity 200ms var(--ease);
}
.watch__meta-link:hover {
  opacity: 0.7;
}

@media (max-width: 960px) {
  .watch__grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .watch__copy {
    order: 2;
  }
  .watch__player {
    order: 1;
  }
}

@media (max-width: 720px) {
  .watch__cta :deep(.btn) {
    width: 100%;
    justify-content: center;
  }
}
</style>
