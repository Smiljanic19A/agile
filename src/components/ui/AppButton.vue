<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | ghost | link | onTeal | ghostOnTeal
  },
  href: { type: String, default: null },
  external: { type: Boolean, default: false },
  arrow: { type: Boolean, default: true },
  size: { type: String, default: 'md' }, // sm | md | lg
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href || undefined"
    :target="href && external ? '_blank' : undefined"
    :rel="href && external ? 'noopener noreferrer' : undefined"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <span class="btn__label"><slot /></span>
    <span v-if="arrow" class="btn__arrow" aria-hidden="true">→</span>
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.01em;
  padding: 14px 22px;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: background 200ms var(--ease), color 200ms var(--ease),
    border-color 200ms var(--ease), transform 200ms var(--ease);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.btn__arrow {
  display: inline-block;
  transition: transform 220ms var(--ease);
  font-family: var(--font-body);
}
.btn:hover .btn__arrow {
  transform: translateX(3px);
}

.btn--sm {
  font-size: 13px;
  padding: 10px 16px;
}
.btn--lg {
  font-size: 15px;
  padding: 16px 26px;
}

.btn--primary {
  background: var(--ink);
  color: var(--cream);
  border-color: var(--ink);
}
.btn--primary:hover {
  background: var(--teal-deep);
  border-color: var(--teal-deep);
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: var(--hairline-strong);
}
.btn--ghost:hover {
  border-color: var(--ink);
}

.btn--onTeal {
  background: var(--cream);
  color: var(--ink);
  border-color: var(--cream);
}
.btn--onTeal:hover {
  background: transparent;
  color: var(--cream);
}

.btn--ghostOnTeal {
  background: transparent;
  color: var(--cream);
  border-color: var(--hairline-light-strong);
}
.btn--ghostOnTeal:hover {
  background: var(--cream);
  color: var(--ink);
  border-color: var(--cream);
}

.btn--link {
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  border-radius: 0;
  border-bottom: 1px solid currentColor;
  padding-bottom: 4px;
  font-size: 14px;
}
.btn--link:hover {
  opacity: 0.7;
}
</style>
