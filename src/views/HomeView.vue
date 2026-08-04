<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useContentStore } from '@/stores/content.js'
import { useFeaturedStore } from '@/stores/featured.js'
import SplashScreen from '@/components/SplashScreen.vue'
import AppNav from '@/components/AppNav.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturedBanner from '@/components/sections/FeaturedBanner.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import EcosystemSection from '@/components/sections/EcosystemSection.vue'
import CommunitySection from '@/components/sections/CommunitySection.vue'
import BlogSection from '@/components/sections/BlogSection.vue'
import StoreSection from '@/components/sections/StoreSection.vue'
import NewsletterSection from '@/components/sections/NewsletterSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import FinalCTASection from '@/components/sections/FinalCTASection.vue'
import AppFooter from '@/components/sections/AppFooter.vue'

const content  = useContentStore()
const featured = useFeaturedStore()

// Splash plays on a fresh page load, not on in-app back/forward navigation.
const splashing = ref(!window.__apSplashPlayed)

function splashDone() {
  splashing.value = false
  window.__apSplashPlayed = true
}

let io = null
onMounted(() => {
  content.fetch()
  featured.fetchPublic()
  if (typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
  )
  document.querySelectorAll('.fade-up').forEach((el) => io.observe(el))
})
onBeforeUnmount(() => { io?.disconnect() })
</script>

<template>
  <div id="top">
    <SplashScreen v-if="splashing" @done="splashDone" />
    <AppNav />
    <main>
      <HeroSection />
      <FeaturedBanner />
      <AboutSection />
      <EcosystemSection />
      <CommunitySection />
      <BlogSection />
      <StoreSection />
      <NewsletterSection />
      <ContactSection />
      <FinalCTASection />
    </main>
    <AppFooter />
  </div>
</template>
