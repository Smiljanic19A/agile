import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api.js'

export const sources = {
  substack: { id: 'substack', name: 'Substack', url: 'https://agileperiodization.substack.com/' },
  skool:    { id: 'skool',    name: 'Skool',    url: 'https://www.skool.com/agileperiodization' },
  payhip:   { id: 'payhip',  name: 'Payhip',   url: 'https://payhip.com/mjovanovic' },
  amazon:   { id: 'amazon',  name: 'Amazon',   url: 'https://www.amazon.com/stores/author/B07MYX4Y13' },
  youtube:  { id: 'youtube', name: 'YouTube',  url: 'https://www.youtube.com/@mladenjovanovic' },
}

export const externalLinks = {
  substack:  sources.substack.url,
  skool:     sources.skool.url,
  payhip:    sources.payhip.url,
  amazon:    sources.amazon.url,
  linkedin:  'https://www.linkedin.com/in/mladenjovanovic/',
  instagram: 'https://www.instagram.com/physical_prep/',
  github:    'https://github.com/mladenjovanovic',
}

export function itemUrl(item) {
  if (!item) return '#'
  if (item.url) return item.url
  return sources[item.source]?.url || '#'
}

export function sourceLabel(item) {
  return sources[item?.source]?.name || ''
}

function normalizeArticle(a, idx) {
  return {
    // Prefixed — article and product DB ids overlap, and merged `items`
    // lookups (e.g. the banner's source-item picker) need global uniqueness.
    id:          'a-' + a.id,
    type:        a.type || 'Article',
    category:    'writing',
    title:       a.title,
    description: a.description || null,
    cover:       { seed: a.id },
    image:       a.image_url || null,
    price:       null,
    url:         a.url,
    source:      'substack',
    date:        a.published_at
      ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    readTime:    a.read_time || null,
    variant:     a.is_featured ? 'feature' : (idx < 3 ? 'standard' : 'text'),
  }
}

function normalizeProduct(p) {
  return {
    id:          'p-' + p.id,
    type:        p.type || 'Course',
    category:    p.category || 'courses',
    title:       p.title,
    description: p.description || null,
    cover:       { seed: p.id },
    image:       p.image_url || null,
    price:       p.price || null,
    url:         p.url,
    source:      p.source || 'payhip',
    date:        null,
    readTime:    null,
    variant:     'standard',
  }
}

export const useContentStore = defineStore('content', () => {
  const _articles = ref([])
  const _products = ref([])
  const loading   = ref(false)
  const error     = ref(null)

  const items              = computed(() => [..._articles.value, ..._products.value])
  const articles           = computed(() => _articles.value)
  const products           = computed(() => _products.value)
  const featureArticle     = computed(() => _articles.value.find(i => i.variant === 'feature') || _articles.value[0] || null)
  const standardArticles   = computed(() => _articles.value.filter(i => i.variant === 'standard'))
  const textArticles       = computed(() => _articles.value.filter(i => i.variant === 'text'))
  const books              = computed(() => _products.value.filter(i => i.category === 'books'))
  const resources          = computed(() => _products.value.filter(i => i.category === 'courses' || i.category === 'tools'))
  function productsByCategory(cat) { return _products.value.filter(i => i.category === cat) }

  // Skool community data stays static (no Skool API)
  const channels = ref([
    { id: 'planning',       label: '# planning' },
    { id: 'monitoring',     label: '# monitoring' },
    { id: 'return-to-play', label: '# return-to-play' },
    { id: 'book-club',      label: '# book-club' },
  ])
  const threads = ref([
    { id: 't1',  channel: 'planning',       handle: 'evelyn.k', role: 'S&C · Football',      time: '2h',  replies: 14, text: 'Anyone using readiness scores to gate sprint volume during in-season? Looking for thresholds that actually hold up across a long schedule.' },
    { id: 't2',  channel: 'planning',       handle: 'jakob.r',  role: 'Athletics · Throws',   time: '5h',  replies: 8,  text: 'What does your minimum viable week look like when the schedule collapses to 3 days? Asking for the next 6 weeks.' },
    { id: 't3',  channel: 'planning',       handle: 'sara.v',   role: 'Hockey · S&C',         time: '1d',  replies: 21, text: 'Has anyone mapped the barbell strategy to block design — safe base block plus small experimental block rather than undulating everything?' },
    { id: 't4',  channel: 'monitoring',     handle: 'marko.p',  role: 'Physio · Track',       time: '6h',  replies: 19, text: 'Sharing a return-to-play decision log we built off the monitoring template. Feedback very welcome.' },
    { id: 't5',  channel: 'monitoring',     handle: 'claire.m', role: 'S&C · Rugby',          time: '9h',  replies: 11, text: 'Rolling 28-day load is giving me cleaner signals than ACWR ever did. Anyone else moved away from the ratio entirely?' },
    { id: 't6',  channel: 'monitoring',     handle: 'niko.a',   role: 'Basketball · Perf',    time: '2d',  replies: 6,  text: 'We cut subjective wellness to one question — overall feel 1–10. Three months in and it is more actionable than the full questionnaire.' },
    { id: 't7',  channel: 'return-to-play', handle: 'jules.t',  role: 'Combat sports',        time: '14h', replies: 17, text: 'Question on residual fatigue during fight camp — how aggressively are you cutting CNS work in week 2 of a 4-week camp?' },
    { id: 't8',  channel: 'return-to-play', handle: 'ana.d',    role: 'Physio · Football',    time: '1d',  replies: 23, text: 'Criteria-based vs time-based RTP — what decision triggers do you actually use in practice vs what the literature says?' },
    { id: 't9',  channel: 'return-to-play', handle: 'liam.f',   role: 'S&C · Cricket',        time: '3d',  replies: 9,  text: 'Anyone have a template for the deload-to-ramp sequence after a soft tissue injury? Something I can hand to the physio.' },
    { id: 't10', channel: 'book-club',      handle: 'petra.s',  role: 'Sports Sci · Swim',    time: '4h',  replies: 12, text: '"Models are maps, not territory" hits differently each time. Re-reading the Foundations notes this week.' },
    { id: 't11', channel: 'book-club',      handle: 'oskar.l',  role: 'Strength Coach',       time: '12h', replies: 7,  text: 'Taleb on robustness vs optimisation — has anyone applied the barbell concept directly to program structure?' },
    { id: 't12', channel: 'book-club',      handle: 'mei.w',    role: 'Tennis · Performance', time: '2d',  replies: 15, text: 'Reading Cynefin for the first time. The sense-respond vs analyse-respond split is exactly what the agile framework is built on.' },
  ])
  const communityStats = ref([
    { value: '1,200+', label: 'Coaches & practitioners' },
    { value: '30+',    label: 'Countries represented' },
    { value: 'Weekly', label: 'Live discussion threads' },
  ])
  const tabs = ref([
    { id: 'courses', label: 'Courses' },
    { id: 'tools',   label: 'Tools' },
    { id: 'books',   label: 'Books' },
  ])

  async function fetch() {
    if (loading.value) return
    loading.value = true
    error.value   = null
    try {
      const [rawA, rawP] = await Promise.all([api.articles(), api.products()])
      _articles.value = (rawA || []).map((a, i) => normalizeArticle(a, i))
      _products.value = (rawP || []).map(p => normalizeProduct(p))
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    items, articles, products, loading, error, fetch,
    featureArticle, standardArticles, textArticles, books, resources,
    productsByCategory,
    channels, threads, communityStats, tabs,
  }
})
