<script setup>
import { ref, computed, onMounted } from 'vue'
import { externalLinks } from '@/stores/content.js'
import { api } from '@/lib/api.js'
import { useI18n } from '@/i18n'
import HexLattice from '@/components/ui/HexLattice.vue'

const { t } = useI18n()
const year = new Date().getFullYear()

// Fallbacks mirror the seeded defaults; replaced by the API as soon as it responds.
const fallbackColumns = computed(() => [
  {
    id: 'explore',
    title: t('footer.explore'),
    links: [
      { label: 'What is AP?', url: '#what-is-ap', is_external: false },
      { label: 'Ecosystem',   url: '#ecosystem',  is_external: false },
      { label: 'Articles',    url: '#substack',   is_external: false },
      { label: 'Resources',   url: '#resources',  is_external: false },
      { label: 'Contact',     url: '#contact',    is_external: false },
    ],
  },
  {
    id: 'ecosystem',
    title: t('footer.ecosystem'),
    links: [
      { label: 'Substack',        url: externalLinks.substack, is_external: true },
      { label: 'Skool Community', url: externalLinks.skool,    is_external: true },
      { label: 'Payhip Store',    url: externalLinks.payhip,   is_external: true },
      { label: 'Books on Amazon', url: externalLinks.amazon,   is_external: true },
    ],
  },
  {
    id: 'connect',
    title: t('footer.connect'),
    links: [
      { label: 'LinkedIn',  url: externalLinks.linkedin,  is_external: true },
      { label: 'Instagram', url: externalLinks.instagram, is_external: true },
      { label: 'GitHub',    url: externalLinks.github,    is_external: true },
    ],
  },
])

const apiColumns = ref(null)

onMounted(async () => {
  try {
    const data = await api.footer()
    if (Array.isArray(data) && data.length) {
      apiColumns.value = data.map((g) => ({ id: g.slug, title: g.title, links: g.links || [] }))
    }
  } catch {
    // keep fallback — footer must never look broken
  }
})

const columns = computed(() => apiColumns.value || fallbackColumns.value)
</script>

<template>
  <footer class="ft">
    <div class="container ft__inner" :style="{ '--ft-cols': columns.length }">
      <div class="ft__brand">
        <div class="ft__brand-mark">
          <img src="/logo.png" alt="" aria-hidden="true" />
        </div>
        <h3 class="ft__brand-title">Agile Periodization</h3>
        <p class="ft__brand-tag is-desktop-only">{{ t('footer.tagline') }}</p>
      </div>

      <nav v-for="col in columns" :key="col.id" class="ft__col" :aria-label="col.title">
        <h4 class="ft__col-title">{{ col.title }}</h4>
        <ul>
          <li v-for="l in col.links" :key="l.id || l.url + l.label">
            <a
              :href="l.url"
              :target="l.is_external ? '_blank' : undefined"
              :rel="l.is_external ? 'noopener noreferrer' : undefined"
            >{{ l.label }} <span v-if="l.is_external" class="ft__ext" aria-hidden="true">↗</span></a>
          </li>
        </ul>
      </nav>

    </div>

    <div class="ft__watermark" aria-hidden="true">
      <HexLattice variant="cluster" tone="on-deep" :size="180" :accents="3" :seed="33" />
    </div>

    <div class="container ft__bottom">
      <span class="ft__copy">© {{ year }} Agile Periodization · Mladen Jovanović</span>
      <span class="ft__credo">{{ t('footer.credo') }}</span>
      <span class="ft__build is-desktop-only"><span>v 1.0</span><span>·</span><span>{{ t('footer.location') }}</span></span>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  position: relative; background: var(--teal-deep); color: var(--cream);
  padding-top: clamp(80px, 9vw, 130px); padding-bottom: 28px; overflow: hidden;
}
.ft__inner {
  display: grid; grid-template-columns: 1.4fr repeat(var(--ft-cols, 3), 1fr); gap: 56px; align-items: start;
  position: relative; z-index: 1; padding-bottom: clamp(60px, 7vw, 100px); border-bottom: 1px solid var(--hairline-light);
}

.ft__brand { display: flex; flex-direction: column; gap: 16px; max-width: 36ch; }
.ft__brand-mark { width: 44px; height: 44px; border-radius: 50%; background: var(--teal); display: grid; place-items: center; overflow: hidden; }
.ft__brand-mark img { width: 86%; height: 86%; object-fit: contain; }
.ft__brand-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.018em; margin: 0; color: var(--cream); }
.ft__brand-tag { font-size: 14px; line-height: 1.55; color: rgba(247, 242, 233, 0.82); margin: 0; }

.ft__col { display: flex; flex-direction: column; gap: 18px; }
.ft__col-title { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(247, 242, 233, 0.78); margin: 0; font-weight: 500; }
.ft__col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ft__col li a { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--cream); opacity: 0.95; transition: opacity 200ms var(--ease); }
.ft__col li a:hover { opacity: 1; }
.ft__ext { font-size: 10px; opacity: 0.6; }


.ft__watermark { position: absolute; right: -8vw; bottom: -10vw; width: clamp(420px, 60vw, 880px); height: clamp(380px, 50vw, 760px); pointer-events: none; z-index: 0; opacity: 0.85; }

.ft__bottom {
  position: relative; z-index: 1; margin-top: 28px; display: flex; justify-content: space-between;
  align-items: center; gap: 16px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; color: rgba(247, 242, 233, 0.7); flex-wrap: wrap;
}
.ft__build { display: inline-flex; gap: 8px; }

@media (max-width: 1180px) {
  .ft__inner { grid-template-columns: 1fr 1fr 1fr; gap: 48px; }
  .ft__brand { grid-column: 1 / -1; }
}
@media (max-width: 720px) {
  .ft { padding-top: clamp(56px, 11vw, 88px); }
  .ft__inner { grid-template-columns: 1fr 1fr; gap: 28px; padding-bottom: clamp(36px, 9vw, 64px); }
  .ft__brand { grid-column: 1 / -1; gap: 12px; }
  .ft__brand-title { font-size: 20px; }
  .ft__bottom { flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 18px; font-size: 10.5px; }
}
@media (max-width: 420px) { .ft__inner { grid-template-columns: 1fr; gap: 24px; } }
</style>
