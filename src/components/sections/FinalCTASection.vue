<script setup>
import AppButton from '@/components/ui/AppButton.vue'
import HexLattice from '@/components/ui/HexLattice.vue'
import { externalLinks } from '@/stores/content.js'
</script>

<template>
  <section class="cta-final" aria-label="Final call to action">
    <div class="cta-final__hex" aria-hidden="true">
      <HexLattice variant="grid" tone="on-teal" mask="radial" :size="110" :accents="6" :seed="77" />
    </div>
    <div class="container cta-final__inner">
      <p class="cta-final__eyebrow">Final call</p>
      <h2 class="cta-final__title display-2">Reality will break the plan.<br><em>Build a system that learns.</em></h2>
      <p class="cta-final__sub">
        Join coaches, sport scientists, physios, and performance practitioners building better training systems through discussion, tools, courses, and shared experiments.
      </p>
      <div class="cta-final__cta">
        <AppButton variant="onTeal" :href="externalLinks.skool" external>Join the Agile Periodization Community</AppButton>
        <AppButton variant="ghostOnTeal" href="#updates">Get Updates</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-final {
  position: relative; background: var(--teal); color: #f3f3f3;
  padding: clamp(80px, 11vw, 140px) 0; overflow: hidden; isolation: isolate; text-align: center;
}
.cta-final__hex { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.35; }

.cta-final__inner {
  position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 28px;
}

.cta-final__eyebrow {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(243,243,243,0.62);
}

.cta-final__title { color: #f3f3f3; max-width: 20ch; margin: 0; }
.cta-final__title em { font-style: italic; font-weight: 500; color: rgba(243,243,243,0.72); }

.cta-final__sub {
  font-size: clamp(15px, 1.15vw, 17px); line-height: 1.68;
  color: rgba(243,243,243,0.82); max-width: 52ch; margin: 0;
}

.cta-final__cta { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

@media (max-width: 560px) {
  .cta-final__cta { flex-direction: column; width: 100%; }
  .cta-final__cta :deep(.btn) { width: 100%; justify-content: center; }
}
</style>
