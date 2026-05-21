<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useContentStore } from '@/stores/content.js'
import AppNav from '@/components/AppNav.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturedBanner from '@/components/sections/FeaturedBanner.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import CommunitySection from '@/components/sections/CommunitySection.vue'
import StoreSection from '@/components/sections/StoreSection.vue'
import NewsletterSection from '@/components/sections/NewsletterSection.vue'
import AppFooter from '@/components/sections/AppFooter.vue'

const content = useContentStore()

let io = null
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  const els = document.querySelectorAll('.fade-up')
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  )
  els.forEach((el) => io.observe(el))
})
onBeforeUnmount(() => { io?.disconnect() })
</script>

<template>
  <div id="top">
    <AppNav />
    <main>
      <HeroSection />
      <FeaturedBanner />
      <AboutSection />
      <BlogSection />
      <CommunitySection />
      <StoreSection />
      <NewsletterSection />
    </main>
    <AppFooter />
  </div>
</template>
