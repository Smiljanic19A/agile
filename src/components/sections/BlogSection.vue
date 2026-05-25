<script setup>
import { storeToRefs } from 'pinia'
import { useContentStore, externalLinks } from '@/stores/content.js'
import SectionLabel from '@/components/ui/SectionLabel.vue'
import BlogCard from '@/components/ui/BlogCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const content = useContentStore()
const { articles, featureArticle, standardArticles, textArticles } = storeToRefs(content)
</script>

<template>
  <section id="writing" class="blog section section--teal" aria-labelledby="blog-title">
    <div class="container">
      <header class="blog__head">
        <div class="blog__head-left">
          <SectionLabel index="03" label="Writing" />
          <h2 id="blog-title" class="display-2 blog__title fade-up">
            Writing from <em>inside the practice.</em>
          </h2>
        </div>
        <div class="blog__head-right fade-up">
          <p class="blog__lead">
            Not theory for its own sake. Essays on planning, monitoring, and coaching judgment — written the way a coach talks to another coach.
          </p>
          <div class="is-desktop-only">
            <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>
              Read on Substack
            </AppButton>
          </div>
        </div>
      </header>

      <div class="blog__grid is-desktop-only fade-up">
        <div v-if="featureArticle" class="blog__feature">
          <BlogCard :item="featureArticle" variant="feature" />
        </div>

        <div class="blog__row">
          <BlogCard
            v-for="article in standardArticles"
            :key="article.id"
            :item="article"
            variant="standard"
          />
        </div>

        <div class="blog__text">
          <BlogCard
            v-for="article in textArticles"
            :key="article.id"
            :item="article"
            variant="text"
          />
        </div>
      </div>

      <div class="blog__rail snap-rail is-mobile-only fade-up">
        <BlogCard
          v-for="article in articles"
          :key="article.id"
          :item="article"
          variant="standard"
        />
      </div>

      <div class="blog__mobile-cta is-mobile-only">
        <AppButton variant="ghostOnTeal" :href="externalLinks.substack" external>
          Read on Substack
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog {
  background: var(--teal);
  color: var(--cream);
}

.blog__head {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 60px;
  align-items: end;
  margin-bottom: 64px;
}
.blog__head-left {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.blog__head-right {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: flex-start;
}
.blog__title {
  max-width: 16ch;
  color: var(--cream);
}
.blog__title em {
  font-style: italic;
  font-weight: 500;
  color: rgba(243, 243, 243, 0.78);
}
.blog__lead {
  color: rgba(243, 243, 243, 0.78);
  font-size: 16px;
  line-height: 1.6;
  max-width: 48ch;
  margin: 0;
}

.blog__grid {
  display: grid;
  gap: 18px;
}
.blog__feature {
  display: block;
}
.blog__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.blog__text {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

@media (max-width: 1100px) {
  .blog__head {
    grid-template-columns: 1fr;
    gap: 28px;
    margin-bottom: 44px;
    align-items: start;
  }
  .blog__row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 720px) {
  .blog__head {
    margin-bottom: 28px;
  }
  .blog__lead {
    font-size: 15px;
  }
  .blog__mobile-cta {
    margin-top: 12px;
    display: flex;
  }
  .blog__mobile-cta :deep(.btn) {
    width: 100%;
    justify-content: center;
  }
  .blog__rail :deep(.card) {
    height: clamp(360px, 76vw, 460px);
  }
}
</style>
