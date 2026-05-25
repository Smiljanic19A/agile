# Visual Polish Audit — Agile Periodization Website

## Your Mission

Do a deep visual audit of this codebase. Find everything that can be polished to make this website look like an absolute masterpiece. Go section by section, component by component. Identify contrast issues, spacing inconsistencies, typography weaknesses, hover states, transitions, layout problems, anything that would make a senior designer wince. Then fix all of it.

---

## Project Overview

**Site:** Agile Periodization — personal brand hub for Mladen Jovanović, PhD (sports scientist, S&C coach, author)

**What it is:** A single-page hub linking to his Substack (writing), Skool community, Payhip store (courses/tools/books), and serving as the canonical home for the Agile Periodization framework.

**Brand in one line:** Coach-scholar. Serious, not corporate. Practical, not academic. Premium, not shiny.

**Tech stack:**
- Vue 3 (Composition API, `<script setup>`)
- Vite
- Pinia (content store)
- No external UI library — everything is custom
- CSS: scoped styles per component + global `base.css` + `theme-v3.css`

---

## Design System

### Fonts (3 total — keep it to these)
```
--font-display: "Space Grotesk"   → headings, large type, buttons
--font-body:    "Inter"           → paragraphs, body copy, descriptions
--font-mono:    "JetBrains Mono"  → labels, eyebrows, tags, metadata, fine print
```

### Color Tokens
```css
--teal:        #378882   /* primary brand — dark teal sections */
--teal-deep:   #23615c   /* footer background */
--teal-soft:   #5ba39d   /* accents, secondary elements */
--cream:       #f3f3f3   /* light text on dark backgrounds */
--paper:       #faf9f4   /* light section backgrounds */
--ink:         #0e1a1a   /* primary text on light */
--ink-soft:    #1c2a2a   /* secondary text on light */
--mute:        #6b7574   /* muted labels on light */
--mute-2:      #94a09f
--hairline:    rgba(14,26,26,0.08)
--hairline-strong: rgba(14,26,26,0.14)
--hairline-light: rgba(243,243,243,0.16)   /* dividers on dark */
--hairline-light-strong: rgba(243,243,243,0.28)
--radius-sm: 6px  --radius: 14px  --radius-lg: 22px
--ease: cubic-bezier(0.22, 0.61, 0.36, 1)
--section-y: clamp(48px, 7vw, 104px)
--container: 1280px
--gutter: clamp(22px, 4vw, 56px)
```

### Theme v3 (active)
The site runs `data-theme="v3"` on `<html>`. This flips all `section--teal` sections to **white** (`#ffffff`) with dark ink text — EXCEPT the Hero, About, and newsletter/contact sections which stay dark teal. The theme overrides live in `src/assets/styles/theme-v3.css`.

**Important:** The `--cream` variable globally becomes `#0e1a1a` (dark ink) in v3. Sections that need light text on dark backgrounds re-scope it locally.

### Global helpers (base.css)
```css
.display-1 { font-size: clamp(40px, 7.4vw, 110px); font-weight: 700; letter-spacing: -0.025em; }
.display-2 { font-size: clamp(30px, 5.4vw, 80px);  font-weight: 700; letter-spacing: -0.022em; }
.display-3 { font-size: clamp(24px, 3.6vw, 52px);  font-weight: 700; letter-spacing: -0.02em; }
.prose     { font-size: clamp(15px, 1.05vw, 17px); line-height: 1.65; color: var(--ink-soft); }
.section   { padding: var(--section-y) 0; }
.section--teal  { background: var(--teal); color: var(--cream); }
.section--cream { background: var(--paper); color: var(--ink); }
.fade-up   { opacity: 0; transform: translateY(10px); } /* animated by IntersectionObserver in HomeView */
```

---

## Page Structure (top to bottom)

```
AppNav              fixed header, teal background, blurs on scroll
HeroSection         full-height, dark teal, logo + title + CTA buttons
FeaturedBanner      full-height carousel (HeroCard components), dark teal/dark
AboutSection        dark teal, two-part: AP explainer + Mladen bio
BlogSection         white (v3 flips teal→white), article grid
CommunitySection    white/paper, two-col: copy left + mock community UI right
StoreSection        white (v3 flips), tabbed product grid
NewsletterSection   dark (#0e1a1a), two-panel split: Contact | Newsletter
AppFooter           dark teal-deep (#23615c), nav columns + newsletter input
```

---

## Component Files

```
src/
├── assets/styles/
│   ├── base.css                   ← global tokens, typography, utilities
│   └── theme-v3.css               ← v3 overrides (white canvas theme)
├── components/
│   ├── AppNav.vue                 ← fixed nav + fullscreen mobile menu
│   ├── sections/
│   │   ├── HeroSection.vue        ← dark teal hero, full-height
│   │   ├── FeaturedBanner.vue     ← carousel wrapper (delegates to HeroCard)
│   │   ├── AboutSection.vue       ← dark teal: AP explainer + bio
│   │   ├── BlogSection.vue        ← article grid, v3 = white bg
│   │   ├── CommunitySection.vue   ← community mock UI + stats
│   │   ├── StoreSection.vue       ← tabbed product grid, v3 = white bg
│   │   ├── NewsletterSection.vue  ← dark split: contact + newsletter
│   │   └── AppFooter.vue          ← dark teal-deep footer
│   └── ui/
│       ├── HeroCard.vue           ← individual featured banner card (overlay + split layouts)
│       ├── BlogCard.vue           ← article cards (feature / standard / text variants)
│       ├── ProductCard.vue        ← store product cards
│       ├── AppButton.vue          ← button component (variants: onTeal, ghostOnTeal, primary)
│       ├── HexLattice.vue         ← decorative hex grid SVG (used as bg decoration)
│       ├── SectionLabel.vue       ← "03 / Writing" type section index labels
│       └── StoreTabs.vue          ← tab switcher for store categories
├── stores/
│   └── content.js                 ← all content data (articles, products, featured items, stats)
└── views/
    └── HomeView.vue               ← mounts all sections, runs IntersectionObserver for .fade-up
```

---

## Current Copy (for context — don't touch unless a copy change directly serves visual polish)

**Hero:**
- Eyebrow: "Coaching under uncertainty"
- Title: "The plan is a hypothesis. *Reality is the feedback loop.*"
- Sub: "Writing, tools, and a community — for coaches who plan with intent and adapt without panic."

**About — AP explainer:**
- "Your plan looks perfect on paper. Then real athletes happen. Agile Periodization is the operating framework for what comes next..."
- Principles: Adaptive Planning / Probabilistic Thinking / Emergent Structure

**About — Mladen bio:**
- "Sports scientist, S&C coach, and author. Twenty years across professional sport in Australia, Qatar, and Sweden."
- Quote: "The goal isn't the perfect program. It's building a coach who can always make a better one."

**Blog:** "Writing from *inside the practice.*"
**Community:** "The community is the *center of the project.*"
**Store:** "Books, courses, *and working tools.*"
**Contact:** "Get in touch." / "Read the writing."

---

## What's Already Been Done (don't redo these)

- Font unified to 3 fonts (Space Grotesk / Inter / JetBrains Mono)
- Global section spacing tightened (`--section-y` reduced)
- All text opacity on dark backgrounds lifted to minimum 0.68 for labels, 0.88+ for body
- About section: decorative numbers downsized, internal spacing reduced
- Featured banner body text: opacity lifted to 0.92, size increased
- Newsletter redesigned as two-panel split (Contact | Newsletter) with modal
- Footer tagline rewritten, link opacity lifted to 0.95
- AboutSection fully redesigned (replaced old career timeline with AP explainer + bio)

---

## Known Remaining Issues (starting points for your audit)

These were mentioned but not fully resolved — start here then expand:

1. **Hover states** — audit every interactive element (buttons, links, cards, nav items). Are they all polished? Consistent timing? Do they feel satisfying?

2. **Card polish** — BlogCard, ProductCard, HeroCard. Check border radius, shadow, hover lift, image treatment, typography inside cards.

3. **Transition consistency** — some components use 180ms, some 200ms, some 220ms. Should be harmonized to the `--ease` curve throughout.

4. **Mobile layouts** — everything has responsive breakpoints but mobile polish is unknown. Check padding, font sizes, touch targets, snap rails.

5. **SectionLabel component** — the "03 / Writing" index labels. Check their visual weight, spacing, and whether they feel intentional or like an afterthought.

6. **HexLattice opacity** — used as decorative background in multiple sections at various opacities (0.22 in About, 0.28 in split panel). Check if these feel balanced or if some are too heavy/light.

7. **AppNav scrolled state** — the blurred teal nav on scroll. Check if it transitions smoothly and looks premium at all scroll positions.

8. **Community section mock UI** — the fake thread feed on the right. Check if thread cards, channel tabs, and the floating "Live / Q&A" card look polished.

9. **Store tabs** — the StoreTabs switcher component. Check active/hover states, spacing, typography.

10. **AppButton variants** — the three button variants (`onTeal`, `ghostOnTeal`, `primary`). Check hover, focus, disabled states. Do they all feel premium?

11. **Footer newsletter input** — the email input + send button in the footer. Does it look and feel polished?

12. **Selection color, focus rings** — `::selection` is teal/cream. `:focus-visible` uses `--teal-soft`. Check these throughout.

13. **Loading/animation feel** — the `.fade-up` scroll animations (600ms). Does the timing and easing feel right? Should stagger be considered?

---

## Brand Personality (use this to judge every decision)

```
Serious, not corporate
Scholarly, not academic cosplay
Practical, not simplistic
Philosophical, not vague
Premium, not shiny startup nonsense
Strong, not aggressive fitness-bro
```

**Visual mood:** Coach-scholar meets field manual meets ancient philosophy meets modern performance lab.

**Good references:** Editorial design, premium educational brands, field manuals, dark teal + off-white palettes, strong typographic hierarchy, generous whitespace.

**Bad references:** SaaS gradient dashboards, gym influencer aesthetics, motivational poster design, corporate blue, cluttered infographics.

---

## How to Approach the Audit

1. Read every component file listed above
2. For each one, ask: does this look like it belongs in a masterpiece?
3. Flag every opacity under 0.7 on dark backgrounds (non-decorative text)
4. Flag every hover state that has no transition or uses a generic opacity dip
5. Flag any spacing that feels arbitrary or inconsistent with the global scale
6. Flag any font-size below 13px being used for actual readable content (labels ok)
7. Flag any border-radius inconsistency (mixing --radius-sm, --radius, --radius-lg arbitrarily)
8. Fix everything you flag — don't just report, ship the fixes

The bar is: would a senior product designer at a premium brand agency approve this without changes?
