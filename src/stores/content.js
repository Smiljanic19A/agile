import { defineStore } from 'pinia'

export const sources = {
  substack: { id: 'substack', name: 'Substack', url: 'https://agileperiodization.substack.com' },
  skool:    { id: 'skool',    name: 'Skool',    url: 'https://www.skool.com/agileperiodization' },
  payhip:   { id: 'payhip',   name: 'Payhip',   url: 'https://payhip.com/mjovanovic' },
  amazon:   { id: 'amazon',   name: 'Amazon',   url: 'https://www.amazon.com/stores/author/B07MYX4Y13' },
  youtube:  { id: 'youtube',  name: 'YouTube',  url: 'https://www.youtube.com/@mladenjovanovic' },
}

export function itemUrl(item) {
  if (!item) return '#'
  if (item.url) return item.url
  if (item.source && sources[item.source]) return sources[item.source].url
  return '#'
}

export function sourceLabel(item) {
  if (!item || !item.source) return ''
  return sources[item.source]?.name || ''
}

// Item shape:
//  id, category, type, tag, title, description, image,
//  source (drives default url), url (optional explicit override),
//  featured (bool), layout ('overlay' | 'split-right' | 'split-left'),
//  badge, ctaLabel, date, readTime

export const useContentStore = defineStore('content', {
  state: () => ({
    items: [
      // ── Featured Banner slides ───────────────────────────────────────────
      {
        id: 'f-overview',
        category: 'featured',
        type: 'Video orientation',
        title: 'What is <em>Agile Periodization</em>?',
        description: 'Why fixed plans break, why training needs feedback loops, and how Agile Periodization turns planning into a learning system.',
        image: '/assets/images/philosophical-foundations.png',
        source: 'youtube',
        url: 'https://www.youtube.com/@mladenjovanovic',
        featured: true,
        layout: 'split-right',
        badge: 'Start here',
        ctaLabel: 'Watch the overview',
      },
      {
        id: 'f-endurance',
        category: 'featured',
        type: 'Tool · Conditioning',
        title: 'Endurance Map <em>Builder</em>',
        description: 'Map domains, thresholds, CP/W′, MAS/vVO₂max, and conditioning decisions. The endurance toolkit that turns theory into a working week.',
        image: '/assets/images/endurance-map-builder.png',
        source: 'payhip',
        url: 'https://payhip.com/b/DSc7p',
        featured: true,
        layout: 'overlay',
        badge: 'New tool',
        ctaLabel: 'Get the tool',
      },
      {
        id: 'f-stm',
        category: 'featured',
        type: 'Book · Strength',
        title: 'Strength Training <em>Manual</em>',
        description: 'The long-form reference on programming logic, set-and-rep schemes, and progression — for coaches who want the system, not the trend.',
        image: '/assets/images/strength-training-manual.png',
        source: 'amazon',
        featured: true,
        layout: 'split-left',
        badge: 'Paperback',
        ctaLabel: 'View on Amazon',
      },

      // ── Articles ─────────────────────────────────────────────────────────
      {
        id: 'a1',
        category: 'article',
        type: 'Field note',
        title: 'Problemming, practice design, and messy transfer',
        description: 'Why "transfer" is rarely a property of the gym exercise itself, and what to do about it on Monday.',
        image: '/assets/images/conditioning-mma.png',
        source: 'substack',
        date: 'Apr 28, 2026',
        readTime: '11 min',
      },
      {
        id: 'a2',
        category: 'article',
        type: 'Conditioning',
        title: 'Thresholds, domains, and practical endurance maps',
        description: 'An applied take on intensity domains, CP/W′, and how to use them without turning the team into a lab.',
        image: '/assets/images/endurance-map-builder.png',
        source: 'substack',
        date: 'Apr 11, 2026',
        readTime: '9 min',
      },
      {
        id: 'a3',
        category: 'article',
        type: 'Theory',
        title: 'Fatigue, monitoring, and decisions under uncertainty',
        description: 'Monitoring is not decision-making. Here is how to bridge the gap on the staff whiteboard.',
        image: '/assets/images/decoding-fatigue.png',
        source: 'substack',
        date: 'Mar 24, 2026',
        readTime: '13 min',
      },

      // ── Payhip resources ─────────────────────────────────────────────────
      {
        id: 'r1',
        category: 'resource',
        type: 'Course',
        tag: 'Philosophy',
        title: 'Philosophical Foundations',
        description: 'The mental models behind Agile Periodization — uncertainty, robustness, adaptation, and decision-making.',
        image: '/assets/images/philosophical-foundations.png',
        source: 'payhip',
      },
      {
        id: 'r2',
        category: 'resource',
        type: 'Tool',
        tag: 'Conditioning',
        title: 'Endurance Map Builder',
        description: 'Map domains, thresholds, CP/W′, MAS, and conditioning decisions.',
        image: '/assets/images/endurance-map-builder.png',
        source: 'payhip',
        url: 'https://payhip.com/b/DSc7p',
      },
      {
        id: 'r3',
        category: 'resource',
        type: 'PDF',
        tag: 'Strength',
        title: 'Badger Protocol',
        description: 'Simple, flexible loading ideas and isoSandwich variations.',
        image: '/assets/images/badger-protocol.png',
        source: 'payhip',
      },
      {
        id: 'r4',
        category: 'resource',
        type: 'Course',
        tag: 'Conditioning',
        title: 'Conditioning for MMA',
        description: 'Agile microcycle planning and conditioning under combat-sport constraints.',
        image: '/assets/images/conditioning-mma.png',
        source: 'payhip',
      },
      {
        id: 'r5',
        category: 'resource',
        type: 'Course',
        tag: 'Monitoring',
        title: 'Decoding Fatigue',
        description: 'Make sense of HRV, wellness, and load data without worshipping it.',
        image: '/assets/images/decoding-fatigue.png',
        source: 'payhip',
      },
      {
        id: 'r6',
        category: 'resource',
        type: 'Book',
        tag: 'Strength',
        title: 'Strength Training Manual (Digital)',
        description: 'The digital edition of the long-form manual on programming, decisions, and structure.',
        image: '/assets/images/strength-training-manual.png',
        source: 'payhip',
      },

      // ── Books (Amazon paperback) ─────────────────────────────────────────
      {
        id: 'b1',
        category: 'book',
        type: 'Book',
        title: 'Strength Training Manual',
        description: 'The long-form reference on programming logic, set-and-rep schemes, and progression.',
        image: '/assets/images/strength-training-manual.png',
        source: 'amazon',
      },
      {
        id: 'b2',
        category: 'book',
        type: 'Book',
        title: 'HIIT Manual',
        description: 'The applied manual on high-intensity interval training, its variants, and where each fits.',
        image: '/assets/images/hiit-manual.jpg',
        source: 'amazon',
      },
    ],
  }),

  getters: {
    featuredItems: (s) => s.items.filter((i) => i.category === 'featured' && i.featured),
    articles:      (s) => s.items.filter((i) => i.category === 'article'),
    resources:     (s) => s.items.filter((i) => i.category === 'resource'),
    books:         (s) => s.items.filter((i) => i.category === 'book'),
  },
})
