<script setup>
import { onMounted } from 'vue'
import AppNav from '@/components/AppNav.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import CommunitySection from '@/components/sections/CommunitySection.vue'
import StoreSection from '@/components/sections/StoreSection.vue'
import BooksSection from '@/components/sections/BooksSection.vue'
import NewsletterSection from '@/components/sections/NewsletterSection.vue'
import AppFooter from '@/components/sections/AppFooter.vue'

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  const els = document.querySelectorAll('.fade-up')
  const io = new IntersectionObserver(
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
</script>

<template>
  <div id="top">
    <AppNav />
    <main>
      <HeroSection />
      <AboutSection />
      <BlogSection />
      <CommunitySection />
      <StoreSection />
      <BooksSection />
      <NewsletterSection />
    </main>
    <AppFooter />
  </div>
</template>
