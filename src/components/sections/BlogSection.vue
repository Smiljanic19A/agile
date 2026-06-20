<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import BlogCard from '@/components/ui/BlogCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()
const { articles } = storeToRefs(content)

const featuredArticles = computed(() => articles.value.slice(0, 3))
</script>

<template>
  <section id="substack" class="blog section section--teal" aria-labelledby="blog-title">
    <div class="container">
      <header class="blog__head fade-up">
        <div class="blog__head-left">
          <SectionLabel index="05" label="Substack Articles" />
          <h2 id="blog-title" class="display-2 blog__title">
            Latest from <em>the blog.</em>
          </h2>
        </div>
        <div class="blog__head-right is-desktop-only">
          <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>Read all articles</AppButton>
        </div>
      </header>

      <div class="blog__grid is-desktop-only fade-up">
        <BlogCard v-for="article in featuredArticles" :key="article.id" :item="article" variant="standard" />
      </div>

      <div class="blog__rail snap-rail is-mobile-only fade-up">
        <BlogCard v-for="article in featuredArticles" :key="article.id" :item="article" variant="standard" />
      </div>

      <div class="blog__mobile-cta is-mobile-only">
        <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>Read all articles</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog { background: var(--teal); color: var(--cream); }

.blog__head {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 32px; margin-bottom: 48px;
}
.blog__head-left { display: flex; flex-direction: column; gap: 20px; }
.blog__title { color: var(--cream); max-width: 20ch; margin: 0; }
.blog__title em { font-style: italic; font-weight: 500; color: rgba(243,243,243,0.72); }

.blog__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

@media (max-width: 1100px) {
  .blog__head { flex-direction: column; align-items: flex-start; margin-bottom: 36px; }
  .blog__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .blog__head { margin-bottom: 24px; }
  .blog__mobile-cta { margin-top: 12px; display: flex; }
  .blog__mobile-cta :deep(.btn) { width: 100%; justify-content: center; }
  .blog__rail :deep(.card) { height: clamp(360px, 76vw, 460px); }
}
</style>
